import '../css/loginpage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import ApiService from "../services/api"; // Replace axios import with ApiService

export default function LoginPage() {
  const [email, setEmail] = useState(''); // Changed setemail to setEmail for consistency
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Added for better error handling
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      // Use ApiService instead of direct axios call
      const response = await ApiService.login({ email, password });

      if (response.token) {
        // Save the token
        localStorage.setItem("token", response.token);
        
        // If the response includes user data, save it too
        localStorage.setItem('user', JSON.stringify({
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
          profilePhoto: response.user.profilePhoto || null
          // Add any other user data you need to access throughout the app
        }));
        
        alert("Login Successful!");
        navigate("/");
      } else {
        setError(response.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-screen">
        <Link to="/" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to My Blog
        </Link>

        <div className="login-screen__content">
          <form className="login-form" onSubmit={handleLogin}>
            {/* Display error message if there is one */}
            {error && <div className="error-message">{error}</div>}
            
            <div className="login-form__field">
              <i className="login-form__icon fas fa-user"></i>
              <input 
                type="text" 
                className="login-form__input" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="login-form__field">
              <i className="login-form__icon fas fa-lock"></i>
              <input 
                type="password" 
                className="login-form__input" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="button login-form__submit">
              <span className="button__text">Log In Now</span>
              <i className="login-button__icon fas fa-chevron-right"></i>
            </button>
          </form>
          
          <div className="login-page-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link></p>
          </div>
        </div>
        <div className="login-screen__background">
          <span className="login-screen__background__shape login-screen__background__shape4"></span>
          <span className="login-screen__background__shape login-screen__background__shape3"></span>
          <span className="login-screen__background__shape login-screen__background__shape2"></span>
          <span className="login-screen__background__shape login-screen__background__shape1"></span>
        </div>
      </div>
    </div>
  );
}