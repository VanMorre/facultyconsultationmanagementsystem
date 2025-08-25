import { TbCalendar, TbWaveSawTool } from "react-icons/tb";
import { FaClipboardList, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler
);

const ReportManagement = () => {
  const SECRET_KEY = "my_secret_key_123456";
  const [loggedInUserId, setLoggedInUserId] = useState(null);

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
  }, [loggedInUserId]);

  // Chart sample data
  const barData = {
    labels: ["Information Assurance 1", "Information Assurance 1", "Capstone 1" , "Capstone 2 " ],
    datasets: [
      {
        label: "Consultations",
        data: [18, 13, 10 , 5],
        backgroundColor: "rgba(97, 96, 28, 0.7)",
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false, // ✅ prevents auto-stretching
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        barPercentage: 0.6, // % of available category width
        categoryPercentage: 0.8, // % space taken by bars per group
        ticks: { font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5, font: { size: 12 } },
      },
    },
    datasets: {
      bar: {
        maxBarThickness: 100, // ✅ keeps bar width stable regardless of resize
      },
    },
  };

  // Animation for cards
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white p-6 shadow-md">
        <h1 className="text-l font-bold mb-4 text-green-800 pb-5 mt-3 flex items-center gap-2">
          <TbWaveSawTool className="text-xl w-6 h-6" />
          Reports
        </h1>

        {/* Action buttons */}
        <div className="flex items-center gap-4 pt-6 mb-6">
          <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
            Generate Report
          </button>

          <button className="flex items-center gap-2 border border-green-800 text-green-800 px-4 py-2 rounded-lg transition-colors duration-300 hover:bg-green-800 hover:text-white">
            <TbCalendar className="h-5 w-5 transition-colors duration-300" />
            Filter Reports by Date
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4 }}
            className="border bg-white p-5 h-25 rounded-lg shadow-lg flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-green-800 font-semibold">
                Total Consultations
              </p>
              <h2 className="text-2xl font-bold text-green-800">74</h2>
            </div>
            <div className="bg-green-900 text-white p-3 rounded-full">
              <FaClipboardList className="text-xl" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5 }}
            className="border bg-white p-5 h-25 rounded-lg shadow-lg flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-green-800 font-semibold">Completed</p>
              <h2 className="text-2xl font-bold text-green-800">38</h2>
            </div>
            <div className="bg-green-900 text-white p-3 rounded-full">
              <FaCheckCircle className="text-xl" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.6 }}
            className="border bg-white p-5 h-25 rounded-lg shadow-lg flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-green-800 font-semibold">Cancelled</p>
              <h2 className="text-2xl font-bold text-green-800">7</h2>
            </div>
            <div className="bg-green-900 text-white p-3 rounded-full">
              <FaTimesCircle className="text-xl" />
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="text-md font-bold text-green-800 mb-4">
            Consultation on Department
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
