import {
  TbZoom,
  TbArrowsDownUp,
  TbPlus,
  TbEdit,
  TbChevronDown,
  TbEye,
  TbUsers
} from "react-icons/tb";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
const ACTIVE_STATUS_ID = 1;

const FacultyManagement = () => {
  const [fetchusersaccounts, setfetchusersaccounts] = useState([]);

  const [usersname, setusersname] = useState("");
  const [userpasswords, setuserpasswords] = useState("");
  const [useremail, setuseremail] = useState("");
  const [userage, setuserage] = useState("");
  const [useraddress, setuseraddress] = useState("");
  const [usercontact, setusercontact] = useState("");
  const [userrole, setuserRole] = useState("");
  const [userstatus, setuserStatus] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  //
  const [statusadminOptions, setStatusadminOptions] = useState([]);
  const [roleadminOptions, setroleadminOptions] = useState([]);
  const [userfullname, setuserfullname] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  const [userImage, setuserImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const SECRET_KEY = "my_secret_key_123456";

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const itemsPerPage = 10;

  const filteredaccounts = fetchusersaccounts.filter(
    (faccounts) =>
      String(faccounts.username || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      String(faccounts.email || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      String(faccounts.role || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      String(faccounts.status || "")
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );
  const totalPages = Math.ceil(filteredaccounts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredaccounts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    fetchuseraccounts_info();
    fetchStatusesadmin();
    fetchRoleadmin();
    decryptUserId();
  }, [loggedInUserId]);

  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("user_id");

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

  const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++; // At least 8 characters
    if (password.match(/[A-Z]/)) strength++; // At least one uppercase letter
    if (password.match(/[a-z]/)) strength++; // At least one lowercase letter
    if (password.match(/[0-9]/)) strength++; // At least one number
    if (password.match(/[^a-zA-Z0-9]/)) strength++; // At least one special character

    if (strength <= 2) return "Weak";
    if (strength === 3) return "Moderate";
    if (strength === 4) return "Strong";
    return "Excellent";
  };

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

  const [dialogOpen, setDialogOpen] = useState(false);
  const handleUsersSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("usersname", usersname);
    formData.append("userpasswords", userpasswords);
    formData.append("useremail", useremail);
    formData.append("userage", userage);
    formData.append("useraddress", useraddress);
    formData.append("usercontact", usercontact);
    formData.append("userstatus", ACTIVE_STATUS_ID);
    formData.append("userrole", userrole);
    formData.append("userfullname", userfullname);

    if (userImage) {
      formData.append("userImage", userImage);
    }

    if (passwordStrength === "Weak") {
      toast.error("Password is too weak. Please use a stronger password.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost/fchms/app/api_fchms/useraccounts/add-account.php",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "User Added Successfully!");
        setuserImage(null);
        setImagePreview(null);
        setusersname("");
        setuserpasswords("");
        setuseremail("");
        setuserage("");
        setuseraddress("");
        setusercontact("");
        setuserStatus("");
        setuserRole("");
        setuserfullname("");
        await fetchuseraccounts_info();
        setDialogOpen(false);
      } else {
        toast.error(response.data.message || "Failed to add user.");
      }
    } catch (error) {
      toast.error("An error occurred while adding the user.");
    }
  };

  const fetchuseraccounts_info = async () => {
    try {
      const response = await axios.get(
        "http://localhost/fchms/app/api_fchms/useraccounts/fetch-account.php"
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

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [Users, setUserDetails] = useState([]);

  const handleView = async (user_id) => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/useraccounts/view-account.php?user_id=${user_id}`
      );
      if (response.data.success) {
        setUserDetails(response.data.data);
        setViewDialogOpen(true);
      } else {
        toast.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching  user details:", error);
      toast.error("Error fetching  user details");
    }
  };

  const [originalUserData, setOriginalUserData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [UserData, setUserData] = useState({
    username: "",
    fullname: "",
    contact: "",
    address: "",
    email: "",
    age: "",
    role_id: "",
    user_status: "",
  });

  const handleEdit = async (user_id) => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/useraccounts/view-account.php?user_id=${user_id}`
      );
      if (response.data.success) {
        const data = response.data.data;
        setUserData({ ...data, user_id });
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

    if ([username, fullname, address, contact].some(hasInvalidChars)) {
      toast.error("Invalid characters in input fields.");
      return;
    }

    if (!isEmailValid(email)) {
      toast.error("Invalid email format.");
      return;
    }

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
      Number(user_status) === Number(originalUserData.user_status)
    ) {
      toast.error("No changes detected.");
      return;
    }

    try {
      const payload = {
        user_id: UserData.user_id,
        username,
        fullname,
        age,
        address,
        contact,
        email,
        photo_url,
        role_id: Number(role_id),
        user_status: Number(user_status),
      };

      const { data } = await axios.post(
        "http://localhost/fchms/app/api_fchms/useraccounts/edit-account.php",
        payload
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <>
        <div className="bg-white p-6  shadow-md">
          <h1 className="text-l font-bold mb-4 text-green-800 pb-5 mt-3 flex items-center gap-2">
            <TbUsers className="text-xl w-6 h-6 !w-6 !h-6" />
            Faculty Accounts
          </h1>
          {/* Search Input with Magnifier Icon and Buttons */}
          <div className="flex items-center justify-between pt-6 mb-4">
            <div className="relative w-full max-w-md">
              {/* Input Field with Icon on the Right */}
              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-green-800 text-black placeholder-black rounded-lg pl-4 pr-10 py-2 shadow-sm"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />

              <TbZoom className="absolute inset-y-0 right-3 text-black h-5 w-5 flex items-center justify-center mt-3" />
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button
                  onClick={() => setDialogOpen(true)}
                  className="ml-2 px-4 py-2 bg-green-900 text-white text-m font-semibold rounded-lg shadow flex items-center hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-800"
                >
                  <TbPlus className="mr-2 h-6 w-6 !h-6 !w-6" />
                  Add Faculty
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                  <DialogTitle>Add Faculty</DialogTitle>
                  <DialogDescription>
                    Fill in the user's details below and click save to add them.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUsersSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-4">
                      <div className="col-span-1">
                        <div
                          className="border-2 border-dashed border-black rounded-lg w-58 h-58 flex items-center justify-center cursor-pointer hover:border-gray-600 relative overflow-hidden"
                          onClick={() =>
                            document.getElementById("userImage").click()
                          }
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="User Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <p className="text-black text-l text-center">
                              Click to upload
                            </p>
                          )}
                          <Input
                            id="userImage"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setuserImage(file);
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setImagePreview(e.target.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor="name" className="text-left mb-2">
                          Username:
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          value={usersname}
                          onChange={(e) => setusersname(e.target.value)}
                        />
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor="password" className="text-left mb-2">
                          Password:
                        </Label>
                        <Input
                          id="password"
                          className="w-full"
                          type="password"
                          value={userpasswords}
                          onChange={(e) => {
                            const password = e.target.value;
                            setuserpasswords(password);
                            setPasswordStrength(
                              checkPasswordStrength(password)
                            );
                          }}
                        />
                        <p
                          className={`text-sm mt-1 ${
                            passwordStrength === "Weak"
                              ? "text-red-500"
                              : passwordStrength === "Moderate"
                              ? "text-yellow-500"
                              : passwordStrength === "Strong"
                              ? "text-green-500"
                              : "text-blue-500"
                          }`}
                        >
                          {passwordStrength
                            ? `Password Strength: ${passwordStrength}`
                            : ""}
                        </p>
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor="email" className="text-left mb-2">
                          Email:
                        </Label>
                        <Input
                          id="email"
                          className="w-full"
                          type="text"
                          value={useremail}
                          onChange={(e) => setuseremail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor="email" className="text-left mb-2">
                          Fullname:
                        </Label>
                        <Input
                          id="email"
                          className="w-full"
                          type="text"
                          value={userfullname}
                          onChange={(e) => setuserfullname(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor="address" className="text-left mb-2">
                          Address:
                        </Label>
                        <Input
                          id="address"
                          className="w-full"
                          type="text"
                          value={useraddress}
                          onChange={(e) => setuseraddress(e.target.value)}
                        />
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor="age" className="text-left mb-2">
                          Age:
                        </Label>
                        <Input
                          id="age"
                          className="w-full"
                          type="number"
                          value={userage}
                          onChange={(e) => setuserage(e.target.value)}
                        />
                      </div>

                      <div className="col-span-1">
                        <Label
                          htmlFor="contactnumber"
                          className="text-left mb-2"
                        >
                          Contact Number
                        </Label>
                        <Input
                          id="contactnumber"
                          className="w-full"
                          type="number"
                          value={usercontact}
                          onChange={(e) => setusercontact(e.target.value)}
                        />
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor="role" className="text-left mb-2">
                          Role:
                        </Label>
                        <select
                          id="role"
                          className="w-full border rounded px-2 py-1"
                          value={userrole}
                          onChange={(e) => setuserRole(e.target.value)}
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
                  </div>

                  <DialogFooter className="mt-4">
                    <Button type="submit">Add User</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <table className="w-full border-collapse bg-white shadow-lg  overflow-hidden">
            <thead className="bg-green-900 text-white">
              <tr>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  #
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Username
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Email
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Role
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Status
                </th>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Created day
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((usersaccountdetails) => (
                  <tr key={usersaccountdetails.user_id}>
                    <td
                      className="border px-6 py-3 text-center text-sm"
                      style={{
                        padding: "15px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <img
                        src={usersaccountdetails.photo_url || "/default.jpg"}
                        alt="userImage"
                        onError={(e) => (e.target.src = "/default.jpg")}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "5px",
                          display: "block",
                          margin: "auto",
                        }}
                      />
                    </td>

                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      {usersaccountdetails.username}
                    </td>
                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      {usersaccountdetails.email}
                    </td>
                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      {usersaccountdetails.role}
                    </td>
                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <span
                        className={`inline-block px-5 py-2 text-sm font-semibold rounded-md ${
                          usersaccountdetails.status === "Active"
                            ? "bg-gray-200 text-black"
                            : usersaccountdetails.status === "Inactive"
                            ? "bg-red-400 text-white"
                            : "bg-gray-200 text-white"
                        }`}
                      >
                        {usersaccountdetails.status}
                      </span>
                    </td>

                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      {new Date(
                        usersaccountdetails.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="px-5 py-3 bg-gray-200 text-black font-semibold text-sm rounded-md flex items-center space-x-2 focus:outline-none text-center mx-auto">
                            <span>Options</span>
                            <TbChevronDown className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-54">
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() =>
                              handleView(usersaccountdetails.user_id)
                            }
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <TbEye className="w-6 h-6 !w-6 !h-6 text-black" />{" "}
                            <span>View users details</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              handleEdit(usersaccountdetails.user_id)
                            }
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <TbEdit className="w-6 h-6 !w-6 !h-6 text-black" />{" "}
                            <span>Edit user details</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border px-6 py-3 text-left text-sm"
                    colSpan="7"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px] p-6 rounded-xl border shadow-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-red-800">
                  User Information
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Name */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Username
                  </Label>
                  <Input
                    value={Users.username || ""}
                    readOnly
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Fullname
                  </Label>
                  <Input
                    value={Users.fullname || ""}
                    readOnly
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Contact
                  </Label>
                  <Input
                    value={Users.contact || ""}
                    readOnly
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Age
                  </Label>
                  <Input
                    value={Users.age || ""}
                    readOnly
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Address
                  </Label>
                  <Input
                    value={Users.address || ""}
                    readOnly
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Email
                  </Label>
                  <Input
                    value={Users.email || ""}
                    readOnly
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Role
                  </Label>
                  <Input
                    value={Users.role_name || ""}
                    readOnly
                    className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex flex-col">
                  <Label className="text-sm font-semibold text-black mb-1">
                    Status
                  </Label>
                  <div className="bg-black text-white rounded-lg px-4 py-2 text-sm w-fit">
                    {Users.status_name || "Unknown"}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px] p-6 rounded-xl border shadow-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-red-800">
                  Edit User Information
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Full Name */}
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
                    value={UserData.status_name}
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
                        status_name: e.target.value,
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

                <div className="flex flex-col">
                  <Label htmlFor="role" className="text-left mb-2">
                    Role:
                  </Label>
                  <select
                    id="role"
                    className="w-full border rounded px-2 py-1"
                    value={UserData.role_name}
                    onChange={(e) =>
                      setUserData({
                        ...UserData,
                        role_name: e.target.value,
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
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-red-900"
                >
                  Save Changes
                </button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-between mt-14">
            {/* Entries Text */}
            <span className="text-sm text-green-800 font-semibold pl-4">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, fetchusersaccounts.length)} of{" "}
              {fetchusersaccounts.length} entries
            </span>

            {/* Pagination */}
            <div className="flex">
              <Pagination>
                <PaginationContent className="flex">
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => goToPage(index + 1)}
                        className={
                          currentPage === index + 1
                            ? "bg-green-900 text-white"
                            : ""
                        }
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </>

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
    </motion.div>
  );
};

export default FacultyManagement;
