import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("username");
    sessionStorage.clear();
    navigate("/"); // Redirect to login page
  };

  return logout;
};

export default useLogout;
 
