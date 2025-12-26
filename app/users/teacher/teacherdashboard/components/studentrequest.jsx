import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiEye, FiXCircle, FiMessageSquare, FiBell } from "react-icons/fi";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentrequestManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [fetchbooking, setfetchbooking] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [openFeedbackDialog, setopenFeedbackDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [discussion, setDiscussion] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calendar state
  const getToday = () => new Date();
  const today = getToday();
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [dateDialogTab, setDateDialogTab] = useState("all"); // "all", "pending", or "completed"
  const [dialogCurrentPage, setDialogCurrentPage] = useState(1);
  const dialogItemsPerPage = 5;

  const notifiedBookingIdsRef = useRef([]);
  const toastShownBookingRef = useRef(false);

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
      // Load session-stored notified booking IDs
      const storedNotified = sessionStorage.getItem("notified_booking_ids");
      if (storedNotified) {
        notifiedBookingIdsRef.current = JSON.parse(storedNotified);
      }

      let isInitial = true;

      // First fetch (initial load)
      fetchbookingstudentWithNotify(loggedInUserId, isInitial);
      isInitial = false;

      // Poll every 5 seconds
      const interval = setInterval(() => {
        fetchbookingstudentWithNotify(loggedInUserId, false);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [loggedInUserId]);

  // Calendar utility functions
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const buildCalendarDays = (month, year) => {
    const days = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = daysInMonth(month, year);

    // Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, currentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }

    // Fill remaining to 42
    while (days.length < 42) {
      const nextDate = new Date(
        year,
        month,
        days.length - (firstDayOfMonth - 1)
      );
      days.push({ date: nextDate, currentMonth: false });
    }

    return days;
  };

  const [calendarDays, setCalendarDays] = useState(
    buildCalendarDays(currentMonth, currentYear)
  );

  useEffect(() => {
    setCalendarDays(buildCalendarDays(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isToday = (date) => {
    const today = getToday();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getBookingsForDate = (date) => {
    const dateStr = formatDate(date);
    return fetchbooking.filter((booking) => booking.booking_date === dateStr);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    const today = getToday();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const openDateDialogHandler = (date) => {
    setSelectedDate(date);
    setDateDialogTab("all");
    setDialogCurrentPage(1); // Reset to first page when opening dialog
    setOpenDateDialog(true);
  };

  // Get notification count (only non-completed bookings)
  const getNotificationCount = () => {
    const nonCompletedBookings = fetchbooking.filter(
      (booking) => booking.approval_name !== "Completed"
    );
    const newNonCompletedIds = nonCompletedBookings
      .map((b) => b.booking_id)
      .filter((id) => !notifiedBookingIdsRef.current.includes(id));
    return newNonCompletedIds.length;
  };

  const fetchbookingstudentWithNotify = async (
    UserID,
    isInitial = false,
    skipNotify = false
  ) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
        { params: { user_id: UserID } }
      );

      if (response.data.success) {
        const newBookings = response.data.data;

        // Filter out completed bookings from notification tracking
        const nonCompletedBookings = newBookings.filter(
          (item) => item.approval_name !== "Completed"
        );
        const currentIds = nonCompletedBookings.map((item) => item.booking_id);

        // Only run notification logic if not skipped
        if (!skipNotify) {
          const newIds = currentIds.filter(
            (id) => !notifiedBookingIdsRef.current.includes(id)
          );

          if (
            !isInitial &&
            newIds.length > 0 &&
            !toastShownBookingRef.current
          ) {
            toastShownBookingRef.current = true;

            toast.success(`${newIds.length} new consultation booking(s)`, {
              toastId: "new-booking-toast", // prevents stacking
              position: "top-right",
              autoClose: 2000,
            });

            // Save notified IDs
            notifiedBookingIdsRef.current = [
              ...notifiedBookingIdsRef.current,
              ...newIds,
            ];

            sessionStorage.setItem(
              "notified_booking_ids",
              JSON.stringify(notifiedBookingIdsRef.current)
            );

            // Reset lock
            setTimeout(() => {
              toastShownBookingRef.current = false;
            }, 5000);
          }

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

  const fetchBookingDetails = async (booking_id) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-studentrequest/view-studentrequest.php`,
        {
          params: { booking_id },
        }
      );

      if (response.data.success) {
        const booking = response.data.data;
        setSelectedBooking(booking);
        // Initialize discussion and recommendation if they exist
        setDiscussion(booking.discussion || "");
        setRecommendation(booking.recommendation || "");
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
      toast.error("Failed to load booking details.");
    }
  };

  const handleSubmitBookingDetails = async () => {
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    if (selectedBooking?.approval_name === "Completed") {
      toast.warning("This booking is already completed!");
      return;
    }

    if (
      !selectedBookingId ||
      !discussion.trim() ||
      !recommendation.trim()
    ) {
      toast.error(
        "Please fill in both Key Discussion Points and Recommendations."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-studentrequest/complete-studentrequest.php`,
        {
          booking_id: selectedBookingId,
          discussion: discussion.trim(),
          recommendation: recommendation.trim(),
          user_id: loggedInUserId,
        }
      );

      if (response.data.success) {
        toast.success("Booking completed successfully!");
        
        // Remove from notification count if it was being tracked
        if (selectedBookingId && notifiedBookingIdsRef.current.includes(selectedBookingId)) {
          notifiedBookingIdsRef.current = notifiedBookingIdsRef.current.filter(
            (id) => id !== selectedBookingId
          );
          sessionStorage.setItem(
            "notified_booking_ids",
            JSON.stringify(notifiedBookingIdsRef.current)
          );
        }
        
        setOpenViewDialog(false);
        setDiscussion("");
        setRecommendation("");
        setSelectedBooking(null);
        setSelectedBookingId(null);

        // Refresh bookings list (skip notification since we just completed it)
        await fetchbookingstudentWithNotify(loggedInUserId, false, true);
      } else {
        toast.error(
          response.data.message || "Failed to complete booking."
        );
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      toast.error("Server error while completing booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Mark as Cancelled
  const handleCancelled = async (booking_id, currentStatus) => {
    if (currentStatus === "Cancelled") {
      toast.warning("This booking is already Cancelled!");
      return;
    }
    if (currentStatus === "Completed") {
      toast.warning("This booking has already been Completed!");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-studentrequest/approve-studentrequest.php`,
        {
          booking_id,
          action: "Cancelled",
          user_id: loggedInUserId,
        }
      );

      if (response.data.success) {
        toast.success("Booking marked as Cancelled");

        // ✅ Update only the affected row in state
        setfetchbooking((prev) =>
          prev.map((booking) =>
            booking.booking_id === booking_id
              ? { ...booking, approval_name: "Cancelled" }
              : booking
          )
        );
      } else {
        toast.error(response.data.message || "Failed to mark as Cancelled.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating to Cancelled.");
    }
  };

  const handleFeedback = async (booking_id) => {
    // Check if feedback already exists for this booking
    const booking = fetchbooking.find((b) => b.booking_id === booking_id);
    
    if (booking?.user_feedback_count > 0) {
      toast.warning("You have already submitted feedback for this booking. Feedback can only be submitted once.");
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please enter feedback before submitting.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-studentrequest/feedback-studentrequest.php`,
        {
          booking_id,
          user_id: loggedInUserId,
          feedback_text: feedback,
        }
      );

      if (response.data.success) {
        toast.success("Feedback submitted successfully!");

        // Update booking with new feedback count
        setfetchbooking((prev) =>
          prev.map((booking) =>
            booking.booking_id === booking_id
              ? { 
                  ...booking, 
                  user_feedback_count: (booking.user_feedback_count || 0) + 1,
                  feedback_count: (booking.feedback_count || 0) + 1
                }
              : booking
          )
        );

        setFeedback("");
        setopenFeedbackDialog(false);
        setSelectedBookingId(null);
      } else {
        toast.error(response.data.message || "Failed to submit feedback.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while submitting feedback.");
    }
  };




  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <>
        <ToastContainer
          position="top-right"
          autoClose={1000}
          theme="light"
          transition={Bounce}
        />

        <div className="bg-white p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-l font-bold text-green-800 pb-2 mt-3 flex items-center gap-2">
                Student Request
              </h1>
              <p className="text-sm text-gray-500">
                Click on a date to view consultation requests for that day.
              </p>
            </div>
          </div>

          {/* Calendar */}
          <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5 text-green-800" />
                </button>
                <button
                  onClick={handleToday}
                  className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition text-sm"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5 text-green-800" />
                </button>
              </div>
              <h2 className="text-lg font-semibold text-green-800">
                {monthNames[currentMonth]} {currentYear}
              </h2>
            </div>

            {/* Calendar Grid */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Days Header */}
                  <div className="grid grid-cols-7 text-center font-semibold border-b bg-gray-100 text-black shadow text-xs sm:text-sm">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="p-2 border border-gray-200"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 text-xs sm:text-sm">
                    {calendarDays.map(({ date, currentMonth: isCurrentMonth }) => {
                      const bookingsForDate = getBookingsForDate(date);
                      const hasBookings = bookingsForDate.length > 0;
                      const isPastDate = date < today && !isToday(date);
                      // Count pending bookings (not completed)
                      const pendingBookingsCount = bookingsForDate.filter(
                        (b) => b.approval_name !== "Completed"
                      ).length;

                      return (
                        <div
                          key={date.toISOString()}
                          onClick={() => hasBookings && openDateDialogHandler(date)}
                          className={`h-20 sm:h-28 border flex flex-col items-start p-2 relative ${
                            !isCurrentMonth
                              ? "text-gray-400 bg-gray-50"
                              : isPastDate
                              ? "bg-gray-100 text-gray-500"
                              : "bg-white"
                          } ${isToday(date) ? "bg-green-50 font-bold border-green-500" : ""} ${
                            hasBookings ? "hover:bg-green-100 cursor-pointer" : "cursor-not-allowed opacity-60"
                          }`}
                        >
                          <div className="self-end flex items-center gap-1">
                            {date.getDate()}
                            {hasBookings && (
                              <div className="relative">
                                <FiBell className="w-7 h-7 text-blue-500" />
                                {pendingBookingsCount > 0 && (
                                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
                                    {pendingBookingsCount}
                                  </span>
                                )}
                                {pendingBookingsCount === 0 && hasBookings && (
                                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-white text-xs font-bold">
                                    0
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {isPastDate && !isCurrentMonth && (
                            <div className="w-full mt-1 text-sm text-gray-500 text-center font-medium">
                              Past Date
                            </div>
                          )}
                          {isPastDate && isCurrentMonth && (
                            <div className="w-full mt-1 text-sm text-gray-500 text-center font-medium">
                              Past Date
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Dialog with Table */}
          <Dialog open={openDateDialog} onOpenChange={setOpenDateDialog}>
            <DialogContent className="sm:max-w-6xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-green-800 text-xl font-semibold">
                  Bookings for {selectedDate ? formatDate(selectedDate) : ""}
                </DialogTitle>
              </DialogHeader>

              {selectedDate && (
                <div className="mt-4">
                  {/* Tabs */}
                  <div className="flex gap-2 border-b mb-4">
                    <button
                      onClick={() => {
                        setDateDialogTab("all");
                        setDialogCurrentPage(1);
                      }}
                      className={`px-4 py-2 font-semibold ${
                        dateDialogTab === "all"
                          ? "text-green-800 border-b-2 border-green-800"
                          : "text-gray-500"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => {
                        setDateDialogTab("pending");
                        setDialogCurrentPage(1);
                      }}
                      className={`px-4 py-2 font-semibold ${
                        dateDialogTab === "pending"
                          ? "text-green-800 border-b-2 border-green-800"
                          : "text-gray-500"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => {
                        setDateDialogTab("completed");
                        setDialogCurrentPage(1);
                      }}
                      className={`px-4 py-2 font-semibold ${
                        dateDialogTab === "completed"
                          ? "text-green-800 border-b-2 border-green-800"
                          : "text-gray-500"
                      }`}
                    >
                      Completed
                    </button>
                  </div>

                  {/* Table */}
                  {(() => {
                    const allBookings = getBookingsForDate(selectedDate);
                    const filteredBookings =
                      dateDialogTab === "completed"
                        ? allBookings.filter((b) => b.approval_name === "Completed")
                        : dateDialogTab === "pending"
                        ? allBookings.filter((b) => b.approval_name !== "Completed")
                        : allBookings;

                    // Pagination
                    const dialogTotalPages = Math.ceil(filteredBookings.length / dialogItemsPerPage);
                    const dialogIndexOfLastItem = dialogCurrentPage * dialogItemsPerPage;
                    const dialogIndexOfFirstItem = dialogIndexOfLastItem - dialogItemsPerPage;
                    const displayBookings = filteredBookings.slice(dialogIndexOfFirstItem, dialogIndexOfLastItem);

                    return (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse bg-white">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Book no.
                                </th>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Faculty
                                </th>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Student
                                </th>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Time
                                </th>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Subject
                                </th>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Notes
                                </th>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Status
                                </th>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Approved date
                                </th>
                                <th className="border px-4 py-2 text-center text-sm font-semibold">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayBookings.length > 0 ? (
                                displayBookings.map((bks, index) => (
                                <tr key={index}>
                                  <td className="border px-4 py-2 text-center">
                                    {bks.booking_id}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {bks.faculty_name}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {bks.student_name}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {bks.time_range}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {bks.subject_name}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {bks.purpose}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    <span
                                      className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${
                                        bks.approval_name === "Completed"
                                          ? "bg-green-900 text-white"
                                          : bks.approval_name === "Cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-200 text-black"
                                      }`}
                                    >
                                      {bks.approval_name}
                                    </span>
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    {bks.approval_date}
                                  </td>
                                  <td className="border px-4 py-2 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        title="View"
                                        onClick={async () => {
                                          setSelectedBookingId(bks.booking_id);
                                          await fetchBookingDetails(bks.booking_id);
                                          setOpenViewDialog(true);
                                        }}
                                        className="px-2 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                      >
                                        <FiEye className="w-4 h-4" />
                                      </button>
                                      <button
                                        title="Cancelled"
                                        onClick={() =>
                                          handleCancelled(bks.booking_id, bks.approval_name)
                                        }
                                        className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-100 transition"
                                      >
                                        <FiXCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        title={
                                          bks.user_feedback_count > 0
                                            ? "Feedback already submitted"
                                            : "Send Feedback"
                                        }
                                        onClick={() => {
                                          if (bks.user_feedback_count > 0) {
                                            toast.warning(
                                              "You have already submitted feedback for this booking."
                                            );
                                            return;
                                          }
                                          setSelectedBookingId(bks.booking_id);
                                          setopenFeedbackDialog(true);
                                        }}
                                        className="relative px-2 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={bks.user_feedback_count > 0}
                                      >
                                        <FiMessageSquare className="w-4 h-4" />
                                        {bks.user_feedback_count > 0 && (
                                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold border border-white">
                                            {bks.user_feedback_count}
                                          </span>
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="9" className="text-center py-4">
                                  No bookings found for this date.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination */}
                      {filteredBookings.length > dialogItemsPerPage && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <span className="text-sm text-gray-700">
                            Showing {dialogIndexOfFirstItem + 1} to {Math.min(dialogIndexOfLastItem, filteredBookings.length)} of {filteredBookings.length} entries
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setDialogCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={dialogCurrentPage === 1}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            {Array.from({ length: dialogTotalPages }, (_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => setDialogCurrentPage(index + 1)}
                                className={`px-3 py-1 border rounded-md text-sm ${
                                  dialogCurrentPage === index + 1
                                    ? "bg-green-800 text-white border-green-800"
                                    : "border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {index + 1}
                              </button>
                            ))}
                            <button
                              onClick={() => setDialogCurrentPage(prev => Math.min(dialogTotalPages, prev + 1))}
                              disabled={dialogCurrentPage === dialogTotalPages}
                              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                      </>
                    );
                  })()}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Feedback Dialog */}
          <Dialog
            open={openFeedbackDialog}
            onOpenChange={(open) => {
              setopenFeedbackDialog(open);
              if (!open) {
                setSelectedBookingId(null);
                setFeedback("");
              }
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Please share your comments or suggestions about this booking.
                  Your feedback will help improve our service.
                </p>
                {selectedBookingId && (() => {
                  const booking = fetchbooking.find((b) => b.booking_id === selectedBookingId);
                  if (booking?.user_feedback_count > 0) {
                    return (
                      <div className="mt-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
                        <p className="text-sm font-semibold">
                          ⚠️ You have already submitted feedback for this booking. Feedback can only be submitted once.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <Textarea
                  placeholder="Write your feedback here..."
                  className="w-full"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  disabled={
                    selectedBookingId
                      ? fetchbooking.find((b) => b.booking_id === selectedBookingId)
                          ?.user_feedback_count > 0
                      : false
                  }
                />

                <Button
                  onClick={() => {
                    if (selectedBookingId) {
                      handleFeedback(selectedBookingId);
                    }
                  }}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={
                    selectedBookingId
                      ? fetchbooking.find((b) => b.booking_id === selectedBookingId)
                          ?.user_feedback_count > 0 || !feedback.trim()
                      : !feedback.trim()
                  }
                >
                  {selectedBookingId &&
                  fetchbooking.find((b) => b.booking_id === selectedBookingId)
                    ?.user_feedback_count > 0
                    ? "Already Submitted"
                    : "Submit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Booking Dialog */}
          <Dialog
            open={openViewDialog}
            onOpenChange={(open) => {
              setOpenViewDialog(open);
              if (!open) {
                setSelectedBooking(null);
                setDiscussion("");
                setRecommendation("");
                setSelectedBookingId(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-green-800 text-xl font-semibold">
                  Booking Details
                </DialogTitle>
              </DialogHeader>

              {selectedBooking && (
                <div className="flex flex-col gap-4 mt-4">
                  {/* Student Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Student Information
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span>{" "}
                        {selectedBooking.student_name || "N/A"}
                      </p>
                      {(selectedBooking.course_name ||
                        selectedBooking.year_name) && (
                        <p className="text-sm">
                          <span className="font-medium">
                            Course • Year Level:
                          </span>{" "}
                          {selectedBooking.course_name || ""}
                          {selectedBooking.course_name &&
                          selectedBooking.year_name
                            ? " • "
                            : ""}
                          {selectedBooking.year_name || ""}
                        </p>
                      )}
                      {selectedBooking.subject_name && (
                        <p className="text-sm">
                          <span className="font-medium">Subject:</span>{" "}
                          {selectedBooking.subject_name}
                        </p>
                      )}
                      {selectedBooking.purpose && (
                        <p className="text-sm">
                          <span className="font-medium">Purpose:</span>{" "}
                          {selectedBooking.purpose}
                        </p>
                      )}
                      {selectedBooking.booking_date && (
                        <p className="text-sm">
                          <span className="font-medium">Date:</span>{" "}
                          {selectedBooking.booking_date}
                        </p>
                      )}
                      {selectedBooking.time_range && (
                        <p className="text-sm">
                          <span className="font-medium">Time:</span>{" "}
                          {selectedBooking.time_range}
                        </p>
                      )}
                      {selectedBooking.faculty_name && (
                        <p className="text-sm">
                          <span className="font-medium">Faculty:</span>{" "}
                          {selectedBooking.faculty_name}
                        </p>
                      )}
                      {selectedBooking.approval_name && (
                        <p className="text-sm">
                          <span className="font-medium">Status:</span>{" "}
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${
                              selectedBooking.approval_name === "Completed"
                                ? "bg-green-900 text-white"
                                : selectedBooking.approval_name === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : selectedBooking.approval_name === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-200 text-black"
                            }`}
                          >
                            {selectedBooking.approval_name}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Key Discussion Points */}
                  <div>
                    <Label
                      htmlFor="discussion"
                      className="mb-2 block text-green-800 font-medium"
                    >
                      Key Discussion Points{" "}
                      {selectedBooking.approval_name !== "Completed" && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Textarea
                      id="discussion"
                      placeholder={
                        selectedBooking.approval_name === "Completed"
                          ? "No discussion points entered."
                          : "Enter key discussion points..."
                      }
                      className={`w-full min-h-[120px] ${
                        selectedBooking.approval_name === "Completed"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      value={discussion}
                      onChange={(e) => setDiscussion(e.target.value)}
                      readOnly={
                        selectedBooking.approval_name === "Completed"
                      }
                      required={
                        selectedBooking.approval_name !== "Completed"
                      }
                    />
                  </div>

                  {/* Recommendations */}
                  <div>
                    <Label
                      htmlFor="recommendation"
                      className="mb-2 block text-green-800 font-medium"
                    >
                      Recommendations{" "}
                      {selectedBooking.approval_name !== "Completed" && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Textarea
                      id="recommendation"
                      placeholder={
                        selectedBooking.approval_name === "Completed"
                          ? "No recommendations entered."
                          : "Enter recommendations..."
                      }
                      className={`w-full min-h-[120px] ${
                        selectedBooking.approval_name === "Completed"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      readOnly={
                        selectedBooking.approval_name === "Completed"
                      }
                      required={
                        selectedBooking.approval_name !== "Completed"
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="border-green-800 text-green-800"
                      onClick={() => {
                        setOpenViewDialog(false);
                        setDiscussion("");
                        setRecommendation("");
                        setSelectedBooking(null);
                        setSelectedBookingId(null);
                      }}
                    >
                      {selectedBooking.approval_name === "Completed"
                        ? "Close"
                        : "Cancel"}
                    </Button>
                    <Button
                      onClick={handleSubmitBookingDetails}
                      className="bg-green-800 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={
                        selectedBooking.approval_name === "Completed" ||
                        !discussion.trim() ||
                        !recommendation.trim() ||
                        isSubmitting
                      }
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : selectedBooking.approval_name === "Completed"
                        ? "Already Completed"
                        : "Complete Booking"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </>
    </motion.div>
  );
};

export default StudentrequestManagement;
