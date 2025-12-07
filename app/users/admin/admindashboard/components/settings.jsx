import React, { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import { motion } from "framer-motion";
import { FaUserEdit, FaKey } from "react-icons/fa";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  FiUser,
  FiUserCheck,
  FiTag,
  FiMapPin,
  FiMail,
  FiCalendar,
  FiPhone,
} from "react-icons/fi";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const SettingsManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [userId, setUserId] = useState(null);
  const [fullname, setFullname] = useState("");
  const [role, setRolename] = useState("");
  const [username, setUsername] = useState("");
  const [userImage, setUserImage] = useState("");
  const [contact, setContact] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [fetchusersaccounts, setfetchusersaccounts] = useState([]);
  const [statusadminOptions, setStatusadminOptions] = useState([]);
  const [roleadminOptions, setroleadminOptions] = useState([]);

  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [openChangePass, setOpenChangePass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

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

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("user_id");
    const storedRolename = sessionStorage.getItem("role");
    const storedFullname = sessionStorage.getItem("fullname");
    const storedUsername = sessionStorage.getItem("username");
    const storedImage = sessionStorage.getItem("userImage");
    const storedContact = sessionStorage.getItem("contact");
    const storedAge = sessionStorage.getItem("age");
    const storedEmail = sessionStorage.getItem("email");
    const storedAddress = sessionStorage.getItem("address");

    if (storedUserId) {
      const decryptedUserId = decryptData(storedUserId);
      setUserId(decryptedUserId);
    }

    if (storedRolename) {
      const decryptedRolename = decryptData(storedRolename);
      setRolename(decryptedRolename || "");
    }

    if (storedFullname) {
      const decryptedFullname = decryptData(storedFullname);
      setFullname(decryptedFullname || "");
    }

    if (storedUsername) {
      const decryptedUsername = decryptData(storedUsername);
      setUsername(decryptedUsername || "");
    }

    if (storedImage) {
      const decryptedImage = decryptData(storedImage);
      setUserImage(decryptedImage || "");
    }

    if (storedContact) {
      const decryptedContact = decryptData(storedContact);
      setContact(decryptedContact || "");
    }

    if (storedAge) {
      const decryptedAge = decryptData(storedAge);
      setAge(decryptedAge || "");
    }

    if (storedEmail) {
      const decryptedEmail = decryptData(storedEmail);
      setEmail(decryptedEmail || "");
    }

    if (storedAddress) {
      const decryptedAddress = decryptData(storedAddress);
      setAddress(decryptedAddress || "");
    }

    fetchuseraccounts_info();
    fetchStatusesadmin();
    fetchRoleadmin();
  }, []);

  const fetchStatusesadmin = async () => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/status/fetch-status.php`
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
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/role/fetch-role.php`
      );
      if (response.data.success) {
        setroleadminOptions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching statuses:", error);
    }
  };

  const fetchuseraccounts_info = async () => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/useraccounts/fetch-account.php`
      );

      // Check if response is successful and has data
      if (response.data.success) {
        setfetchusersaccounts(response.data.data);
      } else {
        console.log("No Users Account found");
        setfetchusersaccounts([]);
      }
    } catch (error) {
      console.error("Error fetching User Accounts:", error);
    }
  };

  const [originalUserData, setOriginalUserData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [UserData, setUserData] = useState({
    user_id: "",
    username: "",
    fullname: "",
    contact: "",
    address: "",
    email: "",
    age: "",
    photo_url: "",
    role_id: "",
    user_status: "",
  });

  const handleEdit = async (user_id) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/useraccounts/view-account.php?user_id=${user_id}`
      );

      if (response.data.success) {
        const data = response.data.data;
        setUserData(data); // data includes all correct fields
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUsersUpdateSubmit = async () => {
    const {
      user_id,
      username,
      fullname,
      age,
      address,
      contact,
      email,
      photo_url,
      role_id,
      user_status,
    } = UserData;

    if (
      !username.trim() ||
      !fullname.trim() ||
      !address.trim() ||
      !contact.trim() ||
      !email.trim()
    ) {
      toast.error("All fields are required.");
      return;
    }

    const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid(email)) {
      toast.error("Invalid email format.");
      return;
    }

    // Detect no changes
    if (
      originalUserData &&
      username === originalUserData.username &&
      fullname === originalUserData.fullname &&
      age === originalUserData.age &&
      address === originalUserData.address &&
      contact === originalUserData.contact &&
      email === originalUserData.email &&
      photo_url === originalUserData.photo_url &&
      Number(role_id) === Number(originalUserData.role_id) &&
      Number(user_status) === Number(originalUserData.user_status) &&
      !editImage
    ) {
      toast.error("No changes detected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user_id", user_id);
      formData.append("username", username);
      formData.append("fullname", fullname);
      formData.append("age", age);
      formData.append("address", address);
      formData.append("contact", contact);
      formData.append("email", email);
      formData.append("role_id", role_id ? Number(role_id) : "");
      formData.append("user_status", user_status ? Number(user_status) : "");

      if (editImage) {
        formData.append("userImage", editImage); // new uploaded image
      } else {
        formData.append("photo_url", UserData.photo_url || ""); // keep old image
      }

      const { data } = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/useraccounts/edit-account.php`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (data.success) {
        toast.success("User updated successfully!");
        setEditDialogOpen(false);
        setEditImage(null);
        setEditImagePreview(null);

        // 🔹 Encrypt and update sessionStorage
        sessionStorage.setItem(
          "fullname",
          CryptoJS.AES.encrypt(JSON.stringify(fullname), SECRET_KEY).toString()
        );
        sessionStorage.setItem(
          "username",
          CryptoJS.AES.encrypt(JSON.stringify(username), SECRET_KEY).toString()
        );
        sessionStorage.setItem(
          "contact",
          CryptoJS.AES.encrypt(JSON.stringify(contact), SECRET_KEY).toString()
        );
        sessionStorage.setItem(
          "address",
          CryptoJS.AES.encrypt(JSON.stringify(address), SECRET_KEY).toString()
        );
        sessionStorage.setItem(
          "email",
          CryptoJS.AES.encrypt(JSON.stringify(email), SECRET_KEY).toString()
        );
        sessionStorage.setItem(
          "age",
          CryptoJS.AES.encrypt(JSON.stringify(age), SECRET_KEY).toString()
        );
        sessionStorage.setItem(
          "userImage",
          CryptoJS.AES.encrypt(
            JSON.stringify(data.newPhotoUrl),
            SECRET_KEY
          ).toString()
        );
        setUserImage(data.newPhotoUrl);

        // 🔹 Update React states so UI refreshes instantly
        setFullname(fullname);
        setUsername(username);
        setContact(contact);
        setAddress(address);
        setEmail(email);
        setAge(age);
        setUserImage(editImage ? data.newPhotoUrl : photo_url);
        window.dispatchEvent(new Event("userProfileUpdated"));
        // Refresh user accounts list if needed
        await fetchuseraccounts_info();
      } else {
        toast.error(`Update failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating user");
    }
  };

  const handleChangePassword = async () => {
    // Disallow specific characters
    const disallowedRegex = /[\[\]\?\+\-\s!#$%^&*()\/\\\";:]/;
    if (disallowedRegex.test(newPass)) {
      toast.error("Password contains invalid characters.");
      return;
    }

    // Complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!passwordRegex.test(newPass)) {
      toast.error(
        "Password must have at least 8 characters, uppercase, lowercase, number, and symbol."
      );
      return;
    }

    if (newPass !== confirmPass) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/useraccounts/changepassword.php`,
        {
          user_id: userId, // Ensure userId is available
          current_password: currentPass,
          new_password: newPass,
        }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Password updated successfully!"
        );
        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
        setOpenChangePass(false);
      } else {
        toast.error(response.data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Error updating password.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />

        <div className="bg-white p-6  shadow-md">
          <h1 className="text-1xl font-bold mb-4 text-green-800  mt-3">
            Profile Information
          </h1>
          <p className="text-gray-600 mb-6">
            This section contains your personal profile details including your
            full name, username, contact information, and other important
            information associated with your account.
          </p>

          <div className="flex flex-col md:flex-row gap-9 items-start ">
            {/* Left side - Avatar and Basic Info */}
            <div className="md:w-1/3 flex flex-col items-center mt-8">
              <Avatar className="w-52 h-52">
                <AvatarImage
                  src={userImage || "https://github.com/shadcn.png"}
                  alt="User Avatar"
                  className="w-52 h-52 rounded-full object-cover"
                />
                <AvatarFallback className="w-52 h-52 text-4xl flex items-center justify-center rounded-full bg-gray-300">
                  {username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="mt-8 space-y-8 w-full">
                <div className="flex items-center gap-4 text-gray-800 mt-4 items-center justify-center pr-8">
                  <FiTag className="w-8 h-8 !w-8 !h-8" />
                  <span className="text-l font-semibold">Usertype:</span>
                  <p className="text-m font-semibold bg-green-800 text-white px-2 py-1 rounded">
                    {role || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Additional Info */}
            <div className="w-full md:w-2/3 md:pl-24 grid grid-cols-1 space-y-14 mt-12">
              <div className="flex items-center gap-4 text-gray-800 ">
                <FiUser className="w-8 h-8 !w-8 !h-8" />
                <span className="text-l font-semibold w-96">Fullname:</span>
                <p className="text-m font-semibold">{fullname || "-"}</p>
              </div>

              <div className="flex items-center gap-4 text-gray-800 ">
                <FiUserCheck className="w-8 h-8 !w-8 !h-8" />
                <span className="text-l font-semibold w-96">Username:</span>
                <p className="text-m font-semibold">{username || "-"}</p>
              </div>

              <div className="flex items-center gap-4 text-gray-800">
                <FiMapPin className="w-8 h-8 !w-8 !h-8" />
                <span className="text-l font-semibold w-96">Address:</span>
                <p className="text-m font-semibold">{address || "-"}</p>
              </div>
              <div className="flex items-center gap-4 text-gray-800">
                <FiMail className="w-8 h-8 !w-8 !h-8" />
                <span className="text-l font-semibold w-96">Email:</span>
                <p className="text-m font-semibold">{email || "-"}</p>
              </div>
              <div className="flex items-center gap-4 text-gray-800">
                <FiCalendar className="w-8 h-8 !w-8 !h-8" />
                <span className="text-l font-semibold w-96">Age:</span>
                <p className="text-m font-semibold">{age || "-"}</p>
              </div>
              <div className="flex items-center gap-4 text-gray-800">
                <FiPhone className="w-8 h-8 !w-8 !h-8" />
                <span className="text-l font-semibold w-96">
                  Contact Number:
                </span>
                <p className="text-m font-semibold">{contact || "-"}</p>
              </div>
            </div>
          </div>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] p-6 rounded-xl border shadow-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-red-800">
                  Edit Personal Information
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300">
                    <img
                      src={
                        editImagePreview
                          ? editImagePreview
                          : `http://localhost/fchms/app/api_fchms/${UserData.photo_url}`
                      }
                      alt="User Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <label className="cursor-pointer px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Username
                  </Label>
                  <Input
                    value={UserData.username}
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
                        username: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Fullname
                  </Label>
                  <Input
                    value={UserData.fullname}
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
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
                    value={UserData.contact}
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
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
                    value={UserData.address}
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
                        address: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Age
                  </Label>
                  <Input
                    value={UserData.age}
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
                        age: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Email
                  </Label>
                  <Input
                    value={UserData.email}
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
                        email: e.target.value,
                      })
                    }
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label htmlFor="status" className="text-left mb-2">
                    Status:
                  </Label>
                  <select
                    id="status"
                    className="w-full border rounded px-2 py-1"
                    value={UserData.user_status ?? ""} // ✅ bind to user_status
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
                        user_status: Number(e.target.value), // ✅ keep as number
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

                {/* Role Dropdown */}
                <div className="flex flex-col">
                  <Label htmlFor="role" className="text-left mb-2">
                    Role:
                  </Label>
                  <select
                    id="role"
                    className="w-full border rounded px-2 py-1"
                    value={UserData.role_id ?? ""} // ✅ bind to role_id
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
                        role_id: Number(e.target.value), // ✅ keep as number
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

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={handleUsersUpdateSubmit}
                  className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-red-900"
                >
                  Save Changes
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex justify-end items-center mt-10 space-x-4">
            <button
              className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-md flex items-center gap-2"
              onClick={() => handleEdit(userId)}
            >
              <FaUserEdit />
              <span>Edit Personal detail</span>
            </button>

            <Dialog open={openChangePass} onOpenChange={setOpenChangePass}>
              <DialogTrigger asChild>
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center gap-2">
                  <FaKey />
                  <span>Change password</span>
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-black mb-3">
                  Note: The new password must contain at least 8 or more
                  characters with a mix of uppercase, lowercase letters,
                  numbers, and symbols.
                </p>

                <div className="flex flex-col gap-7 mt-3">
                  <div>
                    <Label className="mb-2">Current password</Label>
                    <Input
                      type="password"
                      className="border-gray-500 shadow-xl"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">New password</Label>
                    <Input
                      type="password"
                      value={newPass}
                      className="border-gray-500 shadow-xl"
                      onChange={(e) => setNewPass(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Confirm password</Label>
                    <Input
                      type="password"
                      className="border-gray-500 shadow-xl"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-red-900"
                  >
                    Save New Password
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </>
    </motion.div>
  );
};

export default SettingsManagement;
