"use client";
import React, { useState } from 'react';
import AdminSidebar from '../../admin/layouts/adminsidebar';
import AdminHeader from '../../admin/layouts/adminheader';

const AdminLayout = ({ children, currentView, setCurrentView }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        setCurrentView={setCurrentView}
        currentView={currentView}
      />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <AdminHeader toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} 
          setCurrentView={setCurrentView}
          />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;