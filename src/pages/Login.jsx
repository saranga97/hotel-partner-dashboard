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
      console.log(user);
      localStorage.setItem("ceylonstay_token", token);
      localStorage.setItem("ceylonstay_user", user);

      toast.success("Welcome to Partner Dashboard!");

      // Redirect to dashboard home
      navigate("/"); // <-- This is the correct path (your dashboard is '/')
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Redirecting to your dashboard...</p>
    </div>
  );
};

export default Login;
