"use client";

import { useRouter } from "next/navigation";

const useLogout = () => {
  const router = useRouter();

  const logout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("username");
    sessionStorage.clear();
    router.push("/loginpage"); 
  };

  return logout;
};

export default useLogout;
 
