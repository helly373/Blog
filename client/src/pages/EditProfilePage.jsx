import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import '../css/EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({
    profilePhoto: 0,
    coverPhoto: 0
  });
  
  const [profileData, setProfileData] = useState({
    bio: '',
    location: '',
    interests: [],
    visitedCountries: [],
    bucketList: [],
    profilePhoto: '',
    coverPhoto: ''
  });
  
  // Refs for file inputs
  const profilePictureInputRef = useRef(null);
  const coverPictureInputRef = useRef(null);
  
  // Image previews
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [coverPicturePreview, setCoverPicturePreview] = useState(null);
  
  // Files to upload
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [coverPictureFile, setCoverPictureFile] = useState(null);
  
  // For handling array inputs
  const [interestInput, setInterestInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [bucketListInput, setBucketListInput] = useState('');
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getUserProfile(currentUser.id);
        if (data.user) {
          // Set the form data from the user profile
          setProfileData({
            bio: data.user.bio || '',
            location: data.user.location || '',
            interests: data.user.interests || [],
            visitedCountries: data.user.visitedCountries || [],
            bucketList: data.user.bucketList || [],
            profilePhoto: data.user.profilePhoto || '',
            coverPhoto: data.user.coverPhoto || ''
          });
          
          // Set image previews if available
          if (data.user.profilePhoto) {
            setProfilePicturePreview(data.user.profilePhoto);
          }
          if (data.user.coverPhoto) {
            setCoverPicturePreview(data.user.coverPhoto);
          }
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
  }, [currentUser.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handlers for image uploads
  const handleProfilePictureClick = () => {
    profilePictureInputRef.current.click();
  };
  
  const handleCoverPictureClick = () => {
    coverPictureInputRef.current.click();
  };
  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Store the file for upload
    setProfilePictureFile(file);
    console.log('Profile picture selected:', file.name, 'Size:', Math.round(file.size / 1024), 'KB');
  };
  
  const handleCoverPictureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Preview the image
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Store the file for upload
    setCoverPictureFile(file);
    console.log('Cover picture selected:', file.name, 'Size:', Math.round(file.size / 1024), 'KB');
  };

  // Function to upload a file using the new API endpoint
  const uploadFile = async (file, type) => {
    if (!file) {
      console.log(`No ${type} file selected, keeping existing URL:`, profileData[type === 'profilePicture' ? 'profilePhoto' : 'coverPhoto'] || 'none');
      // If no file is selected, resolve with existing URL
      return profileData[type === 'profilePicture' ? 'profilePhoto' : 'coverPhoto'] || '';
    }
    
    try {
      console.log(`Starting upload for ${type}:`, file.name);
      
      // Create a mock XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      
      // Use the xhr.upload.onprogress event to track upload progress
      const uploadPromise = new Promise((resolve, reject) => {
        // Set up progress tracking
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            console.log(`${type} upload progress: ${progress}%`);
            setUploadProgress(prev => ({
              ...prev,
              [type === 'profilePicture' ? 'profilePhoto' : 'coverPhoto']: progress
            }));
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            if (response.success) {
              resolve(response.url);
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          } else {
            reject(new Error(`HTTP error ${xhr.status}: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => {
          reject(new Error('Network error during upload'));
        };
      });
      
      // Create FormData manually instead of using ApiService to track progress
      const formData = new FormData();
      formData.append('image', file);
      
      // Open and send the request
      xhr.open('POST', `/api/upload/${type}`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
      
      // Wait for the upload to complete
      const url = await uploadPromise;
      console.log(`${type} uploaded successfully:`, url);
      return url;
    } catch (err) {
      console.error(`${type} upload failed:`, err);
      setError(`${type} upload failed: ${err.message || 'Unknown error'}`);
      throw err;
    }
  };

  // Handlers for array inputs
  const addInterest = () => {
    if (interestInput.trim() !== '') {
      setProfileData((prev) => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (index) => {
    setProfileData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const addCountry = () => {
    if (countryInput.trim() !== '') {
      setProfileData((prev) => ({
        ...prev,
        visitedCountries: [...prev.visitedCountries, countryInput.trim()]
      }));
      setCountryInput('');
    }
  };

  const removeCountry = (index) => {
    setProfileData((prev) => ({
      ...prev,
      visitedCountries: prev.visitedCountries.filter((_, i) => i !== index)
    }));
  };

  const addBucketListItem = () => {
    if (bucketListInput.trim() !== '') {
      setProfileData((prev) => ({
        ...prev,
        bucketList: [...prev.bucketList, bucketListInput.trim()]
      }));
      setBucketListInput('');
    }
  };

  const removeBucketListItem = (index) => {
    setProfileData((prev) => ({
      ...prev,
      bucketList: prev.bucketList.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      
      console.log('Starting profile update...');
      console.log('Current user ID:', currentUser.id);
      
      // Upload images if files are selected
      let profilePhotoUrl = profileData.profilePhoto;
      let coverPhotoUrl = profileData.coverPhoto;
      
      // Only attempt upload if files are selected
      if (profilePictureFile) {
        try {
          const result = await ApiService.uploadFile(profilePictureFile, 'profilePicture');
          if (result.success) {
            profilePhotoUrl = result.url;
            // Set progress to 100% when complete
            setUploadProgress(prev => ({
              ...prev,
              profilePhoto: 100
            }));
          } else {
            throw new Error(result.message || 'Upload failed');
          }
        } catch (uploadErr) {
          console.error('Profile picture upload failed:', uploadErr);
          setError(`Profile picture upload failed: ${uploadErr.message || 'Unknown error'}`);
          setSubmitting(false);
          return;
        }
      }
      
      if (coverPictureFile) {
        try {
          coverPhotoUrl = await uploadFile(coverPictureFile, 'coverPicture');
        } catch (uploadErr) {
          console.error('Cover picture upload failed:', uploadErr);
          setError(`Cover picture upload failed: ${uploadErr.message || 'Unknown error'}`);
          setSubmitting(false);
          return; // Stop form submission if upload fails
        }
      }
      
      // Prepare updated profile data with image URLs
      const updatedProfileData = {
        ...profileData,
        profilePhoto: profilePhotoUrl,
        coverPhoto: coverPhotoUrl
      };
      
      console.log('Sending updated profile data to API:', updatedProfileData);
      
      // Update profile via API
      const response = await ApiService.updateProfile(updatedProfileData);
      console.log('API response:', response);
      
      if (response.user) {
        setSuccess('Profile updated successfully!');
        
        // Update local storage with new user data
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          ...response.user
        }));
        
        // Navigate to profile page after short delay
        setTimeout(() => {
          navigate(`/profile/${currentUser.id}`);
        }, 1500);
      } else {
        setError(response.message || 'Failed to update profile');
        console.error('API error:', response.message || 'No error message provided');
      }
    } catch (err) {
      setError('Error updating profile. Please try again later.');
      console.error('Profile update error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="edit-profile-loading">Loading profile data...</div>;

  return (
    <div className="edit-profile-container">
      <h1 className="edit-profile-title">Edit Your Profile</h1>
      
      {error && <div className="edit-profile-error">{error}</div>}
      {success && <div className="edit-profile-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* Profile Picture Section */}
        <div className="form-group image-upload-section">
          <label>Profile Picture</label>
          <div 
            className="profile-picture-container"
            onClick={handleProfilePictureClick}
          >
            {profilePicturePreview ? (
              <img 
                src={profilePicturePreview} 
                alt="Profile Preview" 
                className="profile-picture-preview" 
              />
            ) : (
              <div className="profile-picture-placeholder">
                <i className="fa fa-user"></i>
                <span>Click to upload</span>
              </div>
            )}
            <input
              type="file"
              ref={profilePictureInputRef}
              onChange={handleProfilePictureChange}
              accept="image/*"
              className="file-input"
              style={{ display: 'none' }}
            />
          </div>
          {uploadProgress.profilePhoto > 0 && uploadProgress.profilePhoto < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${uploadProgress.profilePhoto}%` }}
                ></div>
              </div>
              <div className="progress-text">{uploadProgress.profilePhoto}%</div>
            </div>
          )}
          {profilePictureFile && (
            <div className="selected-file-info">
              Selected: {profilePictureFile.name} ({Math.round(profilePictureFile.size / 1024)} KB)
            </div>
          )}
        </div>
        
        {/* Cover Picture Section */}
        <div className="form-group image-upload-section">
          <label>Cover Picture</label>
          <div 
            className="cover-picture-container"
            onClick={handleCoverPictureClick}
          >
            {coverPicturePreview ? (
              <img 
                src={coverPicturePreview} 
                alt="Cover Preview" 
                className="cover-picture-preview" 
              />
            ) : (
              <div className="cover-picture-placeholder">
                <i className="fa fa-image"></i>
                <span>Click to upload</span>
              </div>
            )}
            <input
              type="file"
              ref={coverPictureInputRef}
              onChange={handleCoverPictureChange}
              accept="image/*"
              className="file-input"
              style={{ display: 'none' }}
            />
          </div>
          {uploadProgress.coverPhoto > 0 && uploadProgress.coverPhoto < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${uploadProgress.coverPhoto}%` }}
                ></div>
              </div>
              <div className="progress-text">{uploadProgress.coverPhoto}%</div>
            </div>
          )}
          {coverPictureFile && (
            <div className="selected-file-info">
              Selected: {coverPictureFile.name} ({Math.round(coverPictureFile.size / 1024)} KB)
            </div>
          )}
        </div>
        
        {/* Rest of the form remains the same... */}
        <div className="form-group">
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={profileData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself..."
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={profileData.location}
            onChange={handleChange}
            placeholder="Where are you based?"
            className="form-control"
          />
        </div>
        
        <div className="form-group">
          <label>Interests</label>
          <div className="array-input-container">
            <input
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="Add an interest"
              className="array-input"
            />
            <button 
              type="button" 
              onClick={addInterest}
              className="add-array-btn"
            >
              Add
            </button>
          </div>
          <div className="tags-container">
            {profileData.interests.map((interest, index) => (
              <div key={index} className="tag">
                {interest}
                <button 
                  type="button" 
                  onClick={() => removeInterest(index)}
                  className="remove-tag-btn"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Countries Visited</label>
          <div className="array-input-container">
            <input
              type="text"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              placeholder="Add a country"
              className="array-input"
            />
            <button 
              type="button" 
              onClick={addCountry}
              className="add-array-btn"
            >
              Add
            </button>
          </div>
          <div className="tags-container">
            {profileData.visitedCountries.map((country, index) => (
              <div key={index} className="tag">
                {country}
                <button 
                  type="button" 
                  onClick={() => removeCountry(index)}
                  className="remove-tag-btn"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Bucket List</label>
          <div className="array-input-container">
            <input
              type="text"
              value={bucketListInput}
              onChange={(e) => setBucketListInput(e.target.value)}
              placeholder="Add a bucket list item"
              className="array-input"
            />
            <button 
              type="button" 
              onClick={addBucketListItem}
              className="add-array-btn"
            >
              Add
            </button>
          </div>
          <div className="bucket-list-container">
            {profileData.bucketList.map((item, index) => (
              <div key={index} className="bucket-list-item">
                {item}
                <button 
                  type="button" 
                  onClick={() => removeBucketListItem(index)}
                  className="remove-bucket-item-btn"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(`/profile/${currentUser.id}`)}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="save-btn"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;