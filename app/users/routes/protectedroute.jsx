import { Navigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const SECRET_KEY = "my_secret_key_123456"; // Change this to a secure key

// Function to decrypt session storage values
const decryptData = (data) => {
  if (!data) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Fetch and decrypt session storage values
  const encryptedRole = sessionStorage.getItem("role");
  const encryptedAuth = sessionStorage.getItem("isAuthenticated");

  const userRole = decryptData(encryptedRole);
  const isAuthenticated = decryptData(encryptedAuth);

  console.log("Decrypted Role:", userRole);
  console.log("Decrypted Authenticated:", isAuthenticated);

  // Redirect unauthorized users to login
  if (!isAuthenticated || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;



