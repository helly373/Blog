import '../css/Registerpage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import ApiService from "../services/api"; // Import the ApiService instead of axios

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // Add error state for better error handling
  const navigate = useNavigate();

  // Function to handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      // Use ApiService instead of direct axios call
      const response = await ApiService.register({
        username,
        email,
        password,
        confirmPassword
      });

      console.log(response);
      
      if (response.message === "User registered successfully.") {
        alert("Registration Successful!");
        navigate('/login');
      } else {
        // If there's an error message in the response
        setError(response.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error registering:", error);
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-screen">
        {/* Back button positioned inside the form */}
        <Link to="/" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to My Blog
        </Link>
        
        <div className="register-screen__content">
          <form className="register-form" onSubmit={handleRegister}>
            {/* Display error message if there is one */}
            {error && <div className="error-message">{error}</div>}
            
            <div className="register-form__field">
              <i className="register-form__icon fas fa-user"></i>
              <input 
                type="text" 
                className="register-form__input" 
                placeholder="Username"  
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="register-form__field">
              <i className="register-form__icon fas fa-envelope"></i>
              <input 
                type="email" 
                className="register-form__input" 
                placeholder="Email"  
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="register-form__field">
              <i className="register-form__icon fas fa-lock"></i>
              <input 
                type="password" 
                className="register-form__input" 
                placeholder="Password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="register-form__field">
              <i className="register-form__icon fas fa-lock"></i>
              <input 
                type="password" 
                className="register-form__input" 
                placeholder="Confirm Password"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="button register-form__submit">
              <span className="button__text">REGISTER NOW</span>
              <i className="register-button__icon fas fa-chevron-right"></i>
            </button>
          </form>
          
          {/* Add a link to login page at the bottom */}
          <div className="register-page-footer">
            <p>Already have an account? <Link to="/login" className="auth-link">Log In</Link></p>
          </div>
        </div>
        <div className="register-screen__background">
          <span className="register-screen__background__shape register-screen__background__shape4"></span>
          <span className="register-screen__background__shape register-screen__background__shape3"></span>
          <span className="register-screen__background__shape register-screen__background__shape2"></span>
          <span className="register-screen__background__shape register-screen__background__shape1"></span>
        </div>
      </div>
    </div>
  );
}