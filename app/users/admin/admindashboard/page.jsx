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

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

import { Line } from "react-chartjs-2";
import SubjectlistManagement from "./components/subjectslist";
import StudentrequestManagement from "./components/studentrequest";
import DepartmentManagement from "./components/department";
import ConsultationManagement from "./components/consultation";
import AuditManagement from "./components/auditlogs";
import FacultyManagement from "./components/faculty";
import AvailabilityManagement from "./components/availability";
import ReportManagement from "./components/reports";
import CryptoJS from "crypto-js";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import {
  FaClipboardList,
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import AdminLayout from "../layouts/adminlayout";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TbUser, TbFilter, TbArrowDown, TbArrowRight } from "react-icons/tb";

const AdminDashboard = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [fadeTransition, setFadeTransition] = useState(false);

  const SECRET_KEY = "my_secret_key_123456";

  // 1) decrypt on mount
  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("user_id");

    if (encryptedUserId) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedUserId, SECRET_KEY);
        const decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
        setLoggedInUserId(decryptedUserId);
      } catch (error) {
        console.error("Error decrypting user ID:", error);
      }
    }
  };

  useEffect(() => {
    decryptUserId();
  }, [loggedInUserId]);

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
    <AdminLayout
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
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div
                variants={itemVariants}
                className="border  bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Total Consultations
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">1,225</h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaClipboardList className="text-xl" />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="border  bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Scheduled
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">78</h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaCalendarCheck className="text-xl" />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="border  bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Complete
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">162</h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaCheckCircle className="text-xl" />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="border  bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Scheduled
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">428</h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaCalendarCheck className="text-xl" />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="border  bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Cancelled
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">629</h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaTimesCircle className="text-xl" />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Left Column - Teacher Consultation and My Weekly Availability stacked */}
              <div className="col-span-2 flex flex-col gap-3">
                {/* Teacher Consultation Render Hours */}
                <motion.div
                  variants={chartVariants}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-l font-bold text-black">
                      Faculty Consultation Render Hours
                    </h2>
                    <motion.select
                      whileHover={{ scale: 1.05 }}
                      className="border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00856F]"
                    >
                      <option value="0">All</option>
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
                            label: "RenderHours",
                            data: [5, 8, 6, 10, 7, 12, 9, 11, 6, 8, 10, 7],
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

                {/* My Weekly Consultation Availability */}
                <motion.div
                  variants={chartVariants}
                  className="bg-white p-6 rounded-lg shadow-md flex-grow"
                >
                  <h2 className="text-l  font-bold text-black mb-4">
                    My Consultation Availability
                  </h2>
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-7 text-center text-sm font-medium bg-green-900 text-white font-semibold">
                      <div className="py-2">Monday</div>
                      <div className="py-2">Tuesday</div>
                      <div className="py-2">Wednesday</div>
                      <div className="py-2">Thursday</div>
                      <div className="py-2">Friday</div>
                      <div className="py-2">Saturday</div>
                      <div className="py-2">Sunday</div>
                    </div>
                    <div className="grid grid-cols-7 text-center">
                      <div className="border p-4 h-[80px]"></div>
                      <div className="border p-4 h-[80px]"></div>
                      <div className="border p-1 h-[80px] flex items-center justify-center">
                        <div className="bg-green-900 text-white text-xs px-3 py-1 rounded-md">
                          2:00pm – 4:00pm
                        </div>
                      </div>
                      <div className="border p-4 h-[80px]"></div>
                      <div className="border p-4 h-[80px]"></div>
                      <div className="border p-1 h-[80px] flex items-center justify-center">
                        <div className="bg-green-900 text-white text-xs px-3 py-1 rounded-md">
                          7:00pm – 4:00pm
                        </div>
                      </div>
                      <div className="border p-4 h-[80px]"></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-4 rounded-lg shadow-md h-full"
              >
                {/* Header with icon & filter */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <TbUser className="text-green-800 w-8 h-8 !w-8 !h-8" />
                    <h2 className="text-l font-bold text-black ">
                      Student Requests
                    </h2>
                  </div>
                  <div className="flex items-center gap-1">
                    <TbFilter className="text-green-800 w-8 h-8 !w-8 !h-8" />
                    <select className="border border-green-800 rounded px-2 py-1 text-sm text-black focus:outline-none">
                      <option>All</option>
                      <option>Today</option>
                      <option>This Week</option>
                      <option>This Month</option>
                    </select>
                  </div>
                </div>

                {/* Requests list */}
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-black">
                          Juan Dela Cruz
                        </p>
                        <p className="text-sm text-gray-700">
                          Discussion on research
                        </p>
                        <p className="text-sm text-gray-600">
                          Aug 10, 2025 - 1:00 am
                        </p>
                        <p className="text-sm text-gray-700">
                          Project guidance
                        </p>
                      </div>
                      <TbArrowRight className="text-green-800 w-5 h-5 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-black">Daniel Smith</p>
                        <p className="text-sm text-gray-700">
                          Project guidance
                        </p>
                        <p className="text-sm text-gray-600">
                          Aug 12, 2025 - 9:30 am
                        </p>
                        <p className="text-sm text-gray-700">Assistance help</p>
                      </div>
                      <TbArrowRight className="text-green-800 w-5 h-5 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-black">Anne Reyes</p>
                        <p className="text-sm text-gray-700">
                          Consultation altoe
                        </p>
                        <p className="text-sm text-gray-600">
                          Aug 15, 2025 - 11:00 am
                        </p>
                        <p className="text-sm text-gray-700">
                          Discussion on research
                        </p>
                      </div>
                      <TbArrowRight className="text-green-800 w-5 h-5 flex-shrink-0" />
                    </div>
                  </div>
                </div>

                {/* See more link */}
                <div className="mt-56 flex justify-center">
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-green-800 hover:bg-green-900 transition-colors">
                    <TbArrowDown className="text-white text-lg" />
                  </button>
                </div>
              </motion.div>
            </div>

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
          </>
        )}

        {currentView === "faculty" && <FacultyManagement />}
        {currentView === "subjects" && <SubjectlistManagement />}
         {currentView === "studentrequest" && <StudentrequestManagement />}
        {currentView === "auditlogs" && <AuditManagement />}
        {currentView === "availability" && <AvailabilityManagement />}
        {currentView === "consultation" && <ConsultationManagement />}
        {currentView === "departments" && <DepartmentManagement />}
        {currentView === "reports" && <ReportManagement />}
      </motion.div>
    </AdminLayout>
  );
};
export default AdminDashboard;
