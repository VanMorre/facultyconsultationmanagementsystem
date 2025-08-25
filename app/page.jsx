"use client";
import dynamic from "next/dynamic";

const ClientOnlyApp = dynamic(() => Promise.resolve(App), { ssr: false });
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./users/routes/ProtectedRoute";
import AdminDashboard from "./users/admin/admindashboard/page";
import TeacherDashboard from "./users/teacher/teacherdashboard/page";
import StudentDashboard from "./users/student/studentdashboard/page";

import Login from "./loginpage/page";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
   
      </Routes>
    </Router>
  );
}

// ✅ Export only the client-safe version
export default function Root() {
  return <ClientOnlyApp />;
}
 
