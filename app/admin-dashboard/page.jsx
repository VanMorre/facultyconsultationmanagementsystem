"use client";

import ProtectedRoute from "@/app/users/routes/protectedroute";
import AdminDashboard from "@/app/users/admin/admindashboard/page";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}

