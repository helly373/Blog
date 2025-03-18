import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Blogpage.css";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState(null); // For storing debugging information

  useEffect(() => {
    // Fetch posts from the backend API
    const fetchPosts = async () => {
      try {
        setLoading(true);
        
        // Get the token from localStorage (if user is logged in)
        const token = localStorage.getItem("token");
        console.log("Token available:", !!token); // Debug: Check if token exists
        
        // Make API request to fetch posts - use relative URL
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

        console.log("Posts fetched successfully:", data);
        
        // Store first post for debugging
        const firstPost = data[0];
        if (firstPost) {
          console.log("First post author:", firstPost.author);
          console.log("First post author type:", typeof firstPost.author);
          setDebugInfo({
            firstPostId: firstPost._id,
            firstPostAuthor: firstPost.author,
            authorType: typeof firstPost.author
          });
        }
        
        // Fetch author usernames for posts
        const postsWithUsernames = await Promise.all(data.map(async (post, index) => {
          try {
            // Log post author info
            console.log(`Post ${index} - author:`, post.author);
            
            // Get the author ID - handle both string ID and object with _id
            const authorId = typeof post.author === 'string' 
              ? post.author 
              : (post.author && post.author._id ? post.author._id : post.author);
            
            console.log(`Post ${index} - resolved authorId:`, authorId);
            
            if (!authorId) {
              console.error(`No valid author ID found for post ${index}`);
              return { ...post, authorUsername: 'Missing Author ID' };
            }
            
            // Only proceed with fetch if we have an authorId
            if (authorId) {
              const userEndpoint = `http://localhost:4000/api/users/${authorId}`;
              console.log(`Fetching user from: ${userEndpoint}`);
              
              // Fetch user data from backend
              const userResponse = await fetch(userEndpoint, {
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
              });
              
              console.log(`User API response status: ${userResponse.status}`);
              
              if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log(`User data for post ${index}:`, userData);
                
                // Check if username exists
                if (userData && userData.username) {
                  console.log(`Found username: ${userData.username}`);
                  return {
                    ...post,
                    authorUsername: userData.username
                  };
                } else {
                  console.error(`No username in userData for post ${index}:`, userData);
                  return {
                    ...post,
                    authorUsername: 'No Username Found'
                  };
                }
              } else {
                console.error(`Failed to fetch user for post ${index}. Status: ${userResponse.status}`);
                return {
                  ...post,
                  authorUsername: `Fetch Error (${userResponse.status})`
                };
              }
            }
          } catch (err) {
            console.error(`Error fetching username for post ${index}:`, err);
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
        
        console.log("Posts with usernames:", postsWithUsernames);
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
      
      {/* Debug information - only visible during development */}
      {/* {debugInfo && process.env.NODE_ENV === 'development' && (
        <div style={{background: '#f0f0f0', padding: '10px', margin: '10px 0', borderRadius: '5px'}}>
          <h3>Debug Info:</h3>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )} */}
      
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
                <p className="post-summary-horizontal">{post.summary}</p>
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
    </div>
  );
}