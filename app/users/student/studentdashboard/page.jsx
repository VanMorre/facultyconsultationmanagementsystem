"use client";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from "chart.js";
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
);
import { Line } from "react-chartjs-2";
import BookConsultationManagement from "./components/studentbookconsultation";
import StudentConsultationManagement from "./components/studentbookconsultationview";
import CryptoJS from "crypto-js";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

import StudentLayout from "../layouts/studentlayout";

import { FaClipboardList } from "react-icons/fa";

const StudentDashboard = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [fadeTransition, setFadeTransition] = useState(false);
  const [fetchbooking, setfetchbooking] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = All
  const SECRET_KEY = "my_secret_key_123456";

  // 🔑 Decrypt user ID
  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("student_id");

    if (encryptedUserId) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedUserId, SECRET_KEY);
        let decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);

        // 🔹 Remove wrapping quotes if any
        decryptedUserId = decryptedUserId.replace(/^"|"$/g, "");

        // 🔹 Cast to integer
        const numericId = parseInt(decryptedUserId, 10);

        if (!isNaN(numericId)) {
          setLoggedInUserId(numericId);
        } else {
          console.error("Invalid decrypted student ID:", decryptedUserId);
        }
      } catch (error) {
        console.error("Error decrypting user ID:", error);
      }
    }
  };


  useEffect(() => {
    decryptUserId();
    if (loggedInUserId) {
      fetchbookingstudent(loggedInUserId);
    }
  }, [loggedInUserId]);

  const fetchbookingstudent = async (StudentID) => {
    try {
    
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
        {
          params: { student_id: StudentID }, // ✅ send user_id
        }
      );

      if (response.data.success) {
        setfetchbooking(response.data.data);
      } else {
        setfetchbooking([]);
      }
    } catch (error) {
      console.error("Error fetching student booking:", error);
      setfetchbooking([]);
    }
  };

  // 📊 Count bookings by month
  const getMonthlyBookings = () => {
    const counts = Array(12).fill(0);
    fetchbooking.forEach((booking) => {
      if (booking.booking_date) {
        const month = new Date(booking.booking_date).getMonth(); // 0–11
        counts[month] += 1;
      }
    });
    return counts;
  };

  const monthlyData = getMonthlyBookings();

  // 🗓️ Filtered bookings (for card)
  const filteredBookings = fetchbooking.filter((booking) => {
    if (selectedMonth === 0) return true;
    const month = new Date(booking.booking_date).getMonth() + 1;
    return month === selectedMonth;
  });

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };
  const chartVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <StudentLayout
      currentView={currentView}
      setCurrentView={(v) => {
        if (v !== currentView) {
          setFadeTransition(true);
          setTimeout(() => {
            setCurrentView(v);
            setTimeout(() => setFadeTransition(false), 50);
          }, 300);
        }
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`transition-opacity duration-300 ${
          fadeTransition ? "opacity-0" : "opacity-100"
        }`}
      >
        {currentView === "dashboard" && (
          <>
            {/* ✅ Card Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div
                variants={itemVariants}
                className="border bg-white p-5 min-h-[100px] rounded-lg shadow flex justify-between items-center w-full"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Total Consultations
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">
                    {filteredBookings.length}
                  </h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaClipboardList className="text-xl" />
                </div>
              </motion.div>
            </div>

            {/* ✅ Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
              <motion.div
                variants={chartVariants}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-black">
                    Number of Book Consultation
                  </h2>
                  <motion.select
                    whileHover={{ scale: 1.05 }}
                    className="border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00856F]"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    <option value={0}>All</option>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m, idx) => (
                      <option key={idx} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </motion.select>
                </div>
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ],
                      datasets: [
                        {
                          label: "Book Consultation",
                          data: monthlyData, // ✅ dynamic data
                          borderColor: "#246919ff",
                          backgroundColor: "rgba(31, 118, 110, 0.2)",
                          tension: 0.4,
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "top" } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}

        {currentView === "bookconsultation" && <BookConsultationManagement />}
        {currentView === "consultation" && <StudentConsultationManagement />}
      </motion.div>
    </StudentLayout>
  );
};

export default StudentDashboard;
