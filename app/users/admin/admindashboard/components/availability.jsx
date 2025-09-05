import {
  TbZoom,
  TbClipboardList,
  TbPlus,
  TbEye,
  TbEdit,
  TbFilter,
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const DEFAULT_AVAILABLESLOT_STATUS_ID = 1;
  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("user_id");

    if (encryptedUserId) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedUserId, SECRET_KEY);
        const decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
        setLoggedInUserId(decryptedUserId);
      } catch (error) {
        console.error("Error decrypting user ID:", error);
      }
    }
  };
  useEffect(() => {
    decryptUserId();

    fetchrecurrence();
    fetchavailabilityday();
    fetchtimerange();
    fetchAvailability();
  }, [loggedInUserId]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchText, setSearchText] = useState("");
  const filteredAvailabilitySlots = (AvailabilityFetch || [])
    .filter(
      (finv) =>
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
        String(finv.start_time).toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => a.availabilityfaculty_id - b.availabilityfaculty_id);

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

 

  const fetchrecurrence = async () => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/recurrence/fetch-recurrence.php`
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

  const fetchavailabilityday = async () => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/availabilityday/fetch-availabilityday.php`
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
        `http://localhost/fchms/app/api_fchms/adminside/admin-availability/add-availability.php`,
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
        await fetchAvailability();
      } else {
        toast.error(response.data.message || "Failed to set availability.");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error("An error occurred while saving availability.");
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/adminside/admin-availability/fetch-availability.php`
      );

      if (response.data.success) {
        setFetchAvailability(response.data.data);
      } else {
        console.log(response.data.message || "No faculty availability found");
        setFetchAvailability([]);
      }
    } catch (error) {
      console.error("Error faculty availability found:", error);
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
                  setCurrentPage(1); // Reset to page 1 when searching
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

            <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
              <TbPlus className="h-5 w-5 transition-colors duration-300" />
              Add Slot
            </button>

            <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
              <TbEye className="h-5 w-5 transition-colors duration-300" />
              View logs
            </button>

            <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
              <TbFilter className="h-5 w-5 transition-colors duration-300" />
              Filter Availability day
            </button>
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
              {currentItems.length > 0 ? (
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
                  <td colSpan="22" className="text-center py-4 text-gray-500">
                    No availability found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

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
