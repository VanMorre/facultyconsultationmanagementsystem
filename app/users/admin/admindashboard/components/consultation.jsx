import {
  TbZoom,
  TbClipboardList,
  TbPlus,
  TbFilter,
  TbDotsVertical,
} from "react-icons/tb";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConsultationManagement = () => {
  const [fetchbooking, setfetchbooking] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [scheduledStudentIds, setScheduledStudentIds] = useState(new Set()); // Track already scheduled student booking_ids
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const DEFAULT_APPROVAL_STATUS_ID = 5;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ConsultationFetch, setFetchConsultation] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [openFeedbackDialog, setopenFeedbackDialog] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [discussion, setDiscussion] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "", "Complete", "Schedule", "Cancel"
  const [isLoading, setIsLoading] = useState(false);
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
  }, []);

  // 🔑 Second effect: runs whenever loggedInUserId changes
  useEffect(() => {
    if (loggedInUserId) {
      // Always fetch these once
      fetchConsultation(loggedInUserId);

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
  const filteredConsultations = (ConsultationFetch || [])
    .filter((finv) => {
      const matchesSearch =
        String(finv.schedulebookings_id)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.student_name)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.approval_name)
          .toLowerCase()
          .includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "" || finv.approval_name === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => a.schedulebookings_id - b.schedulebookings_id);

  const totalPages = Math.ceil(filteredConsultations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredConsultations.slice(
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
    }, 1000); // 1 second effect
  };

  // Filter out already scheduled students and get unique students
  const uniqueStudents = [
    ...new Map(
      fetchbooking
        .filter((s) => !scheduledStudentIds.has(s.booking_id)) // Exclude already scheduled
        .map((s) => [s.student_name, s])
    ).values(),
  ];

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


  const handleSubmitConsultation = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }

    try {
      const payload = {
        students: selectedStudents.map((id) => Number(id)), // ✅ these should be booking_id values
        approval_id: DEFAULT_APPROVAL_STATUS_ID,
        user_id: Number(loggedInUserId),
      };

      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-consultation/add-consultation.php`,
        payload
      );

      if (response.data.success) {
        toast.success("Consultation scheduled successfully!");
        setSelectedStudents([]);
        setIsDialogOpen(false);
        
        // Refresh both consultations and student bookings to update the list
        await fetchConsultation(loggedInUserId);
        await fetchbookingstudentWithNotify(loggedInUserId, false);
      } else {
        toast.error(
          response.data.message || "Failed to schedule consultation."
        );
      }
    } catch (error) {
      console.error("Error scheduling consultation:", error);
      toast.error("An error occurred while scheduling consultation.");
    }
  };

  const fetchConsultation = async (UserID) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-consultation/fetch-consultation.php`,
        {
          params: { user_id: UserID }, // ✅ send user_id
        }
      );

      if (response.data.success) {
        const consultations = response.data.data;
        setFetchConsultation(consultations);
        
        // Extract booking_ids from scheduled consultations
        const scheduledIds = new Set(
          consultations.map((c) => c.booking_id).filter((id) => id != null)
        );
        setScheduledStudentIds(scheduledIds);
      } else {
        setFetchConsultation([]);
        setScheduledStudentIds(new Set());
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
    }
  };

  const fetchConsultationDetails = async (schedulebookings_id) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-consultation/view-consultation.php`,
        {
          params: { schedulebookings_id },
        }
      );

      if (response.data.success) {
        const consultation = response.data.data;
        setSelectedConsultation(consultation);
        setDiscussion(consultation.discussion || "");
        setRecommendation(consultation.recommendation || "");
      }
    } catch (error) {
      console.error("Error fetching consultation details:", error);
      toast.error("Failed to load consultation details.");
    }
  };

  const handleSubmitConsultationDetails = async () => {
    if (selectedConsultation?.approval_name === "Completed") {
      toast.warning("This consultation is already completed!");
      return;
    }

    if (!selectedConsultationId || !discussion.trim() || !recommendation.trim()) {
      toast.error("Please fill in both Key Discussion Points and Recommendations.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-consultation/complete-consultation.php`,
        {
          schedulebookings_id: selectedConsultationId,
          discussion: discussion.trim(),
          recommendation: recommendation.trim(),
          user_id: loggedInUserId,
        }
      );

      if (response.data.success) {
        toast.success("Consultation completed successfully!");
        setOpenViewDialog(false);
        setDiscussion("");
        setRecommendation("");
        setSelectedConsultation(null);
        setSelectedConsultationId(null);
        
        // Refresh consultations list
        await fetchConsultation(loggedInUserId);
      } else {
        toast.error(response.data.message || "Failed to complete consultation.");
      }
    } catch (error) {
      console.error("Error completing consultation:", error);
      toast.error("Server error while completing consultation.");
    }
  };

  // ✅ Mark as Scheduled
  const handleSchedule = async (schedulebookings_id, currentStatus) => {
    if (currentStatus === "Scheduled") {
      toast.warning("This consultation is already Scheduled!");
      return;
    }
    if (currentStatus === "Completed") {
      toast.warning("This consultation is already Completed!");
      return;
    }

    try {
      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-consultation/approval-consultation.php`,
        {
          schedulebookings_id,
          action: "Scheduled",
          user_id: loggedInUserId, // ✅ Always send logged-in user
        }
      );

      if (response.data.success) {
        toast.success("Consultation marked as Scheduled");

        // ✅ Update only the affected row in state
        setFetchConsultation((prev) =>
          prev.map((consult) =>
            consult.schedulebookings_id === schedulebookings_id
              ? { ...consult, approval_name: "Scheduled" }
              : consult
          )
        );
      } else {
        toast.error(response.data.message || "Failed to mark as Scheduled.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating to Scheduled.");
    }
  };

  // ✅ Mark as Cancelled
  const handleCancelled = async (schedulebookings_id, currentStatus) => {
    if (currentStatus === "Cancelled") {
      toast.warning("This consultation is already Cancelled!");
      return;
    }
    if (currentStatus === "Completed") {
      toast.warning("This consultation is already Completed!");
      return;
    }

    try {
      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-consultation/approval-consultation.php`,
        {
          schedulebookings_id,
          action: "Cancelled",
          user_id: loggedInUserId, // ✅ Always send logged-in user
        }
      );

      if (response.data.success) {
        toast.success("Consultation marked as Cancelled");

        // ✅ Update only the affected row in state
        setFetchConsultation((prev) =>
          prev.map((consult) =>
            consult.schedulebookings_id === schedulebookings_id
              ? { ...consult, approval_name: "Cancelled" }
              : consult
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

const handleFeedback = async (schedulebookings_id) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-consultation/feedback-consultation.php`,
      {
        schedulebookings_id,
        user_id: loggedInUserId,
        feedback_text: feedback, // ✅ match backend
      }
    );

    if (response.data.success) {
      toast.success("Feedback submitted successfully!");

      setFetchConsultation((prev) =>
        prev.map((consult) =>
          consult.schedulebookings_id === schedulebookings_id
            ? { ...consult, feedback: feedback }
            : consult
        )
      );

      setFeedback(""); 
      setopenFeedbackDialog(false);
      setSelectedConsultationId(null); 
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
          <h1 className="text-l font-bold mb-4 text-green-800  mt-3 flex items-center gap-2">
            <TbClipboardList className="text-xl w-6 h-6 !w-6 !h-6" />
            Consultations
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            This table provides a detailed record of student consultations,
            including the consultation number, student name, date, time, status,
            and available actions for managing each entry.
          </p>

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

            <Dialog 
              open={isDialogOpen} 
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (open && loggedInUserId) {
                  // Refresh consultations when dialog opens to get latest scheduled students
                  fetchConsultation(loggedInUserId);
                }
                if (!open) {
                  setSelectedStudents([]);
                }
              }}
            >
              <DialogTrigger asChild>
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white"
                >
                  <TbPlus className="h-5 w-5 transition-colors duration-300" />
                  New Consultation
                </button>
              </DialogTrigger>
              <DialogContent
                className="w-full h-auto max-h-[85vh] flex flex-col"
                style={{ maxWidth: "700px", height: "650px" }}
              >
                <DialogHeader className="pb-4 flex-shrink-0">
                  <DialogTitle className="text-green-800 text-xl font-semibold">
                    Schedule Consultation
                  </DialogTitle>
                  <p className="text-sm text-gray-500">
                    Select students for consultation
                  </p>
                </DialogHeader>

                {/* Student list */}
                <div className="flex flex-col flex-1 min-h-0">
                  <Label className="mb-3 block text-green-800 font-medium flex-shrink-0">
                    Student list:
                  </Label>

                  {/* Select All checkbox */}
                  <div className="mb-3 pb-2 border-b border-gray-300 flex-shrink-0">
                    <label className="flex items-center gap-3 px-3 py-2 hover:bg-green-50 cursor-pointer rounded">
                      <input
                        type="checkbox"
                        checked={
                          uniqueStudents.length > 0 &&
                          selectedStudents.length === uniqueStudents.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents(
                              uniqueStudents.map((s) => s.booking_id)
                            );
                          } else {
                            setSelectedStudents([]);
                          }
                        }}
                        className="h-4 w-4 text-green-800 border-green-800 rounded"
                      />
                      <span className="text-sm font-semibold text-green-800">
                        Select All
                      </span>
                    </label>
                  </div>

                  {/* Student list with scroll */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden border border-green-800 shadow-xl bg-green-50 rounded-md pr-1 custom-scrollbar" style={{ maxHeight: "450px" }}>
                    <div className="grid grid-cols-1 gap-2 p-3">
                      {uniqueStudents.length > 0 ? (
                        uniqueStudents.map((student) => (
                          <label
                            key={student.booking_id}
                            className="flex items-start gap-3 px-4 py-3 border border-gray-200 rounded-md hover:bg-green-100 cursor-pointer w-full bg-white"
                          >
                            <input
                              type="checkbox"
                              value={student.booking_id}
                              checked={selectedStudents.includes(
                                student.booking_id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents((prev) => [
                                    ...prev,
                                    student.booking_id,
                                  ]);
                                } else {
                                  setSelectedStudents((prev) =>
                                    prev.filter(
                                      (id) => id !== student.booking_id
                                    )
                                  );
                                }
                              }}
                              className="h-4 w-4 text-green-800 border-green-800 rounded mt-1 flex-shrink-0"
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900">
                                {student.student_name}
                              </span>
                              {(student.course_name || student.year_name) && (
                                <span className="text-xs text-gray-600 mt-1">
                                  {student.course_name || ""}
                                  {student.course_name && student.year_name
                                    ? " • "
                                    : ""}
                                  {student.year_name || ""}
                                </span>
                              )}
                              {student.booking_date && (
                                <span className="text-xs text-gray-500 mt-1">
                                  Request Date: {student.booking_date}
                                </span>
                              )}
                              {student.time_range && (
                                <span className="text-xs text-gray-500">
                                  Time: {student.time_range}
                                </span>
                              )}
                            </div>
                          </label>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">
                          No students found.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sticky Footer Save */}
                <div className="pt-4 border-t flex justify-end gap-3 bg-white mt-4 flex-shrink-0">
                  <Button
                    variant="outline"
                    className="border-green-800 text-green-800"
                    onClick={() => {
                      setSelectedStudents([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-800 hover:bg-green-700 text-white"
                    onClick={handleSubmitConsultation}
                  >
                    Save Consultation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Filter Date Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
                  <TbFilter className="h-5 w-5 transition-colors duration-300" />
                  Filter Consultation Status
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => onFilter("")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Completed")}>
                  Completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Scheduled")}>
                  Scheduled
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Cancelled")}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <table className="w-full border-collapse bg-white shadow-lg  overflow-hidden mx-auto">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Consult no.
                </th>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Student
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Status
                </th>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">
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
                currentItems.map((consult, index) => (
                  <tr key={index}>
                    <td className="border px-6 py-2 text-center">
                      {consult.schedulebookings_id}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {consult.student_name}
                    </td>

                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${
                          consult.approval_name === "Completed"
                            ? "bg-green-900 text-white"
                            : consult.approval_name === "Pending"
                            ? "bg-gray-200 text-black"
                            : consult.approval_name === "Scheduled"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-black"
                        }`}
                      >
                        {consult.approval_name}
                      </span>
                    </td>

                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none hover:bg-gray-100 transition">
                              <TbDotsVertical className="w-5 h-5 text-gray-700" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={async () => {
                                setSelectedConsultationId(consult.schedulebookings_id);
                                await fetchConsultationDetails(consult.schedulebookings_id);
                                setOpenViewDialog(true);
                              }}
                              className="cursor-pointer text-blue-700 hover:bg-blue-50"
                            >
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleSchedule(
                                  consult.schedulebookings_id,
                                  consult.approval_name
                                )
                              }
                              className="cursor-pointer text-blue-700 hover:bg-blue-50"
                            >
                              Scheduled
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleCancelled(
                                  consult.schedulebookings_id,
                                  consult.approval_name
                                )
                              }
                              className="cursor-pointer text-red-700 hover:bg-red-50"
                            >
                              Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedConsultationId(consult.schedulebookings_id);
                                setopenFeedbackDialog(true);
                              }}
                              className="cursor-pointer text-yellow-700 hover:bg-yellow-50"
                            >
                              Send feedback
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>




                    
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No consultation found.
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
                setSelectedConsultationId(null);
                setFeedback("");
              }
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Feedback</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Please share your comments or suggestions about this
                  consultation. Your feedback will help improve our service.
                </p>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <Textarea
                  placeholder="Write your feedback here..."
                  className="w-full"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                />

                <Button
                  onClick={() => {
                    if (selectedConsultationId) {
                      handleFeedback(selectedConsultationId);
                    }
                  }}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  Submit
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Consultation Dialog */}
          <Dialog
            open={openViewDialog}
            onOpenChange={(open) => {
              setOpenViewDialog(open);
              if (!open) {
                setSelectedConsultation(null);
                setDiscussion("");
                setRecommendation("");
                setSelectedConsultationId(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-green-800 text-xl font-semibold">
                  Consultation Details
                </DialogTitle>
              </DialogHeader>

              {selectedConsultation && (
                <div className="flex flex-col gap-4 mt-4">
                  {/* Student Information */}
                  <div className="border-b pb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Student Information</h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {selectedConsultation.student_name}
                      </p>
                      {(selectedConsultation.course_name || selectedConsultation.year_name) && (
                        <p className="text-sm">
                          <span className="font-medium">Course • Year Level:</span>{" "}
                          {selectedConsultation.course_name || ""}
                          {selectedConsultation.course_name && selectedConsultation.year_name ? " • " : ""}
                          {selectedConsultation.year_name || ""}
                        </p>
                      )}
                      {selectedConsultation.subject_name && (
                        <p className="text-sm">
                          <span className="font-medium">Subject:</span> {selectedConsultation.subject_name}
                        </p>
                      )}
                      {selectedConsultation.purpose && (
                        <p className="text-sm">
                          <span className="font-medium">Purpose:</span> {selectedConsultation.purpose}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Key Discussion Points */}
                  <div>
                    <Label htmlFor="discussion" className="mb-2 block text-green-800 font-medium">
                      Key Discussion Points {selectedConsultation.approval_name !== "Completed" && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                      id="discussion"
                      placeholder={selectedConsultation.approval_name === "Completed" ? "No discussion points entered." : "Enter key discussion points..."}
                      className={`w-full min-h-[120px] ${selectedConsultation.approval_name === "Completed" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      value={discussion}
                      onChange={(e) => setDiscussion(e.target.value)}
                      readOnly={selectedConsultation.approval_name === "Completed"}
                      required={selectedConsultation.approval_name !== "Completed"}
                    />
                  </div>

                  {/* Recommendations */}
                  <div>
                    <Label htmlFor="recommendation" className="mb-2 block text-green-800 font-medium">
                      Recommendations {selectedConsultation.approval_name !== "Completed" && <span className="text-red-500">*</span>}
                    </Label>
                    <Textarea
                      id="recommendation"
                      placeholder={selectedConsultation.approval_name === "Completed" ? "No recommendations entered." : "Enter recommendations..."}
                      className={`w-full min-h-[120px] ${selectedConsultation.approval_name === "Completed" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      readOnly={selectedConsultation.approval_name === "Completed"}
                      required={selectedConsultation.approval_name !== "Completed"}
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
                        setSelectedConsultation(null);
                        setSelectedConsultationId(null);
                      }}
                    >
                      {selectedConsultation.approval_name === "Completed" ? "Close" : "Cancel"}
                    </Button>
                    <Button
                      onClick={handleSubmitConsultationDetails}
                      className="bg-green-800 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={
                        selectedConsultation.approval_name === "Completed" ||
                        !discussion.trim() ||
                        !recommendation.trim()
                      }
                    >
                      {selectedConsultation.approval_name === "Completed"
                        ? "Already Completed"
                        : "Complete Consultation"}
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
              {Math.min(indexOfLastItem, ConsultationFetch.length)} of{" "}
              {ConsultationFetch.length} entries
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

export default ConsultationManagement;
