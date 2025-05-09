import { useEffect } from "react";
import mainInstance from "../../services/networkAdapters/mainAxiosInstance";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUserDetails } from "../../redux/actions/userActions";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const getUserDetails = async () => {
        try {
            const response = await mainInstance.get("/auth/getUserDetails");
            dispatch(updateUserDetails(response.data.data, localStorage.getItem("token") || ""));
        } catch (err) {
            console.log(err);
            navigate("/login");
            localStorage.removeItem("token");
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token && (window.location.pathname !== "/login" && window.location.pathname !== "/signup")) {
            getUserDetails();
        } else if((window.location.pathname !== "/login" && window.location.pathname !== "/signup") && !token) {
            navigate("/login");
        }
    }, []);

    return (
        <div>{children}</div>
    )
}

export default AuthProvider