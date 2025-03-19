import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/WorldMap.css'; // You'll need to create this CSS file

const WorldMap = () => {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [regionPosts, setRegionPosts] = useState([]);
  
  // Fetch map data on component mount
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage if needed
        const token = localStorage.getItem("token");
        
        // Fetch map data from your API
        const response = await fetch('http://localhost:4000/api/map-data', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch map data");
        }
        
        const data = await response.json();
        setMapData(data);
      } catch (error) {
        console.error("Error fetching map data:", error);
        setError("Failed to load map data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMapData();
  }, []);
  
  // Fetch posts for a specific region when selected
  useEffect(() => {
    if (!selectedRegion) {
      setRegionPosts([]);
      return;
    }
    
    const fetchRegionPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const response = await fetch(`http://localhost:4000/api/posts/region/${selectedRegion}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch posts for ${selectedRegion}`);
        }
        
        const posts = await response.json();
        setRegionPosts(posts);
      } catch (error) {
        console.error(`Error fetching posts for ${selectedRegion}:`, error);
        setRegionPosts([]);
      }
    };
    
    fetchRegionPosts();
  }, [selectedRegion]);
  
  // Handle region selection
  const handleRegionClick = (region) => {
    setSelectedRegion(region === selectedRegion ? null : region);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  if (loading) {
    return <div className="map-loading">Loading map data...</div>;
  }
  
  if (error) {
    return <div className="map-error">{error}</div>;
  }
  
  // List of all regions
  const regions = [
    'Europe', 
    'Asia', 
    'Africa', 
    'North America', 
    'South America', 
    'Australia', 
    'Antarctica'
  ];
  
  return (
    <div className="world-map-container">
      <h1 className="map-title">Explore Our Travel Destinations</h1>
      
      <div className="map-interface">
        <div className="regions-selection">
          <h2>Select a Region</h2>
          <div className="region-buttons">
            {regions.map(region => {
              // Find post count for this region from the mapData
              const regionData = mapData?.regionCounts.find(r => r.region === region);
              const postCount = regionData ? regionData.count : 0;
              
              return (
                <button 
                  key={region}
                  className={`region-button ${selectedRegion === region ? 'active' : ''} ${postCount === 0 ? 'empty' : ''}`}
                  onClick={() => handleRegionClick(region)}
                  disabled={postCount === 0}
                >
                  {region} {postCount > 0 && `(${postCount})`}
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="region-posts-section">
          {selectedRegion ? (
            <>
              <h2>{selectedRegion} Travel Posts</h2>
              {regionPosts.length > 0 ? (
                <div className="region-posts-grid">
                  {regionPosts.map(post => (
                    <div className="region-post-card" key={post._id}>
                      <div className="post-image">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x200?text=Travel";
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                      <div className="post-content">
                        <h3>{post.title}</h3>
                        <div className="post-meta">
                          <span className="post-location">
                            {post.location?.city && `${post.location.city}, `}
                            {post.location?.country}
                          </span>
                          <span className="post-date">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                        <p className="post-summary">{post.summary.substring(0, 120)}...</p>
                        <Link to={`/post/${post._id}`} className="read-more-btn">
                          Read More
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-posts-message">
                  <p>No posts found for {selectedRegion}.</p>
                  <Link to="/create-post" className="create-post-link">
                    Be the first to share your {selectedRegion} adventure!
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="map-statistics">
              <h2>Our Global Coverage</h2>
              
              <div className="stats-container">
                <div className="stat-box">
                  <span className="stat-number">{mapData?.regionCounts.reduce((total, region) => total + region.count, 0)}</span>
                  <span className="stat-label">Total Posts</span>
                </div>
                
                <div className="stat-box">
                  <span className="stat-number">{mapData?.countryCounts.length}</span>
                  <span className="stat-label">Countries</span>
                </div>
                
                <div className="stat-box">
                  <span className="stat-number">{mapData?.regionCounts.filter(r => r.count > 0).length}</span>
                  <span className="stat-label">Continents</span>
                </div>
              </div>
              
              <div className="top-countries">
                <h3>Top Destinations</h3>
                <ul className="country-list">
                  {mapData?.countryCounts.slice(0, 5).map(country => (
                    <li key={country.country} className="country-item">
                      <span className="country-name">{country.country}</span>
                      <span className="country-count">{country.count} post{country.count !== 1 ? 's' : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <p className="map-prompt">Select a region above to explore travel posts by destination.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorldMap;