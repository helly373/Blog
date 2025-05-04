import { Outlet } from "react-router-dom";
// import Header from "./Header";
import Navbar from "./pages/Navbar";

export default function layout(){
    return (
        <main>
            <Navbar />
            <Outlet />
        </main>
    );
}