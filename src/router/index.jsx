import { Routes, Route, Navigate } from "react-router-dom";
import Tom from "../pages/User/Tom";
import Files from "./../pages/Files/Files";
import Dashboard from "../pages/Dashboard/Dashboard";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/files" element={<Files />} />
      <Route path="/user/:id" element={<Tom />} />
    </Routes>
  );
}

export default Router;
