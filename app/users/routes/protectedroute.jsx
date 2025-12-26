"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import CryptoJS from "crypto-js";

const SECRET_KEY = "my_secret_key_123456"; // Change this to a secure key

// Memoized decrypt function for better performance
const decryptData = (() => {
  const cache = new Map();
  return (data) => {
    if (!data) return null;
    // Use cache to avoid re-decrypting same values
    if (cache.has(data)) {
      return cache.get(data);
    }
    try {
      const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
      const result = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      cache.set(data, result);
      return result;
    } catch (error) {
      return null;
    }
  };
})();

const ProtectedRoute = ({ children, allowedRoles }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Memoize allowed roles check
  const allowedRolesSet = useMemo(() => new Set(allowedRoles), [allowedRoles]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Use requestIdleCallback for non-critical auth check (faster initial render)
    const checkAuth = () => {
      try {
        // Fetch session storage values synchronously (fast)
        const encryptedRole = sessionStorage.getItem("role");
        const encryptedAuth = sessionStorage.getItem("isAuthenticated");

        // Quick check: if no auth data, redirect immediately
        if (!encryptedAuth || !encryptedRole) {
          setIsAuthorized(false);
          setIsChecking(false);
          router.replace("/loginpage");
          return;
        }

        // Decrypt (cached for performance)
        const userRole = decryptData(encryptedRole);
        const isAuthenticated = decryptData(encryptedAuth);

        // Check authorization
        const authorized = 
          (isAuthenticated === "true" || isAuthenticated === true) && 
          userRole && 
          allowedRolesSet.has(userRole);

        setIsAuthorized(authorized);
        setIsChecking(false);

        // Redirect unauthorized users to login
        if (!authorized) {
          router.replace("/loginpage");
        }
      } catch (error) {
        setIsAuthorized(false);
        setIsChecking(false);
        router.replace("/loginpage");
      }
    };

    // Use requestIdleCallback if available, otherwise run immediately
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(checkAuth, { timeout: 100 });
    } else {
      // Fallback: use setTimeout with 0 delay to allow initial render
      setTimeout(checkAuth, 0);
    }
  }, [router, allowedRolesSet]);

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



