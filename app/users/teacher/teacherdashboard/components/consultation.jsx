import {
  TbZoom,
  TbClipboardList,
  TbPlus,
  TbCalendar,
  TbFilter,
  TbHistory,
} from "react-icons/tb";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

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
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect , useRef } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ConsultationManagement = () => {
  const [date, setDate] = useState(null); // ✅ fixed for .jsx
  const [fetchbooking, setfetchbooking] = useState([]);
  const [TimerangeFetch, setTimerangeFetch] = useState([]);
  const [selectedTimerange, setSelectedTimerange] = useState("");
  const [selectedStudents, setSelectedStudents] = useState("");
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const DEFAULT_APPROVAL_STATUS_ID = 5;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ConsultationFetch, setFetchConsultation] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
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

// 🔑 First effect: run once to decrypt userId
useEffect(() => {
  decryptUserId();
  fetchtimerange();
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
        String(finv.schedulebookdate)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.timeranges)
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

  const uniqueStudents = [
    ...new Map(fetchbooking.map((s) => [s.student_name, s])).values(),
  ];

  const fetchbookingstudentWithNotify = async (UserID, isInitial = false) => {
     try {
       const response = await axios.get(
         `http://localhost/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
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



  const fetchtimerange = async () => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/timerange/fetch-timerange.php`
      );

      if (response.data.success) {
        setTimerangeFetch(response.data.data);
      } else {
        console.log(response.data.message || "No timerange found");
        setTimerangeFetch([]);
      }
    } catch (error) {
      console.error("Error fetching timerange :", error);
    }
  };

  const handleSubmitConsultation = async () => {
    if (selectedStudents.length === 0 || !date || !selectedTimerange) {
      toast.error("Please select students, date, and a time range.");
      return;
    }

    try {
      const payload = {
        students: selectedStudents.map((id) => Number(id)), // ✅ these should be booking_id values
        consultation_date: format(date, "yyyy-MM-dd"),
        timerange_id: Number(selectedTimerange),
        approval_id: DEFAULT_APPROVAL_STATUS_ID,
        user_id: Number(loggedInUserId),
      };

      const response = await axios.post(
        `http://localhost/fchms/app/api_fchms/facultyside/teacher-consultation/add-consultation.php`,
        payload
      );

      if (response.data.success) {
        toast.success("Consultation scheduled successfully!");
        setSelectedStudents([]);
        setDate(null);
        setSelectedTimerange("");
        setIsDialogOpen(false);
        await fetchConsultation(loggedInUserId);
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
        `http://localhost/fchms/app/api_fchms/facultyside/teacher-consultation/fetch-consultation.php`,
        {
          params: { user_id: UserID }, // ✅ send user_id
        }
      );

      if (response.data.success) {
        setFetchConsultation(response.data.data);
      } else {
        setFetchConsultation([]);
      }
    } catch (error) {
      console.error("Error fetching consultation:", error);
    }
  };

  const handleCompleted = async (schedulebookings_id, currentStatus) => {
    if (currentStatus === "Completed") {
      toast.warning("This consultation is already marked as Completed!");
      return;
    }
    if (currentStatus === "Cancelled") {
      toast.warning("This consultation has been Cancelled!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost/fchms/app/api_fchms/facultyside/teacher-consultation/approval-consultation.php`,
        {
          schedulebookings_id,
          action: "Completed",
          user_id: loggedInUserId, // ✅ Always send logged-in user
        }
      );

      if (response.data.success) {
        toast.success("Consultation marked as Completed");

        // ✅ Update only the affected row in state
        setFetchConsultation((prev) =>
          prev.map((consult) =>
            consult.schedulebookings_id === schedulebookings_id
              ? { ...consult, approval_name: "Completed" }
              : consult
          )
        );
      } else {
        toast.error(response.data.message || "Failed to mark as Completed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while updating to Completed.");
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
        `http://localhost/fchms/app/api_fchms/facultyside/teacher-consultation/approval-consultation.php`,
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
        `http://localhost/fchms/app/api_fchms/facultyside/teacher-consultation/approval-consultation.php`,
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
          <h1 className="text-l font-bold mb-4 text-green-800 pb-5 mt-3 flex items-center gap-2">
            <TbClipboardList className="text-xl w-6 h-6 !w-6 !h-6" />
            Consultations
          </h1>

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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                style={{ maxWidth: "1200px", height: "700px" }}
              >
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-green-800 text-xl font-semibold">
                    Schedule Consultation
                  </DialogTitle>
                  <p className="text-sm text-gray-500">
                    Select students and set a consultation schedule
                  </p>
                </DialogHeader>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto px-1">
                  {/* Left side: Students */}
                  <div className="flex flex-col h-full">
                    <Label className="mb-3 block text-green-800 font-medium">
                      Student list:
                    </Label>

                    <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto border border-green-800 shadow-xl p-2 bg-green-50 rounded-md">
                      {uniqueStudents.length > 0 ? (
                        uniqueStudents.map((student) => (
                          <label
                            key={student.booking_id} // ✅ keep booking_id as unique key
                            className="flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-sm hover:bg-green-100 cursor-pointer w-full"
                          >
                            <input
                              type="checkbox"
                              value={student.booking_id} // ✅ use booking_id here
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
                              className="h-4 w-4 text-green-800 border-green-800 rounded"
                            />
                            <span className="text-sm">
                              {student.student_name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No students found.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Date & Time */}
                  <div className="flex flex-col h-full justify-between">
                    {/* Date Picker */}
                    <div>
                      <Label className="mb-2 block text-green-800 font-medium">
                        Date
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-between border-green-800 ${
                              !date && "text-muted-foreground"
                            }`}
                          >
                            {date ? (
                              format(date, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-2 h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Start Time */}
                    <div>
                      <Label
                        htmlFor="subject"
                        className="mb-2 block text-green-800"
                      >
                        Start time
                      </Label>
                      <Select
                        value={selectedTimerange}
                        onValueChange={(val) => setSelectedTimerange(val)}
                      >
                        <SelectTrigger
                          id="time"
                          className="w-full border-2 border-green-800 rounded-md focus:ring-2 focus:ring-green-600"
                        >
                          <SelectValue placeholder="Select timerange" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-green-800 rounded-md">
                          {TimerangeFetch.length > 0 ? (
                            TimerangeFetch.map((time) => (
                              <SelectItem
                                key={time.timerange_id}
                                value={time.timerange_id}
                              >
                                {time.start_time} - {time.end_time}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem disabled>No timerange found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Note */}
                    <div className="mt-6">
                      <p className="text-sm text-gray-500">
                        Note!: Please ensure the end time is later than the
                        start time. I cater consultation only 10 students per
                        day, the rest may be rescheduled or cancelled if there
                        are conflicts in my schedule.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer Save */}
                <div className="pt-4 border-t flex justify-end gap-3 bg-white mt-4">
                  <Button
                    variant="outline"
                    className="border-green-800 text-green-800"
                    onClick={() => {
                      setSelectedStudents([]);
                      setDate(null);
                      setSelectedTimerange("");
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
                  Date
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Time
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
                currentItems.map((consult, index) => (
                  <tr key={index}>
                    <td className="border px-6 py-2 text-center">
                      {consult.schedulebookings_id}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {consult.student_name}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {consult.schedulebookdate}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {consult.timeranges}
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
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleCompleted(
                              consult.schedulebookings_id,
                              consult.approval_name
                            )
                          }
                          className="px-2 py-1 border-2 border-green-500 text-green-500 rounded-md focus:outline-none hover:bg-green-600 hover:text-white transition"
                        >
                          <HiCheckCircle className="w-6 h-6" />
                        </button>

                        <button
                          onClick={() =>
                            handleSchedule(
                              consult.schedulebookings_id,
                              consult.approval_name
                            )
                          }
                          className="px-2 py-1 border-2 border-blue-500 text-blue-500 rounded-md focus:outline-none hover:bg-blue-600 hover:text-white transition"
                        >
                          <TbHistory className="w-6 h-6" />
                        </button>

                        <button
                          onClick={() =>
                            handleCancelled(
                              consult.schedulebookings_id,
                              consult.approval_name
                            )
                          }
                          className="px-2 py-1 border-2 border-red-500 text-red-500 rounded-md focus:outline-none hover:bg-red-600 hover:text-white transition"
                        >
                          <HiXCircle className="w-6 h-6" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="22" className="text-center py-4 text-gray-500">
                    No consultation found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
