import { TbZoom } from "react-icons/tb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
const ActivityManagement = () => {
  const [filteredLogs, setFilteredLogs] = useState([]);
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const notifiedLogIdsRef = useRef([]);
  const toastShownLogsRef = useRef(false);
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
      // ✅ Load session-stored notified logs
      const storedLogs = sessionStorage.getItem("notified_activitylog_ids");
      if (storedLogs) {
        notifiedLogIdsRef.current = JSON.parse(storedLogs);
      }

      let isInitial = true;

      // ✅ First fetch (initial load)
      fetchlogs(isInitial);
      isInitial = false;

      // ✅ Poll every 5 seconds
      const interval = setInterval(() => {
        fetchlogs(false);
      }, 5000);

      return () => clearInterval(interval);
    }
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

  const fetchlogs = async (isInitial = false) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/activitylogs/fetch-activitylogs.php`
      );

      if (response.data.success) {
        const logs = response.data.data;

        // ✅ Extract current log IDs
        const currentIds = logs.map((log) => log.log_id);

        // ✅ Find new IDs compared to stored ones
        const newIds = currentIds.filter(
          (id) => !notifiedLogIdsRef.current.includes(id)
        );

        // 🚫 No toast — just handle ID tracking
        if (!isInitial && newIds.length > 0 && !toastShownLogsRef.current) {
          toastShownLogsRef.current = true;

          // Save newly notified IDs
          notifiedLogIdsRef.current = [...notifiedLogIdsRef.current, ...newIds];

          sessionStorage.setItem(
            "notified_activitylog_ids",
            JSON.stringify(notifiedLogIdsRef.current)
          );

          // Reset lock after delay
          setTimeout(() => {
            toastShownLogsRef.current = false;
          }, 5000);
        }

        // ✅ On initial fetch, just store IDs without notifications
        if (isInitial) {
          notifiedLogIdsRef.current = [
            ...notifiedLogIdsRef.current,
            ...currentIds,
          ];
          sessionStorage.setItem(
            "notified_activitylog_ids",
            JSON.stringify(notifiedLogIdsRef.current)
          );
        }

        setFilteredLogs(logs);
      } else {
        console.log("No activity logs found");
        setFilteredLogs([]);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setFilteredLogs([]);
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
            Activity logs
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            This section displays a record of all user activities, including
            logins, actions performed, and timestamps. Use this log to monitor
            system usage and track important changes.
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
                  logs #
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Username
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Activity
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Action
                </th>

                <th className="border px-6 py-3 text-center text-sm font-semibold relative">
                  Date & Time
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
                  <td colSpan="5" className="text-center py-4">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-14">
            {/* Entries Text */}
            <span className="text-sm text-black pl-4">
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

export default ActivityManagement;
