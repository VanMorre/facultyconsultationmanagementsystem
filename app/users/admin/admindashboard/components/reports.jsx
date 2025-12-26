import { TbPrinter, TbWaveSawTool } from "react-icons/tb";
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect , useRef } from "react";
import CryptoJS from "crypto-js";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker"; // ✅ install react-datepicker
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { registerChartJS } from "@/lib/chart-config";
registerChartJS();

const ReportManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [fetchbooking, setfetchbooking] = useState([]);
  // ❗ Default to "no date filter" so all consultations show initially
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const notifiedBookingIdsRef = useRef([]);
  const toastShownBookingRef = useRef(false);


  
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
      const storedBooking = sessionStorage.getItem(
        "notified_booking_ids"
      );
      if (storedBooking) {
        notifiedBookingIdsRef.current = JSON.parse(storedBooking);
      }
      let isInitial = true;

      fetchbookingstudentWithNotify(loggedInUserId, isInitial);

      isInitial = false;

      const interval = setInterval(() => {
        fetchbookingstudentWithNotify(loggedInUserId, false);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [loggedInUserId]);


const fetchbookingstudentWithNotify = async (UserID, isInitial = false) => {
    try {
      const response = await axios.get(
        `
${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
        { params: { user_id: UserID } }
      );

      if (response.data.success) {
        const newBookings = response.data.data;

        // Extract unique booking IDs
        const currentIds = newBookings.map((item) => item.booking_id);

        // Find IDs that are new
        const newIds = currentIds.filter(
          (id) => !notifiedBookingIdsRef.current.includes(id)
        );

        if (
          !isInitial &&
          newIds.length > 0 &&
          !toastShownBookingRef.current
        ) {
          toastShownBookingRef.current = true;

          // ✅ Save notified IDs
          notifiedBookingIdsRef.current = [
            ...notifiedBookingIdsRef.current,
            ...newIds,
          ];

          sessionStorage.setItem(
            "notified_booking_ids",
            JSON.stringify(notifiedBookingIdsRef.current)
          );

          // Reset lock after delay
          setTimeout(() => {
            toastShownBookingRef.current = false;
          }, 5000);
        }

        // ✅ On initial fetch, just mark IDs
        if (isInitial) {
          notifiedBookingIdsRef.current = [
            ...notifiedBookingIdsRef.current,
            ...currentIds,
          ];
          sessionStorage.setItem(
            "notified_booking_ids",
            JSON.stringify(notifiedBookingIdsRef.current)
          );
        }

        setfetchbooking(newBookings);
      } else {
        setfetchbooking([]);
      }
    } catch (error) {
      console.error("Error fetching student booking:", error);
      setfetchbooking([]);
    }
  };

  // ✅ Filter consultations based on date range
  const filterData = () => {
    if (!fetchbooking || fetchbooking.length === 0) {
      return [];
    }

    // If either date is not set, do not filter by date
    if (!startDate || !endDate) {
      return fetchbooking;
    }

    return fetchbooking.filter((c) => {
      if (!c.booking_date) return true; // keep rows with no date

      const consultDate = new Date(c.booking_date);
      if (isNaN(consultDate.getTime())) return true;

      // Set time to start/end of day for accurate comparison
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      consultDate.setHours(0, 0, 0, 0);

      return consultDate >= start && consultDate <= end;
    });
  };

  const filteredConsultations = filterData();

  // ✅ Group by subject
  const subjects = [
    ...new Set(
      filteredConsultations
        .map((c) => c.subject_name)
        .filter((subject) => subject && subject.trim() !== "")
    ),
  ];
  const subjectCounts = subjects.map(
    (subject) =>
      filteredConsultations.filter((c) => c.subject_name === subject).length
  );

  // ✅ Chart Data
  const barData = {
    labels: subjects,
    datasets: [
      {
        label: "Consultations",
        data: subjectCounts,
        backgroundColor: "rgba(165, 160, 177, 1)",
        borderRadius: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      x: {
        barPercentage: 0.3, // thinner bars (lower = thinner)
        categoryPercentage: 0.5,
      },
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
    datasets: {
      bar: {
        maxBarThickness: 100, // ✅ maximum width per bar
      },
    },
  };

  // ✅ Counts
  const totalConsultations = filteredConsultations.length;
  const completedCount = filteredConsultations.filter(
    (c) => c.approval_name === "Completed"
  ).length;
  const cancelledCount = filteredConsultations.filter(
    (c) => c.approval_name === "Cancelled"
  ).length;

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

const generatePDF = () => {
  const doc = new jsPDF("landscape", "mm", "a4");

  const logoPath = "/images/CIT-ENCHANCEPIC.png";
  const pageWidth = doc.internal.pageSize.getWidth();

  // ❌ Removed watermark (center background logo)

  // --- HEADER (small logo + header text) ---
  const headerLogoSize = 25; // size of top-left logo
  doc.addImage(
    logoPath,
    "PNG",  
    15, // X position (left side)
    12, // Y position (align with header text)
    headerLogoSize,
    headerLogoSize
  );

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("College of Information Technology Education", pageWidth / 2, 20, {
    align: "center",
  });

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text("Phinma Cagayan de Oro College", pageWidth / 2, 28, {
    align: "center",
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Consultation Report", pageWidth / 2, 34, { align: "center" });

  // Separator line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(10, 40, pageWidth - 10, 40);

  // --- REPORT INFO ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 47);

  // --- TABLE HEADERS ---
  const tableColumn = [
    "Student name",
    "Subject",
    "Purpose",
    "Schedule date",
    "Time range",
    "Status",
    "Discussion",
    "Recommendation",
  ];

  let tableRows = [];
  if (filteredConsultations.length > 0) {
    tableRows = filteredConsultations.map((item) => [
      item.student_name || "N/A",
      item.subject_name || "N/A",
      item.purpose || "N/A",
      item.booking_date || "N/A",
      item.time_range ? formatTimeTo12Hour(item.time_range) : "N/A",
      item.approval_name || "N/A",
      item.discussion || "N/A",
      item.recommendation || "N/A",
    ]);
  } else {
    tableRows = [["No data available", "", "", "", "", "", "", ""]];
  }

  // --- RENDER TABLE ---
  autoTable(doc, {
    startY: 55,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [0, 100, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: 0,
      halign: "center",
    },
    styles: {
      cellPadding: 3,
      fontSize: 10,
    },
    didParseCell: (data) => {
      if (
        filteredConsultations.length === 0 &&
        data.row.index === 0 &&
        data.column.index === 0
      ) {
        data.cell.colSpan = 8;
      }
    },
    columnStyles: {
      0: { cellWidth: 38 }, // Student name
      1: { cellWidth: 36 }, // Subject
      2: { cellWidth: 30 }, // Purpose
      3: { cellWidth: 32 }, // Schedule date
      4: { cellWidth: 32 }, // Time range
      5: { cellWidth: 28 }, // Status
      6: { cellWidth: 37 }, // Discussion
      7: { cellWidth: 37 }, // Recommendation
    },
  });

  // --- TOTAL STUDENTS RENDERED ---
  if (filteredConsultations.length > 0) {
    const uniqueBookings = new Set(
      filteredConsultations.map((item) => item.booking_id)
    );
    const totalStudents = uniqueBookings.size;

    const finalY = doc.lastAutoTable.finalY || 90;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Total Number of Students Rendered: ${totalStudents}`,
      14,
      finalY + 10
    );
  }

  // --- SIGNATURE SECTION ---
  if (filteredConsultations.length > 0) {
    const finalY = doc.lastAutoTable.finalY || 100;
    const lineWidth = 50;
    const lineStartX = (pageWidth - lineWidth) / 2; // Center the line
    const lineEndX = lineStartX + lineWidth;
    const signatureY = finalY + 110;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const authorizedName =
      filteredConsultations[0]?.faculty_name || filteredConsultations[0]?.student_name || "Authorized Name";

    const textWidth = doc.getTextWidth(authorizedName);
    const textX = lineStartX + (lineWidth - textWidth) / 2;
    doc.text(authorizedName, textX, signatureY);

    doc.line(lineStartX, signatureY + 2, lineEndX, signatureY + 2);

    const label = "Authorized Name & Signature";
    const labelWidth = doc.getTextWidth(label);
    const labelX = lineStartX + (lineWidth - labelWidth) / 2;
    doc.text(label, labelX, signatureY + 8);
  }

  // --- OPEN PDF ---
  const pdfBlobUrl = doc.output("bloburl");
  const printWindow = window.open(pdfBlobUrl, "_blank");

  if (printWindow) {
    printWindow.addEventListener("load", () => {
      printWindow.focus();
      printWindow.print();
    });
  }
};


  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white p-6 shadow-md">
        <h1 className="text-l font-bold mb-4 text-green-800 pb-5 mt-3 flex items-center gap-2">
          <TbWaveSawTool className="text-xl w-6 h-6" /> Reports
        </h1>

        {/* Action buttons */}
        <div className="flex items-center gap-4 pt-6 mb-6">
          <button
            onClick={() => generatePDF()}
            className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg hover:bg-green-800 hover:text-white"
          >
            <TbPrinter className="h-5 w-5" /> Generate Report
          </button>
          
          {/* ✅ Date Range Picker */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-green-800 font-semibold">From:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              placeholderText="Start Date"
              className="border border-green-800 px-4 py-2 rounded-lg text-green-800"
            />
            <label className="text-sm text-green-800 font-semibold">To:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="border border-green-800 px-4 py-2 rounded-lg text-green-800"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <motion.div className="border bg-white p-5 rounded-lg shadow-lg flex justify-between items-center">
            <div>
              <p className="text-sm text-green-800 font-semibold">
                Total Consultations
              </p>
              <h2 className="text-2xl font-bold text-green-800">
                {totalConsultations}
              </h2>
            </div>
            <div className="bg-green-900 text-white p-3 rounded-full">
              <FaClipboardList className="text-xl" />
            </div>
          </motion.div>

          <motion.div className="border bg-white p-5 rounded-lg shadow-lg flex justify-between items-center">
            <div>
              <p className="text-sm text-green-800 font-semibold">Completed</p>
              <h2 className="text-2xl font-bold text-green-800">
                {completedCount}
              </h2>
            </div>
            <div className="bg-green-900 text-white p-3 rounded-full">
              <FaCheckCircle className="text-xl" />
            </div>
          </motion.div>

          <motion.div className="border bg-white p-5 rounded-lg shadow-lg flex justify-between items-center">
            <div>
              <p className="text-sm text-green-800 font-semibold">Cancelled</p>
              <h2 className="text-2xl font-bold text-green-800">
                {cancelledCount}
              </h2>
            </div>
            <div className="bg-green-900 text-white p-3 rounded-full">
              <FaTimesCircle className="text-xl" />
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-md font-bold text-green-800 mb-4">
            Consultation per Subject
          </h2>
          <div className="h-[400px] w-full">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ReportManagement;
