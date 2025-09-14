"use client";
import dynamic from "next/dynamic";

const ClientOnlyApp = dynamic(() => Promise.resolve(App), { ssr: false });
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./users/routes/ProtectedRoute";
import AdminDashboard from "./users/admin/admindashboard/page";
import TeacherDashboard from "./users/teacher/teacherdashboard/page";
import StudentDashboard from "./users/student/studentdashboard/page";
import Forgotpasswordfacultyemailform from "./forgotpassword-facultyemailform/page";
import Forgotpasswordfacultycreatenewpassword from "./forgotpassword-facultycreatenewpassword/page";
import Forgotpasswordstudentemailform from "./forgotpassword-studentmailform/page";
import Forgotpasswordstudentcreatenewpassword from "./forgotpassword-studentcreatenewpassword/page";
import Login from "./loginpage/page";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/loginpage" element={<Login />} />
        <Route
          path="/forgotpassword-facultyemailform"
          element={<Forgotpasswordfacultyemailform />}
        />
        <Route
          path="/forgotpassword-facultycreatenewpassword"
          element={<Forgotpasswordfacultycreatenewpassword />}
        />
        <Route
          path="/forgotpassword-studentemailform"
          element={<Forgotpasswordstudentemailform />}
        />
        <Route
          path="/forgotpassword-studentcreatenewpassword"
          element={<Forgotpasswordstudentcreatenewpassword />}
        />

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
