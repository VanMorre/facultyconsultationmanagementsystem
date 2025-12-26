import { TbZoom, TbFilter } from "react-icons/tb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FiEye, FiXCircle, FiMessageSquare } from "react-icons/fi";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const StudentrequestManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [fetchbooking, setfetchbooking] = useState([]);
  const [statusFilter, setStatusFilter] = useState(""); // "Approve", "Disapprove", or ""
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [openFeedbackDialog, setopenFeedbackDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [discussion, setDiscussion] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchText, setSearchText] = useState("");
  const filteredbookings = (fetchbooking || [])
    .filter((finv) => {
      const matchesSearch =
        String(finv.booking_id)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.faculty_name)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.booking_date)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.time_range)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.purpose).toLowerCase().includes(searchText.toLowerCase()) ||
        String(finv.approval_name)
          .toLowerCase()
          .includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "" || finv.approval_name === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.booking_id - b.booking_id);

  const totalPages = Math.ceil(filteredbookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredbookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

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
    setCurrentPage(pageNumber);
  };

  const onFilter = (status) => {
    setIsLoading(true);
    setTimeout(() => {
      setStatusFilter(status);
      setIsLoading(false);
      setCurrentPage(1); // reset to first page when filtering
    }, 1000);
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

        // Extract unique booking IDs
        const currentIds = newBookings.map((item) => item.booking_id);

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-studentrequest/view-studentrequest.php`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-studentrequest/complete-studentrequest.php`,
        {
          booking_id: selectedBookingId,
          discussion: discussion.trim(),
          recommendation: recommendation.trim(),
          user_id: loggedInUserId,
        }
      );

      if (response.data.success) {
        toast.success("Booking completed successfully!");
        setOpenViewDialog(false);
        setDiscussion("");
        setRecommendation("");
        setSelectedBooking(null);
        setSelectedBookingId(null);

        // Refresh bookings list
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-studentrequest/approve-studentrequest.php`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-studentrequest/feedback-studentrequest.php`,
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

        <div className="bg-white p-6  shadow-md">
          <h1 className="text-l font-bold  text-green-800 pb-5 mt-3 flex items-center gap-2">
            Student Request
          </h1>

          <p className="text-sm text-gray-500">
            Below is the list of student consultation requests with their
            details, including purpose, schedule, and additional notes.
          </p>

          {/* Search Input with Magnifier Icon and Buttons */}
          <div className="flex items-center gap-4 pt-6 mb-4">
            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-green-800 rounded-lg pl-4 pr-10 py-2 shadow-sm text-black placeholder-black"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1); // Reset to page 1 when searching
                }}
              />
              <TbZoom className="absolute inset-y-0 right-3 text-black h-5 w-5 flex items-center justify-center mt-3" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
                  <TbFilter className="h-5 w-5 transition-colors duration-300" />
                  Filter student request status
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => onFilter("")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Approve")}>
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Disapprove")}>
                  Disapprove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <table className="w-full border-collapse bg-white shadow-lg  overflow-hidden mx-auto">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Book no.
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Faculty
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Student
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Date
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Time
                </th>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Subject
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Notes
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Status
                </th>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Approved date
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="22" className="text-center py-6">
                    <div className="flex justify-center items-center gap-2 text-green-700 font-medium">
                      <svg
                        className="animate-spin h-6 w-6 text-green-800"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                      <span>Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((bks, index) => (
                  <tr key={index}>
                    <td className="border px-6 py-2 text-center">
                      {bks.booking_id}
                    </td>

                    <td className="border px-6 py-2 text-center">
                      {bks.faculty_name}
                    </td>

                    <td className="border px-6 py-2 text-center">
                      {bks.student_name}
                    </td>

                    <td className="border px-6 py-2 text-center">
                      {bks.booking_date}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {bks.time_range}
                    </td>

                    <td className="border px-6 py-2 text-center">
                      {bks.subject_name}
                    </td>

                    <td className="border px-6 py-2 text-center">
                      {bks.purpose}
                    </td>
                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${
                          bks.approval_name === "Completed"
                            ? "bg-green-900 text-white"
                            : bks.approval_name === "Cancelled"
                            ? "bg-gray-200 text-black"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        {bks.approval_name}
                      </span>
                    </td>

                    <td className="border px-6 py-2 text-center">
                      {bks.approval_date}
                    </td>

                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <div className="flex items-center justify-center gap-3">
                        {/* View */}
                        <button
                          title="View"
                          onClick={async () => {
                            setSelectedBookingId(bks.booking_id);
                            await fetchBookingDetails(bks.booking_id);
                            setOpenViewDialog(true);
                          }}
                          className="px-1 py-1 border-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>

                        {/* Cancelled */}
                        <button
                          title="Cancelled"
                          onClick={() =>
                            handleCancelled(bks.booking_id, bks.approval_name)
                          }
                          className="px-1 py-1 border-1 bg-red-600 text-white rounded-md hover:bg-red-100 transition"
                        >
                          <FiXCircle className="w-5 h-5" />
                        </button>

                        {/* Send Feedback */}
                        <button
                          title={
                            bks.user_feedback_count > 0
                              ? "Feedback already submitted"
                              : "Send Feedback"
                          }
                          onClick={() => {
                            if (bks.user_feedback_count > 0) {
                              toast.warning("You have already submitted feedback for this booking.");
                              return;
                            }
                            setSelectedBookingId(bks.booking_id);
                            setopenFeedbackDialog(true);
                          }}
                          className="relative px-1 py-1 border-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={bks.user_feedback_count > 0}
                        >
                          <FiMessageSquare className="w-5 h-5" />
                          {bks.user_feedback_count > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold border-2 border-white">
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
                  <td colSpan="24" className="text-center py-4">
                    No student request found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
                              selectedBooking.approval_name === "Approve"
                                ? "bg-green-900 text-white"
                                : selectedBooking.approval_name === "Pending"
                                ? "bg-gray-200 text-black"
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

          <div className="flex items-center justify-between mt-14">
            {/* Entries Text */}
            <span className="text-sm text-green-800 font-semibold pl-4">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, fetchbooking.length)} of{" "}
              {fetchbooking.length} entries
            </span>

            {/* Pagination */}
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
                            ? "bg-green-800 text-white"
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
        </div>
      </>
    </motion.div>
  );
};

export default StudentrequestManagement;
