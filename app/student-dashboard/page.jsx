"use client";

import ProtectedRoute from "@/app/users/routes/protectedroute";
import StudentDashboard from "@/app/users/student/studentdashboard/page";

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentDashboard />
    </ProtectedRoute>
  );
}

