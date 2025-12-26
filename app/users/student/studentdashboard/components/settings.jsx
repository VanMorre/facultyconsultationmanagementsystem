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
  FiTag,
  FiMail,
  FiCalendar,
  FiPhone,
  FiBook,
  FiLayers,
} from "react-icons/fi";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SettingsManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [studentId, setStudentId] = useState(null);
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("");
  const [photo_url, setPhotoUrl] = useState("");
  const [contact, setContact] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [courseName, setCourseName] = useState("");
  const [yearName, setYearName] = useState("");
  const [fetchStudents, setFetchStudents] = useState([]);

  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [openChangePass, setOpenChangePass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [YearlevelFetch, setYearlevelFetch] = useState([]);
  const [CourseFetch, setCourseFetch] = useState([]);

 
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
    const storedStudentId = sessionStorage.getItem("student_id");
    const storedFullname = sessionStorage.getItem("student_name");
    const storedImage = sessionStorage.getItem("photo_url");
    const storedContact = sessionStorage.getItem("contact");
    const storedAge = sessionStorage.getItem("age");
    const storedEmail = sessionStorage.getItem("student_email");
    const storedRole = sessionStorage.getItem("role");
    const storedCourseName = sessionStorage.getItem("course_name");
    const storedYearName = sessionStorage.getItem("year_name");

    if (storedStudentId) setStudentId(decryptData(storedStudentId));
    if (storedFullname) setFullname(decryptData(storedFullname));
    if (storedImage) setPhotoUrl(decryptData(storedImage));
    if (storedContact) setContact(decryptData(storedContact));
    if (storedAge) setAge(decryptData(storedAge));
    if (storedEmail) setEmail(decryptData(storedEmail));
    if (storedRole) setRole(decryptData(storedRole));
    if (storedCourseName) setCourseName(decryptData(storedCourseName));
    if (storedYearName) setYearName(decryptData(storedYearName));

    fetchStudentsInfo();

    fetchyearlevel();
  }, []);

  const fetchStudentsInfo = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/fetch-studentaccount.php`
      );
      if (response.data.success) {
        setFetchStudents(response.data.data);
      } else {
        setFetchStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchyearlevel = async () => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/yearlevel/fetch-yearlevel.php`
      );

      if (response.data.success) {
        setYearlevelFetch(response.data.data);
      } else {
        console.log(response.data.message || "No yearlevel found");
        setYearlevelFetch([]);
      }
    } catch (error) {
      console.error("Error yearlevel found:", error);
    }
  };



  const [originalStudentData, setOriginalStudentData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studentData, setStudentData] = useState({
    student_id: "",
    student_name: "",
    contact: "",
    student_email: "",
    age: "",
    photo_url: "",
    year_id: "",
  });

  const handleEdit = async (student_id) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/settingsaccount/view-account.php?student_id=${student_id}`
      );

      if (response.data.success) {
        const data = response.data.data;
        setStudentData(data);
        setOriginalStudentData(data);
        setEditDialogOpen(true);
      } else {
        toast.error("Student not found");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Error fetching student details");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStudentUpdateSubmit = async () => {
    const {
      student_id,
      student_name,
      age,
      contact,
      student_email,
      photo_url,
      year_id,
    } = studentData;

    if (!student_name.trim() || !contact.trim() || !student_email.trim()) {
      toast.error("All fields are required.");
      return;
    }

    const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid(student_email)) {
      toast.error("Invalid email format.");
      return;
    }

    if (
      originalStudentData &&
      student_name === originalStudentData.student_name &&
      age === originalStudentData.age &&
      contact === originalStudentData.contact &&
      student_email === originalStudentData.student_email &&
      photo_url === originalStudentData.photo_url &&
      year_id === originalStudentData.year_id &&
      !editImage
    ) {
      toast.error("No changes detected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("student_id", student_id);
      formData.append("student_name", student_name);
      formData.append("age", age);
      formData.append("contact", contact);
      formData.append("student_email", student_email);
      formData.append("year_id", year_id ? Number(year_id) : "");
      if (editImage) {
        formData.append("photo_url", editImage);
      } else {
        formData.append("photo_url", studentData.photo_url || "");
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/settingsaccount/edit-account.php`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success("Student updated successfully!");
        setEditDialogOpen(false);
        setEditImage(null);
        setEditImagePreview(null);

        // 🔹 Update sessionStorage
        sessionStorage.setItem(
          "student_name",
          CryptoJS.AES.encrypt(
            JSON.stringify(student_name),
            SECRET_KEY
          ).toString()
        );
        sessionStorage.setItem(
          "contact",
          CryptoJS.AES.encrypt(JSON.stringify(contact), SECRET_KEY).toString()
        );
        sessionStorage.setItem(
          "student_email",
          CryptoJS.AES.encrypt(
            JSON.stringify(student_email),
            SECRET_KEY
          ).toString()
        );
        sessionStorage.setItem(
          "age",
          CryptoJS.AES.encrypt(JSON.stringify(age), SECRET_KEY).toString()
        );
        sessionStorage.setItem(
          "photo_url",
          CryptoJS.AES.encrypt(
            JSON.stringify(data.newPhotoUrl),
            SECRET_KEY
          ).toString()
        );
    
        sessionStorage.setItem(
          "year_name",
          CryptoJS.AES.encrypt(
            JSON.stringify(data.year_name),
            SECRET_KEY
          ).toString()
        );

        setPhotoUrl(data.newPhotoUrl);
        setFullname(student_name);
        setContact(contact);
        setEmail(student_email);
        setAge(age);
        setYearName(data.year_name);
        setPhotoUrl(editImage ? data.newPhotoUrl : photo_url);
        window.dispatchEvent(new Event("studentProfileUpdated"));

        await fetchStudentsInfo();
      } else {
        toast.error(`Update failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Error updating student");
    }
  };






  const handleChangePassword = async () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!passwordRegex.test(newPass)) {
      toast.error(
        "Password must be 8+ chars, include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    if (newPass !== confirmPass) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/settingsaccount/changepassword.php`,
        {
          student_id: studentId,
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
        theme="light"
        transition={Bounce}
      />

      <div className="bg-white p-4 md:p-6 shadow-md rounded-lg">
        <h1 className="text-lg md:text-xl font-bold mb-4 border-b-2 border-gray-500 pb-3 md:pb-5 mt-2 md:mt-3">
          Student Profile
        </h1>
        <p className="text-gray-600 mb-6">
            This section contains your personal profile details including your
            full name, username, contact information, and other important
            information associated with your account.
          </p>

   
        <div className="flex flex-col md:flex-row gap-6 md:gap-9 items-center md:items-start">
          {/* Avatar + Role */}
          <div className="flex flex-col items-center w-full md:w-1/3 mt-4 md:mt-8">
            <Avatar className="w-32 h-32 md:w-52 md:h-52">
              <AvatarImage
                src={photo_url || "https://github.com/shadcn.png"}
                alt="Student Avatar"
                className="w-32 h-32 md:w-52 md:h-52 rounded-full object-cover"
              />
              <AvatarFallback className="w-32 h-32 md:w-52 md:h-52 text-2xl md:text-4xl bg-gray-300">
                {fullname?.charAt(0)?.toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>

            <div className="mt-6 md:mt-8 space-y-4 md:space-y-8 w-full">
              <div className="flex items-center gap-3 md:gap-4 text-gray-800 justify-center">
                <FiTag className="w-6 h-6 md:w-8 md:h-8" />
                <span className="font-semibold">Role:</span>
                <p className="bg-green-800 text-white px-2 py-1 rounded text-sm md:text-base">
                  {role || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="w-full md:w-2/3 md:pl-24 grid space-y-6 md:space-y-8 mt-6 md:mt-12">
            {[
              { icon: <FiUser />, label: "Fullname:", value: fullname },
              { icon: <FiMail />, label: "Email:", value: email },
              { icon: <FiCalendar />, label: "Age:", value: age },
              { icon: <FiPhone />, label: "Contact:", value: contact },
              { icon: <FiBook />, label: "Course:", value: courseName },
              { icon: <FiLayers />, label: "Year:", value: yearName },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-800"
              >
                <span className="flex items-center gap-2 md:gap-4">
                  {React.cloneElement(item.icon, {
                    className: "w-6 h-6 md:w-8 md:h-8",
                  })}
                  <span className="font-semibold min-w-[90px] md:w-96">
                    {item.label}
                  </span>
                </span>
                <p className="break-words">{item.value || "-"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Student Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] p-4 md:p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle>Edit Student Information</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2">
                  <img
                    src={
                      editImagePreview
                        ? editImagePreview
                        : `http://localhost/fchms/app/api_fchms/${studentData.photo_url}`
                    }
                    alt="Student Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="cursor-pointer px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-sm md:text-base">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>

              <Label>Fullname</Label>
              <Input
                value={studentData.student_name}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    student_name: e.target.value,
                  })
                }
              />

              <Label>Contact</Label>
              <Input
                value={studentData.contact}
                onChange={(e) =>
                  setStudentData({ ...studentData, contact: e.target.value })
                }
              />

              <Label>Age</Label>
              <Input
                value={studentData.age}
                onChange={(e) =>
                  setStudentData({ ...studentData, age: e.target.value })
                }
              />

              <Label>Email</Label>
              <Input
                value={studentData.student_email}
                onChange={(e) =>
                  setStudentData({
                    ...studentData,
                    student_email: e.target.value,
                  })
                }
              />


              <div className="flex flex-col">
                <Label htmlFor="year" className="text-left mb-2">
                  Year
                </Label>
                <select
                  id="year"
                  className="w-full border rounded px-2 py-1"
                  value={studentData.year_id ?? ""}
                  onChange={(e) =>
                    setStudentData({
                      ...studentData,
                      year_id: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Select Year</option>
                  {YearlevelFetch.map((yearses) => (
                    <option key={yearses.year_id} value={yearses.year_id}>
                      {yearses.year_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleStudentUpdateSubmit}
                className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
              >
                Save Changes
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-end items-stretch md:items-center mt-8 md:mt-10 gap-3 md:gap-4">
          <button
            className="bg-green-800 hover:bg-green-900 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
            onClick={() => handleEdit(studentId)}
          >
            <FaUserEdit />
            <span>Edit Student Details</span>
          </button>

          <Dialog open={openChangePass} onOpenChange={setOpenChangePass}>
            <DialogTrigger asChild>
              <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2">
                <FaKey />
                <span>Change Password</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-3">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                />

                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />

                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                >
                  Update Password
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
