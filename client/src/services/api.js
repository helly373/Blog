// src/services/api.js

const BASE_URL =  'http://localhost:4000';

// Create a class for handling API requests
class ApiService {  
  // Auth endpoints
  static async register(userData) {
    try {
      const response = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(credentials) {
    try {
      const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // User profile endpoints
  static async getUserProfile(userId) {
    try {
      console.log("Fetching profile for user ID:", userId);
      
      const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Profile data received:", data);
      
      // Format the response to match what your Profile component expects
      return {
        user: {
          id: data._id,
          username: data.username,
          email: data.email,
          bio: data.bio || '',
          location: data.location || '',
          profilePhoto: data.profilePhoto || null,
          coverPhoto: data.coverPhoto || null,
          interests: data.interests || [],
          visitedCountries: data.visitedCountries || [],
          bucketList: data.bucketList || [],
          followersCount: data.followers?.length || 0,
          followingCount: data.following?.length || 0
        }
      };
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  static async updateProfile(profileData) {
    try {
      const response = await fetch(`${BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Follow/unfollow endpoints
  static async followUser(userId) {
    try {
      const response = await fetch(`${BASE_URL}/api/users/follow/${userId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Follow user error:', error);
      throw error;
    }
  }

  static async unfollowUser(userId) {
    try {
      const response = await fetch(`${BASE_URL}/api/users/unfollow/${userId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Unfollow user error:', error);
      throw error;
    }
  }


   // Post endpoints - Adding the new methods based on PostController.js
   static async createPost(postData) {
    try {
      // Create a FormData object to handle file upload
      const formData = new FormData();
      
      // Add image file to FormData
      if (postData.image) {
        formData.append('image', postData.image);
      }
      
      // Add text fields to FormData
      formData.append('title', postData.title);
      formData.append('summary', postData.summary);
      
      // Add categories if provided
      if (postData.categories && postData.categories.length > 0) {
        formData.append('categories', postData.categories.join(','));
      }
      
      // Add location data if provided
      if (postData.country) formData.append('country', postData.country);
      if (postData.city) formData.append('city', postData.city);
      if (postData.region) formData.append('region', postData.region);
      
      // Get token from local storage
      const token = localStorage.getItem('token');
      
      // We need to use different headers for FormData (without Content-Type)
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      console.log('Sending request with Authorization header:', headers.Authorization);
      
      // Use the endpoint that worked in the original code
      const response = await fetch(`${BASE_URL}/api/post/create-posts`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error('Failed to create post');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }
  
  static async getAllPosts(filters = {}) {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.region) queryParams.append('region', filters.region);
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.category) queryParams.append('category', filters.category);
      
      const queryString = queryParams.toString();
      const url = queryString ? `${BASE_URL}/api/post/posts?${queryString}` : `${BASE_URL}/api/post/posts`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await response.json();
    } catch (error) {
      console.error('Get all posts error:', error);
      throw error;
    }
  }
  
  static async getPostsByRegion(region) {
    try {
      const response = await fetch(`${BASE_URL}/api/post/region/${region}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Get posts by region error for ${region}:`, error);
      throw error;
    }
  }
  
  static async getPostsByCountry(country) {
    try {
      const response = await fetch(`${BASE_URL}/api/post/country/${country}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Get posts by country error for ${country}:`, error);
      throw error;
    }
  }
  
  static async getMapData() {
    try {
      const response = await fetch(`${BASE_URL}/api/post/map-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await response.json();
    } catch (error) {
      console.error('Get map data error:', error);
      throw error;
    }
  }

  // Helper method to get auth headers (includes token)
  static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  static async uploadFile(file, type) {
    try {
      const formData = new FormData();
      formData.append('image', file);  // Make sure this key is 'image' to match backend
  
      // Convert type to the correct parameter format
      // Your backend expects 'profilePicture' or 'coverPicture'
      const uploadType = type === 'profilePicture' ? 'profilePicture' : 'coverPicture';
  
      const response = await fetch(`${BASE_URL}/api/upload/${uploadType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type when using FormData - browser will set it with boundary
        },
        body: formData
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, message: `Error uploading file: ${error.message}` };
    }
  }

  static async getPostById(postId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch(`${BASE_URL}/api/post/postbyId/${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch post');
      }
  
      return await response.json();
    } catch (error) {
      console.error('API Service - getPostById error:', error);
      throw error;
    }
  }
  
  // Update an existing post
  async updatePost(postId, postData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      // Create FormData for file upload if needed
      const formData = new FormData();
      
      // Add text fields to FormData
      if (postData.title) formData.append('title', postData.title);
      if (postData.summary) formData.append('summary', postData.summary);
      
      // Add categories if they exist
      if (postData.categories) {
        if (Array.isArray(postData.categories)) {
          // If categories is already an array, convert to comma-separated string
          formData.append('categories', postData.categories.join(','));
        } else {
          // Otherwise, just append as is
          formData.append('categories', postData.categories);
        }
      }
      
      // Add location information
      if (postData.country) formData.append('country', postData.country);
      if (postData.city) formData.append('city', postData.city);
      if (postData.region) formData.append('region', postData.region);
      
      // Add image file if included in update
      if (postData.image) {
        formData.append('image', postData.image);
      }
  
      const response = await fetch(`${BASE_URL}/api/post/update-posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }
  
      return await response.json();
    } catch (error) {
      console.error('API Service - updatePost error:', error);
      throw error;
    }
  }
  
  // Delete a post
  async deletePost(postId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const response = await fetch(`${BASE_URL}/api/post/delete-posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete post');
      }
  
      return await response.json();
    } catch (error) {
      console.error('API Service - deletePost error:', error);
      throw error;
    }
  }

}

export default ApiService;