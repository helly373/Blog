import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/CreatePost.css'; // We'll reuse the CreatePost CSS
import ApiService from '../services/api';

const EditPost = () => {
  const navigate = useNavigate();
  const { postId } = useParams(); // Get postId from URL params
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState(''); // Store current image URL
  const [categories, setCategories] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // Location state variables
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  
  // Available regions/continents
  const regions = [
    'Europe', 
    'Asia', 
    'Africa', 
    'North America', 
    'South America', 
    'Australia', 
    'Antarctica',
    'Uncategorized'
  ];

  // Fetch existing post data when component mounts
  // In EditPost.js, update the useEffect function:

useEffect(() => {
  const fetchPostData = async () => {
    try {
      setFetchLoading(true);
      
      // Get token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to edit a post');
        navigate('/login');
        return;
      }
      
      // Get user data from localStorage - using the 'user' object instead of 'userId'
      const userJSON = localStorage.getItem('user');
      const user = userJSON ? JSON.parse(userJSON) : null;
      const userId = user ? user.id : null;
      
      console.log("Current user ID for edit:", userId);
      
      // Fetch post data by ID
      const post = await ApiService.getPostById(postId);
      console.log("Fetched post for editing:", post);
      
      // Check if post exists
      if (!post) {
        setError('Post not found');
        return;
      }
      
      // Check if current user is the author
      const postAuthorId = typeof post.author === 'string' 
        ? post.author 
        : (post.author && post.author._id ? post.author._id : post.author);
      
      console.log("Post author ID:", postAuthorId, "Current user ID:", userId);
      
      // Convert both to strings for comparison
      const strAuthorId = String(postAuthorId).trim();
      const strUserId = String(userId).trim();
      const isUserPost = strAuthorId === strUserId;
      
      console.log("Is user's post?", isUserPost);
      
      if (!isUserPost) {
        setError('You are not authorized to edit this post');
        navigate('/BlogPage');
        return;
      }
      
      // Populate form with existing data
      setTitle(post.title || '');
      setSummary(post.summary || post.content || '');
      setCurrentImage(post.imageUrl || post.image || '');
      
      // Handle categories
      if (post.categories && Array.isArray(post.categories)) {
        setCategories(post.categories.join(', '));
      }
      
      // Handle location data
      const location = post.location || {};
      setCountry(location.country || '');
      setCity(location.city || '');
      setRegion(location.region || '');
      
    } catch (err) {
      console.error('Error fetching post data:', err);
      setError(err.message || 'Failed to load post data');
    } finally {
      setFetchLoading(false);
    }
  };
  
  fetchPostData();
}, [postId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!title || !summary) {
      setError('Please fill out all required fields (title and summary)');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to update a post');
        setLoading(false);
        return;
      }
      
      // Prepare categories array if provided
      const categoriesArray = categories ? categories.split(',').map(cat => cat.trim()) : [];
      
      // Prepare update data
      const updateData = {
        title,
        summary,
        categories: categoriesArray,
        country,
        city,
        region
      };
      
      // Only include image if a new one was selected
      if (file) {
        updateData.image = file;
      }
      
      // Call the ApiService method to update post
      const response = await ApiService.updatePost(postId, updateData);
      
      // Check if there was an error in the response
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Post updated successfully, navigate to blog page
      navigate('/BlogPage');
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.message || 'An error occurred while updating your post');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="create-post-container">
        <h1 className="create-post-title">Loading Post Data...</h1>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <h1 className="create-post-title">Edit Your Travel Post</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="create-post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a compelling title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="summary">Summary *</label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Write a brief summary of your travel experience"
            required
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image</label>
          {currentImage && (
            <div className="current-image">
              <p>Current image:</p>
              <img 
                src={currentImage} 
                alt="Current post" 
                style={{ maxWidth: '200px', maxHeight: '150px', marginBottom: '10px' }} 
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/200x150?text=Image+Not+Available";
                  e.target.onerror = null;
                }}
              />
            </div>
          )}
          <input
            type="file"
            id="image"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
          />
          <small>Only select a new image if you want to replace the current one</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="categories">Categories</label>
          <input
            type="text"
            id="categories"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="Enter categories separated by commas (e.g., Mountains, Hiking, Adventure)"
          />
          <small>Optional: Add categories to help organize your post</small>
        </div>
        
        {/* Location Information Section */}
        <div className="location-section">
          <h3>Location Information</h3>
          
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., Spain, Japan, Brazil"
              />
            </div>
            
            <div className="form-group half-width">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Barcelona, Tokyo, Rio de Janeiro"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="region">Region/Continent</label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="">Select a region</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Post'}
          </button>
          
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/BlogPage')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;