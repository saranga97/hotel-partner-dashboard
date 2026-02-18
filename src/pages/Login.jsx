import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      localStorage.setItem("ceylonstay_token", token);
      localStorage.setItem("ceylonstay_user", user);

      toast.success("Welcome to Partner Dashboard!");
      navigate("/");
    } else {
      // Check if already logged in
      const storedToken = localStorage.getItem("ceylonstay_token");
      const storedUser = localStorage.getItem("ceylonstay_user");

      if (storedToken && storedUser) {
        navigate("/");
      } else {
        // No credentials at all — redirect back to main login
        toast.error("Please login from the main website.");
        window.location.href = "http://localhost:5173/login";
      }
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Redirecting to your dashboard...</p>
    </div>
  );
};

export default Login;
