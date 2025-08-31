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
      <div className="bg-white p-4 sm:p-6 shadow-md">
        {/* Title */}
        <h1 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-green-800 mt-2 sm:mt-3 flex items-center gap-2">
          <TbHistory className="text-lg sm:text-xl w-5 sm:w-6 h-5 sm:h-6" />
          Book Consultation
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-xs sm:text-sm mb-6 sm:mb-12">
          Here you can schedule and manage your consultations. Select a faculty
          availability, choose a time for consultations, and pick a convenient
          time to ensure you get the assistance you need.
        </p>

        {/* Calendar Header */}
        <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <button
              onClick={handlePrevMonth}
              className="p-1 sm:p-2 rounded border border-green-800 text-black hover:bg-green-900 hover:text-white transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 sm:p-2 rounded border border-green-800 text-black hover:bg-green-900 hover:text-white transition-colors duration-200"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={() => {
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
              }}
              className="ml-0 sm:ml-2 px-2 sm:px-3 py-1 rounded border border-green-800 text-black hover:bg-green-900 hover:text-white transition-colors duration-200"
            >
              Today
            </button>
          </div>

          {/* ✅ Centered Title */}
          <h2 className="sm:absolute left-1/2 sm:transform sm:-translate-x-1/2 font-semibold text-sm sm:text-lg text-green-800 text-center mt-1 sm:mt-0">
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 text-center font-semibold border-b bg-gray-100 text-black shadow-xl text-xs sm:text-sm">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-1 sm:p-2 border border-gray-200">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 shadow-xl text-xs sm:text-sm">
          {calendarDays.map(({ date, currentMonth }, idx) => (
            <Dialog key={idx} open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <div
                  onClick={() => openDateDialog(date)}
                  className={`h-16 sm:h-28 border flex justify-end p-1 sm:p-2 cursor-pointer
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
          <DialogContent
            className={`
    w-full 
    sm:max-w-md 
    sm:rounded-lg 
    sm:h-auto 
    h-[60vh]   // ✅ take only 80% height on mobile
    fixed 
    bottom-0 
    sm:bottom-auto 
    sm:top-1/2 sm:left-1/2 
    sm:-translate-x-1/2 sm:-translate-y-1/2
    sm:p-6 p-4 
    overflow-y-auto
    transition-transform
    animate-in 
    sm:fade-in-90 
    slide-in-from-bottom-10
  `}
          >
            <DialogHeader>
              <DialogTitle className="text-sm sm:text-base">
                Book Consultation - {selectedDate}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 text-sm sm:text-base">
              {/* Faculty */}
              <div>
                <Label className="pb-2 sm:pb-4">Faculty</Label>
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

              {/* Time */}
              <div>
                <Label className="pb-2 sm:pb-4">Time</Label>
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

              {/* Subject */}
              <div>
                <Label className="pb-2 sm:pb-4">Subject</Label>
                <Select>
                  <SelectTrigger className="w-full border border-black text-black">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="database">
                      Database Management
                    </SelectItem>
                    <SelectItem value="webdev">Web Development</SelectItem>
                    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                    <SelectItem value="ai">Artificial Intelligence</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label className="pb-2 sm:pb-4">Notes</Label>
                <textarea
                  className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                  rows="3"
                  placeholder="Enter notes"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-green-700 hover:bg-green-800 w-full sm:w-auto">
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
