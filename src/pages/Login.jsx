import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../components/ui";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState(null);
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
      const storedToken = localStorage.getItem("ceylonstay_token");
      const storedUser = localStorage.getItem("ceylonstay_user");

      if (storedToken && storedUser) {
        navigate("/");
      } else {
        setStatus("error");
        setMessage("Please login from the main website.");
        setTimeout(() => {
          window.location.href = `${import.meta.env.VITE_APP_URL}/login`;
        }, 2000);
      }
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {status === "success" && (
          <Alert variant="success" className="mb-4 inline-flex">{message}</Alert>
        )}
        {status === "error" && (
          <Alert variant="error" className="mb-4 inline-flex">{message}</Alert>
        )}
        <p className="text-gray-500 text-lg">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default Login;
