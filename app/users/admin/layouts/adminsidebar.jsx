import React, { useState } from "react";
import { Button } from "@/components/ui/button";

import { LayoutDashboard } from "lucide-react";
import {
  TbCalendarCheck,
  TbClipboardText,
  TbUsers,
  TbBuildingCommunity,
  TbReport
} from "react-icons/tb";

const AdminSidebar = ({ collapsed, setCurrentView, currentView }) => {
  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } bg-white shadow-2xl transition-all duration-300 overflow-hidden`}
    >
      <div className="p-4 mt-2 flex items-center justify-center gap-x-1 pl-2">
        <img
          src="/images/coclogo-removebg.png"
          alt="PatientCare Logo"
          className={`transition-all duration-300 ${
            collapsed ? "w-24 opacity-100" : "w-24"
          } h-auto`}
        />
        {!collapsed && (
          <p className="text-m font-semibold text-black  pb-1">FCHMS PORTAL</p>
        )}
      </div>

      <nav className="space-y-5 mt-3 ">
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
            <span className="pr-8 font-semibold">Availability</span>
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
            <span className="pr-8 font-semibold">Consultation</span>
          )}
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "faculty" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("faculty")}
        >
          <TbUsers
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && <span className="pr-8 font-semibold">Faculty</span>}
        </Button>

        <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "departments" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("departments")}
        >
          <TbBuildingCommunity
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && (
            <span className="pr-8 font-semibold">Departments</span>
          )}
        </Button>


          <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "reports" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("reports")}
        >
          <TbReport
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#6e7a36ff" }}
          />
          {!collapsed && (
            <span className="pr-8 font-semibold">Reports</span>
          )}
        </Button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
