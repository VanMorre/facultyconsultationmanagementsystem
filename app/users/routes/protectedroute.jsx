"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Fetch and decrypt session storage values
    const encryptedRole = sessionStorage.getItem("role");
    const encryptedAuth = sessionStorage.getItem("isAuthenticated");

    const userRole = decryptData(encryptedRole);
    const isAuthenticated = decryptData(encryptedAuth);

    console.log("Decrypted Role:", userRole);
    console.log("Decrypted Authenticated:", isAuthenticated);

    // Check authorization
    const authorized = 
      isAuthenticated && 
      userRole && 
      allowedRoles.includes(userRole);

    setIsAuthorized(authorized);
    setIsChecking(false);

    // Redirect unauthorized users to login
    if (!authorized) {
      router.replace("/loginpage");
    }
  }, [router, allowedRoles]);

  // Show nothing while checking (prevents flash of content)
  if (isChecking) {
    return null;
  }

  // Don't render children if not authorized
  if (!isAuthorized) {
    return null;
  }

  return children;
};

export default ProtectedRoute;



