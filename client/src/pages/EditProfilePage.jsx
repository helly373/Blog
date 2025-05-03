import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AWS from 'aws-sdk';
import ApiService from '../services/api';
import '../css/EditProfile.css';

// AWS S3 Configuration
const S3_BUCKET = process.env.REACT_APP_AWS_BUCKET_NAME || "travel-user-images";
const REGION = process.env.REACT_APP_AWS_REGION || "us-east-2";

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
  
  // Add AWS debug state to track configuration status
  const [awsConfigStatus, setAwsConfigStatus] = useState({
    hasAccessKey: false,
    hasSecretKey: false
  });
  
  const [profileData, setProfileData] = useState({
    bio: '',
    location: '',
    interests: [],
    visitedCountries: [],
    bucketList: [],
    profilePhoto: '', // Changed to match database schema
    coverPhoto: ''    // Changed to match database schema
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
            profilePhoto: data.user.profilePhoto || '', // Changed to match database schema
            coverPhoto: data.user.coverPhoto || ''      // Changed to match database schema
          });
          
          // Set image previews if available
          if (data.user.profilePhoto) { // Changed to match database schema
            setProfilePicturePreview(data.user.profilePhoto);
          }
          if (data.user.coverPhoto) { // Changed to match database schema
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
    
    // Log AWS config info for debugging
    const awsHasAccessKey = !!process.env.REACT_APP_AWS_ACCESS_KEY_ID;
    const awsHasSecretKey = !!process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
    
    // Update AWS config status
    setAwsConfigStatus({
      hasAccessKey: awsHasAccessKey,
      hasSecretKey: awsHasSecretKey
    });
    
    console.log('AWS S3 Config:', {
      bucket: S3_BUCKET,
      region: REGION,
      hasAccessKey: awsHasAccessKey,
      hasSecretKey: awsHasSecretKey
    });
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

  // Function to upload a file to AWS S3
  const uploadToS3 = (file, type) => {
    return new Promise((resolve, reject) => {
      // Map frontend types to database field names
      const typeMap = {
        'profilePicture': 'profilePhoto',
        'coverPicture': 'coverPhoto'
      };
      
      // Get the database field name
      const dbField = typeMap[type] || type;
      
      if (!file) {
        console.log(`No ${type} file selected, keeping existing URL:`, profileData[dbField] || 'none');
        // If no file is selected, resolve with existing URL
        resolve(profileData[dbField] || '');
        return;
      }
  
      console.log(`Starting S3 upload for ${type}:`, file.name);
      console.log('File size:', Math.round(file.size / 1024), 'KB');
      console.log('File type:', file.type);
      
      // Configure AWS
      try {
        // Check if AWS credentials are available
        if (!process.env.REACT_APP_AWS_ACCESS_KEY_ID || !process.env.REACT_APP_AWS_SECRET_ACCESS_KEY) {
          console.error('AWS credentials not found in environment variables');
          setError('AWS configuration error. Please check your environment variables.');
          reject(new Error('AWS credentials not configured'));
          return;
        }
        
        // Configure AWS
        AWS.config.update({
          accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
          region: REGION
        });
      } catch (configError) {
        console.error('Error configuring AWS:', configError);
        setError('AWS configuration error: ' + configError.message);
        reject(configError);
        return;
      }
  
      // Create a unique file name to prevent overwrites
      const timestamp = new Date().getTime();
      const fileName = `${currentUser.id}/${type}_${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      console.log('Generated filename:', fileName);
      
      // Set up S3 upload parameters - WITHOUT ACL to fix the bucket error
      const params = {
        // ACL property removed since bucket doesn't allow ACLs
        Body: file,
        Bucket: S3_BUCKET,
        Key: fileName,
        ContentType: file.type
      };
  
      console.log('S3 params:', {
        Bucket: params.Bucket,
        Key: params.Key,
        ContentType: params.ContentType
      });
      
      try {
        // Create S3 instance
        const s3 = new AWS.S3({
          params: { Bucket: S3_BUCKET },
          region: REGION,
        });
        
        // Upload the file to S3
        s3.upload(params)
          .on('httpUploadProgress', (evt) => {
            // Update progress
            const progress = Math.round((evt.loaded / evt.total) * 100);
            console.log(`${type} upload progress: ${progress}%`);
            setUploadProgress(prev => ({
              ...prev,
              [dbField]: progress  // Use database field name for state update
            }));
          })
          .send((err, data) => {
            if (err) {
              console.error(`Error uploading ${type}:`, err);
              console.error('S3 error details:', JSON.stringify(err, null, 2));
              console.error('Error code:', err.code);
              console.error('Error message:', err.message);
              
              // Handle specific error types
              if (err.code === 'NetworkingError') {
                setError('Network connectivity issue detected. Please check your connection.');
              } else if (err.code === 'AccessDenied') {
                setError('Access denied - check S3 bucket permissions and credentials.');
              } else if (err.code === 'NoSuchBucket') {
                setError(`Bucket "${S3_BUCKET}" does not exist or is not accessible.`);
              } else {
                setError(`Error uploading ${type}: ${err.message}`);
              }
              
              reject(err);
            } else {
              console.log(`Successfully uploaded ${type}:`, data.Location);
              
              // If the S3 URL doesn't have the right format, construct one
              let finalUrl = data.Location;
              if (!finalUrl || !finalUrl.startsWith('http')) {
                finalUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${params.Key}`;
                console.log(`Constructed public URL: ${finalUrl}`);
              }
              
              resolve(finalUrl);
            }
          });
      } catch (uploadError) {
        console.error('Error initiating upload:', uploadError);
        setError('Error initiating upload: ' + uploadError.message);
        reject(uploadError);
      }
    });
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
          profilePhotoUrl = await uploadToS3(profilePictureFile, 'profilePicture');
          console.log('Profile picture uploaded successfully:', profilePhotoUrl);
        } catch (uploadErr) {
          console.error('Profile picture upload failed:', uploadErr);
          setError(`Profile picture upload failed: ${uploadErr.message || 'Unknown error'}`);
          setSubmitting(false);
          return; // Stop form submission if upload fails
        }
      }
      
      if (coverPictureFile) {
        try {
          coverPhotoUrl = await uploadToS3(coverPictureFile, 'coverPicture');
          console.log('Cover picture uploaded successfully:', coverPhotoUrl);
        } catch (uploadErr) {
          console.error('Cover picture upload failed:', uploadErr);
          setError(`Cover picture upload failed: ${uploadErr.message || 'Unknown error'}`);
          setSubmitting(false);
          return; // Stop form submission if upload fails
        }
      }
      
      // Prepare updated profile data with S3 URLs
      const updatedProfileData = {
        ...profileData,
        profilePhoto: profilePhotoUrl, // Changed to match database schema
        coverPhoto: coverPhotoUrl     // Changed to match database schema
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
      console.error('Error details:', JSON.stringify(err, null, 2));
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
      
      {/* Display AWS configuration status */}
      {!awsConfigStatus.hasAccessKey || !awsConfigStatus.hasSecretKey ? (
        <div className="edit-profile-warning">
          <strong>Warning:</strong> AWS credentials not properly configured. Image uploads may not work.
        </div>
      ) : null}
      
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
          {uploadProgress.profilePicture > 0 && uploadProgress.profilePicture < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${uploadProgress.profilePicture}%` }}
                ></div>
              </div>
              <div className="progress-text">{uploadProgress.profilePicture}%</div>
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
          {uploadProgress.coverPicture > 0 && uploadProgress.coverPicture < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${uploadProgress.coverPicture}%` }}
                ></div>
              </div>
              <div className="progress-text">{uploadProgress.coverPicture}%</div>
            </div>
          )}
          {coverPictureFile && (
            <div className="selected-file-info">
              Selected: {coverPictureFile.name} ({Math.round(coverPictureFile.size / 1024)} KB)
            </div>
          )}
        </div>
        
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