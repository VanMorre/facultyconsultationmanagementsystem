import { TbZoom, TbFilter, TbDotsVertical } from "react-icons/tb";
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
  const [statusFilter, setStatusFilter] = useState(""); // "Approve", "Disapprove", or ""
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

 const handleApprove = async (booking_id, currentStatus) => {
  if (currentStatus === "Approve") {
    toast.warning("This booking is already approved!");
    return;
  }
  if (currentStatus === "Disapprove") {
    toast.warning("This booking has already been disapproved!");
    return;
  }
  if (currentStatus === "Cancelled") {
    toast.warning("This booking has already been cancelled!");
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-studentrequest/approve-studentrequest.php`,
      {
        booking_id,
        action: "Approve",
        user_id: loggedInUserId, // ✅ FIXED
      }
    );

    if (response.data.success) {
      toast.success("Booking approved successfully!");
      fetchbookingstudentWithNotify(loggedInUserId, false, true);
    } else {
      toast.error(response.data.message || "Approval failed.");
    }
  } catch (error) {
    console.error(error);
    toast.error("Server error while approving.");
  }
};

const handleReject = async (booking_id, currentStatus) => {
  if (currentStatus === "Disapprove") {
    toast.warning("This booking is already disapproved!");
    return;
  }
  if (currentStatus === "Approve") {
    toast.warning("This booking has already been approved!");
    return;
  }
  if (currentStatus === "Cancelled") {
    toast.warning("This booking has already been cancelled!");
    return;
  }

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/facultyside/teacher-studentrequest/approve-studentrequest.php`,
      {
        booking_id,
        action: "Disapprove",
        user_id: loggedInUserId, // ✅ FIXED
      }
    );

    if (response.data.success) {
      toast.success("Booking rejected successfully!");
      fetchbookingstudentWithNotify(loggedInUserId, false, true);
    } else {
      toast.error(response.data.message || "Rejection failed.");
    }
  } catch (error) {
    console.error(error);
    toast.error("Server error while rejecting.");
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

                    <td className="border px-6 py-2 text-center">
                      {bks.approval_date}
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
                              onClick={() =>
                                handleApprove(bks.booking_id, bks.approval_name)
                              }
                              className="cursor-pointer text-green-700 hover:bg-green-50"
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleReject(bks.booking_id, bks.approval_name)
                              }
                              className="cursor-pointer text-red-700 hover:bg-red-50"
                            >
                              Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
