import '../css/Registerpage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // Function to handle registration
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post('http://localhost:4000/api/register', {
        username,
        email,
        password,
        confirmPassword
      });

      console.log(response.data);
      alert("Registration Successful!");
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (error) {
      console.error("Error registering:", error);
      alert("Registration failed. Please try again.");
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
            <div className="register-form__field">
              <i className="register-form__icon fas fa-user"></i>
              <input 
                type="text" 
                className="register-form__input" 
                placeholder="Username"  
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
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