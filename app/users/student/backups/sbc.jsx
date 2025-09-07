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
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  const [AvailabilityFetch, setFetchAvailability] = useState([]);
  const [AvailabilityFaculty, setFetchAvailabilityFaculty] = useState([]);
  const [facultyDialog, setFacultyDialog] = useState(null);

  // ✅ Decrypt logged-in user
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
    fetchAvailabilityData();
    fetchAvailabilityFacultyData();
  }, [loggedInUserId]);

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

  const [calendarDays, setCalendarDays] = useState(
    buildCalendarDays(currentMonth, currentYear)
  );

  useEffect(() => {
    setCalendarDays(buildCalendarDays(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  // ✅ Navigation
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
    setSelectedDate(day.toDateString());
    setOpenDialog(true);
  };

  const fetchAvailabilityData = async () => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/allavailabilityfaculty/fetch-allavailabilityfaculty.php`
      );

      if (response.data.success) {
        setFetchAvailability(response.data.data);
      } else {
        setFetchAvailability([]);
      }
    } catch (error) {
      console.error("Error fetching faculty availability:", error);
    }
  };

  const fetchAvailabilityFacultyData = async () => {
    try {
      const response = await axios.get(
        `http://localhost/fchms/app/api_fchms/allavailabilityfaculty/fetch-facultyname.php`
      );

      if (response.data.success) {
        setFetchAvailabilityFaculty(response.data.data);
      } else {
        setFetchAvailabilityFaculty([]);
      }
    } catch (error) {
      console.error("Error fetching faculty availability:", error);
    }
  };

  // ✅ Save consultation
  const handleSaveConsultation = async () => {
    if (!selectedFaculty || !selectedTime || !subject) {
      alert("Please fill all required fields (faculty, time, subject).");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost/fchms/app/api_fchms/consultations/save-consultation.php`,
        {
          student_id: loggedInUserId,
          faculty_id: selectedFaculty,
          date: selectedDate,
          time: selectedTime,
          subject,
          notes,
        }
      );

      if (response.data.success) {
        alert("Consultation booked successfully!");
        setOpenDialog(false);
        setSubject("");
        setNotes("");
        setSelectedTime("");
        setSelectedFaculty("");
      } else {
        alert("Failed to book consultation.");
      }
    } catch (error) {
      console.error("Error saving consultation:", error);
      alert("An error occurred while saving.");
    }
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
          {calendarDays.map(({ date, currentMonth }, idx) => {
            const availabilities = getFacultyForDate(date);
            const faculty =
              availabilities.length > 0 ? availabilities[0] : null;

            return (
              <div
                key={idx}
                onClick={() => openDateDialog(date)} // Opens consultation booking
                className={`h-16 sm:h-28 border flex flex-col items-start p-1 sm:p-2 cursor-pointer
          ${!currentMonth ? "text-gray-400 bg-gray-50" : "bg-white"}
          ${isToday(date) ? "bg-gray-200 font-bold" : ""}
          hover:bg-green-100`}
              >
                {/* Date Number */}
                <div className="self-end">{date.getDate()}</div>

                {/* Faculty Username - Centered */}
                {faculty && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      const clickedDay = availabilities[0].availability_name;
                      const facultyDayAvailabilities = AvailabilityFetch.filter(
                        (f) =>
                          f.username === faculty.username &&
                          f.availability_name === clickedDay
                      );

                      setFacultyDialog({
                        username: faculty.username,
                        day: clickedDay,
                        availabilities: facultyDayAvailabilities,
                      });
                    }}
                    className="w-full text-center text-green-800 text-xs sm:text-sm font-medium underline hover:text-green-600"
                  >
                    {faculty.username}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Faculty Availability Modal */}
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
                  on <span className="font-semibold">{facultyDialog.day}</span>.
                </p>

                <DialogHeader>
                  <DialogTitle className="text-m font-semibold">
                    {facultyDialog.username} — {facultyDialog.day}
                  </DialogTitle>
                </DialogHeader>

                <div className="mt-3 text-sm text-gray-700 space-y-2">
                  {facultyDialog.availabilities.map((a, i) => (
                    <div key={i} className="border p-2 rounded-md bg-gray-50">
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

        {/* Booking Modal */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent
            className="w-full sm:max-w-md sm:rounded-lg sm:h-auto h-[60vh] fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-6 p-4 overflow-y-auto"
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
                  onValueChange={(val) => setSelectedFaculty(val)}
                >
                  <SelectTrigger id="faculty" className="w-full">
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {AvailabilityFaculty.length > 0 ? (
                      AvailabilityFaculty.map((faculty) => (
                        <SelectItem
                          key={faculty.user_id}
                          value={faculty.user_id}
                        >
                          {faculty.username}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled>No availability Found</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Time */}
              <div>
                <Label className="pb-2 sm:pb-4">Time</Label>
                <Select
                  value={selectedTime}
                  onValueChange={(val) => setSelectedTime(val)}
                >
                  <SelectTrigger className="w-full border border-black text-black">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
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
                  onClick={handleSaveConsultation}
                >
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
