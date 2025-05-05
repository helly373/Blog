import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Blogpage.css";
import ApiService from "../services/api"; // Import the ApiService
import { FaRegEdit, FaTrash } from "react-icons/fa"; // Import icons from react-icons

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the current user's ID from localStorage or session
    const token = localStorage.getItem("token");
    
     // Get userId from the user object
  const userJSON = localStorage.getItem("user");
  const user = userJSON ? JSON.parse(userJSON) : null;
  const userId = user ? user.id : null;
  
  console.log("User data from localStorage:", user);
  console.log("Current user ID:", userId);
    
    if (userId) {
      setCurrentUserId(userId);
    }

    // Fetch posts from the backend API using ApiService
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Use ApiService to fetch posts
        const postsData = await ApiService.getAllPosts();
        
        console.log("Fetched posts:", postsData); // Debug
        
        // Fetch author usernames for posts
        const postsWithUsernames = await Promise.all(postsData.map(async (post) => {
          try {
            // Get the author ID - handle both string ID and object with _id
            const authorId = typeof post.author === 'string' 
              ? post.author 
              : (post.author && post.author._id ? post.author._id : post.author);
            
            // Convert both IDs to strings for comparison
            const strAuthorId = String(authorId).trim();
            const strUserId = String(userId).trim();
            
            // Check if user owns this post
            const isUserPost = strAuthorId === strUserId;
            
            console.log(`Post ${post._id} - Author ID: ${strAuthorId}, Current User ID: ${strUserId}, Match: ${isUserPost}`); // Debug
            
            if (!authorId) {
              return { ...post, authorUsername: 'Missing Author ID', isOwnPost: false };
            }
            
            // Only proceed with fetch if we have an authorId
            if (authorId) {
              try {
                // Use ApiService to get user profile
                const userData = await ApiService.getUserProfile(authorId);
                
                // Check if username exists in the returned data structure
                if (userData && userData.user && userData.user.username) {
                  return {
                    ...post,
                    authorUsername: userData.user.username,
                    isOwnPost: isUserPost
                  };
                } else {
                  return {
                    ...post,
                    authorUsername: 'No Username Found',
                    isOwnPost: isUserPost
                  };
                }
              } catch (userError) {
                console.error(`Error fetching user ${authorId}:`, userError);
                return {
                  ...post,
                  authorUsername: `Fetch Error: ${userError.message}`,
                  isOwnPost: isUserPost
                };
              }
            }
          } catch (err) {
            console.error(`Error processing post author ${post._id}:`, err);
            return {
              ...post,
              authorUsername: `Error: ${err.message}`,
              isOwnPost: false
            };
          }
          
          // Return original post if couldn't fetch username
          return {
            ...post,
            authorUsername: 'Anonymous (Default)',
            isOwnPost: false
          };
        }));
        
        console.log("Posts with usernames and isOwnPost flags:", postsWithUsernames.map(p => ({
          id: p._id,
          title: p.title,
          author: p.authorUsername,
          isOwnPost: p.isOwnPost
        }))); // Debug
        
        setPosts(postsWithUsernames);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(error.message || "Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Generate location display string
  const formatLocation = (post) => {
    const location = post.location || {};
    const city = location.city;
    const country = location.country;
    const region = location.region;
    
    let locationParts = [];
    if (city) locationParts.push(city);
    if (country) locationParts.push(country);
    if (region) locationParts.push(region);
    
    return locationParts.length > 0 
      ? locationParts.join(', ')
      : 'Location not specified';
  };

  // Handle Edit Post
  const handleEditPost = (postId) => {
    // Navigate to edit post page with post ID
    navigate(`/edit-post/${postId}`);
  };

  // Handle Delete Post
  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // Call API to delete post
        await ApiService.deletePost(postId);
        // Remove deleted post from state
        setPosts(posts.filter(post => (post._id || post.id) !== postId));
      } catch (error) {
        console.error("Error deleting post:", error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  // Modal for viewing the full post
  const renderFullPostModal = () => {
    if (!selectedPostId) return null;
    
    const post = posts.find(p => (p._id || p.id) === selectedPostId);
    if (!post) return null;
    
    return (
      <div className="post-modal-overlay" onClick={() => setSelectedPostId(null)}>
        <div className="post-modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close-button" onClick={() => setSelectedPostId(null)}>×</button>
          <h2 className="modal-title">{post.title}</h2>
          <div className="modal-metadata">
            <span>By: {post.authorUsername || 'Anonymous'}</span>
            <span>{post.date || post.createdAt ? formatDate(post.date || post.createdAt) : 'Unknown date'}</span>
            <span><i className="fas fa-map-marker-alt"></i> {formatLocation(post)}</span>
          </div>
          <p className="modal-content">{post.summary || post.content}</p>
          {post.categories && post.categories.length > 0 && (
            <div className="modal-categories">
              {post.categories.map((category, index) => (
                <span key={index} className="category-tag">{category}</span>
              ))}
            </div>
          )}

          {/* Add Edit/Delete buttons in modal if it's the user's own post */}
          {post.isOwnPost && (
            <div className="modal-actions">
              <button 
                className="edit-button" 
                onClick={() => {
                  setSelectedPostId(null); 
                  handleEditPost(post._id || post.id);
                }}
              >
                <FaRegEdit style={{ marginRight: '5px' }} /> Edit
              </button>
              <button 
                className="delete-button" 
                onClick={() => {
                  setSelectedPostId(null);
                  handleDeletePost(post._id || post.id);
                }}
              >
                <FaTrash style={{ marginRight: '5px' }} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="blog-container">
        <h1 className="blog-title">Travel Blog</h1>
        <div className="loading">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-container">
        <h1 className="blog-title">Travel Blog</h1>
        <div className="error-message">{error}</div>
        <p className="create-post-prompt">In the meantime, why not <Link to="/create-post" className="create-post-link">create your own post</Link>?</p>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <h1 className="blog-title">Travel Blog</h1>
      <p className="blog-description">
        Explore our adventures around the world, from bustling cities to tranquil beaches and everything in between.
      </p>
      
      {/* Debug info - Set display to 'block' to see it */}
      <div style={{padding: '10px', background: '#f8f9fa', marginBottom: '20px', display: 'none'}}>
        <p>Current User ID: {currentUserId || 'Not logged in'}</p>
        <p>Number of posts: {posts.length}</p>
        <p>User owns posts: {posts.filter(post => post.isOwnPost).length}</p>
      </div>
      
      {posts.length > 0 ? (
        <div className="blog-posts-single-column">
          {posts.map(post => (
            <div className="post-card-horizontal" key={post._id || post.id}>
              <div className="post-image-horizontal">
                <img 
                  src={post.imageUrl || post.image} 
                  alt={post.title} 
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x250?text=Travel+Adventures";
                    e.target.onerror = null;
                  }}
                />
              </div>
              <div className="post-content-horizontal">
                <h2 className="post-title">{post.title}</h2>
                <div className="post-meta">
                  <span className="post-author">
                    By: {post.authorUsername || 'Anonymous'}
                  </span>
                  <span className="post-date">
                    {post.date || post.createdAt 
                      ? formatDate(post.date || post.createdAt) 
                      : 'Unknown date'}
                  </span>
                </div>
                
                {/* Location information */}
                <div className="post-location">
                  <i className="fas fa-map-marker-alt"></i> {formatLocation(post)}
                </div>
                
                {/* Summary with read more link */}
                <div className="post-summary-container">
                  <p className="post-summary-horizontal">
                    {(post.summary || post.content).substring(0, 150)}
                    {/* Don't add ellipsis here, the CSS will handle truncation */}
                  </p>
                  <span 
                    className="read-more-link"
                    onClick={() => setSelectedPostId(post._id || post.id)}
                  >
                    Read more
                  </span>
                </div>
                
                {post.categories && post.categories.length > 0 && (
                  <div className="post-categories">
                    {post.categories.map((category, index) => (
                      <span key={index} className="category-tag">{category}</span>
                    ))}
                  </div>
                )}

                {/* Add Edit/Delete buttons if it's the user's own post */}
                {post.isOwnPost && (
                  <div className="post-actions" style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    display: 'flex',
                    gap: '10px',
                    zIndex: '10'
                  }}>
                    <button 
                      className="edit-post-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPost(post._id || post.id);
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                        color: '#3a80d2',
                        boxShadow: 'none'
                      }}
                    >
                      <FaRegEdit size={18} />
                    </button>
                    <button 
                      className="delete-post-button" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post._id || post.id);
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                        color: '#d32f2f',
                        boxShadow: 'none'
                      }}
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-posts-message">
          <p>No posts found. Be the first to share your travel experience!</p>
          <Link to="/create-post" className="create-post-link">Create a Post</Link>
        </div>
      )}
      
      {/* Modal for full post view */}
      {renderFullPostModal()}
    </div>
  );
}