import '../css/loginpage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [email, setemail] = useState(''); // Using email for login
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook for redirection

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post('http://localhost:4000/api/login', {
        email, // Using email for login
        password,
      });

      // Assuming your backend returns an object with a "token" property
      const { token } = response.data;
      // Save the token (e.g., in localStorage for future requests)
      localStorage.setItem("token", token);
      alert("Login Successful!");

      // Redirect the user to the home or dashboard page
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-screen">
        {/* Back button positioned inside the form */}
        <Link to="/" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to My Blog
        </Link>

        <div className="login-screen__content">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-form__field">
              <i className="login-form__icon fas fa-user"></i>
              <input 
                type="text" 
                className="login-form__input" 
                placeholder="Email" 
                value={email}
                onChange={(e) => setemail(e.target.value)}
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
              />
            </div>
            <button type="submit" className="button login-form__submit">
              <span className="button__text">Log In Now</span>
              <i className="login-button__icon fas fa-chevron-right"></i>
            </button>
          </form>
          
          {/* Add a link to sign up page at the bottom */}
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
