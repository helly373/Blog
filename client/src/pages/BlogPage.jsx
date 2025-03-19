import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Blogpage.css";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    // Fetch posts from the backend API
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Get the token from localStorage (if user is logged in)
        const token = localStorage.getItem("token");
        console.log("Token available:", !!token);
        
        // Make API request to fetch posts
        const response = await fetch('http://localhost:4000/api/posts', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Server returned non-JSON response:", text);
          throw new Error("Unexpected response from server");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch posts");
        }
        
        // Fetch author usernames for posts
        const postsWithUsernames = await Promise.all(data.map(async (post, index) => {
          try {
            // Get the author ID - handle both string ID and object with _id
            const authorId = typeof post.author === 'string' 
              ? post.author 
              : (post.author && post.author._id ? post.author._id : post.author);
            
            if (!authorId) {
              return { ...post, authorUsername: 'Missing Author ID' };
            }
            
            // Only proceed with fetch if we have an authorId
            if (authorId) {
              const userEndpoint = `http://localhost:4000/api/users/${authorId}`;
              
              // Fetch user data from backend
              const userResponse = await fetch(userEndpoint, {
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
              });
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                
                // Check if username exists
                if (userData && userData.username) {
                  return {
                    ...post,
                    authorUsername: userData.username
                  };
                } else {
                  return {
                    ...post,
                    authorUsername: 'No Username Found'
                  };
                }
              } else {
                return {
                  ...post,
                  authorUsername: `Fetch Error (${userResponse.status})`
                };
              }
            }
          } catch (err) {
            return {
              ...post,
              authorUsername: `Error: ${err.message}`
            };
          }
          
          // Return original post if couldn't fetch username
          return {
            ...post,
            authorUsername: 'Anonymous (Default)'
          };
        }));
        
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