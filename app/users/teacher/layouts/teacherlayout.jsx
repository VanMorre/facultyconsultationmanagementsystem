"use client";
import React, { useState } from 'react';
import TeacherSidebar from '../../teacher/layouts/teachersidebar';
import TeacherHeader from '../../teacher/layouts/teacherheader';

const TeacherLayout = ({ children, currentView, setCurrentView }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <TeacherSidebar
        collapsed={sidebarCollapsed}
        setCurrentView={setCurrentView}
        currentView={currentView}
      />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <TeacherHeader toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
          setCurrentView={setCurrentView}
          />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default TeacherLayout;