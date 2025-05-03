import './css/App.css';
import {Route, Routes, Navigate} from "react-router-dom";
import Layout from './Layout';
import LoginPage from './pages/LoginPage';
import IndexPage from './pages/Indexpage';
import RegisterPage from './pages/Registerpage';
import BlogPage from './pages/BlogPage';
import CreatePost from './pages/CreatePost';
import WorldMap from './pages/WorldMap';
import Profile from './pages/ProfilePage'; // Import Profile component
import EditProfile from './pages/EditProfilePage'; // Import EditProfile component

// Protected route component
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return element;
};

function App() {
  return (
    <Routes>
      {/* Main layout with header */}
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage/>}/>
        <Route path="/BlogPage" element={<BlogPage/>}/>
        <Route path="/create-post" element={<CreatePost/>}/>
        <Route path="/explore" element={<WorldMap/>}/>
        <Route path="/profile/:userId" element={<Profile/>}/> {/* Add Profile route */}
        <Route path="/edit-profile" element={<ProtectedRoute element={<EditProfile/>}/>}/> {/* Add protected EditProfile route */}
        {/* Other routes that need the header... */}
      </Route>
      
      {/* Auth pages without layout wrapper */}
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
    </Routes>
  );
}

export default App;