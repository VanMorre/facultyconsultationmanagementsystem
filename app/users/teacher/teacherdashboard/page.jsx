"use client";
import { registerChartJS } from "@/lib/chart-config";
registerChartJS();
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

import { TbUser, TbFilter, TbArrowRight, TbArrowDown } from "react-icons/tb";
import { Line } from "react-chartjs-2";
import dynamic from "next/dynamic";

// Lazy load heavy components for better initial load performance
const SettingsManagement = dynamic(() => import("./components/settings"), { ssr: false });
const ReportManagement = dynamic(() => import("./components/reports"), { ssr: false });
const StudentrequestManagement = dynamic(() => import("./components/studentrequest"), { ssr: false });
const AvailabilityManagement = dynamic(() => import("./components/availability"), { ssr: false });
const ConsultationManagement = dynamic(() => import("../backups/consultation"), { ssr: false });
import CryptoJS from "crypto-js";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import TeacherLayout from "../layouts/teacherlayout";
import { PiBellRingingFill } from "react-icons/pi";
import { toast } from "react-toastify";

const TeacherDashboard = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [fadeTransition, setFadeTransition] = useState(false);
  const [AvailabilityFetch, setFetchAvailability] = useState([]);
  const [fetchbooking, setfetchbooking] = useState([]);
  const [ConsultationFetch, setFetchConsultation] = useState([]);
  const SECRET_KEY = "my_secret_key_123456";
  const notifiedBookingIdsRef = useRef([]);
  const toastShownBookingRef = useRef(false);
  const notifiedAvailabilityIdsRef = useRef([]);
  const toastShownAvailabilityRef = useRef(false);
  const notifiedConsultationIdsRef = useRef([]);
  const toastShownConsultationRef = useRef(false);
  const decryptCacheRef = useRef(new Map());

  // Decrypt user ID function with caching
  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("user_id");
    if (!encryptedUserId) return null;

    // Use cache to avoid re-decrypting
    if (decryptCacheRef.current.has(encryptedUserId)) {
      return decryptCacheRef.current.get(encryptedUserId);
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encryptedUserId, SECRET_KEY);
      let decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
      decryptedUserId = decryptedUserId.replace(/^"|"$/g, "");
      const numericId = parseInt(decryptedUserId, 10);

      if (!isNaN(numericId)) {
        decryptCacheRef.current.set(encryptedUserId, numericId);
        return numericId;
      }
    } catch (error) {
      console.error("Error decrypting user ID:", error);
    }
    return null;
  };

  useEffect(() => {
    // Decrypt user ID synchronously
    const userId = decryptUserId();
    if (userId) {
      setLoggedInUserId(userId);
    }
  }, []);

  useEffect(() => {
    if (!loggedInUserId) return;

    // Load session-stored notified IDs (fast synchronous operation)
    const storedBooking = sessionStorage.getItem("notified_booking_ids");
    if (storedBooking) {
      try {
        notifiedBookingIdsRef.current = JSON.parse(storedBooking);
      } catch (e) {
        notifiedBookingIdsRef.current = [];
      }
    }

    const storedConsultation = sessionStorage.getItem("notified_consultation_ids");
    if (storedConsultation) {
      try {
        notifiedConsultationIdsRef.current = JSON.parse(storedConsultation);
      } catch (e) {
        notifiedConsultationIdsRef.current = [];
      }
    }

    const storedAvailability = sessionStorage.getItem("notified_availability_ids");
    if (storedAvailability) {
      try {
        notifiedAvailabilityIdsRef.current = JSON.parse(storedAvailability);
      } catch (e) {
        notifiedAvailabilityIdsRef.current = [];
      }
    }

    // Defer initial API calls to allow page to render first
    const initialFetchTimeout = setTimeout(() => {
      fetchbookingstudentWithNotify(loggedInUserId, true);
      fetchConsultationWithNotify(loggedInUserId, true);
      fetchAvailabilityWithNotify(loggedInUserId, true);
    }, 100);

    // Poll every 5 seconds (start after initial fetch)
    const interval = setInterval(() => {
      fetchbookingstudentWithNotify(loggedInUserId, false);
      fetchConsultationWithNotify(loggedInUserId, false);
      fetchAvailabilityWithNotify(loggedInUserId, false);
    }, 5000);

    return () => {
      clearTimeout(initialFetchTimeout);
      clearInterval(interval);
    };
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(fetchbooking.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = fetchbooking.slice(indexOfFirstItem, indexOfLastItem);
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const fetchAvailabilityWithNotify = async (userId, isInitial = false) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-availability/fetch-availability.php`,
        { params: { user_id: userId } }
      );

      if (response.data.success) {
        const newAvailability = response.data.data;

        // Extract unique availability IDs
        const currentIds = newAvailability.map(
          (item) => item.availabilityfaculty_id
        );

        // Find IDs that are new
        const newIds = currentIds.filter(
          (id) => !notifiedAvailabilityIdsRef.current.includes(id)
        );

        if (
          !isInitial &&
          newIds.length > 0 &&
          !toastShownAvailabilityRef.current
        ) {
          toastShownAvailabilityRef.current = true;

          // ✅ Save notified IDs
          notifiedAvailabilityIdsRef.current = [
            ...notifiedAvailabilityIdsRef.current,
            ...newIds,
          ];

          sessionStorage.setItem(
            "notified_availability_ids",
            JSON.stringify(notifiedAvailabilityIdsRef.current)
          );

          // Reset lock after delay
          setTimeout(() => {
            toastShownAvailabilityRef.current = false;
          }, 5000);
        }

        // ✅ On initial fetch, just mark IDs
        if (isInitial) {
          notifiedAvailabilityIdsRef.current = [
            ...notifiedAvailabilityIdsRef.current,
            ...currentIds,
          ];
          sessionStorage.setItem(
            "notified_availability_ids",
            JSON.stringify(notifiedAvailabilityIdsRef.current)
          );
        }

        setFetchAvailability(newAvailability);
      } else {
        setFetchAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching faculty availability:", error);
      setFetchAvailability([]);
    }
  };

  const fetchbookingstudentWithNotify = async (UserID, isInitial = false) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
        { params: { user_id: UserID } }
      );

      if (response.data.success) {
        const newBookings = response.data.data;

        // Extract unique booking IDs
        const currentIds = newBookings.map((item) => item.booking_id);

        // Find IDs that are new compared to stored ones
        const newIds = currentIds.filter(
          (id) => !notifiedBookingIdsRef.current.includes(id)
        );

        // 🚫 Removed toast, but still handle ID tracking
        if (!isInitial && newIds.length > 0 && !toastShownBookingRef.current) {
          toastShownBookingRef.current = true;

          // ✅ Save notified IDs
          notifiedBookingIdsRef.current = [
            ...notifiedBookingIdsRef.current,
            ...newIds,
          ];

          sessionStorage.setItem(
            "notified_booking_ids",
            JSON.stringify(notifiedBookingIdsRef.current)
          );

          // Reset lock after delay
          setTimeout(() => {
            toastShownBookingRef.current = false;
          }, 5000);
        }

        // ✅ On initial fetch, just mark IDs without showing anything
        if (isInitial) {
          notifiedBookingIdsRef.current = [
            ...notifiedBookingIdsRef.current,
            ...currentIds,
          ];
          sessionStorage.setItem(
            "notified_booking_ids",
            JSON.stringify(notifiedBookingIdsRef.current)
          );
        }

        setfetchbooking(newBookings);
      } else {
        setfetchbooking([]);
      }
    } catch (error) {
      console.error("Error fetching student booking:", error);
      setfetchbooking([]);
    }
  };

  const fetchConsultationWithNotify = async (UserID, isInitial = false) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-consultation/fetch-consultation.php`,
        { params: { user_id: UserID } }
      );

      if (response.data.success) {
        const newConsultations = response.data.data;

        // Extract unique consultation IDs
        const currentIds = newConsultations.map(
          (item) => item.schedulebookings_id
        );

        // Find IDs that are new
        const newIds = currentIds.filter(
          (id) => !notifiedConsultationIdsRef.current.includes(id)
        );

        if (
          !isInitial &&
          newIds.length > 0 &&
          !toastShownConsultationRef.current
        ) {
          toastShownConsultationRef.current = true;

          // ✅ Save notified IDs
          notifiedConsultationIdsRef.current = [
            ...notifiedConsultationIdsRef.current,
            ...newIds,
          ];

          sessionStorage.setItem(
            "notified_consultation_ids",
            JSON.stringify(notifiedConsultationIdsRef.current)
          );

          // Reset lock after delay
          setTimeout(() => {
            toastShownConsultationRef.current = false;
          }, 5000);
        }

        // ✅ On initial fetch, just mark IDs
        if (isInitial) {
          notifiedConsultationIdsRef.current = [
            ...notifiedConsultationIdsRef.current,
            ...currentIds,
          ];
          sessionStorage.setItem(
            "notified_consultation_ids",
            JSON.stringify(notifiedConsultationIdsRef.current)
          );
        }

        setFetchConsultation(newConsultations);
      } else {
        setFetchConsultation([]);
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
      setFetchConsultation([]);
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

  const totalConsultations = fetchbooking.length;
  const completedCount = fetchbooking.filter(
    (c) => c.approval_name === "Completed"
  ).length;
  const cancelledCount = fetchbooking.filter(
    (c) => c.approval_name === "Cancelled"
  ).length;

  return (
    <TeacherLayout
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              {/* Left Column - Teacher Consultation and My Weekly Availability stacked */}
              <div className="col-span-2 flex flex-col gap-3">
                {/* Teacher Consultation Render Hours */}
                {/* <motion.div
                  variants={chartVariants}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-l font-bold text-black ">
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
                  className="bg-white p-6 rounded-lg shadow-md flex-grow h-[700px]" // fixed height card
                >
                  <h2 className="text-l font-bold text-black mb-4">
                    My Consultation Availability
                  </h2>

                  <div className="border rounded-md flex flex-col h-[600px]">
                    {/* Header with rounded top corners */}
                    <div className="grid grid-cols-7 text-center text-sm font-medium bg-green-900 text-white font-semibold rounded-t-md">
                      {days.map((day) => (
                        <div key={day} className="py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Availability Slots */}
                    <div className="grid grid-cols-7 text-center flex-1 overflow-y-auto">
                      {days.map((day) => {
                        const slots = AvailabilityFetch.filter(
                          (slot) => slot.availability_name === day
                        );

                        return (
                          <div
                            key={day}
                            className="border p-1 flex flex-col items-center gap-1 min-h-[150px]"
                          >
                            {slots.length > 0 ? (
                              slots.map((slot) => (
                                <div
                                  key={slot.availabilityfaculty_id}
                                  className="bg-green-900 text-white text-xs px-3 py-1 rounded-md mt-2"
                                >
                                  {slot.time_range}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 mt-2">
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
                className="bg-white p-4 rounded-lg shadow-md h-[700px] flex flex-col" // ✅ fixed height
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-l font-bold text-black">
                      Student Requests
                    </h2>

                    {/* Bell with count */}
                    <div className="relative">
                      <PiBellRingingFill className="text-green-900 w-7 h-7 cursor-pointer" />
                      {fetchbooking.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-sm font-bold rounded-full px-2 py-0.10">
                          {fetchbooking.length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requests list (scrollable) */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {currentItems.length > 0 ? (
                    currentItems.map((req, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                      >
                        {/* Header */}
                        <div className="bg-green-900 px-4 py-2">
                          <h3 className="text-white font-semibold text-sm">
                            Student Request
                          </h3>
                        </div>
                        {/* Body */}
                        <div className="p-4 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="w-24 font-semibold text-gray-800">
                                  Name:
                                </span>
                                <span className="text-black">
                                  {req.student_name}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 font-semibold text-gray-800">
                                  Subject:
                                </span>
                                <span className="text-gray-700">
                                  {req.subject_name}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 font-semibold text-gray-800">
                                  Purpose:
                                </span>
                                <span className="text-gray-700">
                                  {req.purpose}
                                </span>
                              </div>
                              <div className="flex">
                                <span className="w-24 font-semibold text-gray-800">
                                  Date:
                                </span>
                                <span className="text-gray-600">
                                  {new Date(req.booking_date).toLocaleString(
                                    "en-US",
                                    {
                                      month: "long",
                                      day: "2-digit",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="bg-green-900 p-2 rounded-full flex items-center justify-center ml-4">
                              <TbArrowRight className="text-white w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      No requests found
                    </p>
                  )}
                </div>

                {/* Footer fixed at bottom */}
                {/* Footer fixed at bottom */}
                <div className="mt-3 flex items-center justify-between ">
                  <span className="text-sm text-green-900 font-semibold ">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, fetchbooking.length)} of{" "}
                    {fetchbooking.length} entries
                  </span>

                  <div className="flex">
                    <Pagination>
                      <PaginationContent className="flex">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() => goToPage(index + 1)}
                              className={
                                currentPage === index + 1
                                  ? "bg-green-900 text-white"
                                  : ""
                              }
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {currentView === "Settings" && <SettingsManagement />}
        {currentView === "reports" && <ReportManagement />}
        {currentView === "availability" && <AvailabilityManagement />}
        {currentView === "consultation" && <ConsultationManagement />}
        {currentView === "studentrequest" && <StudentrequestManagement />}
      </motion.div>
    </TeacherLayout>
  );
};
export default TeacherDashboard;
