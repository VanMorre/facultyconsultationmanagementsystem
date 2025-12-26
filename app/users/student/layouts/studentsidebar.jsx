import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

import { LayoutDashboard } from "lucide-react";
import { TbCalendarCheck, TbClipboardText, TbSettings2 } from "react-icons/tb";

const StudentSidebar = ({ collapsed, setCurrentView, currentView }) => {
  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } h-full bg-white shadow-2xl transition-all duration-300 overflow-y-auto`}
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
            currentView === "bookconsultation" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("bookconsultation")}
        >
          <TbCalendarCheck
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && (
            <span className="pr-8 font-semibold"> Book Consultation </span>
          )}
        </Button>

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

export default StudentSidebar;
