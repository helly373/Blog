// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ApiService from '../services/api';
import '../css/Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const isOwnProfile = currentUser.id === userId;

  // S3 bucket and region for constructing URLs if needed
  const S3_BUCKET = 'travel-user-images';
  const REGION = 'us-east-2';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getUserProfile(userId);
        if (data.user) {
          setProfile(data.user);
          console.log('Profile data loaded:', data.user);
          console.log('Profile photo URL:', data.user.profilePhoto);
          console.log('Cover photo URL:', data.user.coverPhoto);
        } else {
          setError(data.message || 'Failed to load profile');
        }
      } catch (err) {
        setError('Error fetching profile. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    try {
      await ApiService.followUser(userId);
      // Refresh profile to update follower count
      const data = await ApiService.getUserProfile(userId);
      if (data.user) {
        setProfile(data.user);
      }
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await ApiService.unfollowUser(userId);
      // Refresh profile to update follower count
      const data = await ApiService.getUserProfile(userId);
      if (data.user) {
        setProfile(data.user);
      }
    } catch (err) {
      console.error('Error unfollowing user:', err);
    }
  };

  // Function to get a valid image URL
  const getValidImageUrl = (url, defaultUrl) => {
    if (!url) return defaultUrl;
    
    // Check if this is an S3 path without full URL
    if (url.includes('/') && !url.startsWith('http')) {
      // If it's just a path from the bucket, construct the full URL
      const path = url.startsWith('/') ? url.substring(1) : url;
      console.log(`Converting path to full URL: ${path}`);
      return `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${path}`;
    }
    
    return url;
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!profile) return <div className="profile-not-found">Profile not found</div>;

  // Default images if none are provided
  const defaultProfilePic = '/default-profile.jpg';
  const defaultCoverPic = '/default-cover.jpg';

  // Get valid image URLs - use profilePhoto and coverPhoto field names
  const profilePicUrl = getValidImageUrl(profile.profilePhoto, defaultProfilePic);
  const coverPicUrl = getValidImageUrl(profile.coverPhoto, defaultCoverPic);
  
  console.log('Displaying profile picture:', profilePicUrl);
  console.log('Displaying cover picture:', coverPicUrl);

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div 
          className="profile-cover-photo" 
          style={{ 
            backgroundImage: `url(${coverPicUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="profile-photo-container">
            <img 
              src={profilePicUrl} 
              alt={`${profile.username}'s profile`}
              className="profile-photo"
              onError={(e) => {
                console.error('Image failed to load:', e.target.src);
                e.target.src = defaultProfilePic;
              }}
            />
          </div>
        </div>
        
        <div className="profile-info-header">
          <h1 className="profile-username">{profile.username}</h1>
          {isOwnProfile ? (
            <Link to="/edit-profile" className="edit-profile-btn">
              Edit Profile
            </Link>
          ) : (
            <button 
              className="follow-btn"
              onClick={currentUser.following?.includes(profile.id) ? handleUnfollow : handleFollow}
            >
              {currentUser.following?.includes(profile.id) ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <span className="stat-count">{profile.followersCount || 0}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat">
          <span className="stat-count">{profile.followingCount || 0}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat">
          <span className="stat-count">{profile.posts?.length || 0}</span>
          <span className="stat-label">Posts</span>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Bio</h2>
          <p className="profile-bio">{profile.bio || 'No bio yet'}</p>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Location</h2>
          <p className="profile-location">{profile.location || 'Not specified'}</p>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Interests</h2>
          <div className="profile-interests">
            {profile.interests && profile.interests.length > 0 ? (
              <ul className="interests-list">
                {profile.interests.map((interest, index) => (
                  <li key={index} className="interest-tag">{interest}</li>
                ))}
              </ul>
            ) : (
              <p>No interests added yet</p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Countries Visited</h2>
          <div className="profile-countries">
            {profile.visitedCountries && profile.visitedCountries.length > 0 ? (
              <ul className="countries-list">
                {profile.visitedCountries.map((country, index) => (
                  <li key={index} className="country-tag">{country}</li>
                ))}
              </ul>
            ) : (
              <p>No countries added yet</p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Bucket List</h2>
          <div className="profile-bucket-list">
            {profile.bucketList && profile.bucketList.length > 0 ? (
              <ul className="bucket-list">
                {profile.bucketList.map((item, index) => (
                  <li key={index} className="bucket-list-item">{item}</li>
                ))}
              </ul>
            ) : (
              <p>No bucket list items added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;