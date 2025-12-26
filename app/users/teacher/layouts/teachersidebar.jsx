import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FiBell } from "react-icons/fi";
import axios from "axios";
import CryptoJS from "crypto-js";

import { LayoutDashboard } from "lucide-react";
import {
  TbCalendarCheck,
  TbClipboardText,
  TbMailFilled,
  TbChartLine,
  TbSettings2,
} from "react-icons/tb";

const TeacherSidebar = ({ collapsed, setCurrentView, currentView }) => {
  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const SECRET_KEY = "my_secret_key_123456";

  useEffect(() => {
    const decryptUserId = () => {
      const encryptedUserId = sessionStorage.getItem("user_id");
      if (encryptedUserId) {
        try {
          const bytes = CryptoJS.AES.decrypt(encryptedUserId, SECRET_KEY);
          let decryptedUserId = bytes.toString(CryptoJS.enc.Utf8);
          decryptedUserId = decryptedUserId.replace(/^"|"$/g, "");
          const numericId = parseInt(decryptedUserId, 10);
          if (!isNaN(numericId)) {
            return numericId;
          }
        } catch (error) {
          console.error("Error decrypting user ID:", error);
        }
      }
      return null;
    };

    const fetchPendingBookingsCount = async () => {
      const userId = decryptUserId();
      if (!userId) return;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/fchms/app/api_fchms/studentside/bookconsultation/fetch-bookconsultation.php`,
          { params: { user_id: userId } }
        );

        if (response.data.success) {
          const bookings = response.data.data;
          const pendingCount = bookings.filter(
            (b) => b.approval_name !== "Completed"
          ).length;
          setPendingBookingsCount(pendingCount);
        }
      } catch (error) {
        console.error("Error fetching pending bookings count:", error);
      }
    };

    fetchPendingBookingsCount();
    const interval = setInterval(fetchPendingBookingsCount, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-62"
      } bg-white shadow-2xl transition-all duration-300 overflow-hidden`}
    >
      <div className="p-4 flex items-center justify-center pl-1 bg-green-900 shadow-xl">
        <Image
          src="/images/coclogo-removebg.png"
          alt="PatientCare Logo"
          width={80}
          height={80}
          className={`transition-all duration-300 ${
            collapsed ? "w-20 opacity-100" : "w-20"
          } h-auto`}
          priority
        />
        {!collapsed && (
          <div className="flex flex-col items-start pb-1">
            <p className="text-m font-semibold text-white pb-0 leading-tight">
              Faculty Consultation
            </p>
            <p className="text-m font-semibold text-white pb-1 text-center">
              Hours Portal - CITE.
            </p>
            <div className="w-full border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <nav className="space-y-6 mt-10 ">
        <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "dashboard" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("dashboard")}
        >
          <LayoutDashboard
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && <span className="font-semibold">Dashboard</span>}
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "availability" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("availability")}
        >
          <TbCalendarCheck
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && (
            <span className="pr-8 font-semibold"> My Availability</span>
          )}
        </Button>

        {/* <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "subjects" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("subjects")}
        >
          <MdMenuBook
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && <span className="pr-8 font-semibold">Subjects List</span>}
        </Button> */}
{/* 
        <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "consultation" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("consultation")}
        >
          <TbClipboardText
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && (
            <span className="pr-8 font-semibold">My Consultation</span>
          )}
        </Button> */}

        <Button
          variant="ghost"
          className={`w-full justify-between text-black ${
            currentView === "studentrequest" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("studentrequest")}
        >
          <div className="flex items-center justify-start">
            <TbMailFilled
              className="pr-2"
              style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
            />
            {!collapsed && (
              <span className="font-semibold ml-1">Consultations</span>
            )}
          </div>
          {!collapsed && (
            <div className="relative ml-auto">
              <FiBell className="w-7 h-7 text-blue-500" />
              {pendingBookingsCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold">
                  {pendingBookingsCount}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-white text-[10px] font-bold">
                  0
                </span>
              )}
            </div>
          )}
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "reports" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("reports")}
        >
          <TbChartLine
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && <span className="pr-8 font-semibold">Reports</span>}
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "Settings" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("Settings")}
        >
          <TbSettings2
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36" }}
          />
          {!collapsed && <span className="pr-8 font-semibold">Settings</span>}
        </Button>
      </nav>
    </aside>
  );
};

export default TeacherSidebar;
