import React, { useEffect, useState, createContext, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // <-- Fixed here
import axios from 'axios';
import { toast } from 'react-toastify';



// Create AuthContext to share user data globally
const AuthContext = createContext();

// Custom hook to use AuthContext easily
export const useAuth = () => useContext(AuthContext);

// ----- AUTH PROVIDER -----
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode user from token
        const decodedUser = jwtDecode(token);  // <-- Fixed here
        setUser(decodedUser);
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Invalid Token:', error);
        localStorage.removeItem('token');
        toast.error('Invalid session. Please log in again.');
      }
    }

    // Global axios interceptor for 401 errors
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          // toast.error('Session expired. Please log in again.');
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

// ----- ADMIN ROUTE -----
export const AdminRoute = () => {
  const { user } = useAuth();

  if (user === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return user.role === 'Admin' || user.role ==='SuperAdmin' ? <Outlet /> : <Navigate to="/login" replace />;
};

// ----- CUSTOMER ROUTE -----
export const CustomerRoute = () => {
  const { user } = useAuth();

  if (user === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        {/* <Navigate to="/login" replace /> */}
      </div>
    );
  }

  return user.role=== 'Customer' ? <Outlet /> : <Navigate to="/" replace />;
};
