"use client";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./pages/routes/ProtectedRoute";
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
              <PurchaserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StoreDashboard />
            </ProtectedRoute>
          }
        />
   
      </Routes>
    </Router>
  );
}

export default App;
 
