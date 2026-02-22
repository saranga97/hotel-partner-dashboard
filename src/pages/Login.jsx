import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, AlertCircle } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      localStorage.setItem("ceylonstay_token", token);
      localStorage.setItem("ceylonstay_user", user);

      setStatus("success");
      setMessage("Welcome to Partner Dashboard!");
      setTimeout(() => navigate("/"), 1000);
    } else {
      // Check if already logged in
      const storedToken = localStorage.getItem("ceylonstay_token");
      const storedUser = localStorage.getItem("ceylonstay_user");

      if (storedToken && storedUser) {
        navigate("/");
      } else {
        // No credentials at all — redirect back to main login
        setStatus("error");
        setMessage("Please login from the main website.");
        setTimeout(() => {
          window.location.href = "http://localhost:5173/login";
        }, 2000);
      }
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === "success" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 font-medium mb-4">
            <Check className="h-4 w-4" />
            {message}
          </div>
        )}
        {status === "error" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 font-medium mb-4">
            <AlertCircle className="h-4 w-4" />
            {message}
          </div>
        )}
        <p className="text-gray-500 text-lg">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Login;
