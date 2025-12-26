import {
  TbZoom,
  TbClipboardList,
  TbFilter,
  TbDotsVertical,
  TbPlus,
  TbEdit,
  TbEye,
} from "react-icons/tb";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const AvailabilityManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [Availabilitydayfetch, setAvailabilitydayfetch] = useState([]);
  const [selectedAvailabilityday, setSelectedAvailabilityday] = useState("");
  const [TimerangeFetch, setTimerangeFetch] = useState([]);
  const [selectedTimerange, setSelectedTimerange] = useState("");
  const [RecurrenceFetch, setRecurrenceFetch] = useState([]);
  const [selectedRecurrence, setSelectedRecurrence] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [AvailabilityFetch, setFetchAvailability] = useState([]);

  const [openeditDialog, setOpeneditDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [StatusFetch, setStatusFetch] = useState([]);
  const [editId, setEditId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(""); // "Active", "Inactive", or ""
  const [isLoading, setIsLoading] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const DEFAULT_AVAILABLESLOT_STATUS_ID = 1;

  const [openAddSlotDialog, setOpenAddSlotDialog] = useState(false);
  const [currentAvailabilityFacultyId, setCurrentAvailabilityFacultyId] =
    useState(null);

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
    fetchavailstatus();
    fetchrecurrence();
    fetchavailabilityday();
    fetchtimerange();

    if (loggedInUserId) {
      fetchAvailability(loggedInUserId);
    }
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
  const itemsPerPage = 10;
  const [searchText, setSearchText] = useState("");
  const filteredAvailabilitySlots = (AvailabilityFetch || [])
    .filter((finv) => {
      const matchesSearch =
        String(finv.availabilityfaculty_id)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.recurrence_name)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.availability_name)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.status_name)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.start_time)
          .toLowerCase()
          .includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "" || finv.availableslot_status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => b.availabilityfaculty_id - a.availabilityfaculty_id);

  const totalPages = Math.ceil(filteredAvailabilitySlots.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAvailabilitySlots.slice(
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
    }, 1000); // half-second transition effect
  };

  const fetchavailstatus = async () => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/status/fetch-status.php`
      );

      if (response.data.success) {
        setStatusFetch(response.data.data);
      } else {
        console.log(response.data.message || "No status found");
        setStatusFetch([]);
      }
    } catch (error) {
      console.error("Error fetching status :", error);
    }
  };

  const fetchrecurrence = async () => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/recurrence/fetch-recurrence.php`
      );

      if (response.data.success) {
        setRecurrenceFetch(response.data.data);
      } else {
        console.log(response.data.message || "No recurrence found");
        setRecurrenceFetch([]);
      }
    } catch (error) {
      console.error("Error fetching recurrence:", error);
    }
  };

  const fetchtimerange = async () => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/timerange/fetch-timerange.php`
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

  const fetchavailabilityday = async () => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/availabilityday/fetch-availabilityday.php`
      );

      if (response.data.success) {
        setAvailabilitydayfetch(response.data.data);
      } else {
        console.log(response.data.message || "No availabilityday found");
        setAvailabilitydayfetch([]);
      }
    } catch (error) {
      console.error("Error fetching availabilityday:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation

    if (!selectedRecurrence) {
      toast.error("Please select a recurrence.");
      return;
    }
    if (!selectedAvailabilityday) {
      toast.error("Please select a day.");
      return;
    }
    if (!selectedTimerange) {
      toast.error("Please select a time range.");
      return;
    }

    try {
      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-availability/add-availability.php`,
        {
          recurrence_id: selectedRecurrence,
          availability_id: selectedAvailabilityday,
          timerange_id: selectedTimerange,
          availableslotstatus_id: DEFAULT_AVAILABLESLOT_STATUS_ID,
          user_id: loggedInUserId,
        }
      );

      if (response.data.success) {
        toast.success("Availability set successfully!");

        // ✅ clear form

        setSelectedRecurrence("");
        setSelectedAvailabilityday("");
        setSelectedTimerange("");

        // ✅ close dialog
        setOpenDialog(false);

        // ✅ refresh list
        await fetchAvailability(loggedInUserId);
      } else {
        toast.error(response.data.message || "Failed to set availability.");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("An error occurred while saving availability.");
    }
  };

  const fetchAvailability = async (userId) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-availability/fetch-availability.php`,
        { params: { user_id: userId } } // send user_id as query param
      );

      if (response.data.success) {
        setFetchAvailability(response.data.data);
      } else {
        setFetchAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching faculty availability:", error);
    }
  };

  const handleEdit = async (availabilityfaculty_id) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-availability/get-availability.php?id=${availabilityfaculty_id}`
      );

      if (response.data.success) {
        const details = response.data.data;

        setEditId(details.availabilityfaculty_id);
        setSelectedRecurrence(details.recurrence_id);
        setSelectedAvailabilityday(details.availability_id);
        setSelectedTimerange(details.timerange_id);
        setSelectedStatus(details.status_id);

        setOpeneditDialog(true);
      } else {
        toast.error("Failed to fetch availability details.");
      }
    } catch (error) {
      console.error("Error fetching availability details:", error);
      toast.error("An error occurred while loading availability details.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedRecurrence) {
      toast.error("Please select a recurrence.");
      return;
    }
    if (!selectedAvailabilityday) {
      toast.error("Please select a day.");
      return;
    }
    if (!selectedTimerange) {
      toast.error("Please select a time range.");
      return;
    }
    if (!selectedStatus) {
      toast.error("Please select a status.");
      return;
    }

    try {
      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-availability/edit-availability.php`,
        {
          availabilityfaculty_id: editId,
          recurrence_id: selectedRecurrence,
          availability_id: selectedAvailabilityday,
          timerange_id: selectedTimerange,
          availableslotstatus_id: selectedStatus,
          user_id: loggedInUserId,
        }
      );

      if (response.data.success) {
        toast.success("Availability updated successfully!");

        // 🔹 Update local state instead of reloading
        setFetchAvailability((prev) =>
          prev.map((item) =>
            item.availabilityfaculty_id === editId
              ? {
                  ...item,
                  recurrence_id: selectedRecurrence,
                  availability_id: selectedAvailabilityday,
                  timerange_id: selectedTimerange,
                  status_id: selectedStatus,
                  recurrence_name: RecurrenceFetch.find(
                    (r) => r.recurrence_id == selectedRecurrence
                  )?.recurrence_name,
                  availability_name: Availabilitydayfetch.find(
                    (a) => a.availability_id == selectedAvailabilityday
                  )?.availability_name,
                  time_range: (() => {
                    const t = TimerangeFetch.find(
                      (tr) => tr.timerange_id == selectedTimerange
                    );
                    return t ? `${t.start_time} - ${t.end_time}` : "";
                  })(),
                  availableslot_status: StatusFetch.find(
                    (s) => s.status_id == selectedStatus
                  )?.status_name,
                }
              : item
          )
        );

        // ✅ reset edit state
        setEditId(null);
        setSelectedRecurrence("");
        setSelectedAvailabilityday("");
        setSelectedTimerange("");
        setSelectedStatus("");

        // ✅ close dialog
        setOpeneditDialog(false);
      } else {
        toast.error(response.data.message || "Failed to update availability.");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("An error occurred while updating availability.");
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

  const handleAddSlot = async (availabilityfaculty_id) => {
    try {
      if (!selectedTimerange) {
        toast.error("Please select a time range before adding.");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/adminside/admin-availability/add-slot.php`,
        {
          availabilityfaculty_id,
          timerange_id: selectedTimerange,
        }
      );

      if (response.data.success) {
        toast.success("Slot added successfully.");

        setFetchAvailability((prev) => [
          ...prev,
          {
            availabilityfaculty_id: response.data.new_id, // ✅ backend returns this
            recurrence_id: selectedRecurrence,
            availability_id: selectedAvailabilityday,
            timerange_id: selectedTimerange,
            status_id: selectedStatus,
            recurrence_name: RecurrenceFetch.find(
              (r) => r.recurrence_id == selectedRecurrence
            )?.recurrence_name,
            availability_name: Availabilitydayfetch.find(
              (a) => a.availability_id == selectedAvailabilityday
            )?.availability_name,
            time_range: (() => {
              const t = TimerangeFetch.find(
                (tr) => tr.timerange_id == selectedTimerange
              );
              return t ? `${t.start_time} - ${t.end_time}` : "";
            })(),
            availableslot_status: StatusFetch.find(
              (s) => s.status_id == selectedStatus
            )?.status_name,
          },
        ]);
      } else {
        toast.error(response.data.message || "Failed to add slot.");
      }
    } catch (error) {
      console.error("Error adding slot:", error);
      toast.error("An error occurred while adding slot.");
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
            <TbClipboardList className="text-xl w-6 h-6 !w-6 !h-6" />
            Availability Slots
          </h1>

          <p className="text-sm text-gray-600  mb-2">
            Below is a list of available consultation slots, including the day,
            time range, recurrence, subject, and current status. You can review
            and manage each slot using the actions provided.
          </p>

          {/* Search Input with Magnifier Icon and Button */}
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
                  setCurrentPage(1);
                }}
              />
              <TbZoom className="absolute inset-y-0 right-3 text-black h-5 w-5 flex items-center justify-center mt-3" />
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              {/* Trigger Button */}
              <DialogTrigger asChild>
                <button
                  onClick={() => setOpenDialog(true)}
                  className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white"
                >
                  <TbPlus className="h-5 w-5 transition-colors duration-300" />
                  Set Availability
                </button>
              </DialogTrigger>

              {/* Dialog Content */}
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-green-900">
                    Set Availability
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  <div>
                    <Label htmlFor="subject" className="mb-2 mt-4">
                      Recurrence
                    </Label>

                    <Select
                      value={selectedRecurrence}
                      onValueChange={(val) => setSelectedRecurrence(val)}
                    >
                      <SelectTrigger id="recurrence" className="w-full">
                        <SelectValue placeholder="Select recurrence" />
                      </SelectTrigger>
                      <SelectContent>
                        {RecurrenceFetch.length > 0 ? (
                          RecurrenceFetch.map((recur) => (
                            <SelectItem
                              key={recur.recurrence_id}
                              value={recur.recurrence_id}
                            >
                              {recur.recurrence_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>No recurrences Found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Day Dropdown */}
                  <div>
                    <Label htmlFor="subject" className="mb-2 mt-4">
                      Day
                    </Label>

                    <Select
                      value={selectedAvailabilityday}
                      onValueChange={(val) => setSelectedAvailabilityday(val)}
                    >
                      <SelectTrigger id="availabilityday" className="w-full">
                        <SelectValue placeholder="Select availability day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Availabilitydayfetch.length > 0 ? (
                          Availabilitydayfetch.map((avail) => (
                            <SelectItem
                              key={avail.availability_id}
                              value={avail.availability_id}
                            >
                              {avail.availability_name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>
                            No availabilityday Found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Range Dropdown */}
                  <div>
                    <Label htmlFor="subject" className="mb-2 mt-4">
                      Time range
                    </Label>

                    <Select
                      value={selectedTimerange}
                      onValueChange={(val) => setSelectedTimerange(val)}
                    >
                      <SelectTrigger id="time" className="w-full">
                        <SelectValue placeholder="Select timerange" />
                      </SelectTrigger>
                      <SelectContent>
                        {TimerangeFetch.length > 0 ? (
                          TimerangeFetch.map((time) => (
                            <SelectItem
                              key={time.timerange_id}
                              value={time.timerange_id}
                            >
                              {time.start_time}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled>No timerange found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-green-800 text-white py-2 rounded-lg font-semibold hover:bg-green-900 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
                  <TbFilter className="h-5 w-5 transition-colors duration-300" />
                  Filter availability status
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => onFilter("")}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilter("Inactive")}>
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <table className="w-full border-collapse bg-white shadow-lg  overflow-hidden mx-auto">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Slot no.
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Day
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Time range
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Recurrence
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
                currentItems.map((availday, index) => (
                  <tr key={index}>
                    <td className="border px-6 py-2 text-center">
                      {availday.availabilityfaculty_id}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {availday.availability_name}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {availday.time_range}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {availday.recurrence_name}
                    </td>

                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${
                          availday.availableslot_status === "Active"
                            ? "bg-green-900 text-white"
                            : availday.availableslot_status === "Inactive"
                            ? "bg-gray-200 text-white"
                            : "bg-gray-200 text-white"
                        }`}
                      >
                        {availday.availableslot_status}
                      </span>
                    </td>

                    <td className="border px-6 py-3  text-center text-sm font-semibold">
                      <div className="flex items-center justify-center gap-3">
                        {/* Add Slot */}
                        <button
                          onClick={() => {
                            setCurrentAvailabilityFacultyId(
                              availday.availabilityfaculty_id
                            );
                            setOpenAddSlotDialog(true);
                          }}
                          className="px-1 py-1 border-1 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition"
                          title="Add Slot"
                        >
                          <TbPlus className="w-5 h-5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() =>
                            handleEdit(availday.availabilityfaculty_id)
                          }
                          className="px-1 py-1 border-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
                          title="Edit"
                        >
                          <TbEdit className="w-5 h-5" />
                        </button>

                        {/* View */}
                        <button
                          onClick={() =>
                            handleView(availday.availabilityfaculty_id)
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
                  <td colSpan="22" className="text-center py-4 text-gray-500">
                    No availability found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <Dialog open={openeditDialog} onOpenChange={setOpeneditDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold text-blue-900">
                  Edit Availability
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Recurrence Dropdown */}
                <div>
                  <Label className="mb-2">Recurrence</Label>
                  <Select
                    value={selectedRecurrence}
                    onValueChange={(val) => setSelectedRecurrence(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                    <SelectContent>
                      {RecurrenceFetch.map((recur) => (
                        <SelectItem
                          key={recur.recurrence_id}
                          value={recur.recurrence_id}
                        >
                          {recur.recurrence_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Day Dropdown */}
                <div>
                  <Label className="mb-2">Day</Label>
                  <Select
                    value={selectedAvailabilityday}
                    onValueChange={(val) => setSelectedAvailabilityday(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Availabilitydayfetch.map((avail) => (
                        <SelectItem
                          key={avail.availability_id}
                          value={avail.availability_id}
                        >
                          {avail.availability_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time Range Dropdown */}
                <div>
                  <Label className="mb-2">Time Range</Label>
                  <Select
                    value={selectedTimerange}
                    onValueChange={(val) => setSelectedTimerange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      {TimerangeFetch.map((time) => (
                        <SelectItem
                          key={time.timerange_id}
                          value={time.timerange_id}
                        >
                          {time.start_time} - {time.end_time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2">Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={(val) => setSelectedStatus(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {StatusFetch.map((stat, index) => (
                        <SelectItem
                          key={`${stat.status_id}-${index}`}
                          value={stat.status_id}
                        >
                          {stat.status_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Update Button */}
                <div className="pt-2">
                  <button
                    onClick={handleUpdate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Update
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

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

          <Dialog open={openAddSlotDialog} onOpenChange={setOpenAddSlotDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Slot</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Select Time Range
                  </label>
                  <Select
                    value={selectedTimerange}
                    onValueChange={(val) => setSelectedTimerange(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time range" />
                    </SelectTrigger>
                    {/* Force dropdown to open below the trigger */}
                    <SelectContent side="bottom" align="start" sideOffset={4}>
                      {TimerangeFetch.map((tr) => (
                        <SelectItem
                          key={tr.timerange_id}
                          value={tr.timerange_id}
                        >
                          {tr.start_time} - {tr.end_time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenAddSlotDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green-800 hover:bg-green-900 text-white"
                  onClick={() => {
                    handleAddSlot(currentAvailabilityFacultyId);
                    setOpenAddSlotDialog(false);
                  }}
                  disabled={!selectedTimerange}
                >
                  Add Slot
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-between mt-14">
            <span className="text-sm text-green-800 font-semibold pl-4">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, AvailabilityFetch.length)} of{" "}
              {AvailabilityFetch.length} entries
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
                            ? "bg-green-900 text-white"
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

export default AvailabilityManagement;
