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
import { TbTruckLoading, TbArrowsExchange } from "react-icons/tb";
import CryptoJS from "crypto-js";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useState, useEffect , useRef } from "react";
import ProfileView from "./components/profileview";
import WarehouseLayout from "../layouts/warehouselayout";
import StockReceiving from "./components/stockreceiving";
import Stockreceivinglogs from "./components/stockreceivinglogs";
import StoreInventory from "./components/storeinventory";
import WarehouseInventory from "./components/warehouseinventory";
import Warehousestocktransfer from "./components/stocktransfer";
import Warehousedadjustments from "./components/warehouseadjustments";

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


const WarehouseDashboard = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [fadeTransition, setFadeTransition] = useState(false);

  
  const [selectedMonth, setSelectedMonth] = useState("0");
  const SECRET_KEY = "my_secret_key_123456";
  const [transferprods, setTransferprods] = useState([]);
  const [stockReceiveds, setStockReceiveds] = useState([]);
  const [monthlyOrderCounts, setMonthlyOrderCounts] = useState(
    Array(12).fill(0)
  );

  // show loading until both fetches complete
  const [isLoading, setIsLoading] = useState(true);

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


  // 2) once we have an ID, fetch both
  useEffect(() => {
    decryptUserId();
  }, []);

  
  useEffect(() => {
    const fetchData = async () => {
      if (!loggedInUserId) return;

      await Promise.all([
      fetchstockreceiving(), 
      fetchtransferstock (),
    
    ]);
      setIsLoading(false);
    };
    fetchData();

    const interval = setInterval(() => {
      fetchstockreceiving();
      fetchtransferstock ();
    }, 1000);

    return () => clearInterval(interval);
  }, [loggedInUserId]);




useEffect(() => {
  const stockIds = sessionStorage.getItem("notified_stockreceiving_ids");
  const transferIds = sessionStorage.getItem("notified_transferstock_ids");

  if (stockIds) {
    notifiedStockReceivingRef.current = JSON.parse(stockIds);
  }

  if (transferIds) {
    notifiedTransferRef.current = JSON.parse(transferIds);
  }
}, []);



const notifiedStockReceivingRef = useRef([]);
const hasInitialStockReceivingRun = useRef(false);
const notifiedTransferRef = useRef([]);
const hasInitialTransferRun = useRef(false);



const fetchstockreceiving = async () => {
  try {
    const response = await axios.get(
      "http://localhost/rai/app/api_raielectrical/stockreceiving/fetchstockreceiving.php"
    );

    if (response.data.success) {
      const orders = response.data.data;
      setStockReceiveds(orders);

      const orderIds = orders.map((o) => o.receivingheader_id);
      const newlyAdded = orderIds.filter(
        (id) => !notifiedStockReceivingRef.current.includes(id)
      );

      if (hasInitialStockReceivingRun.current && newlyAdded.length > 0) {
        // Removed toast.success

        notifiedStockReceivingRef.current = [
          ...notifiedStockReceivingRef.current,
          ...newlyAdded,
        ];
        sessionStorage.setItem(
          "notified_stockreceiving_ids",
          JSON.stringify(notifiedStockReceivingRef.current)
        );
      }

      hasInitialStockReceivingRun.current = true;

      const counts = Array(12).fill(0);
      orders.forEach((o) => {
        const month = new Date(o.receiving_date).getMonth();
        counts[month]++;
      });
      setMonthlyOrderCounts(counts);
    } else {
      setStockReceiveds([]);
      setMonthlyOrderCounts(Array(12).fill(0));
    }
  } catch (error) {
    console.error("Error fetching stock receiving:", error);
    setStockReceiveds([]);
    setMonthlyOrderCounts(Array(12).fill(0));
  }
};




const fetchtransferstock = async () => {
  try {
    const response = await axios.get(
      "http://localhost/rai/app/api_raielectrical/transferstock/fetchtransferstock.php"
    );

    if (response.data.success) {
      const transfers = response.data.data;
      setTransferprods(transfers);

      const transferIds = transfers.map((t) => t.stocktransferheader_id);
      const newlyAdded = transferIds.filter(
        (id) => !notifiedTransferRef.current.includes(id)
      );

      if (hasInitialTransferRun.current && newlyAdded.length > 0) {
        // Removed toast.success

        notifiedTransferRef.current = [
          ...notifiedTransferRef.current,
          ...newlyAdded,
        ];
        sessionStorage.setItem(
          "notified_transferstock_ids",
          JSON.stringify(notifiedTransferRef.current)
        );
      }

      hasInitialTransferRun.current = true;
    } else {
      setTransferprods([]);
    }
  } catch (error) {
    console.error("Error fetching transfer stock:", error);
    setTransferprods([]);
  }
};


  const totalReceived = stockReceiveds.length;
  const totalTransfer = transferprods.length;

  // if "All" show full array, otherwise zero‑out the non‑selected
  const filteredData =
    selectedMonth === "0"
      ? monthlyOrderCounts
      : monthlyOrderCounts.map((c, i) =>
          i + 1 === parseInt(selectedMonth, 10) ? c : 0
        );

  const cardData = [
    {
      title: "No. of Purchase Order Received",
      value: totalReceived,
      bg: "bg-red-200",
      iconBg: "bg-red-500",
      icon: <TbTruckLoading size={28} className="text-white" />,
    },
    {
      title: "No. Products Transfer",
      value: totalTransfer,
      bg: "bg-red-200",
      iconBg: "bg-red-500",
      icon: <TbArrowsExchange size={28} className="text-white" />,
    },
  ];

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
    <WarehouseLayout
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
                      Received Charts
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
                            label: "Receiveds",
                            data: filteredData,
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
        {currentView === "profile" && <ProfileView />}
        {currentView === "stockreceive" && <StockReceiving />}
        {currentView === "stocklogs" && <Stockreceivinglogs />}
        {currentView === "warehouse_inventory" && <WarehouseInventory />}
        {currentView === "store_inventory" && <StoreInventory />}
        {currentView === "stocktransfer" && <Warehousestocktransfer />}
        {currentView === "warehouseadjustments" && <Warehousedadjustments />}
      </motion.div>
    </WarehouseLayout>
  );
};
export default WarehouseDashboard;
