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
      transition: {
        duration: 0.5,
      },
    },
  };

  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
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
    ctx.fillText(captcha, 10, 35);

    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 200, Math.random() * 50);
      ctx.lineTo(Math.random() * 200, Math.random() * 50);
      ctx.strokeStyle = "#999";
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
          navigate("/purchaser-dashboard");
          break;
        case "student":
          navigate("/store-dashboard");
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
    } catch (error) {
      console.error("Decryption failed", error);
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
        "http://localhost/rai/app/api_raielectrical/loginphp/loginform.php",
        { email, password }
      );

      if (response.data.success) {
        const { user_id, username, role_name, photo_url , email , address , age, contact , fullname} = response.data;

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
            case "purchaser":
              navigate("/purchaser-dashboard");
              break;
            case "store":
              navigate("/store-dashboard");
              break;
            case "warehouse":
              navigate("/warehouse-dashboard");
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
    } catch (error) {
      toast.error("An error occurred during login.");
      generateCaptcha();
      setCaptchaInput("");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/ss.jpg')" }}
    >
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

      <motion.div
        className="flex w-[1000px] h-[630px] bg-white/96 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex flex-col items-center justify-center w-1/2 text-white p-8 border-r border-black bg-white-400 bg-opacity-90"
          variants={logoVariants}
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative w-[320px] h-auto ">
              <Image
                src="/images/coclogo-removebg.png"
                alt="Logo"
                width={320}
                height={170}
                className="ml-4 h-auto"
                priority
              />
            </div>

            <br />
            <h1 className="text-black font-semibold text-xl">
              Phinma Cagayan de oro College
            </h1>
            <h1 className="text-black font-semibold text-xl ml-6">
              Max Sunniel St. Cagayan de oro City
            </h1>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-1/2 bg-transparent p-10 flex flex-col justify-center"
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-semibold text-black"
          >
            Hello Welcome!
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-sm text-black-600 mb-6 mt-2"
          >
            Please login your credentials.
          </motion.p>
          <motion.form
            className="space-y-4"
            onSubmit={handleSubmit}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="relative">
              <Label htmlFor="email" className="text-black mb-2">
                Email
              </Label>
              <div className="relative">
                <AiOutlineMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black-400" />
                <Input
                  id="email"
                  type="text"
                  className="pl-10 w-full h-10 border border-gray-500 bg-transparent text-black rounded-md"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <Label htmlFor="password" className="text-black mb-2">
                Password
              </Label>
              <div className="relative">
                <AiOutlineLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black-400" />
                <Input
                  id="password"
                  type="password"
                  className="pl-10 w-full h-10 border border-gray-500 bg-transparent text-black rounded-md"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8">
              <canvas
                ref={captchaCanvasRef}
                width="200"
                height="50"
                className="border mb-6 border-black"
              />
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="w-full p-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 text-black"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                type="submit"
                disabled={isLocked}
                className={`w-full h-10 rounded-md ${
                  isLocked ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {isLocked ? `Try again in ${lockoutTime}s` : "LOGIN"}
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <Button variant="link" className="text-sm text-black-400">
                <Link href="/recoveraccountform">Forgotten Your Password?</Link>
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </div>
  );
}


