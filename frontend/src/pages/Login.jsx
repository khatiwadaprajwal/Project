import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../component/ProtectedRoutes";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const {  setToken} = useContext(ShopContext);
  const {user, setUser} = useAuth();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/v1/auth/login", {
        email,
        password,
      });

      if (response.status === 200) {
        // Store token
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);

        // Decode token to get role (Optional here as AuthProvider will handle this on refresh)
        const decoded = jwtDecode(response.data.token);
        localStorage.setItem("user", JSON.stringify(decoded));
        

        // Redirect based on role
        const user = JSON.parse(localStorage.getItem("user"));
        setUser(user);
        if (decoded.role === "Admin") {
          navigate("/admin");
        } else if (decoded.role === "Customer") {
          navigate("/");
        } else {
          navigate("/login");
        }
        toast.success(
                  "Login successful"
                );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="hidden md:block md:w-1/2 bg-blue-50">
          <img
            src={assets.banner}
            alt="Shopping Cart with Smartphone"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold mb-2">Log in to Dkp</h1>
            <p className="text-gray-600 mb-8">Enter your details below</p>

            {error && (
              <p className="text-red-500 mb-4 p-3 bg-red-50 rounded">{error}</p>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email or Phone Number"
                  required
                  className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 border-b border-gray-300 focus:border-gray-900 focus:outline-none bg-transparent"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-8 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </button>
                <Link
                  to="/forgot-password"
                  className="text-red-500 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
