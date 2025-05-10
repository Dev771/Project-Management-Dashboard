import { useState } from "react";
import { LogOut } from "lucide-react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../redux/actions/userActions";
import { Avatar } from "@mui/material";

const Navbar = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user } = useSelector((state) => state.user);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        localStorage.clear();
        navigate("/login");
    }

    return (
      <nav className="bg-white dark:bg-gray-800 shadow-md dark:text-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
                    <span className="text-xl font-bold">Project Management Hub</span>
                </div>
                
                <div className="flex items-center">
                    <div className="relative ml-3">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)} 
                            className="flex text-sm rounded-full focus:ring-2 focus:ring-blue-500"
                        >
                            <Avatar alt={user?.name} src="/static/images/avatar/1.jpg" />
                        </button>
                        
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border dark:border-gray-700">
                                <div className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign out
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </nav>
    )
}

export default Navbar