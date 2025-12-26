"use client";
import { registerChartJS } from "@/lib/chart-config";
registerChartJS();
import { Line } from "react-chartjs-2";
import dynamic from "next/dynamic";

// Lazy load heavy components for better initial load performance
const BookConsultationManagement = dynamic(() => import("./components/studentbookconsultation"), { ssr: false });
const StudentConsultationManagement = dynamic(() => import("./components/studentbookconsultationview"), { ssr: false });
const SettingsManagement = dynamic(() => import("./components/settings"), { ssr: false });
import CryptoJS from "crypto-js";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

import StudentLayout from "../layouts/studentlayout";

import { FaClipboardList, FaUser, FaCalendarAlt, FaClock, FaFileAlt, FaChartLine, FaFilter } from "react-icons/fa";
import { HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi";
import { MdPending, MdTrendingUp } from "react-icons/md";
import { BsBarChartFill } from "react-icons/bs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const StudentDashboard = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [fadeTransition, setFadeTransition] = useState(false);
  const [fetchbooking, setfetchbooking] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = All
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const bookingStatusRef = useRef({});

  const notifiedBookingIdsRef = useRef([]);
  const toastShownBookingRef = useRef(false);

  const SECRET_KEY = "my_secret_key_123456";
  const decryptCacheRef = useRef(new Map());

  // Decrypt user ID function with caching
  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("student_id");
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

    // Defer initial API calls to allow page to render first
    const initialFetchTimeout = setTimeout(() => {
      fetchbookingstudent(loggedInUserId, true);
    }, 100);

    // Poll every 5 seconds (start after initial fetch)
    const interval = setInterval(() => {
      fetchbookingstudent(loggedInUserId, false);
    }, 5000);

    return () => {
      clearTimeout(initialFetchTimeout);
      clearInterval(interval);
    };
  }, [loggedInUserId]);

  const fetchbookingstudent = async (StudentID, isInitial = false) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
        {
          params: { student_id: StudentID },
        }
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

  // 🔹 Month labels (define before use)
  const monthLabels = [
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
  ];

  const monthlyData = getMonthlyBookings();

  // 📊 Chart Statistics
  const totalConsultations = monthlyData.reduce((sum, count) => sum + count, 0);
  const averagePerMonth = totalConsultations > 0 ? (totalConsultations / 12).toFixed(1) : 0;
  const peakMonthIndex = monthlyData.indexOf(Math.max(...monthlyData));
  const peakMonthName = peakMonthIndex >= 0 ? monthLabels[peakMonthIndex] : "N/A";
  const peakMonthValue = monthlyData[peakMonthIndex] || 0;

  // 🗓️ Filtered bookings (for card only)
  const filteredBookings = fetchbooking.filter((booking) => {
    if (selectedMonth === 0) return true;
    const month = new Date(booking.booking_date).getMonth() + 1;
    return month === selectedMonth;
  });

  // 📄 Pagination for My Requests list
  const sortedBookings = [...fetchbooking].sort((a, b) => {
    // Sort by booking_id descending (newest first)
    return b.booking_id - a.booking_id;
  });

  const totalPages = Math.ceil(sortedBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBookings.slice(indexOfFirstItem, indexOfLastItem);

  const goToNextPage = (e) => {
    e?.preventDefault();
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = (e) => {
    e?.preventDefault();
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (pageNumber) => (e) => {
    e?.preventDefault();
    setCurrentPage(pageNumber);
  };

  // 🔹 Chart Data (always keep full line)
  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Book Consultation",
        data: monthlyData.map((count, idx) =>
          selectedMonth === 0 ? count : idx + 1 === selectedMonth ? count : 0
        ), // ✅ Keeps line across 12 months
        borderColor: "#16a34a",
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        borderWidth: 3,
        pointBackgroundColor: "#16a34a",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#15803d",
        pointHoverBorderColor: "#ffffff",
        pointHoverBorderWidth: 3,
        tension: 0.4,
        fill: true,
      },
    ],
  };

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
        }        `}
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

            {/* ✅ Chart and My Requests Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
              <motion.div
                variants={chartVariants}
                className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100"
              >
                {/* Enhanced Header */}
                <div className="flex justify-between items-start mb-5 pb-4 border-b-2 border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-green-600 to-green-800 p-2.5 rounded-lg shadow-md">
                      <BsBarChartFill className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        Book Consultation
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">Monthly Statistics</p>
                    </div>
                  </div>
                  <div className="relative">
                    <motion.select
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="appearance-none border-2 border-green-300 bg-white rounded-lg px-4 py-2 pr-8 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm cursor-pointer transition-all"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    >
                      <option value={0}>All Months</option>
                      {monthLabels.map((m, idx) => (
                        <option key={idx} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </motion.select>
                    <FaFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none text-xs" />
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FaChartLine className="text-green-600 text-xs" />
                      <p className="text-xs font-semibold text-gray-600">Total</p>
                    </div>
                    <p className="text-lg font-bold text-green-800">{totalConsultations}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MdTrendingUp className="text-blue-600 text-xs" />
                      <p className="text-xs font-semibold text-gray-600">Average</p>
                    </div>
                    <p className="text-lg font-bold text-blue-800">{averagePerMonth}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FaCalendarAlt className="text-purple-600 text-xs" />
                      <p className="text-xs font-semibold text-gray-600">Peak</p>
                    </div>
                    <p className="text-sm font-bold text-purple-800">
                      {peakMonthName} ({peakMonthValue})
                    </p>
                  </motion.div>
                </div>

                {/* Enhanced Chart */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-inner">
                  <div className="h-[280px]">
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: "top",
                            labels: {
                              usePointStyle: true,
                              padding: 15,
                              font: {
                                size: 12,
                                weight: "bold",
                              },
                              color: "#374151",
                            },
                          },
                          tooltip: {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                            padding: 12,
                            titleFont: {
                              size: 14,
                              weight: "bold",
                            },
                            bodyFont: {
                              size: 13,
                            },
                            borderColor: "#16a34a",
                            borderWidth: 2,
                            cornerRadius: 8,
                            displayColors: true,
                            callbacks: {
                              label: function(context) {
                                return `Consultations: ${context.parsed.y}`;
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                              font: {
                                size: 11,
                              },
                              color: "#6b7280",
                            },
                            grid: {
                              color: "rgba(229, 231, 235, 0.8)",
                              lineWidth: 1,
                            },
                            border: {
                              color: "#e5e7eb",
                            },
                          },
                          x: {
                            ticks: {
                              font: {
                                size: 11,
                                weight: "600",
                              },
                              color: "#374151",
                            },
                            grid: {
                              display: false,
                            },
                            border: {
                              color: "#e5e7eb",
                            },
                          },
                        },
                        interaction: {
                          intersect: false,
                          mode: "index",
                        },
                        animation: {
                          duration: 1000,
                          easing: "easeInOutQuart",
                        },
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* My Requests List */}
              <motion.div
                variants={chartVariants}
                className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border border-gray-100"
              >
                <div className="flex justify-between items-center mb-5 pb-3 border-b-2 border-green-800">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-800 p-2 rounded-lg">
                      <FaClipboardList className="text-white text-lg" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">
                      My Requests
                    </h2>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    {sortedBookings.length} Total
                  </div>
                </div>
                
                <div className="flex flex-col min-h-[300px] max-h-[450px]">
                  {currentItems.length > 0 ? (
                    <>
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#86efac #f3f4f6', minHeight: '200px', maxHeight: '450px' }}>
                        {currentItems.map((booking, index) => {
                          const statusConfig = {
                            "Approve": {
                              bg: "bg-gradient-to-r from-green-50 to-emerald-50",
                              border: "border-l-4 border-green-600",
                              badge: "bg-green-600 text-white",
                              icon: <HiCheckCircle className="text-green-600 text-lg" />,
                            },
                            "Pending": {
                              bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
                              border: "border-l-4 border-yellow-500",
                              badge: "bg-yellow-500 text-white",
                              icon: <HiClock className="text-yellow-600 text-lg" />,
                            },
                            "Disapprove": {
                              bg: "bg-gradient-to-r from-red-50 to-rose-50",
                              border: "border-l-4 border-red-500",
                              badge: "bg-red-500 text-white",
                              icon: <HiXCircle className="text-red-600 text-lg" />,
                            },
                          };
                          const config = statusConfig[booking.approval_name] || statusConfig["Pending"];

                          return (
                            <motion.div
                              key={`${booking.booking_id}-${indexOfFirstItem + index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`${config.bg} ${config.border} rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-t border-r border-b border-gray-200`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="mt-1">
                                    {config.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-bold text-gray-800">
                                        Booking #{booking.booking_id}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <FaUser className="text-green-700" />
                                      <p className="font-medium">{booking.faculty_name || "N/A"}</p>
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`${config.badge} inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-full shadow-sm whitespace-nowrap`}
                                >
                                  {booking.approval_name}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 gap-2 mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="bg-white p-1.5 rounded-md shadow-sm">
                                    <FaCalendarAlt className="text-green-700" />
                                  </div>
                                  <div>
                                    <span className="text-gray-500 font-medium">Date:</span>{" "}
                                    <span className="text-gray-700 font-semibold">
                                      {booking.booking_date || "N/A"}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="bg-white p-1.5 rounded-md shadow-sm">
                                    <FaClock className="text-green-700" />
                                  </div>
                                  <div>
                                    <span className="text-gray-500 font-medium">Time:</span>{" "}
                                    <span className="text-gray-700 font-semibold">
                                      {booking.time_range || "N/A"}
                                    </span>
                                  </div>
                                </div>
                                
                                {booking.purpose && (
                                  <div className="flex items-start gap-2 text-xs">
                                    <div className="bg-white p-1.5 rounded-md shadow-sm mt-0.5">
                                      <FaFileAlt className="text-green-700" />
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-gray-500 font-medium">Purpose:</span>{" "}
                                      <span className="text-gray-700 font-semibold truncate block" title={booking.purpose}>
                                        {booking.purpose}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="mt-4 pt-4 border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <span className="text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                            Showing <span className="font-bold text-green-800">{indexOfFirstItem + 1}</span> to{" "}
                            <span className="font-bold text-green-800">{Math.min(indexOfLastItem, sortedBookings.length)}</span> of{" "}
                            <span className="font-bold text-green-800">{sortedBookings.length}</span> entries
                          </span>
                          <div className="flex">
                          <Pagination>
                          <PaginationContent className="flex">
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={goToPreviousPage}
                                  disabled={currentPage === 1}
                                  className={`cursor-pointer transition-all ${
                                    currentPage === 1
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-green-100"
                                  }`}
                                />
                              </PaginationItem>
                              {Array.from({ length: totalPages }, (_, index) => (
                                <PaginationItem key={index}>
                                  <PaginationLink
                                    onClick={goToPage(index + 1)}
                                    className={`cursor-pointer transition-all ${
                                      currentPage === index + 1
                                        ? "bg-green-800 text-white shadow-md hover:bg-green-900"
                                        : "hover:bg-green-50"
                                    }`}
                                  >
                                    {index + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={goToNextPage}
                                  disabled={currentPage === totalPages}
                                  className={`cursor-pointer transition-all ${
                                    currentPage === totalPages
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-green-100"
                                  }`}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-8">
                      <div className="bg-gray-100 p-4 rounded-full mb-3">
                        <FaClipboardList className="text-3xl" />
                      </div>
                      <p className="text-sm font-medium">No bookings found</p>
                      <p className="text-xs mt-1">Your consultation requests will appear here</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}

        {currentView === "bookconsultation" && <BookConsultationManagement />}
        {currentView === "consultation" && <StudentConsultationManagement />}
        {currentView === "Settings" && <SettingsManagement />}
      </motion.div>
    </StudentLayout>
  );
};

export default StudentDashboard;

