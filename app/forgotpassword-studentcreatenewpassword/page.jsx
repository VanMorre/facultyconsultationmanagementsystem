import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function ForgotPasswordStudentCreateNewPassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("studentEmail");
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
        `http://localhost/fchms/app/api_fchms/studentside/verifystudent/verifypasswordchange-student.php`,
        {
          email, // ✅ pulled from localStorage
          old_password: oldPassword,
          new_password: newPassword,
        }
      );

      if (response.data.success) {
        toast.success("Password updated successfully! Redirecting...");
        localStorage.removeItem("studentEmail");
        setTimeout(() => {
          window.location.href = "/loginform";
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
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-green-800 mb-4">
        Create New Password
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your old and new password to update your credentials.
      </p>

      <input
        type="password"
        placeholder="Enter old password"
        value={oldPassword}
        onChange={(e) => setOldPassword(e.target.value)}
        className="w-full border border-green-800 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
      />
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border border-green-800 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-600"
      />
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full border border-green-800 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      <button
        onClick={handleChangePassword}
        className="w-full bg-green-800 text-white py-2 rounded-lg hover:bg-green-700 transition"
      >
        Update Password
      </button>
    </div>
  );
}
