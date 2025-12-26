import { TbHistory } from "react-icons/tb";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const today = new Date();

  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDayName, setSelectedDayName] = useState(""); // store weekday
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [subject, setSubject] = useState("");

  const [AvailabilityFetch, setFetchAvailability] = useState([]); // all availability
  const [facultyDialog, setFacultyDialog] = useState(null);

  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedTimerange, setSelectedTimerange] = useState("");
  const [notes, setNotes] = useState("");
  const DEFAULT_APPROVAL_STATUS_ID = 5;

  const notifiedAvailabilityIdsRef = useRef([]);
  const toastShownAvailabilityRef = useRef(false);

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
    setCalendarDays(buildCalendarDays(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  // Navigation
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

  const getFacultyForDate = (date) => {
    const dayName = date.toLocaleString("en-US", { weekday: "long" });
    return AvailabilityFetch.filter((a) => a.availability_name === dayName);
  };

  const isToday = (date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const openDateDialog = (day) => {
    const dayName = day.toLocaleString("en-US", { weekday: "long" });
    setSelectedDate(day.toDateString());
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

        // 🔔 Show toast only on subsequent fetch (not on initial load)
        if (
          !isInitial &&
          newIds.length > 0 &&
          !toastShownAvailabilityRef.current
        ) {
          toastShownAvailabilityRef.current = true;

          toast.info(`${newIds.length} new faculty availability record(s)`, {
            toastId: "new-availability-toast", // prevents stacking
            position: "top-right",
            autoClose: 2000,
          });

          // ✅ Save notified IDs
          notifiedAvailabilityIdsRef.current = [
            ...notifiedAvailabilityIdsRef.current,
            ...newIds,
          ];

          sessionStorage.setItem(
            "notified_availability_ids",
            JSON.stringify(notifiedAvailabilityIdsRef.current)
          );

          // Reset lock after delay
          setTimeout(() => {
            toastShownAvailabilityRef.current = false;
          }, 5000);
        }

        // ✅ On initial fetch, just mark IDs without showing a toast
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

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const handleSubmit = async () => {
    if (!selectedFaculty || !selectedTimerange || !subject) {
      toast.error(
        "Please fill in all required fields (Faculty, Time range, and Subject)."
      );
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
        consultation_date: formatDate(selectedDate),
        approval_id: DEFAULT_APPROVAL_STATUS_ID,
      };

      const response = await axios.post(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/add-bookconsultation.php`,
        payload
      );

      if (response.data.success) {
        toast.success("Consultation booked successfully!");
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
        <ToastContainer
          position="top-right"
          autoClose={1000}
          theme="light"
          transition={Bounce}
        />

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

                    return (
                      <div
                        key={date.toISOString()}
                        onClick={() => openDateDialog(date)}
                        className={`h-20 sm:h-28 border flex flex-col items-start p-1 sm:p-2 cursor-pointer
                ${!currentMonth ? "text-gray-400 bg-gray-50" : "bg-white"}
                ${isToday(date) ? "bg-gray-200 font-bold" : ""}
                hover:bg-green-100`}
                      >
                        <div className="self-end">{date.getDate()}</div>

                        {availabilities.length > 0 &&
                          [
                            ...new Map(
                              availabilities.map((f) => [f.username, f])
                            ).values(),
                          ].map((f, i) => (
                            <button
                              key={`${f.user_id}-${i}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const clickedDay = f.availability_name;

                                const facultyDayAvailabilities =
                                  AvailabilityFetch.filter(
                                    (af) =>
                                      af.username === f.username &&
                                      af.availability_name === clickedDay
                                  );

                                setFacultyDialog({
                                  username: f.username,
                                  day: clickedDay,
                                  availabilities: facultyDayAvailabilities,
                                });
                              }}
                              className="w-full text-center text-green-800 text-xs sm:text-sm font-medium underline hover:text-green-600 truncate"
                              title={f.username}
                            >
                              {f.username}
                            </button>
                          ))}
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
                          {a.time_range}
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
                              {time.time_range}
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
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label className="pb-2 sm:pb-4">Notes</Label>
                  <textarea
                    className="w-full border border-black rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-700"
                    rows="3"
                    placeholder="Enter notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
