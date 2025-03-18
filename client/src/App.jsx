import './css/App.css';
import Post from './pages/Post';
import {Route, Routes} from "react-router-dom";
import Layout from './Layout';
import LoginPage from './pages/LoginPage';
import IndexPage from './pages/Indexpage';
import RegisterPage from './pages/Registerpage';
import BlogPage from './pages/BlogPage';
import CreatePost from './pages/CreatePost'; // Import the CreatePost component

function App() {
  return (
    <Routes>
      {/* Main layout with header */}
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage/>}/>
        <Route path="/BlogPage" element={<BlogPage/>}/>
        <Route path="/create-post" element={<CreatePost/>}/> {/* Add CreatePost route */}
        {/* Other routes that need the header... */}
      </Route>
      
      {/* Auth pages without layout wrapper */}
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
    </Routes>
  );
}

export default App;