import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { TbSettings2 } from "react-icons/tb";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import axios from "axios";
import { FaUserEdit, FaLock } from "react-icons/fa";

import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettingsManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [statusadminOptions, setStatusadminOptions] = useState([]);
  const [roleadminOptions, setroleadminOptions] = useState([]);

  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("user_id");

    if (encryptedUserId) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedUserId, SECRET_KEY);
        let decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);

        // 🔹 Remove wrapping quotes if any
        decryptedUserId = decryptedUserId.replace(/^"|"$/g, "");

        // 🔹 Cast to integer
        const numericId = parseInt(decryptedUserId, 10);

        if (!isNaN(numericId)) {
          setLoggedInUserId(numericId);
        } else {
          console.error("Invalid decrypted student ID:", decryptedUserId);
        }
      } catch (error) {
        console.error("Error decrypting user ID:", error);
      }
    }
  };

  useEffect(() => {
    decryptUserId();
    fetchStatusesadmin();
    fetchRoleadmin();
  }, []);

  useEffect(() => {
    if (loggedInUserId) {
      fetchuseraccounts_info(loggedInUserId);
    }
  }, [loggedInUserId]);

  const fetchStatusesadmin = async () => {
    try {
      const response = await axios.get(
        "http://localhost/fchms/app/api_fchms/status/fetch-status.php"
      );
      if (response.data.success) {
        setStatusadminOptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const fetchRoleadmin = async () => {
    try {
      const response = await axios.get(
        "http://localhost/fchms/app/api_fchms/role/fetch-role.php"
      );
      if (response.data.success) {
        setroleadminOptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const fetchuseraccounts_info = async (id) => {
    try {
      const response = await axios.get(
        "http://localhost/fchms/app/api_fchms/useraccounts/fetch-account.php"
      );

      if (response.data.success) {
        const allUsers = response.data.data;
        // find logged-in user by id
        const user = allUsers.find((u) => u.user_id === id);
        setUserData(user || null);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // 1️⃣ Put all your states at the top
  const [originalUserData, setOriginalUserData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [UseraccountsData, setUseraccountsData] = useState({
    username: "",
    fullname: "",
    contact: "",
    address: "",
    email: "",
    age: "",
    role_id: "",
    user_status: "",
    photo_url: "",
    photo_file: null, // ✅ added for uploads
  });

  // 2️⃣ Define your functions *after* states
  const handleEdit = async (user_id) => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/useraccounts/view-account.php?user_id=${user_id}`
      );
      if (response.data.success) {
        const data = response.data.data;
        setUseraccountsData({ ...data, user_id, photo_file: null });
        setOriginalUserData(data);
        setEditDialogOpen(true);
      } else {
        toast.error("User not found");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching user details");
    }
  };

  const handleUsersUpdateSubmit = async () => {
    const {
      username,
      fullname,
      age,
      address,
      contact,
      email,
      role_id,
      user_status,
      photo_file,
    } = UseraccountsData;

    // 🔹 validation can use originalUserData here
    if (
      originalUserData &&
      username === originalUserData.username &&
      fullname === originalUserData.fullname &&
      age === originalUserData.age &&
      address === originalUserData.address &&
      contact === originalUserData.contact &&
      email === originalUserData.email &&
      Number(role_id) === Number(originalUserData.role_id) &&
      Number(user_status) === Number(originalUserData.user_status) &&
      !photo_file // ✅ also check if photo changed
    ) {
      toast.error("No changes detected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", UseraccountsData.user_id);
      formData.append("username", username);
      formData.append("fullname", fullname);
      formData.append("age", age);
      formData.append("address", address);
      formData.append("contact", contact);
      formData.append("email", email);
      formData.append("role_id", isNaN(Number(role_id)) ? 0 : Number(role_id));
      formData.append("user_status", isNaN(Number(user_status)) ? 0 : Number(user_status));

      
      if (photo_file) {
        formData.append("photo", photo_file);
      }

      const { data } = await axios.post(
        "http://localhost/fchms/app/api_fchms/useraccounts/edit-account.php",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success("User updated successfully!");
        setEditDialogOpen(false);
        await fetchuseraccounts_info();
      } else {
        toast.error(`Update failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating user");
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

        {/* Profile Information */}
        {/* Profile Information */}
        <div className="bg-white shadow-md rounded-b-lg p-6">
          {userData ? (
            <>
              {/* Profile Layout */}
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* Left Section - Photo + Name + Contact */}
                <div className="flex flex-col items-center flex-shrink-0 w-full md:w-1/3">
                  {/* Photo */}
                  <div className="rounded-full bg-gray-100 p-2 shadow-md">
                    <img
                      src={userData.photo_url || "/default-avatar.png"}
                      alt="Profile"
                      className="w-40 h-40 rounded-full object-cover border"
                    />
                  </div>

                  {/* Name */}
                  <div className="w-full mt-12">
                    <label className="block text-xs uppercase text-gray-500 font-semibold text-center">
                      Name
                    </label>
                    <p className="mt-1 px-4 py-2 bg-gray-100 border text-gray-800 text-sm text-center">
                      {userData.username}
                    </p>
                  </div>

                  {/* Contact */}
                  <div className="w-full mt-4">
                    <label className="block text-xs uppercase text-gray-500 font-semibold text-center">
                      Contact
                    </label>
                    <p className="mt-1 px-4 py-2  bg-gray-100 border text-gray-800 text-sm text-center">
                      {userData.contact}
                    </p>
                  </div>
                </div>

                {/* Right Section - Other Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow ml-48">
                  <div className="space-y-4 ">
                    {/* Email */}
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

                    {/* Role */}
                    <div>
                      <label className="block text-xs uppercase text-gray-500 font-semibold">
                        Role
                      </label>
                      <p className="mt-1 px-4 py-2  bg-gray-100 border text-gray-800 text-sm">
                        {userData.role}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs uppercase text-gray-500 font-semibold">
                        Status
                      </label>
                      <p className="mt-1 px-4 py-2  bg-gray-100 border text-gray-800 text-sm">
                        {userData.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t mt-8 mb-6"></div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleEdit(loggedInUserId)} // ✅ use the decrypted user_id
                  className="flex items-center gap-2 px-5 py-2 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaUserEdit className="text-gray-600" />
                  Update Profile Information
                </button>

                <button className="flex items-center gap-2 px-5 py-2 rounded-md bg-green-900 text-white text-sm font-medium hover:bg-green-800 transition">
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

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] p-6 rounded-xl border shadow-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-red-800">
                  Edit User Information
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Profile Photo */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Profile Photo
                  </Label>

                  <div className="flex items-center gap-4">
                    <img
                      src={
                        UseraccountsData.photo_file
                          ? URL.createObjectURL(UseraccountsData.photo_file)
                          : UseraccountsData.photo_url || "/default-avatar.png"
                      }
                      alt="Profile"
                      className="w-24 h-24 object-cover rounded-full border"
                    />

                    {/* Custom upload button */}
                    <div>
                      <input
                        id="upload-photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setUseraccountsData({
                            ...UseraccountsData,
                            photo_file: file || null,
                          });
                        }}
                      />
                      <label
                        htmlFor="upload-photo"
                        className="flex items-center gap-2 border border-green-600 text-green-600 px-4 py-2 rounded cursor-pointer hover:bg-green-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v4h16v-4M12 12V4m0 8l-4-4m4 4l4-4"
                          />
                        </svg>
                        Upload Photo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Username
                  </Label>
                  <Input
                    value={UseraccountsData.username}
                    onChange={(e) =>
                      setUseraccountsData({
                        ...UseraccountsData,
                        username: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Fullname */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Fullname
                  </Label>
                  <Input
                    value={UseraccountsData.fullname}
                    onChange={(e) =>
                      setUseraccountsData({
                        ...UseraccountsData,
                        fullname: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Contact Number */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Contact number
                  </Label>
                  <Input
                    value={UseraccountsData.contact}
                    onChange={(e) =>
                      setUseraccountsData({
                        ...UseraccountsData,
                        contact: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Address */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Address
                  </Label>
                  <Input
                    value={UseraccountsData.address}
                    onChange={(e) =>
                      setUseraccountsData({
                        ...UseraccountsData,
                        address: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Age */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Age
                  </Label>
                  <Input
                    value={UseraccountsData.age}
                    onChange={(e) =>
                      setUseraccountsData({
                        ...UseraccountsData,
                        age: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Email
                  </Label>
                  <Input
                    value={UseraccountsData.email}
                    onChange={(e) =>
                      setUseraccountsData({
                        ...UseraccountsData,
                        email: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <Label htmlFor="status" className="text-left mb-2">
                    Status:
                  </Label>
                  <select
                    id="status"
                    className="w-full border rounded px-2 py-1"
                    value={UseraccountsData.user_status}
                    onChange={(e) =>
                      setUseraccountsData({
                        ...UseraccountsData,
                        user_status: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Status</option>
                    {statusadminOptions.map((status) => (
                      <option key={status.status_id} value={status.status_id}>
                        {status.status_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role */}
                <div className="flex flex-col">
                  <Label htmlFor="role" className="text-left mb-2">
                    Role:
                  </Label>
                  <select
                    id="role"
                    className="w-full border rounded px-2 py-1"
                    value={UseraccountsData.role_id}
                    onChange={(e) =>
                      setUseraccountsData({
                        ...UseraccountsData,
                        role_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Role</option>
                    {roleadminOptions.map((roless) => (
                      <option key={roless.role_id} value={roless.role_id}>
                        {roless.role_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={handleUsersUpdateSubmit}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-red-900"
                >
                  Save Changes
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </>
    </motion.div>
  );
};

export default SettingsManagement;
