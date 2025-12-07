"use client";
import React, { useState } from "react";
import StudentSidebar from "../../student/layouts/studentsidebar";
import StudentHeader from "../../student/layouts/studentheader";
import { FiChevronLeft } from "react-icons/fi";
const TeacherLayout = ({ children, currentView, setCurrentView }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ✅ Sidebar */}
      {/* Desktop */}
      <div className="hidden md:block">
        <StudentSidebar
          collapsed={false}
          setCurrentView={setCurrentView}
          currentView={currentView}
        />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 flex md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar itself */}
        <div className="relative w-3/4 max-w-[280px] h-full bg-white shadow-lg flex flex-col">
          {/* Close Arrow Button - Centered vertically on the edge */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-1/2 -right-16 transform -translate-y-1/2 bg-green-800 hover:bg-green-900 rounded-full p-1 shadow-md"
          >
            <FiChevronLeft className="h-5 w-5 text-white" />
          </button>

          {/* Sidebar Content */}
          <StudentSidebar
            collapsed={false}
            setCurrentView={setCurrentView}
            currentView={currentView}
          />
        </div>

        {/* Clickable transparent area to close */}
        <div className="flex-1" onClick={() => setSidebarOpen(false)} />
      </div>

      {/* ✅ Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          setCurrentView={setCurrentView}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default TeacherLayout;
