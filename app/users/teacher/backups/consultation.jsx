import {
  TbZoom,
  TbClipboardList,
  TbFilter,
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
} from "@/components/ui/dialog";
import { FiEye, FiCalendar, FiXCircle, FiMessageSquare } from "react-icons/fi";
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
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConsultationManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [ConsultationFetch, setFetchConsultation] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [openFeedbackDialog, setopenFeedbackDialog] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [discussion, setDiscussion] = useState("");
  const [recommendation, setRecommendation] = useState("");
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
      fetchConsultation(loggedInUserId);
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


  const fetchConsultation = async (UserID) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-consultation/fetch-consultation.php`,
        {
          params: { user_id: UserID }, // ✅ send user_id
        }
      );

      if (response.data.success) {
        const consultations = response.data.data;
        setFetchConsultation(consultations);
      } else {
        setFetchConsultation([]);
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
    }
  };

  const fetchConsultationDetails = async (schedulebookings_id) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-consultation/view-consultation.php`,
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

    if (
      !selectedConsultationId ||
      !discussion.trim() ||
      !recommendation.trim()
    ) {
      toast.error(
        "Please fill in both Key Discussion Points and Recommendations."
      );
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-consultation/complete-consultation.php`,
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
        toast.error(
          response.data.message || "Failed to complete consultation."
        );
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
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-consultation/approval-consultation.php`,
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
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-consultation/approval-consultation.php`,
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-consultation/feedback-consultation.php`,
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
            including the consultation number, student name, status, and
            available actions for managing each entry.
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

                    <td className="border px-6 py-3  text-center text-sm font-semibold">
                    <div className="flex items-center justify-center gap-3">
                        {/* View */}
                        <button
                          title="View"
                          onClick={async () => {
                            setSelectedConsultationId(
                              consult.schedulebookings_id
                            );
                            await fetchConsultationDetails(
                              consult.schedulebookings_id
                            );
                            setOpenViewDialog(true);
                          }}
                       className="px-1 py-1 border-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>

                        {/* Scheduled */}
                        {/* <button
                          title="Scheduled"
                          onClick={() =>
                            handleSchedule(
                              consult.schedulebookings_id,
                              consult.approval_name
                            )
                          }
                          className="p-2 rounded-md text-green-600 hover:bg-green-100 transition"
                        >
                          <FiCalendar className="w-5 h-5" />
                        </button> */}

                        {/* Cancelled */}
                        <button
                          title="Cancelled"
                          onClick={() =>
                            handleCancelled(
                              consult.schedulebookings_id,
                              consult.approval_name
                            )
                          }
                      className="px-1 py-1 border-1 bg-red-600 text-white rounded-md hover:bg-red-100 transition"
                        >
                          <FiXCircle className="w-5 h-5" />
                        </button>

                        {/* Send Feedback */}
                        <button
                          title="Send Feedback"
                          onClick={() => {
                            setSelectedConsultationId(
                              consult.schedulebookings_id
                            );
                            setopenFeedbackDialog(true);
                          }}
                          className="px-1 py-1 border-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-100 transition"
                        >
                          <FiMessageSquare className="w-5 h-5" />
                        </button>
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
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Student Information
                    </h3>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span>{" "}
                        {selectedConsultation.student_name}
                      </p>
                      {(selectedConsultation.course_name ||
                        selectedConsultation.year_name) && (
                        <p className="text-sm">
                          <span className="font-medium">
                            Course • Year Level:
                          </span>{" "}
                          {selectedConsultation.course_name || ""}
                          {selectedConsultation.course_name &&
                          selectedConsultation.year_name
                            ? " • "
                            : ""}
                          {selectedConsultation.year_name || ""}
                        </p>
                      )}
                      {selectedConsultation.subject_name && (
                        <p className="text-sm">
                          <span className="font-medium">Subject:</span>{" "}
                          {selectedConsultation.subject_name}
                        </p>
                      )}
                      {selectedConsultation.purpose && (
                        <p className="text-sm">
                          <span className="font-medium">Purpose:</span>{" "}
                          {selectedConsultation.purpose}
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
                      {selectedConsultation.approval_name !== "Completed" && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Textarea
                      id="discussion"
                      placeholder={
                        selectedConsultation.approval_name === "Completed"
                          ? "No discussion points entered."
                          : "Enter key discussion points..."
                      }
                      className={`w-full min-h-[120px] ${
                        selectedConsultation.approval_name === "Completed"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      value={discussion}
                      onChange={(e) => setDiscussion(e.target.value)}
                      readOnly={
                        selectedConsultation.approval_name === "Completed"
                      }
                      required={
                        selectedConsultation.approval_name !== "Completed"
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
                      {selectedConsultation.approval_name !== "Completed" && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Textarea
                      id="recommendation"
                      placeholder={
                        selectedConsultation.approval_name === "Completed"
                          ? "No recommendations entered."
                          : "Enter recommendations..."
                      }
                      className={`w-full min-h-[120px] ${
                        selectedConsultation.approval_name === "Completed"
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }`}
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      readOnly={
                        selectedConsultation.approval_name === "Completed"
                      }
                      required={
                        selectedConsultation.approval_name !== "Completed"
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
                        setSelectedConsultation(null);
                        setSelectedConsultationId(null);
                      }}
                    >
                      {selectedConsultation.approval_name === "Completed"
                        ? "Close"
                        : "Cancel"}
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
