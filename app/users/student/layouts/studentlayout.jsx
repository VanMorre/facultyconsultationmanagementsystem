"use client";
import React, { useState } from 'react';
import StudentSidebar from '../../student/layouts/studentsidebar';
import StudentHeader from '../../student/layouts/studentheader';

const TeacherLayout = ({ children, currentView, setCurrentView }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar
        collapsed={sidebarCollapsed}
        setCurrentView={setCurrentView}
        currentView={currentView}
      />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <StudentHeader toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
          setCurrentView={setCurrentView}
          />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default TeacherLayout;