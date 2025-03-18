import '../css/loginpage.css';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-screen">

      {/* Back button positioned inside the form */}
      <Link to="/" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to My Blog
        </Link>

        <div className="login-screen__content">
          <form className="login-form">
            <div className="login-form__field">
              <i className="login-form__icon fas fa-user"></i>
              <input 
                type="text" 
                className="login-form__input" 
                placeholder="User name / Email" 
              />
            </div>
            <div className="login-form__field">
              <i className="login-form__icon fas fa-lock"></i>
              <input 
                type="password" 
                className="login-form__input" 
                placeholder="Password" 
              />
            </div>
            <button className="button login-form__submit">
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