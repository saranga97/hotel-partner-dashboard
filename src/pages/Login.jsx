import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Hotel } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { Alert, Button, FormInput } from "../components/ui";

// Three ways to land here, decided once on mount (no query-param/localStorage
// re-checks on every render, no flash of the wrong screen):
//  - "handoff": tripora-frontend redirected here with ?token=&user= — stored
//    and forwarded into the dashboard automatically. UNCHANGED behavior.
//  - "existing-session": already has a stored session — forwarded in immediately.
//  - "form": neither of the above — show a native login form so hotel partners
//    can sign in to the dashboard directly, without going through the frontend.
const resolveMode = () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("token") && params.get("user")) return "handoff";
  if (localStorage.getItem("ceylonstay_token") && localStorage.getItem("ceylonstay_user")) return "existing-session";
  return "form";
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode] = useState(resolveMode);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "handoff") {
      const params = new URLSearchParams(window.location.search);
      localStorage.setItem("ceylonstay_token", params.get("token"));
      localStorage.setItem("ceylonstay_user", params.get("user"));
      const timer = setTimeout(() => navigate("/"), 1000);
      return () => clearTimeout(timer);
    }
    if (mode === "existing-session") {
      navigate("/");
    }
  }, [mode, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!emailOrPhone.trim() || !password) {
      setFormError("Enter your email/phone and password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axiosInstance.post("/auth/login", {
        email_or_phone: emailOrPhone.trim(),
        password,
      });
      const { token, user } = res.data;

      if (user?.role?.toUpperCase() !== "HOTEL") {
        setFormError("This dashboard is for hotel partners only.");
        return;
      }

      login(token, user);
      navigate("/");
    } catch (err) {
      setFormError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (mode !== "form") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5 mx-auto shadow-sm shadow-primary/30">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          {mode === "handoff" && (
            <Alert variant="success" className="mb-4 inline-flex">Welcome to Partner Dashboard!</Alert>
          )}
          <div className="flex items-center justify-center gap-2.5 text-muted">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-3">
            <Hotel className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Partner Login</h1>
          <p className="text-muted text-sm mt-1">Sign in to manage your hotel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-brand-border shadow-sm p-6 space-y-4">
          {formError && <Alert variant="error">{formError}</Alert>}

          <FormInput
            label="Email or phone number"
            placeholder="you@example.com"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
          />
          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" loading={submitting} className="w-full" size="lg">
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Not a hotel partner?{" "}
          <a href={import.meta.env.VITE_APP_URL} className="text-primary font-medium hover:underline">
            Go to the main site
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
