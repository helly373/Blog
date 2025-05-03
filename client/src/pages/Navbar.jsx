import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user"));
    
    setIsLoggedIn(!!token);
    if (userData) {
      setUser(userData);
    }
    
    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">Travel Adventures</Link>
        </div>

        {/* Hamburger menu button for mobile */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${mobileMenuOpen ? 'open' : ''}`}></span>
        </div>

        {/* Navigation links and auth buttons */}
        <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="nav-items">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link 
              to="/BlogPage" 
              className={`nav-link ${location.pathname === '/BlogPage' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Blog
            </Link>
            <Link 
              to="/explore" 
              className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              Map
            </Link>
          </div>

          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                {/* Profile photo button */}
                {user && (
                  <Link 
                    to={`/profile/${user.id}`} 
                    className="profile-photo-btn"
                    title="View Profile"
                    onClick={closeMobileMenu}
                  >
                    <img 
                      src={user.profilePhoto || "/default-avatar.jpg"} 
                      alt="Profile" 
                      className="profile-photo"
                    />
                  </Link>
                )}
                <Link 
                  to="/create-post" 
                  className="create-post-btn"
                  onClick={closeMobileMenu}
                >
                  Create Post
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="auth-btn logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="auth-btn login-btn"
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="auth-btn signup-btn"
                  onClick={closeMobileMenu}
                >
                  SignUp
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}