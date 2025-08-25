import { useState, useEffect } from "react";
import CryptoJS from "crypto-js"; // Import CryptoJS
import { motion } from "framer-motion";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  TbZoom,
  TbPlus,
  TbArrowsDownUp,
  TbEdit,
  TbChevronDown,
} from "react-icons/tb";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const SECRET_KEY = "my_secret_key_123456"; // Make sure this matches the key used in the backend

const AvailabilityManagement = () => {
  const [fetchsuppliertype, setFetchSuppliertype] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false); // 🔧 FIX: Add this line
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const itemsPerPage = 10;

  // 1. First, filter the categories based on search text
  const filteredsupptypes = fetchsuppliertype.filter(
    (supps) =>
      supps.suppliertype?.toLowerCase().includes(searchText.toLowerCase()) ||
      supps.created_at?.toLowerCase().includes(searchText.toLowerCase()) ||
      supps.updated_at?.toLowerCase().includes(searchText.toLowerCase())
  );

  // 2. Then calculate total pages based on filtered results
  const totalPages = Math.ceil(filteredsupptypes.length / itemsPerPage);

  // 3. Calculate pagination indexes
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // 4. Slice the filtered list
  const currentItems = filteredsupptypes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Pagination controls
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

  useEffect(() => {
    decryptUserId();
  }, [loggedInUserId]);

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
      <div className="bg-white p-6  shadow-md">
        <h1 className="text-l font-bold mb-4 text-green-800 pb-5 mt-3">
          Faculty availability Overview
        </h1>

        {/* Search Input with Magnifier Icon and Add Category Button */}
        <div className="flex items-center justify-between pt-6 mb-4">
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

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setDialogOpen(true)}
                className="ml-2 px-4 py-2 bg-green-900 text-m font-semibold text-white rounded-lg shadow flex items-center hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-800"
              >
                <TbPlus className="w-6 h-6  !w-6 !h-6" />
                Add availability
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Availability</DialogTitle>
                <DialogDescription>
                  Fill in the availability details below and click save to add
                  it.
                </DialogDescription>
              </DialogHeader>

              <form>
                <div className="grid gap-4 py-4"></div>
                <DialogFooter>
                  <Button type="submit">Save availability</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <table className="w-full border-collapse bg-white shadow-lg      overflow-hidden">
          <thead className="bg-green-900 text-white">
            <tr>
              {["Day", "Time range", "Recurrence", "Status", "Actions"].map(
                (header, index) => (
                  <th
                    key={index}
                    className="border px-6 py-3 text-center text-sm font-semibold relative"
                  >
                    {header}
                    {header !== "Action" && (
                      <div className="absolute top-0 right-2 flex flex-col items-center"></div>
                    )}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={5} className="text-center py-6 text-black">
                No faculty availability found
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-14">
          <span className="text-sm text-black pl-4">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, fetchsuppliertype.length)} of{" "}
            {fetchsuppliertype.length} entries
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
                        currentPage === index + 1 ? "bg-red-900 text-white" : ""
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

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={1000}
        theme="light"
        transition={Bounce}
      />
    </motion.div>
  );
};

export default AvailabilityManagement;
