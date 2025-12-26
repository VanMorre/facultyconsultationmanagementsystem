"use client";

import { useRouter } from "next/navigation";

const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    // Clear sessionStorage synchronously (fast)
    sessionStorage.clear();
    
    // Use replace instead of push for faster navigation (no history entry)
    router.replace("/loginpage");
    
    // Force immediate navigation
    if (typeof window !== "undefined") {
      window.location.href = "/loginpage";
    }
  };

  return logout;
};

export default useLogout;
 
