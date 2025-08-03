import React, { useState } from "react";
import { Button } from "@/components/ui/button";


import { LayoutDashboard } from "lucide-react";

const AdminSidebar = ({ collapsed, setCurrentView, currentView }) => {
  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } bg-white transition-all duration-300 overflow-hidden`}
    >

      
      <div className="p-4 mt-2 flex flex-col items-center">
        <img
          src="/images/coclogo-removebg.png"
          alt="PatientCare Logo"
          className={`transition-opacity duration-300 ${
            collapsed ? "w-12 opacity-0" : "w-36 opacity-100"
          } h-auto`}
        />
        {!collapsed && (
          <p className="mt-2 text-sm font-semibold text-black text-center border-b border-black pb-2">
           FCHMS PORTAL
          </p>
        )}
      </div>

      <nav className="space-y-5 mt-3">
        <Button
          variant="ghost"
          className={`w-full justify-start text-black ${
            currentView === "dashboard" ? "bg-gray-200" : ""
          }`}
          onClick={() => setCurrentView("dashboard")}
        >
          <LayoutDashboard
            className="mr-1"
            style={{ height: "28px", width: "35px", color: "#FF5733" }}
          />
          {!collapsed && <span className="font-semibold">Dashboard</span>}
        </Button>




    
      </nav>
    </aside>
  );
};

export default AdminSidebar;
