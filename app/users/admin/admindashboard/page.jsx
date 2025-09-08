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
// import SubjectlistManagement from "../backups/subjectslist";
import StudentrequestManagement from "./components/studentrequest";
// import DepartmentManagement from "../backups/department";
import ConsultationManagement from "./components/consultation";
// import AuditManagement from "./components/auditlogs";
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
  const [AvailabilityFetch, setFetchAvailability] = useState([]);
  const [fetchbooking, setfetchbooking] = useState([]);
  const [ConsultationFetch, setFetchConsultation] = useState([]);

  const SECRET_KEY = "my_secret_key_123456";

  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("user_id");

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
      fetchAvailability(loggedInUserId);
      fetchbookingstudent(loggedInUserId);
      fetchConsultation(loggedInUserId);
    }
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

  const fetchAvailability = async (userId) => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/adminside/admin-availability/fetch-availability.php`,
        { params: { user_id: userId } } // send user_id as query param
      );

      if (response.data.success) {
        setFetchAvailability(response.data.data);
      } else {
        setFetchAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching faculty availability:", error);
    }
  };

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const fetchbookingstudent = async (UserID) => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
        {
          params: { user_id: UserID }, // ✅ send user_id
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

  const fetchConsultation = async (UserID) => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/adminside/admin-consultation/fetch-consultation.php`,
        {
          params: { user_id: UserID }, // ✅ send user_id
        }
      );

      if (response.data.success) {
        setFetchConsultation(response.data.data);
      } else {
        setFetchConsultation([]);
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
    }
  };

  const totalConsultations = ConsultationFetch.length;
  const scheduledCount = ConsultationFetch.filter(
    (c) => c.approval_name === "Scheduled"
  ).length;
  const completedCount = ConsultationFetch.filter(
    (c) => c.approval_name === "Completed"
  ).length;
  const cancelledCount = ConsultationFetch.filter(
    (c) => c.approval_name === "Cancelled"
  ).length;

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
              {/* Total Consultations */}
              <motion.div
                variants={itemVariants}
                className="border bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Total Consultations
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">
                    {totalConsultations}
                  </h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaClipboardList className="text-xl" />
                </div>
              </motion.div>

              {/* Scheduled */}
              <motion.div
                variants={itemVariants}
                className="border bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Scheduled
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">
                    {scheduledCount}
                  </h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaCalendarCheck className="text-xl" />
                </div>
              </motion.div>

              {/* Completed */}
              <motion.div
                variants={itemVariants}
                className="border bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Completed
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">
                    {completedCount}
                  </h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaCheckCircle className="text-xl" />
                </div>
              </motion.div>

              {/* Cancelled */}
              <motion.div
                variants={itemVariants}
                className="border bg-white p-5 h-25 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-green-800 font-semibold">
                    Cancelled
                  </p>
                  <h2 className="text-2xl font-bold text-green-800">
                    {cancelledCount}
                  </h2>
                </div>
                <div className="bg-green-800 text-white p-3 rounded-full">
                  <FaTimesCircle className="text-xl" />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
             
              <div className="col-span-2 flex flex-col gap-3">
                {/* <motion.div
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
                </motion.div> */}

                {/* My Weekly Consultation Availability */}
                <motion.div
                  variants={chartVariants}
                  className="bg-white p-6 rounded-lg shadow-md flex-grow"
                >
                  <h2 className="text-l font-bold text-black mb-4">
                    My Consultation Availability
                  </h2>
                  <div className="border rounded-md overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-7 text-center text-sm font-medium bg-green-900 text-white font-semibold">
                      {days.map((day) => (
                        <div key={day} className="py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Availability Slots */}
                    <div className="grid grid-cols-7 text-center">
                      {days.map((day) => {
                        // get all slots for this day (user_id already filtered in API)
                        const slots = AvailabilityFetch.filter(
                          (slot) => slot.availability_name === day
                        );

                        return (
                          <div
                            key={day}
                            className="border p-1 h-[450px] flex flex-col items-center gap-1 overflow-y-auto"
                          >
                            {slots.length > 0 ? (
                              slots.map((slot) => (
                                <div
                                  key={slot.availabilityfaculty_id}
                                  className="bg-green-900 text-white text-xs px-3 py-1 rounded-md mt-7"
                                >
                                  {slot.time_range}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 mt-8">
                                No assign availability
                              </span>
                            )}
                          </div>
                        );
                      })}
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
                  {fetchbooking.length > 0 ? (
                    fetchbooking.map((req, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            {/* ✅ Student Name */}
                            <p className="font-semibold text-black">
                              {req.student_name}
                            </p>

                            {/* ✅ Purpose */}
                            <p className="text-sm text-gray-700">
                              {req.purpose}
                            </p>

                            {/* ✅ Booking Date */}
                            <p className="text-sm text-gray-600">
                              {new Date(req.booking_date).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </p>

                            {/* ✅ Subject */}
                            <p className="text-sm text-gray-700">
                              {req.subject_name}
                            </p>
                          </div>
                          <TbArrowRight className="text-green-800 w-5 h-5 flex-shrink-0" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      No requests found
                    </p>
                  )}
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
        {/* {currentView === "subjects" && <SubjectlistManagement />} */}
        {currentView === "studentrequest" && <StudentrequestManagement />}
        {/* {currentView === "auditlogs" && <AuditManagement />} */}
        {currentView === "availability" && <AvailabilityManagement />}
        {currentView === "consultation" && <ConsultationManagement />}
        {/* {currentView === "departments" && <DepartmentManagement />} */}
        {currentView === "reports" && <ReportManagement />}
      </motion.div>
    </AdminLayout>
  );
};
export default AdminDashboard;
