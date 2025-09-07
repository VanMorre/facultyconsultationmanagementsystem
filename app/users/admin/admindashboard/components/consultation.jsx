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
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
const ConsultationManagement = () => {
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [date, setDate] = useState(null); // ✅ fixed for .jsx

  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);

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

            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
                  <TbPlus className="h-5 w-5 transition-colors duration-300" />
                  New Consultations
                </button>
              </DialogTrigger>

              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-green-800">
                    New Consultation
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Student Dropdown */}
                  <div>
                    <Label className="mb-2 block">Student</Label>
                    <Select>
                      <SelectTrigger className="w-full border-green-800">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student1">John Doe</SelectItem>
                        <SelectItem value="student2">Jane Smith</SelectItem>
                        <SelectItem value="student3">Mark Johnson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-between text-left font-normal border-green-800 ${
                            !date && "text-muted-foreground"
                          }`}
                        >
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Select date</span>
                          )}
                          <CalendarIcon className="ml-2 h-4 w-4" />{" "}
                          {/* ✅ Icon moved to right */}
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

              
                  <div>
                    <Label className="mb-2  block">Start Time</Label>
                    <Select>
                      <SelectTrigger className="w-full border-green-800">
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:00">09:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* End Time Dropdown */}
                  <div>
                    <Label className="mb-2  block">End Time</Label>
                    <Select>
                      <SelectTrigger className="w-full border-green-800">
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button className="w-full bg-green-800 hover:bg-green-700 text-white">
                      Save Consultation
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Filter Date Button */}
            <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
              <TbCalendar className="h-5 w-5 transition-colors duration-300" />
              Filter Consultation Date
            </button>

            {/* Filter Date Button */}
            <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
              <TbFilter className="h-5 w-5 transition-colors duration-300" />
              Filter Status
            </button>
          </div>

          <table className="w-full border-collapse bg-white shadow-lg  overflow-hidden mx-auto">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Student
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Date
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Start time
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Ended time
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

export default ConsultationManagement;
