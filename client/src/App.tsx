import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Components/LoginSignUp/LoginSignUp";
import Dashboard from "./Components/Dashboard/Dashboard";
import Navbar from "./Components/Navbar/Navbar";
import AuthProvider from "./Components/AuthProvider/AuthProvider";
import ProjectDetails from "./Components/ProjectDetails/ProjectDetails";

const App = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signUp" element={<LoginPage />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/project/:id" element={<ProjectDetails />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App;