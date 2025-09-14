import { TbSettings2 } from "react-icons/tb";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import axios from "axios";
import { FaLock } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const SettingsManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  // Password dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Decrypt user ID from sessionStorage
  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("user_id");

    if (encryptedUserId) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedUserId, SECRET_KEY);
        let decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
        decryptedUserId = decryptedUserId.replace(/^"|"$/g, "");
        const numericId = parseInt(decryptedUserId, 10);

        if (!isNaN(numericId)) {
          setLoggedInUserId(numericId);
        }
      } catch (error) {
        console.error("Error decrypting user ID:", error);
      }
    }
  };

  // Fetch user details
  const fetchuseraccounts_info = async (id) => {
    try {
      const response = await axios.get(
        "http://localhost/fchms/app/api_fchms/useraccounts/fetch-account.php"
      );
      if (response.data.success) {
        const user = response.data.data.find((u) => u.user_id === id);
        setUserData(user || null);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    decryptUserId();
  }, []);

  useEffect(() => {
    if (loggedInUserId) {
      fetchuseraccounts_info(loggedInUserId);
    }
  }, [loggedInUserId]);

 
const handleChangePassword = async () => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    toast.error("All fields are required.");
    return;
  }
  if (newPassword !== confirmPassword) {
    toast.error("New password and confirm password do not match.");
    return;
  }

  try {
    setLoading(true);
    const response = await axios.post(
      "http://localhost/fchms/app/api_fchms/useraccounts/changepassword.php",
      {
        user_id: loggedInUserId,
        current_password: currentPassword,
        new_password: newPassword,
      }
    );

    if (response.data.success) {
      toast.success(response.data.message || "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOpenDialog(false);
    } else {
      toast.error(response.data.message || "Failed to change password");
    }
  } catch (error) {
    console.error("Error changing password:", error);
    toast.error("An error occurred while changing password.");
  } finally {
    setLoading(false);
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          theme="light"
          transition={Bounce}
        />

        <div className="bg-green-900 text-white p-6 rounded-md shadow-md flex items-center gap-3">
          <TbSettings2 className="text-2xl" />
          <h1 className="text-lg font-bold tracking-wide">
            System Settings Information / Profile Information
          </h1>
        </div>

        {/* Profile Info */}
        <div className="bg-white shadow-md rounded-b-lg p-6">
          {userData ? (
            <>
              {/* Profile Layout */}
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Left Section */}
                <div className="flex flex-col items-center flex-shrink-0 w-full md:w-1/3">
                  <div className="rounded-full bg-gray-100 p-2 shadow-md">
                    <img
                      src={userData.photo_url || "/default-avatar.png"}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border"
                    />
                  </div>
                  <div className="w-full mt-12 text-center">
                    <label className="block text-xs uppercase text-gray-500 font-semibold">
                      Name
                    </label>
                    <p className="mt-1 px-4 py-2 bg-gray-100 border text-gray-800 text-sm">
                      {userData.username}
                    </p>
                  </div>
                  <div className="w-full mt-4 text-center">
                    <label className="block text-xs uppercase text-gray-500 font-semibold">
                      Contact
                    </label>
                    <p className="mt-1 px-4 py-2 bg-gray-100 border text-gray-800 text-sm">
                      {userData.contact}
                    </p>
                  </div>
                </div>

                {/* Right Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow ml-48">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase text-gray-500 font-semibold">
                        Email
                      </label>
                      <p className="mt-1 px-4 py-2 bg-gray-100 border text-gray-800 text-sm">
                        {userData.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 font-semibold">
                        Age
                      </label>
                      <p className="mt-1 px-4 py-2 bg-gray-100 border text-gray-800 text-sm">
                        {userData.age}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 font-semibold">
                        Address
                      </label>
                      <p className="mt-1 px-4 py-2 bg-gray-100 border text-gray-800 text-sm">
                        {userData.address}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 font-semibold">
                        Role
                      </label>
                      <p className="mt-1 px-4 py-2 bg-gray-100 border text-gray-800 text-sm">
                        {userData.role}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs uppercase text-gray-500 font-semibold">
                        Status
                      </label>
                      <p className="mt-1 px-4 py-2 bg-gray-100 border text-gray-800 text-sm">
                        {userData.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t mt-8 mb-6"></div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setOpenDialog(true)}
                  className="flex items-center gap-2 px-5 py-2 rounded-md bg-green-900 text-white text-sm font-medium hover:bg-green-800 transition"
                >
                  <FaLock className="text-white" />
                  Change Password
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-sm">
              Loading profile information...
            </p>
          )}
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="p-6 bg-white rounded-lg shadow-md w-[400px] space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-800">
                Change Password
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Please provide your current password and enter a new password.
                Make sure your new password is secure and keep it private.
              </p>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {message && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  {message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    </motion.div>
  );
};

export default SettingsManagement;
