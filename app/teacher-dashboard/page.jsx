"use client";

import ProtectedRoute from "@/app/users/routes/protectedroute";
import TeacherDashboard from "@/app/users/teacher/teacherdashboard/page";

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["teacher"]}>
      <TeacherDashboard />
    </ProtectedRoute>
  );
}

