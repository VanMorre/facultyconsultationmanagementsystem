import { TbZoom, TbHistory, TbEye, TbEdit, TbFilter } from "react-icons/tb";
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
  const bookingStatusRef = useRef({});
  const toastShownBookingRef = useRef(false);

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
    .filter(
      (finv) =>
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
          .includes(searchText.toLowerCase())
    )
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
        `http://localhost/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
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
                  Date
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Time
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
              {currentItems.length > 0 ? (
                currentItems.map((bks, index) => (
                  <tr key={index}>
                    <td className="border px-6 py-2 text-center">
                      {bks.booking_id}
                    </td>

                    <td className="border px-6 py-2 text-center">
                      {bks.faculty_name}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {bks.booking_date}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {bks.time_range}
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
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleEdit(usersaccountdetails.user_id)
                          }
                          className="px-2 py-1 border-2 border-blue-500 text-blue-500 rounded-md focus:outline-none hover:bg-blue-600 hover:text-white transition"
                        >
                          <TbEdit className="w-6 h-6" />
                        </button>

                        <button
                          onClick={() =>
                            handleView(usersaccountdetails.user_id)
                          }
                          className="px-2 py-1 border-2 border-yellow-500 text-yellow-500 rounded-md focus:outline-none hover:bg-yellow-600 hover:text-white transition"
                        >
                          <TbEye className="w-6 h-6" />
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

export default StudentConsultationManagement;
