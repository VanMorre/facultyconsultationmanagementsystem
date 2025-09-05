import {
  TbZoom,
  TbClipboardList,
  TbPlus,
  TbEye,
  TbCalendar,
  TbFilter,
  TbEdit
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
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const SubjectlistManagement = () => {
  
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [SubjectFetch, setFetchSubjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

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
    fetchsubjects();
  }, [loggedInUserId]);

const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchText, setSearchText] = useState("");
  const filteredsubjects = (SubjectFetch || [])
    .filter(
      (finv) =>
        String(finv.subject_id)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.subject_name)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.academicyear)
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        String(finv.status_name)
          .toLowerCase()
          .includes(searchText.toLowerCase())
    )
    .sort((a, b) => a.subject_id - b.subject_id);

  const totalPages = Math.ceil(filteredsubjects.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredsubjects.slice(
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




    const fetchsubjects = async () => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/subjects/fetch-subjects.php`
      );

      if (response.data.success) {
        setFetchSubjects(response.data.data);
      } else {
        console.log(response.data.message || "No subjects found");
        setFetchSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
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

                
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((subs, index) => (
                  <tr key={index}>
                    <td className="border px-6 py-2 text-center ">
                      {subs.subject_id}
                    </td>
                    <td className="border px-6 py-2 text-center ">
                      {subs.subject_name}
                    </td>
                    <td className="border px-6 py-3 text-center text-sm font-semibold">
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded-md ${
                          subs.status_name === "Active"
                            ? "bg-green-900 text-white"
                            : subs.status_name === "Inactive"
                            ? "bg-gray-200 text-white"
                            : "bg-gray-200 text-white"
                        }`}
                      >
                        {subs.status_name}
                      </span>
                    </td>

                    <td className="border px-6 py-2 text-center ">
                      {subs.academicyear}
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
              {Math.min(indexOfLastItem, SubjectFetch.length)} of{" "}
              {SubjectFetch.length} entries
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

export default SubjectlistManagement;
