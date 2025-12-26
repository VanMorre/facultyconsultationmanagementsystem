import { TbZoom, TbEye } from "react-icons/tb";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
const FacultyAvailabilitiesManagement = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const notifiedLogIdsRef = useRef([]);
  const toastShownLogsRef = useRef(false);
  const notifiedAvailabilityIdsRef = useRef([]);
  const toastShownAvailabilityRef = useRef(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [studentList, setStudentList] = useState([]);

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

  useEffect(() => {
    if (!loggedInUserId) return;

    // Load session-stored notified IDs (fast synchronous operation)
    const storedAvailability = sessionStorage.getItem("notified_faculty_availability_ids");
    if (storedAvailability) {
      try {
        notifiedAvailabilityIdsRef.current = JSON.parse(storedAvailability);
      } catch (e) {
        notifiedAvailabilityIdsRef.current = [];
      }
    }

    // Defer initial API calls to allow page to render first
    const initialFetchTimeout = setTimeout(() => {
      fetchAvailabilities(loggedInUserId, true);
    }, 100);

    // Poll every 5 seconds (start after initial fetch)
    const interval = setInterval(() => {
      fetchAvailabilities(loggedInUserId, false);
    }, 5000);

    return () => {
      clearTimeout(initialFetchTimeout);
      clearInterval(interval);
    };
  }, [loggedInUserId]);

  const [studentSearchText, setStudentSearchText] = useState("");
  const [studentCurrentPage, setStudentCurrentPage] = useState(1);
  const studentItemsPerPage = 5; // adjust as needed

  // Filter students by search
  const studentFilteredList = (studentList || []).filter((student) => {
    return (
      student.student_name
        .toLowerCase()
        .includes(studentSearchText.toLowerCase()) ||
      student.subject_name
        .toLowerCase()
        .includes(studentSearchText.toLowerCase()) ||
      (student.purpose || "")
        .toLowerCase()
        .includes(studentSearchText.toLowerCase()) ||
      (student.approval_name || "")
        .toLowerCase()
        .includes(studentSearchText.toLowerCase()) ||
      (student.discussion || "")
        .toLowerCase()
        .includes(studentSearchText.toLowerCase()) ||
      (student.recommendation || "")
        .toLowerCase()
        .includes(studentSearchText.toLowerCase()) ||
      new Date(student.booking_date)
        .toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        .toLowerCase()
        .includes(studentSearchText.toLowerCase())
    );
  });

  // Pagination calculation
  const studentTotalPages = Math.ceil(
    studentFilteredList.length / studentItemsPerPage
  );
  const studentLastIndex = studentCurrentPage * studentItemsPerPage;
  const studentFirstIndex = studentLastIndex - studentItemsPerPage;
  const studentPaginatedItems = studentFilteredList.slice(
    studentFirstIndex,
    studentLastIndex
  );

  const handleNextStudentPage = () => {
    if (studentCurrentPage < studentTotalPages)
      setStudentCurrentPage((prev) => prev + 1);
  };

  const handlePreviousStudentPage = () => {
    if (studentCurrentPage > 1) setStudentCurrentPage((prev) => prev - 1);
  };

  const handleGoToStudentPage = (pageNumber) => {
    setStudentCurrentPage(pageNumber);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [searchText, setSearchText] = useState("");
  const filteredData = (availabilities || [])
    .filter(
      (item) =>
        item.username.toLowerCase().includes(searchText.toLowerCase()) ||
        item.availability_name
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        item.availableslot_status
          .toLowerCase()
          .includes(searchText.toLowerCase())
    )
    .sort((a, b) => b.availabilityfaculty_id - a.availabilityfaculty_id);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

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

  const formatTimeTo12Hour = (timeString) => {
    if (!timeString) return "";
    
    // Handle time range format like "13:00:00 - 14:00:00"
    if (timeString.includes(" - ")) {
      const [startTime, endTime] = timeString.split(" - ");
      return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
    }
    
    // Handle single time format
    return convertTo12Hour(timeString);
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return "";
    
    // Extract hours and minutes from "HH:MM:SS" or "HH:MM" format
    const timeParts = time24.split(":");
    if (timeParts.length < 2) return time24;
    
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    if (isNaN(hours)) return time24;
    
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)
    
    return `${hours}:${minutes} ${period}`;
  };

  const fetchAvailabilities = async (userId, isInitial = false) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/Facultyavailabilities/fetchallfacultyavailabilites.php`
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
            "notified_faculty_availability_ids",
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
            "notified_faculty_availability_ids",
            JSON.stringify(notifiedAvailabilityIdsRef.current)
          );
        }

        setAvailabilities(newAvailability);
      } else {
        setAvailabilities([]);
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      setAvailabilities([]);
    }
  };

  const handleView = async (availabilityfaculty_id) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-availability/view-availability.php?id=${availabilityfaculty_id}`
      );

      if (response.data.success) {
        setStudentList(response.data.data);
        setOpenViewDialog(true);
      } else {
        toast.error("No student bookings found for this slot.");
      }
    } catch (error) {
      console.error("Error fetching student bookings:", error);
      toast.error("An error occurred while loading student bookings.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <>

        
        <div className="bg-white p-6  shadow-md">
          <h1 className="text-m font-bold text-green-800  pb-2 mt-3">
            Faculty Availabilites / Student Consulted
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            This section displays a record of all faculty activities with
            student engagement,This means to track the records of all the
            faculty and the no. of students cater during their consultation
          </p>

          <div className="flex items-center justify-between pt-6 mb-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-black rounded-lg pl-4 pr-10 py-2 shadow-sm text-black placeholder-black"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1); // Important: Reset to page 1 when searching
                }}
              />
              <TbZoom className="absolute inset-y-0 right-3 text-black h-5 w-5 flex items-center justify-center mt-3" />
            </div>
          </div>

          <table className="w-full border-collapse bg-white shadow-lg  overflow-hidden mx-auto">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Faculty
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Day
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Time range
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
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.availabilityfaculty_id}>
                    <td className="border px-4 py-2 text-center">
                      {item.username}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {item.availability_name}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {formatTimeTo12Hour(item.time_range)}
                    </td>

                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${
                          item.availableslot_status === "Active"
                            ? "bg-green-900 text-white"
                            : item.availableslot_status === "Inactive"
                            ? "bg-gray-200 text-white"
                            : "bg-gray-200 text-white"
                        }`}
                      >
                        {item.availableslot_status}
                      </span>
                    </td>
                    <td className="border px-6 py-3 text-center align-middle">
                      <div className="flex justify-center items-center">
                        <button
                          onClick={() =>
                            handleView(item.availabilityfaculty_id)
                          }
                          className="px-1 py-1 border-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                          title="View"
                        >
                          <TbEye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No availability records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Student List:</DialogTitle>
                <p className="text-sm text-gray-600">
                  This table shows all students who booked a consultation for
                  the selected availability.
                </p>

                <div className="relative mt-4 w-full max-w-sm">
                  <input
                    type="text"
                    placeholder="Search student name.."
                    value={studentSearchText}
                    onChange={(e) => {
                      setStudentSearchText(e.target.value);
                      setStudentCurrentPage(1); // reset to first page when searching
                    }}
                    className="w-full border border-black rounded-lg px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-black"
                  />
                  <TbZoom className="absolute inset-y-0 right-3 text-black h-5 w-5 flex items-center justify-center mt-3" />
                </div>
              </DialogHeader>

              {studentPaginatedItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse bg-white shadow-md rounded-md overflow-hidden text-sm">
                    <thead className="bg-gray-100 text-gray-500">
                      <tr>
                        <th className="border px-4 py-2 text-center font-semibold">
                          Student
                        </th>
                        <th className="border px-4 py-2 text-center font-semibold">
                          Subject
                        </th>
                        <th className="border px-4 py-2 text-center font-semibold">
                          Purpose
                        </th>
                        <th className="border px-4 py-2 text-center font-semibold">
                          Booking Date
                        </th>
                        <th className="border px-4 py-2 text-center font-semibold">
                          Discussions
                        </th>
                        <th className="border px-4 py-2 text-center font-semibold">
                          Recommendations
                        </th>
                        <th className="border px-4 py-2 text-center font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentPaginatedItems.map((student, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="border px-4 py-2 text-center">
                            {student.student_name}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {student.subject_name}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {student.purpose || "-"}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {new Date(student.booking_date).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {student.discussion || "-"}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            {student.recommendation || "-"}
                          </td>
                          <td className="border px-4 py-2 text-center">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded-md ${
                                student.approval_name === "Approved" ||
                                student.approval_name === "Completed"
                                  ? "bg-green-900 text-white"
                                  : student.approval_name === "Disapproved" ||
                                    student.approval_name === "Cancelled"
                                  ? "bg-red-600 text-white"
                                  : "bg-yellow-500 text-white"
                              }`}
                            >
                              {student.approval_name || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* 📄 Entries + Pagination */}
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                    <p>
                      Showing {studentFirstIndex + 1} to{" "}
                      {Math.min(studentLastIndex, studentFilteredList.length)}{" "}
                      of {studentFilteredList.length} entries
                    </p>
                    <div className="flex">
                      <Pagination>
                        <PaginationContent className="flex">
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={handlePreviousStudentPage}
                              disabled={studentCurrentPage === 1}
                            />
                          </PaginationItem>
                          {Array.from({ length: studentTotalPages }, (_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                isActive={studentCurrentPage === i + 1}
                                onClick={() => handleGoToStudentPage(i + 1)}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={handleNextStudentPage}
                              disabled={
                                studentCurrentPage === studentTotalPages
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-4">
                  No student bookings found.
                </p>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setOpenViewDialog(false)}
                  className="bg-green-700 hover:bg-green-800"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-between mt-14">
            {/* Entries Text */}
            <span className="text-sm text-black pl-4">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredData.length)} of{" "}
              {filteredData.length} entries
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
                            ? "bg-red-900 text-white"
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

export default FacultyAvailabilitiesManagement;
