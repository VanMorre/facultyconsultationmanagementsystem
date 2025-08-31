import {
  TbZoom,
  TbClipboardList,
  TbPlus,
  TbEye,
  TbCalendar,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
const SubjectlistManagement = () => {
  const [filteredLogs, setFilteredLogs] = useState([]);
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [subject, setSubject] = useState("");
  const [filteredyear, setFilteredyear] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const DEFAULT_SUBJECTSTATUS_STATUS_ID = 1;
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
    fetchacademicyear();
  }, [loggedInUserId]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [searchText, setSearchText] = useState("");
  const filteredlogs = (filteredLogs || [])
    .filter(
      (finv) =>
        String(finv.log_id).toLowerCase().includes(searchText.toLowerCase()) ||
        String(finv.username)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.activity_type)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.action).toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => a.log_id - b.log_id);

  const totalPages = Math.ceil(filteredlogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredlogs.slice(indexOfFirstItem, indexOfLastItem);

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

  const fetchacademicyear = async () => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/academicyear/fetch-academicyear.php`
      );

      if (response.data.success) {
        setFilteredyear(response.data.data);
      } else {
        console.log(response.data.message || "No academic year found");
        setFilteredyear([]);
      }
    } catch (error) {
      console.error("Error fetching academic year:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!subject.trim()) {
      toast.error("Please enter a subject name.");
      return;
    }
    if (!selectedYear) {
      toast.error("Please select an academic year.");
      return;
    }

    try {
      // ✅ API call
      const response = await axios.post(
        "http://localhost/fchms/app/api_fchms/subject/add-subject.php",
        {
          subject_name: subject,
          academicyear_id: selectedYear,
          subjectstatus_id: DEFAULT_SUBJECTSTATUS_STATUS_ID, 
          user_id: loggedInUserId
        }
      );

      // ✅ Success response
      if (response.data.success) {
        toast.success("Subject added successfully!");

        // clear form after save
        setSubject("");
        setSelectedYear("");

        // optional: refresh subject list if you have one
        // fetchSubjects();
      } else {
        toast.error(response.data.message || "Failed to add subject.");
      }
    } catch (error) {
      console.error("Error saving subject:", error);
      toast.error("An error occurred while saving the subject.");
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
          <h1 className="text-l font-bold mb-4 text-green-800 pb-5 mt-3 flex items-center gap-2">
            <TbClipboardList className="text-xl w-6 h-6 !w-6 !h-6" />
            Subjects List
          </h1>

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

            {/* Availability Button */}
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
                  <TbPlus className="h-5 w-5 transition-colors duration-300" />
                  Add Subjects
                </button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Subject</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Subject Input */}
                  <div>
                    <Label htmlFor="subject" className="mb-2 mt-4">
                      Subject Name:
                    </Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter subject name"
                    />
                  </div>

                  <Select
                    value={selectedYear}
                    onValueChange={(val) => setSelectedYear(val)}
                  >
                    <SelectTrigger id="academicyear" className="w-full">
                      <SelectValue placeholder="Select Academic Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredyear.length > 0 ? (
                        filteredyear.map((year) => (
                          <SelectItem
                            key={year.academicyear_id}
                            value={year.academicyear_id}
                          >
                            {year.academicyear}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled>No Academic Year Found</SelectItem>
                      )}
                    </SelectContent>
                  </Select>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSave}
                      variant="ghost"
                      className="border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white mt-4"
                    >
                      Save this Subject
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
              <TbFilter className="h-5 w-5 transition-colors duration-300" />
              Filter Subject Status
            </button>

            <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
              <TbFilter className="h-5 w-5 transition-colors duration-300" />
              Filter Subject Academic Year
            </button>
          </div>

          <table className="w-full border-collapse bg-white shadow-lg  overflow-hidden mx-auto">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Subject code
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Subject
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Status
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Academic year
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((log, index) => (
                  <tr key={index}>
                    <td className="border px-6 py-2 text-center">
                      {log.log_id}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {log.username}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {log.activity_type}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {log.action}
                    </td>
                    <td className="border px-6 py-2 text-center">
                      {new Date(log.activity_time).toLocaleString("en-PH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No Subject found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-14">
            {/* Entries Text */}
            <span className="text-sm text-green-800 font-semibold pl-4">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredLogs.length)} of{" "}
              {filteredLogs.length} entries
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

export default SubjectlistManagement;
