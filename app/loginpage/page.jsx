"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { FiUpload } from "react-icons/fi";
import { LuLogIn } from "react-icons/lu";
import { FiRefreshCcw } from "react-icons/fi";
import { FaUserTie, FaUserGraduate } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const SECRET_KEY = "my_secret_key_123456";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaCanvasRef = useRef(null);
  const navigate = useNavigate();
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [activeRole, setActiveRole] = useState("faculty"); // faculty | student
  const [YearlevelFetch, setYearlevelFetch] = useState([]);
  const [selectedyearlevel, setselectedyearlevel] = useState("");
  const [CourseFetch, setCourseFetch] = useState([]);
  const [selectedcourse, setselectedcourse] = useState("");
  const [studentname, setStudentname] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  // use snake_case consistently
  const [student_email, setStudent_Email] = useState("");
  const [student_password, setStudent_Password] = useState("");

  const [preview, setPreview] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const DEFAULT_ROLE_STATUS_ID = 3;
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  const leftPanelVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const leftItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.4, ease: "easeOut" },
    }),
  };

  const generateCaptcha = () => {
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    setCaptchaText(captcha);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "#000";

    const letterSpacing = 40;
    const textWidth = captcha.length * letterSpacing;
    const startX = (canvas.width - textWidth) / 2;
    const startY = canvas.height / 2 + 10;

    for (let i = 0; i < captcha.length; i++) {
      ctx.fillText(captcha[i], startX + i * letterSpacing, startY);
    }

    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = Math.random() * 2;
      ctx.stroke();
    }
  };

  useEffect(() => {
    fetchcourse();
    fetchyearlevel();
    generateCaptcha();

    const isAuthenticated = decryptData(
      sessionStorage.getItem("isAuthenticated")
    );
    const userRole = decryptData(sessionStorage.getItem("role"));

    if (isAuthenticated && userRole) {
      switch (userRole) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "teacher":
          navigate("/teacher-dashboard");
          break;
        case "student":
          navigate("/student-dashboard");
          break;
        default:
          sessionStorage.clear();
          navigate("/");
      }
    }
  }, []);

  const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  };

  const decryptData = (ciphertext) => {
    if (!ciphertext) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  };

  const handleSubmitFaculty = async (e) => {
    e.preventDefault();
    if (captchaInput !== captchaText) {
      toast.error("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/loginphp/loginform.php`,
        { email, password }
      );
      if (response.data.success) {
        const {
          user_id,
          username,
          role_name,
          photo_url,
          email,
          address,
          age,
          contact,
          fullname,
        } = response.data;

        sessionStorage.setItem("isAuthenticated", encryptData("true"));
        sessionStorage.setItem("user_id", encryptData(user_id));
        sessionStorage.setItem("username", encryptData(username));
        sessionStorage.setItem("role", encryptData(role_name.toLowerCase()));
        sessionStorage.setItem("userImage", encryptData(photo_url));
        sessionStorage.setItem("email", encryptData(email));
        sessionStorage.setItem("address", encryptData(address));
        sessionStorage.setItem("age", encryptData(age));
        sessionStorage.setItem("contact", encryptData(contact));
        sessionStorage.setItem("fullname", encryptData(fullname));

        toast.success("Login Successfully!");

        setTimeout(() => {
          switch (role_name.toLowerCase()) {
            case "admin":
              navigate("/admin-dashboard");
              break;
            case "teacher":
              navigate("/teacher-dashboard");
              break;
            default:
              toast.error("Unauthorized role!");
              sessionStorage.clear();
              navigate("/");
          }
        }, 3000);
      } else {
        if (response.data.message.includes("Maximum attempts reached")) {
          toast.error(
            "Too many failed login attempts. Please try again in 3 minutes."
          );
          setIsLocked(true);
          setLockoutTime(180);
          const interval = setInterval(() => {
            setLockoutTime((prev) => {
              if (prev <= 1) {
                clearInterval(interval);
                setIsLocked(false);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          toast.error(response.data.message || "Invalid username or password.");
        }
      }
    } catch {
      toast.error("An error occurred during login.");
      generateCaptcha();
      setCaptchaInput("");
    }
  };

  const handleSubmitStudent = async (e) => {
    e.preventDefault();

    if (captchaInput !== captchaText) {
      toast.error("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/fetch-studentaccount.php`,
        {
          student_email, // ✅ match PHP
          student_password, // ✅ match PHP
        }
      );

      if (response.data.success) {
        const {
          student_id,
          student_name,
          age,
          contact,
          photo_url,
          student_email,
          role_name,
          year_name,
          course_name,
        } = response.data;

        sessionStorage.setItem("isAuthenticated", encryptData("true"));
        sessionStorage.setItem("role", encryptData(role_name.toString()));
        sessionStorage.setItem(
          "student_id",
          encryptData(student_id.toString())
        );
        sessionStorage.setItem("student_name", encryptData(student_name));
        sessionStorage.setItem("age", encryptData(age));
        sessionStorage.setItem("contact", encryptData(contact));
        sessionStorage.setItem("photo_url", encryptData(photo_url));
        sessionStorage.setItem("student_email", encryptData(student_email));
        sessionStorage.setItem("year_name", encryptData(year_name));
        sessionStorage.setItem("course_name", encryptData(course_name));

        toast.success("Student Login Successful!");
        setTimeout(() => {
          switch (role_name.toLowerCase()) {
            case "student":
              navigate("/student-dashboard");
              break;
            default:
              toast.error("Unauthorized role!");
              sessionStorage.clear();
              navigate("/");
          }
        }, 2000);
      } else {
        response.data.message.includes("Maximum attempts")
          ? handleLockout("Too many failed attempts. Try again later.")
          : toast.error(response.data.message || "Invalid login.");
      }
    } catch {
      toast.error("Error during login.");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const objectUrl = URL.createObjectURL(file);
    setPhoto(file);
    setPreview(objectUrl);
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, []);

  // Password validation (used on submit)
  const validatePassword = (password) => {
    if (!password) return "Password is required.";

    // At least 6 characters, allow letters, numbers, and special characters (_ . @)
    const regex = /^[A-Za-z0-9_.@]{6,}$/;

    if (!regex.test(password)) {
      return "Password must be at least 6 characters. Allowed: letters, numbers, _ . @";
    }
    return "";
  };

  // Strength checker (for live feedback)
  const checkPasswordStrength = (password) => {
    if (password.length < 6) return "weak";

    const hasLetters = /[A-Za-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[_\.@]/.test(password);

    if (hasLetters && hasNumbers && hasSpecial && password.length >= 8) {
      return "strong";
    } else if ((hasLetters && hasNumbers) || (hasLetters && hasSpecial)) {
      return "medium";
    }
    return "weak";
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate password before submit
    const error = validatePassword(student_password);
    if (error) {
      setPasswordError(error);
      return;
    } else {
      setPasswordError("");
    }

    const formData = new FormData();
    formData.append("studentname", studentname);
    formData.append("studentpassword", student_password);
    formData.append("studentemail", student_email);
    formData.append("studentage", age);
    formData.append("studentcontact", contact);
    formData.append("studentcourse", selectedcourse);
    formData.append("studentyearlevel", selectedyearlevel);
    formData.append("studentrole", DEFAULT_ROLE_STATUS_ID);

    if (photo) {
      formData.append("studentphoto", photo);
    }

    try {
      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/add-studentaccount.php`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Student account created successfully!"
        );

        // reset fields
        setPhoto(null);
        setPreview(null);
        setStudentname("");
        setStudent_Password("");
        setStudent_Email("");
        setAge("");
        setContact("");
        setselectedcourse("");
        setselectedyearlevel("");

        // ✅ Close dialog
        setStudentDialogOpen(false);
      } else {
        toast.error(
          response.data.message || "Failed to create student account."
        );
      }
    } catch (error) {
      toast.error("An error occurred while creating the student account.");
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

  const fetchcourse = async () => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/course/fetch-course.php`
      );

      if (response.data.success) {
        setCourseFetch(response.data.data);
      } else {
        console.log(response.data.message || "No course found");
        setCourseFetch([]);
      }
    } catch (error) {
      console.error("Error no course found:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* LEFT PANEL */}
      <div className="relative w-full lg:w-1/2 min-h-[6rem] lg:min-h-screen overflow-hidden">
        {/* Background Image */}
        <motion.div
          className="absolute inset-0 z-0"
          variants={leftPanelVariants}
          initial="hidden"
          animate="visible"
        >
          <Image
            src="/images/bldg.jpg"
            alt="Building Background"
            fill
            className="object-cover opacity-90"
            priority
          />
        </motion.div>

        {/* Overlay Content */}
        <div className="relative z-10 w-full h-full bg-green-800/85 text-white p-8 flex flex-col">
          <div className="flex flex-col lg:flex-row items-center justify-center flex-grow gap-6 lg:gap-10 text-center lg:text-right">
            {/* Text */}
            <motion.div
              className="space-y-1 lg:space-y-1 lg:mr-4 flex flex-col items-center lg:items-end"
              custom={1}
              variants={leftItemVariants}
            >
              <h1 className="font-semibold text-lg lg:text-xl">
                Phinma Cagayan de Oro College
              </h1>
              <h1 className="font-semibold text-lg lg:text-xl">
                FCHMS PORTAL - CITE
              </h1>
              <h2 className="text-sm lg:text-md mb-2 lg:mb-2  font-semibold">
                Max Sunniel St. Cagayan de Oro City
              </h2>
            </motion.div>

            {/* Divider (only desktop) */}
            <motion.div
              className="hidden lg:block w-px h-16 bg-white mx-4"
              custom={4}
              variants={leftItemVariants}
            />

            {/* Logo */}
            <motion.div
              className="w-36 h-20 sm:w-48 sm:h-24 lg:w-[320px] lg:h-[140px] flex items-center justify-center"
              custom={5}
              variants={leftItemVariants}
            >
              <Image
                src="/images/coclogo-removebg.png"
                alt="COC Logo"
                width={320}
                height={140}
                className="mx-auto"
                priority
              />
            </motion.div>
          </div>

          <footer className="text-xs lg:text-sm font-semibold text-center mt-8">
            © {new Date().getFullYear()} PHINMA Cagayan de Oro College. All
            rights reserved.
          </footer>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white relative overflow-hidden">
        {/* Shapes */}
        <div className="absolute w-32 h-32 bg-green-800 rounded-full -top-6 -left-10 z-0 shadow-[0_20px_40px_rgba(0,100,0,0.6)]"></div>
        <div className="absolute w-40 h-40 bg-green-800 rounded-full -bottom-16 -right-12 z-0 shadow-[0_20px_40px_rgba(0,100,0,0.6)]"></div>
        <div className="absolute w-24 h-24 bg-green-800 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 shadow-[0_20px_40px_rgba(0,100,0,0.6)]"></div>
        <div className="absolute w-36 h-20 bg-gray-200 transform rotate-12 skew-x-12 bottom-[10%] left-[40%] z-0 shadow-[0_25px_50px_rgba(100,100,100,0.4)]"></div>
        <div className="absolute w-36 h-20 bg-gray-200 transform rotate-12 skew-x-12 top-[6%] left-[40%] z-0 shadow-[0_25px_50px_rgba(100,100,100,0.4)]"></div>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          theme="light"
          transition={Bounce}
        />
        <div className="flex-1 flex flex-col justify-center items-center w-full relative z-10 px-4 sm:px-8">
          <motion.div className="w-full max-w-md sm:max-w-xl p-6 sm:p-10 bg-white rounded-lg shadow-2xl flex flex-col justify-center">
            {/* Header */}
            <motion.div className="flex items-center justify-between w-full max-w-[700px] mb-6">
              <div>
                <motion.h2 className="text-2xl font-semibold text-black">
                  Hello Welcome!
                </motion.h2>
                <motion.h2 className="text-2xl font-semibold text-black">
                  Logged in as{" "}
                  {activeRole === "faculty" ? "Faculty" : "Student"}
                </motion.h2>
                <motion.p className="text-sm text-black mt-2">
                  Enter your email and password to login.
                </motion.p>
              </div>
              <Image
                src="/images/CIT-ENCHANCEPIC.png"
                alt="COC Logo"
                width={100}
                height={70}
                className="ml-4 sm:ml-6"
                priority
              />
            </motion.div>

            {/* Form */}
            <motion.form
              className="space-y-4"
              onSubmit={
                activeRole === "faculty"
                  ? handleSubmitFaculty
                  : handleSubmitStudent
              }
            >
              <motion.div>
                <Label htmlFor="email" className="text-black mb-2">
                  Email
                </Label>
                <div className="relative">
                  <AiOutlineMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black" />
                  <Input
                    id="email"
                    type="text"
                    className="pl-12 w-full h-12 border border-green-800 bg-transparent text-black rounded-md shadow-xl"
                    value={activeRole === "faculty" ? email : student_email}
                    placeholder={`Enter your ${activeRole} email`}
                    onChange={(e) =>
                      activeRole === "faculty"
                        ? setEmail(e.target.value)
                        : setStudent_Email(e.target.value)
                    }
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div>
                <Label htmlFor="password" className="text-black mb-2">
                  Password
                </Label>
                <div className="relative">
                  <AiOutlineLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-12 w-full h-12 border border-green-800 bg-transparent text-black rounded-md shadow-xl"
                    value={
                      activeRole === "faculty" ? password : student_password
                    }
                    onChange={(e) =>
                      activeRole === "faculty"
                        ? setPassword(e.target.value)
                        : setStudent_Password(e.target.value)
                    }
                  />
                </div>
              </motion.div>

              {/* CAPTCHA */}
              <motion.div className="mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <canvas
                    ref={captchaCanvasRef}
                    width="280"
                    height="70"
                    className="border border-black bg-white shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-3 bg-green-800 hover:bg-green-900 text-white rounded-md shadow-xl"
                  >
                    <FiRefreshCcw size={20} />
                  </button>
                </div>
                <motion.input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full p-2 border border-black shadow-xl rounded-md bg-white h-12 text-black"
                />
              </motion.div>

              {/* SIGN IN BUTTON */}
              <motion.div>
                <Button
                  type="submit"
                  disabled={isLocked}
                  className={`w-full h-12 rounded-md flex items-center justify-center gap-2 shadow-xl ${
                    isLocked ? "bg-gray-400" : "bg-green-800 hover:bg-green-900"
                  }`}
                >
                  {isLocked ? `Try again in ${lockoutTime}s` : "Sign In"}
                  <LuLogIn className="w-6 h-6" />
                </Button>
              </motion.div>

              <motion.div className="flex justify-between items-center mt-4">
                {activeRole === "faculty" ? (
                  <Button
                    variant="link"
                    className="text-sm text-green-800 font-semibold p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveRole("student");
                    }}
                  >
                    Logged in as Student?
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    className="text-sm text-green-800 font-semibold p-0"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveRole("faculty");
                    }}
                  >
                    Proceed to Faculty Login?
                  </Button>
                )}

                <Button
                  variant="link"
                  className="text-sm text-black-600 p-0"
                  onClick={() => {
                    if (activeRole === "faculty") {
                      navigate("/forgotpassword-facultyemailform");
                    } else {
                      navigate("/forgotpassword-studentemailform");
                    }
                  }}
                >
                  Forgotten Your Password?
                </Button>
              </motion.div>
            </motion.form>

            {/* Student Create Account */}
            {activeRole === "student" && (
              <motion.div className="text-center mt-2">
                <Dialog
                  open={studentDialogOpen}
                  onOpenChange={setStudentDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      className="w-full border-2 border-green-800 text-green-800 font-semibold rounded-md 
              bg-transparent hover:bg-green-800 hover:text-white transition-colors duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        setStudentDialogOpen(true);
                      }}
                    >
                      Create Student Account
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-lg bg-white p-6 rounded-lg shadow-xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-green-800">
                        Create Student Account
                      </DialogTitle>
                    </DialogHeader>

                    {/* Form */}
                    <form
                      className="space-y-4 mt-2"
                      onSubmit={handleStudentSubmit}
                    >
                      {/* Photo Upload */}
                      <div className="flex items-center gap-4">
                        <div className="w-28 h-26 border border-dashed border-gray-400 rounded-md flex items-center justify-center overflow-hidden bg-gray-50">
                          {preview ? (
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">
                              No Photo
                            </span>
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            id="photoUpload"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="flex items-center gap-2 border-green-800 text-green-800 hover:bg-green-800 hover:text-white"
                            onClick={() =>
                              document.getElementById("photoUpload").click()
                            }
                          >
                            <FiUpload className="w-4 h-4" />
                            Upload Photo
                          </Button>
                        </div>
                      </div>

                      {/* Student Name */}
                      <div>
                        <Label htmlFor="studentName">Full name</Label>
                        <Input
                          id="studentName"
                          placeholder="Enter full name"
                          className="mt-2"
                          value={studentname}
                          onChange={(e) => setStudentname(e.target.value)}
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          placeholder="Enter age"
                          className="mt-2"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                        />
                      </div>

                      {/* Contact */}
                      <div>
                        <Label htmlFor="contact">Contact number</Label>
                        <Input
                          id="contact"
                          type="text"
                          placeholder="Enter contact number"
                          className="mt-2"
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="studentEmail">Email</Label>
                        <Input
                          id="studentEmail"
                          type="email"
                          placeholder="Enter student email"
                          className="mt-2"
                          value={student_email}
                          onChange={(e) => setStudent_Email(e.target.value)}
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <Label htmlFor="studentPassword">Password</Label>
                        <Input
                          id="studentPassword"
                          type="password"
                          placeholder="Enter password"
                          className="mt-2"
                          value={student_password}
                          onChange={(e) => {
                            const pwd = e.target.value;
                            setStudent_Password(pwd);
                            setPasswordStrength(checkPasswordStrength(pwd));
                          }}
                        />

                        {/* Real-time strength feedback */}
                        {passwordStrength && (
                          <p
                            className={`mt-1 text-sm ${
                              passwordStrength === "weak"
                                ? "text-red-600"
                                : passwordStrength === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {passwordStrength === "weak" && "Weak password"}
                            {passwordStrength === "medium" && "Medium password"}
                            {passwordStrength === "strong" && "Strong password"}
                          </p>
                        )}

                        {/* Final error message on submit */}
                        {passwordError && (
                          <p className="text-red-600 text-sm mt-1">
                            {passwordError}
                          </p>
                        )}
                      </div>

                      {/* Course */}
                      <div>
                        <Label>Course</Label>
                        <Select
                          value={selectedcourse}
                          onValueChange={(cr) => setselectedcourse(cr)}
                        >
                          <SelectTrigger className="w-full border-green-800 mt-2">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {CourseFetch.length > 0 ? (
                              CourseFetch.map((crs) => (
                                <SelectItem
                                  key={crs.course_id}
                                  value={String(crs.course_id)}
                                >
                                  {crs.course_name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem disabled>No course found</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Year Level */}
                      <div>
                        <Label>Year Level</Label>
                        <Select
                          value={selectedyearlevel}
                          onValueChange={(yl) => setselectedyearlevel(yl)}
                        >
                          <SelectTrigger className="w-full border-green-800 mt-2">
                            <SelectValue placeholder="Select year level" />
                          </SelectTrigger>
                          <SelectContent>
                            {YearlevelFetch.length > 0 ? (
                              YearlevelFetch.map((yrs) => (
                                <SelectItem
                                  key={yrs.year_id}
                                  value={String(yrs.year_id)}
                                >
                                  {yrs.year_name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem disabled>
                                No year level found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Button
                          type="submit"
                          className="w-full bg-green-800 hover:bg-green-900 text-white"
                        >
                          Create Account
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="pt-4 pb-8">
          <motion.footer
            variants={itemVariants}
            className="text-green-800 font-semibold text-lg sm:text-3xl text-center"
          >
            Making Lives Better Through Education #SasamahanKita
          </motion.footer>
        </div>
      </div>
    </div>
  );
}
