import { TbZoom, TbPrinter } from "react-icons/tb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

import CryptoJS from "crypto-js";
const StudentrequestManagement = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [getsalesdata, setfetchgetsalesdata] = useState([]);
  useEffect(() => {
    decryptUserId();
  }, [loggedInUserId]);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const filteredSales = getsalesdata.filter(
    (paysales) =>
      paysales.customers_name
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      paysales.productcategory_name
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      paysales.order_quantity
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      paysales.order_amount
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      paysales.amount_paid
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      paysales.payment_status
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      paysales.payment_date
        ?.toString()
        .toLowerCase()
        .includes(searchText.toLowerCase())
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSales = filteredSales.slice(indexOfFirstItem, indexOfLastItem);

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

  const SECRET_KEY = "my_secret_key_123456";
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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <>
        <div className="bg-white p-6  shadow-md">
          <h1 className="text-l font-bold text-green-900 pb-2 mt-3">
            Student Request
          </h1>
          <p className="text-sm text-gray-500">
            Below is the list of student consultation requests with their
            details, including purpose, schedule, and additional notes.
          </p>
          <div className="border-b border-gray-300 mt-2 mb-4"></div>

          <div className="flex justify-between items-center mt-14 mb-4">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search..."
                className="w-full border border-black text-black placeholder-black rounded-lg pl-4 pr-10 py-2 shadow-sm"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1); // Important: Reset to page 1 when searching
                }}
              />

              <TbZoom className="absolute inset-y-0 right-3 text-black h-5 w-5 flex items-center justify-center mt-3" />
            </div>
          </div>

          <table className="w-full border-collapse bg-white shadow-lg  overflow-hidden">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
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
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan={22} className="text-center py-6 text-gray-500 ">
                  No student request found
                </td>
              </tr>
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-14">
            {/* Entries Text */}
            <span className="text-sm text-black pl-4">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, getsalesdata.length)} of{" "}
              {getsalesdata.length} entries
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
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </motion.div>
  );
};

export default StudentrequestManagement;
