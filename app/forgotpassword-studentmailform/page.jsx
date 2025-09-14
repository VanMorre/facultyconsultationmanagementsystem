import { useState } from "react";
import Image from "next/image";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function ForgotPasswordStudentEmailForm() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleVerifyEmail = async () => {
    if (!email) {
      toast.error("Please enter your student email.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost/fchms/app/api_fchms/studentside/verifystudent/verifyemail-student.php`,
        { email }
      );

      if (response.data.success) {
        toast.success("Email verified! Redirecting...");
        localStorage.setItem("studentEmail", email); // ✅ Save email
        setTimeout(() => {
          navigate("/forgotpassword-studentcreatenewpassword");
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex w-full max-w-6xl bg-white shadow-2xl overflow-hidden">
        {/* Left Side */}
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

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-300"></div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-green-800 mb-6">
            Student Password Reset
          </h2>
          <p className="text-gray-600 mb-6 text-lg">
            Enter your student email to receive password reset instructions.
          </p>
          <input
            type="email"
            placeholder="Enter your student email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-green-800 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            onClick={handleVerifyEmail}
            className="w-full bg-green-800 text-white py-3 rounded-lg hover:bg-green-700 transition text-lg"
          >
            Verify Email
          </button>

          <p
            onClick={() => navigate("/loginform")}
            className="mt-6 flex items-center justify-center gap-2 text-green-800 font-medium cursor-pointer hover:underline"
          >
            <AiOutlineArrowLeft size={20} /> Back to Login
          </p>
        </div>
      </div>
    </div>
  );
}
