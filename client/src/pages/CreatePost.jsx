import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CreatePost.css';

const CreatePost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Location state variables (removed latitude and longitude)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!title || !summary || !file) {
      setError('Please fill out all required fields (title, summary, and image)');
      return;
    }
    
    try {
      setLoading(true);
      
      // Get token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to create a post');
        setLoading(false);
        return;
      }
      
      // Create FormData object to send file
      const formData = new FormData();
      formData.append('title', title);
      formData.append('summary', summary);
      formData.append('image', file);
      
      if (categories) {
        formData.append('categories', categories);
      }
      
      // Add location data if provided
      if (country) formData.append('country', country);
      if (city) formData.append('city', city);
      if (region) formData.append('region', region);
      
      // Send request to create post
      const response = await fetch('http://localhost:4000/api/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create post');
      }
      
      // Post created successfully, navigate to blog page
      navigate('/BlogPage');
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.message || 'An error occurred while creating your post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <h1 className="create-post-title">Create a New Travel Post</h1>
      
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
          <label htmlFor="image">Image *</label>
          <input
            type="file"
            id="image"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
            required
          />
          <small>Please upload an image that captures your travel experience</small>
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
            {loading ? 'Creating...' : 'Create Post'}
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

export default CreatePost;