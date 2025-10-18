import { Routes, Route, Navigate } from "react-router-dom";
import Tom from "../pages/User/Tom";
import Files from "./../pages/Files/Files";
import Dashboard from "../pages/Dashboard/Dashboard";
import PropTypes from "prop-types";
import Login from "../pages/Auth/Login";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

function Router() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/files" 
        element={
          <ProtectedRoute>
            <Files />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user/:id" 
        element={
          <ProtectedRoute>
            <Tom />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default Router;