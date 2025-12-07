"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

export default function ForgotPasswordFacultyCreateNewPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("facultyEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      toast.error("No email found. Please go back and verify your email.");
    }
  }, []);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/useraccounts/verifyfaculty/verifypasswordchange-faculty.php`,
        {
          email, // ✅ based on stored email
          old_password: oldPassword,
          new_password: newPassword,
        }
      );

      if (response.data.success) {
        toast.success("Password updated successfully! Redirecting...");
        localStorage.removeItem("facultyEmail");
        setTimeout(() => {
          router.push("/loginpage");
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Something went wrong. Please try again.");
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

      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex w-full max-w-6xl bg-white shadow-2xl overflow-hidden">
          {/* Left Side - Image + Details */}
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
              Secure your account with a strong new password.
              <br />
              Keep your credentials safe at all times.
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-300"></div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-semibold text-green-800 mb-6">
              Create New Password
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Enter your old and new password to update your credentials.
            </p>

            <input
              type="password"
              placeholder="Enter old password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full border border-green-800 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-green-800 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-green-800 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-green-600"
            />

            <button
              onClick={handleChangePassword}
              className="w-full bg-green-800 text-white py-3 rounded-lg hover:bg-green-900 transition text-lg"
            >
              Update Password
            </button>

          </div>
        </div>
      </div>
    </>
  );
}
