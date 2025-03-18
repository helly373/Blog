import './css/App.css';
import Post from './Post'
import {Route, Routes} from "react-router-dom";
import Layout from './Layout';
import LoginPage from './pages/LoginPage';
import IndexPage from './pages/Indexpage';
import RegisterPage from './pages/Registerpage';

function App() {
  return (
    <Routes>
      {/* Main layout with header */}
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage/>}/>
        {/* Other routes that need the header... */}
      </Route>
      
      {/* Auth pages without layout wrapper */}
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
    </Routes>
  );
}

export default App;