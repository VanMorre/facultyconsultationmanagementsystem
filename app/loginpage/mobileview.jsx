"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import CryptoJS from "crypto-js";
import { motion } from "framer-motion";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { FiRefreshCcw } from "react-icons/fi";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import { LuLogIn } from "react-icons/lu";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SECRET_KEY = "my_secret_key_123456";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const captchaCanvasRef = useRef(null);

  const router = useRouter();
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };
  const leftPanelVariants = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const leftItemVariants = { hidden: { opacity: 0, y: 20 }, visible: (i = 1) => ({ opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.4, ease: "easeOut" } }) };

  // Captcha generator
  const generateCaptcha = () => {
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    setCaptchaText(captcha);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "28px Arial";
    ctx.fillStyle = "#000";

    const spacing = 35;
    const textWidth = captcha.length * spacing;
    const startX = (canvas.width - textWidth) / 2;
    const startY = canvas.height / 2 + 10;

    for (let i = 0; i < captcha.length; i++) ctx.fillText(captcha[i], startX + i * spacing, startY);

    for (let i = 0; i < 10; i++) {
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
  }, []);

  const encryptData = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (captchaInput !== captchaText) {
      toast.error("Invalid CAPTCHA. Please try again.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }
    try {
      const response = await axios.post("http://localhost/fchms/app/api_fchms/loginphp/loginform.php", { email, password });
      if (response.data.success) {
        toast.success("Login Successfully!");
        setTimeout(() => router.push("/admin-dashboard"), 1500);
      } else {
        toast.error(response.data.message || "Invalid login credentials.");
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
      <div className="relative w-full lg:w-1/2 h-72 lg:h-auto overflow-hidden">
        <motion.div className="absolute inset-0 z-0" variants={leftPanelVariants} initial="hidden" animate="visible">
          <Image src="/images/bldg.jpg" alt="Building Background" fill className="object-cover opacity-90" priority />
        </motion.div>

        <div className="relative z-10 w-full h-full min-h-[16rem] lg:min-h-screen bg-green-800/85 text-white p-6 flex flex-col">
          <div className="flex flex-col lg:flex-row items-center justify-center flex-grow gap-6 text-center lg:text-right">
            {/* Text */}
            <motion.div className="space-y-1" custom={1} variants={leftItemVariants}>
              <h1 className="font-semibold text-lg lg:text-xl">Phinma Cagayan de Oro College</h1>
              <h1 className="font-semibold text-lg lg:text-xl">FCHMS PORTAL</h1>
              <h2 className="text-sm lg:text-md mt-1 font-semibold">Max Sunniel St. Cagayan de Oro City</h2>
            </motion.div>

            {/* Divider */}
            <motion.div className="hidden lg:block w-px h-28 bg-white" custom={4} variants={leftItemVariants} />

            {/* Logo */}
            <motion.div className="w-40 h-20 lg:w-[400px] lg:h-[160px] mt-4 lg:mt-0 mb-52 lg:mb-52" custom={5}  variants={leftItemVariants}>
              <Image src="/images/coclogo-removebg.png" alt="COC Logo" width={400} height={160} priority />
            </motion.div>
          </div>

          <footer className="text-xs lg:text-sm font-semibold text-center mt-4 lg:mt-8">
            © {new Date().getFullYear()} PHINMA Cagayan de Oro College. All rights reserved.
          </footer>
        </div>

        
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white relative overflow-hidden px-4 py-6">
        {/* Background Circles and Shapes */}
        <div className="absolute w-20 h-20 lg:w-32 lg:h-32 bg-green-800 rounded-full -top-6 -left-10 shadow-[0_20px_40px_rgba(0,100,0,0.6)]"></div>
        <div className="absolute w-28 h-28 lg:w-40 lg:h-40 bg-green-800 rounded-full -bottom-10 -right-10 shadow-[0_20px_40px_rgba(0,100,0,0.6)]"></div>
        <div className="absolute w-16 h-16 lg:w-24 lg:h-24 bg-green-800 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_20px_40px_rgba(0,100,0,0.6)]"></div>

        {/* Parallelograms */}
        <div className="absolute w-36 h-20 bg-green-800 transform -rotate-6 skew-x-12 top-[40%] left-[6%] z-0 shadow-[0_25px_50px_rgba(0,100,0,0.7)]"></div>
        <div className="absolute w-36 h-20 bg-gray-200 transform rotate-12 skew-x-12 bottom-[5%] left-[40%] z-0 shadow-[0_25px_50px_rgba(100,100,100,0.4)]"></div>
        <div className="absolute w-36 h-20 bg-gray-200 transform rotate-12 skew-x-12 top-[6%] left-[40%] z-0 shadow-[0_25px_50px_rgba(100,100,100,0.4)]"></div>
        <div className="absolute w-44 h-24 bg-green-800 transform rotate-12 skew-x-12 top-1/2 right-10 -translate-y-1/2 z-0 shadow-[0_25px_50px_rgba(0,100,0,0.7)]"></div>

        {/* Toast */}
        <ToastContainer position="top-right" autoClose={1000} theme="light" transition={Bounce} />

        {/* Login Form */}
        <motion.div className="w-full max-w-md sm:max-w-lg lg:max-w-xl p-6 sm:p-10 bg-white rounded-lg shadow-2xl z-10" variants={containerVariants} initial="hidden" animate="visible">
          {/* Header */}
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold text-black">Hello Welcome!</h2>
              <p className="text-sm text-black mt-1">Enter your email and password to login.</p>
            </div>
            <Image src="/images/phinmaedlogos.png" alt="Phinma Logo" width={100} height={80} priority />
          </motion.div>

          {/* Form */}
          <motion.form className="space-y-4" onSubmit={handleSubmit} variants={containerVariants}>
            <motion.div variants={itemVariants}>
              <Label htmlFor="email" className="text-black mb-2">Email</Label>
              <div className="relative">
                <AiOutlineMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black" />
                <Input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 w-full h-11 text-sm border border-green-800 bg-transparent text-black rounded-md shadow-xl" placeholder="Enter your phinmaed email" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label htmlFor="password" className="text-black mb-2">Password</Label>
              <div className="relative">
                <AiOutlineLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-black" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 w-full h-11 text-sm border border-green-800 bg-transparent text-black rounded-md shadow-xl" placeholder="Enter your password" />
              </div>
            </motion.div>

            {/* Captcha */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <canvas ref={captchaCanvasRef} width="220" height="60" className="border border-black bg-white shadow-xl" />
                <button type="button" onClick={generateCaptcha} className="p-2 bg-green-800 hover:bg-green-900 text-white rounded-md shadow-xl">
                  <FiRefreshCcw size={18} />
                </button>
              </div>
              <input type="text" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} className="w-full p-2 h-11 border border-black shadow-xl rounded-md bg-white text-black text-sm" placeholder="Enter Captcha" />
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants}>
              <Button type="submit" disabled={isLocked} className={`w-full h-11 rounded-md flex items-center justify-center gap-2 shadow-xl ${isLocked ? "bg-gray-400" : "bg-green-800 hover:bg-green-900"}`}>
                {isLocked ? `Try again in ${lockoutTime}s` : "Sign In"} <LuLogIn className="w-5 h-5" />
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <Link href="/recoveraccountform" className="text-sm text-green-700 hover:underline">Forgotten Your Password?</Link>
            </motion.div>
          </motion.form>
        </motion.div>

        {/* Footer */}
        <div className="pt-4 pb-8">
          <motion.footer variants={itemVariants} className="text-green-800 font-semibold text-base sm:text-lg lg:text-2xl text-center">
            Making Lives Better Through Education #SasamahanKita
          </motion.footer>
        </div>
      </div>
    </div>
  );
}
