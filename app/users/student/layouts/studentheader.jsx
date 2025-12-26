import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";




import { Menu, LogOut, ChevronDown, Plus } from "lucide-react";
import useLogout from "@/app/users/hooks/logout";
import CryptoJS from "crypto-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const SECRET_KEY = "my_secret_key_123456";

const StudentHeader = ({ toggleSidebar, setCurrentView }) => {
  const logout = useLogout();
  const [username, setUsername] = useState("");
  const [photo_url, setPhotoUrl] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [userRole, setUserRole] = useState("");


  const decryptData = (data) => {
       if (!data) return null;
       try {
         const bytes = CryptoJS.AES.decrypt(data, SECRET_KEY);
         const decrypted = bytes.toString(CryptoJS.enc.Utf8);
   
         // 🔒 safeguard against empty/invalid
         if (!decrypted) {
           console.warn("Decryption returned empty string");
           return null;
         }
   
         try {
           return JSON.parse(decrypted);
         } catch (parseError) {
           console.error("Invalid JSON after decryption:", parseError);
           return null;
         }
       } catch (error) {
         console.error("Decryption failed:", error);
         return null;
       }
     };
  
  
     const decryptUserId = () => {
        const encryptedUserId = sessionStorage.getItem("student_id");
    
        if (encryptedUserId) {
          try {
            const bytes = CryptoJS.AES.decrypt(encryptedUserId, SECRET_KEY);
            const decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
            setLoggedInUserId(decryptedUserId);
          } catch (error) {
            console.error("Error decrypting user ID:", error);
          }
        }
      };

  useEffect(() => {
    const updateProfile = () => {
    const storedUsername = sessionStorage.getItem("student_email");
    const storedImage = sessionStorage.getItem("photo_url");
    const storedRole = sessionStorage.getItem("role");

    if (storedUsername) {
      const decryptedUsername = decryptData(storedUsername);
      setUsername(decryptedUsername || "");
    }

    if (storedImage) {
      const decryptedImage = decryptData(storedImage);
      setPhotoUrl(decryptedImage || "");
    }

    if (storedRole) {
      const decryptedRole = decryptData(storedRole);
      // Capitalize first letter
      const capitalizedRole = decryptedRole 
        ? decryptedRole.charAt(0).toUpperCase() + decryptedRole.slice(1).toLowerCase()
        : "Student";
      setUserRole(capitalizedRole);
    }
      };


       updateProfile();

  // 🔹 Listen for profile updates
  window.addEventListener("studentProfileUpdated", updateProfile);

    decryptUserId();

  const interval = setInterval(updateProfile, 5000);

  return () => {
    clearInterval(interval);
    window.removeEventListener("studentProfileUpdated", updateProfile);
  };
 
  }, [loggedInUserId]);



  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="bg-gray-200 rounded-md p-2"
          >
            <Menu className="h-6 w-6 text-black" />
          </Button>

          <div className="flex items-center gap-2">
      
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center space-x-2"
                >
                  <Avatar>
                    <AvatarImage
                      src={photo_url || "https://github.com/shadcn.png"}
                      alt="User Avatar"
                    />
                    <AvatarFallback>
                      {username?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  {username && (
                    <span className="text-black text-sm font-medium flex items-center space-x-1">
                      <span>Hello {userRole || "Student"}, {username}</span>
                      <ChevronDown className=" ml-2 mt-1 w-4 h-4 text-black" />
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                {/* <DropdownMenuItem
                  className="flex items-center gap-2 mb-2 cursor-pointer"
                  onClick={() => setCurrentView("profile")}
                >
                  <TbUserFilled className="h-6 w-6 !h-6 !w-6  text-black" />
                  <span>Profile</span>
                </DropdownMenuItem> */}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex items-center gap-2 text-black hover:text-gray-500 ml-2 w-full text-left">
                      <LogOut className="h-6 w-6" />
                      <span>Logout</span>
                    </button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to logout?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Once logged out, you will
                        be redirected to the login page.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No</AlertDialogCancel>
                      <AlertDialogAction onClick={logout}>
                        Yes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      
    </>
  );
};

export default StudentHeader;
