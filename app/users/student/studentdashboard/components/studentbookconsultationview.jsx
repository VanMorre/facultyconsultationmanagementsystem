import { TbZoom, TbHistory,  TbFilter } from "react-icons/tb";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { HiXCircle } from "react-icons/hi";
import { MdEmail } from "react-icons/md";

import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
const StudentConsultationManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [fetchbooking, setfetchbooking] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState([]);
  const bookingStatusRef = useRef({});
  const [statusFilter, setStatusFilter] = useState(""); // "Approve", "Disapprove", or ""
  const [isLoading, setIsLoading] = useState(false);

  const onFilter = (status) => {
    setIsLoading(true);
    setTimeout(() => {
      setStatusFilter(status);
      setIsLoading(false);
      setCurrentPage(1); // reset to first page when filtering
    }, 1000);
  };

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
      let isInitial = true;

      fetchbookingstudent(loggedInUserId, isInitial);
      isInitial = false;

      const interval = setInterval(() => {
        fetchbookingstudent(loggedInUserId, false);
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
  const fetchbookingstudent = async (StudentID, isInitial = false) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
        {
          params: { student_id: StudentID }, // ✅ send student_id
        }
      );

      if (response.data.success) {
        const newBookings = response.data.data;

        // ✅ Detect status changes (Approved / Disapproved)
        newBookings.forEach((booking) => {
          const { booking_id, approval_name } = booking;
          const prevStatus = bookingStatusRef.current[booking_id];

          // Only notify if status changed AND not the first fetch
          if (!isInitial && prevStatus && prevStatus !== approval_name) {
            if (approval_name === "Approve") {
              toast.success(
                `Your booking #${booking_id} has been Approved ✅`,
                {
                  toastId: `booking-${booking_id}-approved`,
                  position: "top-right",
                  autoClose: 3000,
                }
              );
            } else if (approval_name === "Disapprove") {
              toast.error(`Your booking #${booking_id} was Disapproved ❌`, {
                toastId: `booking-${booking_id}-disapproved`,
                position: "top-right",
                autoClose: 3000,
              });
            }
          }

          // Update status reference
          bookingStatusRef.current[booking_id] = approval_name;
        });

        // ✅ On first fetch, just set statuses without showing toasts
        if (isInitial) {
          const initialStatus = {};
          newBookings.forEach((booking) => {
            initialStatus[booking.booking_id] = booking.approval_name;
          });
          bookingStatusRef.current = initialStatus;
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

  const handleCancelled = async (booking_id, currentStatus) => {
    if (currentStatus === "Cancelled") {
      toast.warning("This booking is already cancelled!");
      return;
    }

    if (currentStatus === "Approve") {
      toast.warning(
        "This booking has already been approved and cannot be cancelled!"
      );
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/studentapproval/handle-request.php`,
        { booking_id, action: "Cancelled" }
      );

      if (response.data.success) {
        toast.success("Booking cancelled successfully!");
        fetchbookingstudent(loggedInUserId, false, true); // ✅ refresh
      } else {
        toast.error(response.data.message || "Cancellation failed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while cancelling.");
    }
  };

  const handleEmailView = async (booking_id) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/view-bookconsultation.php`,
        { params: { booking_id } }
      );

      const data = response.data;

      // ✅ Only open dialog if feedback_id exists
      if (
        data.success &&
        data.data.length > 0 &&
        data.data.some((fb) => fb.feedback_id)
      ) {
        setFeedbackData(data.data.filter((fb) => fb.feedback_id)); // keep only valid feedback
        setIsDialogOpen(true);
      } else {
        toast.error("No feedback found for this consultation.");
        setFeedbackData([]);
        setIsDialogOpen(false); // prevent showing dialog
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to fetch feedback.");
      setIsDialogOpen(false);
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
          <h1 className="text-l font-bold mb-2 text-green-800 pb-5 mt-3 flex items-center gap-2">
            <TbHistory className="text-xl w-6 h-6 !w-6 !h-6" />
            Consultation History
          </h1>
          <p className="text-sm text-gray-600 mb-2">
            This section provides a record of all your consultation bookings,
            including the status of each request and any notes provided by the
            faculty.
          </p>

          {/* ✅ Note */}
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md mb-5 text-sm">
            <strong>Note!!</strong> If the faculty you booked disapproves your
            consultation, it means that the faculty can only cater up to{" "}
            <strong>10 students</strong>, depending on their availability and
            decisions.
          </div>

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
                <DropdownMenuItem onClick={() => onFilter("Cancelled")}>
                  Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ✅ Horizontal scroll wrapper for table */}
          <div className="overflow-x-auto touch-pan-x scroll-smooth">
            <div className="min-w-[900px]">
              <table className="w-full border-collapse bg-white shadow-lg overflow-hidden mx-auto">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="border px-6 py-3 text-center text-sm font-semibold">
                      Book no.
                    </th>
                    <th className="border px-6 py-3 text-center text-sm font-semibold">
                      Faculty
                    </th>
                    <th className="border px-6 py-3 text-center text-sm font-semibold">
                      Date
                    </th>
                    <th className="border px-6 py-3 text-center text-sm font-semibold">
                      Time
                    </th>
                    <th className="border px-6 py-3 text-center text-sm font-semibold">
                      Notes
                    </th>
                    <th className="border px-6 py-3 text-center text-sm font-semibold">
                      Status
                    </th>
                    <th className="border px-6 py-3 text-center text-sm font-semibold">
                      Approved date
                    </th>
                    <th className="border px-6 py-3 text-center text-sm font-semibold">
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
                        <td
                          className="border px-6 py-2 text-center truncate"
                          title={bks.booking_id}
                        >
                          {bks.booking_id}
                        </td>
                        <td
                          className="border px-6 py-2 text-center truncate"
                          title={bks.faculty_name}
                        >
                          {bks.faculty_name}
                        </td>
                        <td
                          className="border px-6 py-2 text-center truncate"
                          title={bks.booking_date}
                        >
                          {bks.booking_date}
                        </td>
                        <td
                          className="border px-6 py-2 text-center truncate"
                          title={bks.time_range}
                        >
                          {bks.time_range}
                        </td>
                        <td
                          className="border px-6 py-2 text-center truncate"
                          title={bks.purpose}
                        >
                          {bks.purpose}
                        </td>
                        <td className="border px-6 py-3 text-center text-sm font-semibold">
                          <span
                            className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${
                              bks.approval_name === "Approve"
                                ? "bg-green-900 text-white"
                                : bks.approval_name === "Pending"
                                ? "bg-gray-200 text-black"
                                : "bg-gray-200 text-black"
                            }`}
                          >
                            {bks.approval_name}
                          </span>
                        </td>
                        <td
                          className="border px-6 py-2 text-center truncate"
                          title={bks.approval_date}
                        >
                          {bks.approval_date}
                        </td>
                        <td className="border px-6 py-3 text-center text-sm font-semibold">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleCancelled(
                                  bks.booking_id,
                                  bks.approval_name
                                )
                              }
                              className="px-1 py-1 border-1 bg-red-600 text-white rounded-md hover:bg-red-100 transition"
                            >
                              <HiXCircle className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleEmailView(bks.booking_id)}
                              className="relative px-1 py-1 border-1 bg-blue-500 text-white rounded-md focus:outline-none hover:bg-blue-100 transition"
                            >
                              <MdEmail className="w-5 h-5" />

                              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                                {Number(bks.feedback_count) || 0}{" "}
                                {/* always show number, 0 if none */}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="24" className="text-center py-4">
                        No booking history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Consultation Feedback</DialogTitle>
                    <DialogDescription>
                      Below are the feedback details provided by the faculty.
                    </DialogDescription>
                  </DialogHeader>

                  {feedbackData && feedbackData.length > 0 ? (
                    <div className="space-y-2">
                      {feedbackData.map((fb, index) => (
                        <div
                          key={fb.feedback_id ?? `fb-${index}`} // ✅ fallback key
                          className="border p-2 rounded"
                        >
                          <p className="text-sm text-gray-700">
                            <strong>{fb.feedback_by || "Unknown"}:</strong>{" "}
                            {fb.feedback_message || "No message"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {fb.feedback_date || "No date"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No feedback available.
                    </p>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Close
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between mt-14">
            <span className="text-sm text-green-800 font-semibold pl-4">
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

export default StudentConsultationManagement;
