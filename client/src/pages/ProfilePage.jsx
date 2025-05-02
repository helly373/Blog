// ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/Profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    profileImage: '',
    coverImage: ''
  });
  const [previewProfileImage, setPreviewProfileImage] = useState(null);
  const [previewCoverImage, setPreviewCoverImage] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  
  const { username } = useParams();
  const navigate = useNavigate();
  
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  // Configure axios headers with token
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // First, get user by username
        const userResponse = await axios.get(`/api/users/username/${username}`);
        setUser(userResponse.data);
        
        // Then get their posts
        const postsResponse = await axios.get(`/api/posts/user/${userResponse.data._id}`);
        setPosts(postsResponse.data);
        
        setFormData({
          displayName: userResponse.data.displayName || '',
          bio: userResponse.data.bio || '',
          location: userResponse.data.location || '',
          profileImage: userResponse.data.profileImage || '',
          coverImage: userResponse.data.coverImage || ''
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
        console.error('Error fetching profile data:', err);
      }
    };
    
    fetchUserData();
  }, [username]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (name === 'profileImage') {
          setPreviewProfileImage(reader.result);
        } else if (name === 'coverImage') {
          setPreviewCoverImage(reader.result);
        }
      };
      
      reader.readAsDataURL(file);
      
      // Store the file object in formData for later upload
      setFormData({
        ...formData,
        [name]: file
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create a FormData object to handle file uploads
    const data = new FormData();
    data.append('displayName', formData.displayName);
    data.append('bio', formData.bio);
    data.append('location', formData.location);
    
    // Append files only if they've been selected
    if (formData.profileImage instanceof File) {
      data.append('profileImage', formData.profileImage);
    }
    
    if (formData.coverImage instanceof File) {
      data.append('coverImage', formData.coverImage);
    }
    
    try {
      const response = await axios.put(`/api/users/${user._id}/profile`, data, {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(response.data);
      setIsEditing(false);
      // Clear preview images
      setPreviewProfileImage(null);
      setPreviewCoverImage(null);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  if (loading) return <div className="loading-container"><div className="loading"></div></div>;
  if (error) return <div className="error-container">{error}</div>;
  if (!user) return <div className="not-found-container">User not found</div>;
  
  const isOwnProfile = token && user._id === JSON.parse(atob(token.split('.')[1])).id;
  
  return (
    <div className="profile-page">
      {/* Cover Image */}
      <div 
        className="cover-image" 
        style={{ backgroundImage: `url(${previewCoverImage || user.coverImage || '/images/default-cover.jpg'})` }}
      >
        {isEditing && (
          <div className="cover-upload">
            <label htmlFor="coverImage" className="upload-btn">
              Change Cover
            </label>
            <input 
              type="file" 
              id="coverImage"
              name="coverImage"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
            />
          </div>
        )}
      </div>
      
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img 
            src={previewProfileImage || user.profileImage || '/images/default-profile.jpg'} 
            alt={user.username} 
            className="profile-avatar"
          />
          {isEditing && (
            <div className="avatar-upload">
              <label htmlFor="profileImage" className="upload-btn">
                <i className="fas fa-camera"></i>
              </label>
              <input 
                type="file" 
                id="profileImage"
                name="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
            </div>
          )}
        </div>
        
        <div className="profile-info">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="edit-profile-form">
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Your display name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself and your travels..."
                  rows="3"
                  maxLength="500"
                ></textarea>
                <small>{formData.bio.length}/500</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Your location"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-header-top">
                <h1 className="display-name">{user.displayName || user.username}</h1>
                {isOwnProfile && (
                  <div className="profile-actions">
                    <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                      Edit Profile
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </div>
                )}
              </div>
              <div className="username">@{user.username}</div>
              {user.bio && <div className="bio">{user.bio}</div>}
              {user.location && (
                <div className="location">
                  <i className="fas fa-map-marker-alt"></i> {user.location}
                </div>
              )}
              <div className="joined-date">
                Joined {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
        <button 
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'posts' && (
          <div className="posts-grid">
            {posts.length > 0 ? (
              posts.map(post => (
                <div key={post._id} className="post-card" onClick={() => navigate(`/post/${post._id}`)}>
                  {post.images && post.images.length > 0 ? (
                    <div className="post-image" style={{ backgroundImage: `url(${post.images[0].url})` }}></div>
                  ) : (
                    <div className="post-no-image">
                      <h3>{post.title}</h3>
                    </div>
                  )}
                  <div className="post-details">
                    <h3 className="post-title">{post.title}</h3>
                    {post.destination && (
                      <div className="post-location">
                        <i className="fas fa-map-marker-alt"></i> 
                        {post.destination.city ? `${post.destination.city}, ` : ''}
                        {post.destination.country}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-posts">
                <p>No posts yet!</p>
                {isOwnProfile && (
                  <button onClick={() => navigate('/create-post')} className="create-post-btn">
                    Create your first post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'saved' && (
          <div className="saved-posts">
            {user.savedPosts && user.savedPosts.length > 0 ? (
              <div className="posts-grid">
                {/* Show saved posts here similar to posts tab */}
                <p>Saved posts will appear here</p>
              </div>
            ) : (
              <div className="no-posts">
                <p>No saved posts yet!</p>
                <button onClick={() => navigate('/')} className="explore-btn">
                  Explore posts
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'about' && (
          <div className="about-section">
            <h2>About {user.displayName || user.username}</h2>
            <div className="about-content">
              {user.bio ? (
                <div className="about-bio">
                  <h3>Bio</h3>
                  <p>{user.bio}</p>
                </div>
              ) : (
                <p>No bio information provided yet.</p>
              )}
              
              {/* Add more sections here like travel stats, etc. */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;