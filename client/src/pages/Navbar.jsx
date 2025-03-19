import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
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
    setIsLoggedIn(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
            >
              Home
            </Link>
            <Link 
              to="/BlogPage" 
              className={`nav-link ${location.pathname === '/BlogPage' ? 'active' : ''}`}
            >
              Blog
            </Link>
            <Link 
              to="/explore" 
              className={`nav-link ${location.pathname === '/explore' ? 'active' : ''}`}
            >
              Map
            </Link>
          </div>

          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <Link to="/create-post" className="create-post-btn">
                  Create Post
                </Link>
                <button onClick={handleLogout} className="auth-btn logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="auth-btn login-btn">
                  Login
                </Link>
                <Link to="/register" className="auth-btn signup-btn">
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