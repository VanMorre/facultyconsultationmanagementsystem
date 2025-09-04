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
import Link from "next/link";
import { LuLogIn } from "react-icons/lu";
import { FiRefreshCcw } from "react-icons/fi";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (captchaInput !== captchaText) {
      toast.error("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost/fchms/app/api_fchms/loginphp/loginform.php",
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
            case "student":
              navigate("/student-dashboard");
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
              <h1 className="font-semibold text-lg lg:text-xl">FCHMS PORTAL</h1>
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
          <motion.div
            className="w-full max-w-md sm:max-w-xl p-6 sm:p-10 bg-white rounded-lg shadow-2xl flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between w-full max-w-[700px] mb-6"
            >
              <div>
                <motion.h2 className="text-2xl font-semibold text-black">
                  Hello Welcome!
                </motion.h2>
                  <motion.h2 className="text-2xl font-semibold text-black">
                  Logged in as Faculty
                </motion.h2>

                <motion.p className="text-sm text-black mt-2">
                  Enter your email and password to login.
                </motion.p>
              </div>
              <Image
                src="/images/phinmaedlogos.png"
                alt="COC Logo"
                width={100}
                height={70}
                className="ml-4 sm:ml-6"
                priority
              />
            </motion.div>

            {/* Login Form */}
            <motion.form
              className="space-y-4"
              onSubmit={handleSubmit}
              variants={containerVariants}
            >
              {/* Email */}
              <motion.div variants={itemVariants}>
                <Label htmlFor="email" className="text-black mb-2">
                  Email
                </Label>
                <div className="relative">
                  <AiOutlineMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black" />
                  <Input
                    id="email"
                    type="text"
                    className="pl-12 w-full h-12 text-base border border-green-800 bg-transparent text-black rounded-md shadow-xl"
                    value={email}
                    placeholder="Enter your phinmaed email"
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <Label htmlFor="password" className="text-black mb-2">
                  Password
                </Label>
                <div className="relative">
                  <AiOutlineLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-12 w-full h-12 text-base border border-green-800 bg-transparent text-black rounded-md shadow-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </motion.div>

              {/* CAPTCHA */}
              <motion.div variants={itemVariants} className="mt-8">
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
                    title="Refresh Captcha"
                  >
                    <FiRefreshCcw size={20} />
                  </button>
                </div>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full p-2 border border-black shadow-xl rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-red-400 text-black h-12"
                />
              </motion.div>

              {/* SIGN IN BUTTON */}
              <motion.div variants={itemVariants}>
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

              {/* Forgot Password */}
              <motion.div variants={itemVariants} className="text-center">
                <Button variant="link" className="text-sm text-black-600">
                  <Link href="/recoveraccountform">
                    Forgotten Your Password?
                  </Link>
                </Button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>

        {/* Footer */}
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
