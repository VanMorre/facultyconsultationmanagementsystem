"use client";

import { useState } from "react";
import Image from "next/image";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPasswordStudentEmailForm() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleVerifyEmail = async () => {
    if (!email) {
      toast.error("Please enter your student email.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/verifystudent/verifyemail-student.php`,
        { email }
      );

      if (response.data.success) {
        toast.success("Email verified! Redirecting...");
        localStorage.setItem("studentEmail", email); // ✅ Save email
        setTimeout(() => {
          router.push("/forgotpassword-studentcreatenewpassword");
        }, 1500);
      } else {
        toast.error(response.data.message || "Student email not found.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (

    <>
       <ToastContainer
        position="top-right"
        autoClose={1000}
        theme="light"
        transition={Bounce}
      />

    
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="flex w-full max-w-6xl bg-white shadow-2xl overflow-hidden flex-col md:flex-row">
        {/* Left Side (Desktop Only) */}
        <div className="hidden md:flex w-1/2 bg-white flex-col items-center justify-center p-6">
          <Image
            src="/images/CIT-ENCHANCEPIC.png"
            alt="Enhance"
            width={500}
            height={600}
            className="object-contain"
            priority
          />
          <p className="mt-6 text-center text-gray-700 text-lg font-medium">
            CIT empowers students and faculty with secure access.
            <br />
            Reset your password easily and safely.
          </p>
        </div>

        {/* Divider (Desktop Only) */}
        <div className="hidden md:block w-px bg-gray-300"></div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-green-800 mb-4 md:mb-6 text-center md:text-left">
            Student Password Reset
          </h2>
          <p className="text-gray-600 mb-4 md:mb-6 text-base md:text-lg text-center md:text-left">
            Enter your student email to receive password reset instructions.
          </p>
          <input
            type="email"
            placeholder="Enter your student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-green-800 rounded-lg px-4 py-2 md:py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm md:text-base"
          />
          <button
            onClick={handleVerifyEmail}
            className="w-full bg-green-800 text-white py-2 md:py-3 rounded-lg hover:bg-green-700 transition text-base md:text-lg"
          >
            Verify Email
          </button>

          <p
            onClick={() => router.push("/loginpage")}
            className="mt-4 md:mt-6 flex items-center justify-center gap-2 text-green-800 font-medium cursor-pointer hover:underline text-sm md:text-base"
          >
            <AiOutlineArrowLeft size={8} className="md:size-10" /> Back to Login
          </p>
        </div>
      </div>
    </div>

    </>

  );
}
