"use client";
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
  Filler
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
import { Line } from "react-chartjs-2";

import CryptoJS from "crypto-js";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect , useRef } from "react";

import AdminLayout from "../layouts/adminlayout";


import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);


const AdminDashboard = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [fadeTransition, setFadeTransition] = useState(false);

  

  const SECRET_KEY = "my_secret_key_123456";


  // 1) decrypt on mount
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





  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };
  const chartVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <AdminLayout
      currentView={currentView}
      setCurrentView={(v) => {
        if (v !== currentView) {
          setFadeTransition(true);
          setTimeout(() => {
            setCurrentView(v);
            setTimeout(() => setFadeTransition(false), 50);
          }, 300);
        }
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={`transition-opacity duration-300 ${
          fadeTransition ? "opacity-0" : "opacity-100"
        }`}
      >
        {currentView === "dashboard" && (
          <>
            {isLoading ? (
              <p className="text-center py-20 text-gray-500">
                Loading dashboard…
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="col-span-4 grid grid-cols-4 gap-4">
                  {cardData.map((card, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className={`${card.bg} shadow-md rounded-md p-5 flex items-center justify-between`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div>
                        <h2 className="text-md font-semibold text-gray-700">
                          {card.title}
                        </h2>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {card.value}
                        </p>
                      </div>
                      <div
                        className={`rounded-full p-3 ${card.iconBg} flex items-center justify-center`}
                      >
                        {card.icon}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  variants={chartVariants}
                  className="bg-white p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-black">
                      Teacher consultation render hours
                    </h2>
                    <motion.select
                      whileHover={{ scale: 1.05 }}
                      className="border rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#00856F]"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="0">All</option>
                      {[
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
                      ].map((m, idx) => (
                        <option key={idx} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </motion.select>
                  </div>
                  <div className="h-[300px]">
                    <Line
                      data={{
                        labels: [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ],
                        datasets: [
                          {
                            label: "RenderHours",
                         
                            borderColor: "#00856F",
                            backgroundColor: "#d1fae5",
                            tension: 0.4,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "top" } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            )}
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



          </>
        )}
   
       
      </motion.div>
    </AdminLayout>
  );
};
export default AdminDashboard;
