// src/services/api.js

// Get the base URL from environment variables
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Create a class for handling API requests
class ApiService {
  // Auth endpoints
  static async register(userData) {
    try {
      const response = await fetch(`${BASE_URL}/users/register`, {
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
      const response = await fetch(`${BASE_URL}/users/login`, {
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
      
      const response = await fetch(`${BASE_URL}/users/${userId}`, {
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
      const response = await fetch(`${BASE_URL}/users/profile`, {
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
      const response = await fetch(`${BASE_URL}/users/follow/${userId}`, {
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
      const response = await fetch(`${BASE_URL}/users/unfollow/${userId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
      return await response.json();
    } catch (error) {
      console.error('Unfollow user error:', error);
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
}

export default ApiService;