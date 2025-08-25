import { TbHistory } from "react-icons/tb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const BookConsultationManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const today = new Date();
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

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
  }, []);

  // ✅ Utility: Days in month
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // ✅ Build calendar days safely
  const buildCalendarDays = (month, year) => {
    const days = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = daysInMonth(month, year);

    // Previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, currentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }

    // Next month leading days to fill 42 cells
    while (days.length < 42) {
      const nextDate = new Date(
        year,
        month,
        days.length - (firstDayOfMonth - 1)
      );
      days.push({ date: nextDate, currentMonth: false });
    }

    return days;
  };

  // ✅ Inside component state
  const [calendarDays, setCalendarDays] = useState(
    buildCalendarDays(currentMonth, currentYear)
  );

  // Rebuild calendar whenever month/year changes
  useEffect(() => {
    setCalendarDays(buildCalendarDays(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  // ✅ Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const openDateDialog = (day) => {
    setSelectedDate(day.toDateString());
    setOpenDialog(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white p-6 shadow-md">
        <h1 className="text-l font-bold mb-4 text-green-800 pb-5 mt-3 flex items-center gap-2">
          <TbHistory className="text-xl w-6 h-6" /> Book Consultation
        </h1>

        {/* Calendar Header */}
        <div className="relative flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
              }}
              className="ml-2 px-3 py-1 rounded border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-200"
            >
              Today
            </button>
          </div>

          {/* ✅ Centered title */}
          <h2 className="absolute left-1/2 transform -translate-x-1/2 font-semibold text-lg text-green-800">
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        <div className="grid grid-cols-7 text-center font-semibold border-b bg-gray-100 text-black shadow-xl">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 border border-gray-200">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 shadow-xl">
          {calendarDays.map(({ date, currentMonth }, idx) => (
            <Dialog key={idx} open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <div
                  onClick={() => openDateDialog(date)}
                  className={`h-28 border flex justify-end p-2 text-sm cursor-pointer
            ${!currentMonth ? "text-gray-400 bg-gray-50" : "bg-white"}
            ${isToday(date) ? "bg-gray-200 font-bold" : ""}
            hover:bg-green-100`}
                >
                  {date.getDate()}
                </div>
              </DialogTrigger>
            </Dialog>
          ))}
        </div>

        {/* Dialog */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Book Consultation - {selectedDate}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="pb-4">Faculty</Label>
                <Select>
                  <SelectTrigger className="w-full border border-black text-black">
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faculty1">Faculty 1</SelectItem>
                    <SelectItem value="faculty2">Faculty 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="pb-4">Time</Label>
                <Select>
                  <SelectTrigger className="w-full border border-black text-black">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9am">9:00 AM</SelectItem>
                    <SelectItem value="10am">10:00 AM</SelectItem>
                    <SelectItem value="11am">11:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="pb-4">Notes</Label>
                <textarea
                  className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                  rows="4"
                  placeholder="Enter notes"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-green-700 hover:bg-green-800">
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

export default BookConsultationManagement;
