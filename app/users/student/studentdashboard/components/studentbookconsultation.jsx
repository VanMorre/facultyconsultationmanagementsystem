import { TbHistory } from "react-icons/tb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
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
import axios from "axios";

const BookConsultationManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  
  // Get current date - ensure it's always fresh
  const getToday = () => new Date();
  const today = getToday();

  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDayName, setSelectedDayName] = useState(""); // store weekday
  // Initialize with current date - will be set properly in useEffect
  const [currentMonth, setCurrentMonth] = useState(() => {
    const todayDate = getToday();
    return todayDate.getMonth();
  });
  const [currentYear, setCurrentYear] = useState(() => {
    const todayDate = getToday();
    return todayDate.getFullYear();
  });
  const [subject, setSubject] = useState("");

  const [AvailabilityFetch, setFetchAvailability] = useState([]); // all availability
  const [facultyDialog, setFacultyDialog] = useState(null);

  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedTimerange, setSelectedTimerange] = useState("");
  const [notes, setNotes] = useState("");
  const DEFAULT_APPROVAL_STATUS_ID = 5;

  const notifiedAvailabilityIdsRef = useRef([]);
  const currentMonthRef = useRef(null);
  const currentYearRef = useRef(null);

  const decryptUserId = () => {
    const encryptedUserId = sessionStorage.getItem("student_id");

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
    
    // Ensure calendar starts at current month/year (only set if different to avoid unnecessary updates)
    const todayDate = getToday();
    const currentMonthValue = todayDate.getMonth();
    const currentYearValue = todayDate.getFullYear();
    
    // Initialize refs
    currentMonthRef.current = currentMonthValue;
    currentYearRef.current = currentYearValue;
    
    // Only update if different to prevent unnecessary re-renders
    setCurrentMonth((prev) => {
      if (prev !== currentMonthValue) return currentMonthValue;
      return prev;
    });
    setCurrentYear((prev) => {
      if (prev !== currentYearValue) return currentYearValue;
      return prev;
    });
    
    const storedNotified = sessionStorage.getItem("notified_availability_ids");
    if (storedNotified) {
      notifiedAvailabilityIdsRef.current = JSON.parse(storedNotified);
    }

    let isInitial = true;

    fetchAvailabilityDataWithNotify(isInitial);
    isInitial = false;

    const interval = setInterval(() => {
      fetchAvailabilityDataWithNotify(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loggedInUserId]);

  // Days in month util
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Build calendar
  const buildCalendarDays = (month, year) => {
    const days = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = daysInMonth(month, year);

    // previous month trailing days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, currentMonth: false });
    }

    // current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }

    // fill remaining to 42
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

  const [calendarDays, setCalendarDays] = useState(
    buildCalendarDays(currentMonth, currentYear)
  );

  useEffect(() => {
    // Sync refs with state
    currentMonthRef.current = currentMonth;
    currentYearRef.current = currentYear;
  }, [currentMonth, currentYear]);

  useEffect(() => {
    // Ensure calendar never shows past months/years - reset to current if needed
    const todayDate = getToday();
    const todayYear = todayDate.getFullYear();
    const todayMonth = todayDate.getMonth();
    
    // Check if we need to reset to current date
    if (currentYear < todayYear || 
        (currentYear === todayYear && currentMonth < todayMonth)) {
      // Reset to current month/year if somehow set to past
      setCurrentMonth(todayMonth);
      setCurrentYear(todayYear);
      // Rebuild calendar will happen on next render with correct values
      return;
    }
    
    // Always rebuild calendar with current month/year values
    setCalendarDays(buildCalendarDays(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  // Navigation with restrictions - prevent going to ANY past month/year
  const handlePrevMonth = () => {
    const todayDate = getToday();
    const todayYear = todayDate.getFullYear();
    const todayMonth = todayDate.getMonth();
    
    // Use refs to get current values reliably
    const prevMonth = currentMonthRef.current ?? currentMonth;
    const prevYear = currentYearRef.current ?? currentYear;
    
    let newMonth, newYear;
    
    if (prevMonth === 0) {
      // Going to previous year (December)
      newYear = prevYear - 1;
      newMonth = 11;
    } else {
      // Going to previous month in same year
      newYear = prevYear;
      newMonth = prevMonth - 1;
    }
    
    // Check if this would be a past date
    if (newYear < todayYear || (newYear === todayYear && newMonth < todayMonth)) {
      toast.error("Cannot navigate to past dates. You can only book consultations from the current month onwards.");
      return;
    }
    
    // Update both states
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    // Use refs to get current values reliably
    const prevMonth = currentMonthRef.current ?? currentMonth;
    const prevYear = currentYearRef.current ?? currentYear;
    
    if (prevMonth === 11) {
      // Increment year properly
      setCurrentYear(prevYear + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(prevMonth + 1);
    }
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

  const formatTimeTo12Hour = (timeString) => {
    if (!timeString) return "";
    
    // Handle time range format like "13:00:00 - 14:00:00"
    if (timeString.includes(" - ")) {
      const [startTime, endTime] = timeString.split(" - ");
      return `${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`;
    }
    
    // Handle single time format
    return convertTo12Hour(timeString);
  };

  const convertTo12Hour = (time24) => {
    if (!time24) return "";
    
    // Extract hours and minutes from "HH:MM:SS" or "HH:MM" format
    const timeParts = time24.split(":");
    if (timeParts.length < 2) return time24;
    
    let hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    if (isNaN(hours)) return time24;
    
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)
    
    return `${hours}:${minutes} ${period}`;
  };

  const getFacultyForDate = (date) => {
    const dayName = date.toLocaleString("en-US", { weekday: "long" });
    // Case-insensitive matching to handle any case variations
    return AvailabilityFetch.filter((a) => 
      a.availability_name && 
      a.availability_name.toLowerCase() === dayName.toLowerCase()
    );
  };

  // Check if a date is in the past (before today) - works for any past year, month, or day
  const isPastDate = (date) => {
    const todayDate = getToday();
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDateOnly = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
    return checkDate < todayDateOnly;
  };

  // Check if current calendar view is in the past (prevents navigation to past months/years)
  const isCurrentViewPast = () => {
    const todayDate = getToday();
    // Block any past year
    if (currentYear < todayDate.getFullYear()) return true;
    // Block past months in current year
    if (currentYear === todayDate.getFullYear() && currentMonth < todayDate.getMonth()) return true;
    return false;
  };

  const isToday = (date) => {
    const todayDate = getToday();
    return (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    );
  };

  const formatDate = (date) => {
    if (!date) return null;
    // Use local date methods to avoid timezone conversion issues
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openDateDialog = (day) => {
    // Prevent opening dialog for ANY past date (any past year, month, or day)
    if (isPastDate(day)) {
      toast.error("Cannot book consultations for past dates. You can only book consultations from today onwards.");
      return;
    }

    const dayName = day.toLocaleString("en-US", { weekday: "long" });
    // Store date in YYYY-MM-DD format to avoid timezone conversion issues
    setSelectedDate(formatDate(day));
    setSelectedDayName(dayName);
    setSelectedFaculty("");
    setSelectedTimerange("");
    setOpenDialog(true);
  };

  const fetchAvailabilityDataWithNotify = async (isInitial = false) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/allavailabilityfaculty/fetch-allavailabilityfaculty.php`
      );

      if (response.data.success) {
        const newAvailabilities = response.data.data;

        // Extract unique availability IDs
        const currentIds = newAvailabilities.map(
          (item) => item.availabilityfaculty_id
        );

        // Find IDs that are new compared to stored ones
        const newIds = currentIds.filter(
          (id) => !notifiedAvailabilityIdsRef.current.includes(id)
        );

        // ✅ Track new IDs without showing toast
        if (!isInitial && newIds.length > 0) {
          // Save notified IDs
          notifiedAvailabilityIdsRef.current = [
            ...notifiedAvailabilityIdsRef.current,
            ...newIds,
          ];

          sessionStorage.setItem(
            "notified_availability_ids",
            JSON.stringify(notifiedAvailabilityIdsRef.current)
          );
        }

        // ✅ On initial fetch, just mark IDs
        if (isInitial) {
          notifiedAvailabilityIdsRef.current = [
            ...notifiedAvailabilityIdsRef.current,
            ...currentIds,
          ];
          sessionStorage.setItem(
            "notified_availability_ids",
            JSON.stringify(notifiedAvailabilityIdsRef.current)
          );
        }

        setFetchAvailability(newAvailabilities);
      } else {
        setFetchAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching faculty availability:", error);
      setFetchAvailability([]);
    }
  };
  const filteredFaculty = AvailabilityFetch.filter(
    (f) => f.availability_name === selectedDayName
  );

  const uniqueFaculty = Array.from(
    new Map(filteredFaculty.map((f) => [f.user_id, f])).values()
  );

  // Filter time ranges for selected faculty (availabilityfaculty_id)
  const filteredTimeRanges = AvailabilityFetch.filter(
    (f) =>
      f.user_id === Number(selectedFaculty) &&
      f.availability_name === selectedDayName
  );

  const handleSubmit = async () => {
    if (!selectedFaculty || !selectedTimerange || !subject) {
      toast.error(
        "Please fill in all required fields (Faculty, Time range, and Subject)."
      );
      return;
    }

    // Validate selected date is not in the past (any past year, month, or day)
    // Parse YYYY-MM-DD string to Date object for validation
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    if (isPastDate(selectedDateObj)) {
      toast.error("Cannot book consultations for past dates. You can only book consultations from today onwards.");
      return;
    }

    try {
      const parsedTime = JSON.parse(selectedTimerange);

      const payload = {
        student_id: Number(loggedInUserId),
        availabilityfaculty_id: Number(parsedTime.availabilityfaculty_id), // ✅ exact availability slot
        timerange_id: Number(parsedTime.timerange_id), // ✅ exact time slot
        subject,
        notes,
        consultation_date: selectedDate, // Already in YYYY-MM-DD format
        approval_id: DEFAULT_APPROVAL_STATUS_ID,
      };

      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/add-bookconsultation.php`,
        payload
      );

      if (response.data.success) {
        toast.success("Consultation booked successfully!", { autoClose: 1000 });
        setOpenDialog(false);

        setSelectedFaculty("");
        setSelectedTimerange("");
        setSubject("");
        setNotes("");
      } else {
        toast.error(response.data.message || "Failed to book consultation.");
      }
    } catch (error) {
      console.error("Error booking consultation:", error);
      toast.error("An error occurred while booking the consultation.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <>
        
        <div className="bg-white p-4 sm:p-6 shadow-md">
          {/* Title */}
          <h1 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-green-800 mt-2 sm:mt-3 flex items-center gap-2">
            <TbHistory className="text-lg sm:text-xl w-5 sm:w-6 h-5 sm:h-6" />
            Book Consultation
          </h1>

          <p className="text-gray-600 text-xs sm:text-sm mb-6 sm:mb-12">
            Here you can schedule and manage your consultations. Select a
            faculty availability, choose a time for consultations, and pick a
            convenient time to ensure you get the assistance you need.
          </p>

          {/* Calendar Header */}
          <div className="relative flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <button
                onClick={handlePrevMonth}
                disabled={isCurrentViewPast()}
                className={`p-1 sm:p-2 rounded border border-green-800 transition-colors duration-200 ${
                  isCurrentViewPast()
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                    : "text-black hover:bg-green-900 hover:text-white"
                }`}
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
                  const todayDate = getToday();
                  setCurrentMonth(todayDate.getMonth());
                  setCurrentYear(todayDate.getFullYear());
                }}
                className="ml-0 sm:ml-2 px-2 sm:px-3 py-1 rounded border border-green-800 text-black hover:bg-green-900 hover:text-white transition-colors duration-200"
              >
                Today
              </button>
            </div>

            <h2 className="sm:absolute left-1/2 sm:transform sm:-translate-x-1/2 font-semibold text-sm sm:text-lg text-green-800 text-center mt-1 sm:mt-0">
              {monthNames[currentMonth]} {currentYear}
            </h2>
          </div>

          {/* Days of Week */}
          {/* Calendar Container with vertical + horizontal scroll */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Horizontal scroll area */}
            <div className="overflow-x-auto touch-pan-x scroll-smooth">
              <div className="min-w-[900px]">
                {/* Days Header */}
                <div className="grid grid-cols-7 text-center font-semibold border-b bg-gray-100 text-black shadow-xl text-xs sm:text-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-1 sm:p-2 border border-gray-200"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 shadow-xl text-xs sm:text-sm">
                  {calendarDays.map(({ date, currentMonth }) => {
                    const availabilities = getFacultyForDate(date);
                    const isPast = isPastDate(date); // Check if date is ANY past date
                    const canBook = availabilities.length > 0 && !isPast;

                    return (
                      <div
                        key={date.toISOString()}
                        onClick={() => !isPast && openDateDialog(date)}
                        className={`h-20 sm:h-28 border flex flex-col items-start p-1 sm:p-2 ${
                          isPast
                            ? "cursor-not-allowed opacity-50 bg-gray-100"
                            : "cursor-pointer"
                        }
                ${!currentMonth ? "text-gray-400 bg-gray-50" : isPast ? "bg-gray-100" : "bg-white"}
                ${isToday(date) ? "bg-gray-200 font-bold" : ""}
                ${!isPast ? "hover:bg-green-100" : ""}`}
                      >
                        <div className="self-end">{date.getDate()}</div>

                        {canBook && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDateDialog(date); // open booking dialog
                            }}
                            className="w-full mt-6 text-center text-green-800 text-xs sm:text-sm font-semibold hover:text-green-600"
                          >
                            Book Availability
                          </button>
                        )}
                        {isPast && availabilities.length > 0 && (
                          <div className="w-full mt-6 text-center text-gray-400 text-xs sm:text-sm">
                            Past Date
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Faculty Availability Dialog */}
          <Dialog
            open={!!facultyDialog}
            onOpenChange={() => setFacultyDialog(null)}
          >
            <DialogContent className="p-6 rounded-xl shadow-lg bg-white">
              {facultyDialog && (
                <>
                  <p className="mt-2 text-gray-600 text-sm">
                    Below are all the available consultation time slots for{" "}
                    <span className="font-semibold">
                      {facultyDialog.username}
                    </span>{" "}
                    on{" "}
                    <span className="font-semibold">{facultyDialog.day}</span>.
                  </p>

                  <DialogHeader>
                    <DialogTitle className="text-m font-semibold">
                      {facultyDialog.username} — {facultyDialog.day}
                    </DialogTitle>
                  </DialogHeader>

                  <div className="mt-3 text-sm text-gray-700 space-y-2">
                    {facultyDialog.availabilities.map((a, i) => (
                      <div
                        key={`${a.user_id ?? facultyDialog.username}-${i}`}
                        className="border p-2 rounded-md bg-gray-50"
                      >
                        <p>
                          <span className="font-semibold">Time range:</span>{" "}
                          {formatTimeTo12Hour(a.time_range)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <button className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900">
                        Close
                      </button>
                    </DialogClose>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Book Consultation Dialog */}
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent
              className={`
    w-full 
    sm:max-w-md 
    sm:rounded-lg 
    sm:h-auto 
    h-[60vh] 
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
                  <Select
                    value={selectedFaculty}
                    onValueChange={(val) => {
                      setSelectedFaculty(val);
                      setSelectedTimerange("");
                    }}
                  >
                    <SelectTrigger id="faculty" className="w-full">
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueFaculty.length > 0 ? (
                        uniqueFaculty.map((faculty) => (
                          <SelectItem
                            key={faculty.user_id}
                            value={faculty.user_id.toString()} // store user_id
                          >
                            {faculty.username}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem key="no-faculty" disabled>
                          No faculty available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

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
                      {filteredTimeRanges.length > 0 ? (
                        filteredTimeRanges.map((time, idx) => {
                          // Store both availabilityfaculty_id and timerange_id in one string
                          const value = JSON.stringify({
                            availabilityfaculty_id: time.availabilityfaculty_id,
                            timerange_id: time.timerange_id,
                          });

                          return (
                            <SelectItem key={idx} value={value}>
                              {formatTimeTo12Hour(time.time_range)}
                            </SelectItem>
                          );
                        })
                      ) : (
                        <SelectItem key="no-timerange" disabled>
                          No timerange found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <Label className="pb-2 sm:pb-4">Subject</Label>
                  <Input
                    type="text"
                    placeholder="Enter subject"
                    className="w-full border border-black text-black"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label className="pb-2 sm:pb-4">Purpose</Label>
                  <textarea
                    className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                    rows="3"
                    placeholder="Enter notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
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
                  <Button
                    className="bg-green-700 hover:bg-green-800 w-full sm:w-auto"
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </>
    </motion.div>
  );
};

export default BookConsultationManagement;
