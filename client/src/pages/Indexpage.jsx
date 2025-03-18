import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";

export default function IndexPage() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        // Get the token from localStorage (if user is logged in)
        const token = localStorage.getItem("token");
        
        // Fetch posts from the API
        const response = await fetch('/api/posts', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Unexpected response from server");
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch posts");
        }

        // Use the most recent 2 posts for the featured section
        if (data.length > 0) {
          // Sort by date (newest first) and take the first 2
          const sortedPosts = [...data].sort((a, b) => 
            new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
          ).slice(0, 2);
          
          setFeaturedPosts(sortedPosts);
        } else {
          // Fallback to default featured posts if no posts from API
          setFeaturedPosts([
            {
              id: 1,
              title: "The trip to Spain",
              author: "Travel Adventures",
              date: "2025-03-04 16:03",
              image: "https://photos.smugmug.com/photos/i-MgVPpnd/0/f647accb/L/i-MgVPpnd-L.jpg",
              summary: "Spain, located on the Iberian Peninsula in southwestern Europe, is renowned for its vibrant culture..."
            },
            {
              id: 2,
              title: "Exploring the streets of Barcelona",
              author: "Travel Explorer",
              date: "2025-02-28 14:30",
              image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070",
              summary: "Barcelona offers a perfect blend of beach vibes, cultural experiences, and exquisite cuisine..."
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching featured posts:", error);
        // Fallback to default featured posts on error
        setFeaturedPosts([
          {
            id: 1,
            title: "The trip to Spain",
            author: "Travel Adventures",
            date: "2025-03-04 16:03",
            image: "https://photos.smugmug.com/photos/i-MgVPpnd/0/f647accb/L/i-MgVPpnd-L.jpg",
            summary: "Spain, located on the Iberian Peninsula in southwestern Europe, is renowned for its vibrant culture..."
          },
          {
            id: 2,
            title: "Exploring the streets of Barcelona",
            author: "Travel Explorer",
            date: "2025-02-28 14:30",
            image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070",
            summary: "Barcelona offers a perfect blend of beach vibes, cultural experiences, and exquisite cuisine..."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  // Format date to a readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="home-container">
      {/* Hero section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Travel Adventures</h1>
          <p>Discover amazing destinations and travel stories from around the world</p>
          <Link to="/BlogPage" className="cta-button">
            Explore All Posts
          </Link>
        </div>
      </section>

      {/* Featured posts section */}
      <section className="featured-section">
        <h2>Featured Posts</h2>
        {loading ? (
          <div className="loading">Loading featured posts...</div>
        ) : (
          <div className="featured-posts">
            {featuredPosts.map(post => (
              <div className="featured-post-card" key={post._id || post.id}>
                <div className="featured-post-image">
                  <img 
                    src={post.imageUrl || post.image} 
                    alt={post.title} 
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x250?text=Travel+Adventures";
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="featured-post-content">
                  <h3 className="featured-post-title">{post.title}</h3>
                  <div className="featured-post-meta">
                    <span className="featured-post-author">
                      {typeof post.author === 'object' 
                        ? post.author.username || 'Anonymous' 
                        : post.author || 'Anonymous'}
                    </span>
                    <span className="featured-post-date">
                      {post.date || post.createdAt 
                        ? formatDate(post.date || post.createdAt) 
                        : 'Unknown date'}
                    </span>
                  </div>
                  <p className="featured-post-summary">{post.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-all-container">
          <Link to="/BlogPage" className="view-all-link">
            View All Posts →
          </Link>
        </div>
      </section>

      {/* About section */}
      <section className="about-section">
        <h2>About Our Travel Blog</h2>
        <p>
          Welcome to our travel community! We share authentic experiences, 
          practical tips, and inspiring stories to help you plan your next adventure.
          Our team of passionate travelers explores destinations around the globe
          to bring you the most exciting and up-to-date content.
        </p>
      </section>
    </div>
  );
}