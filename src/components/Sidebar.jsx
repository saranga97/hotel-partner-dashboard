import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  BarChart3,
  LogOut,
  X,
  Hotel
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ConfirmDialog } from "./ui";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const links = [
    { name: "Home", icon: LayoutDashboard, path: "/" },
    { name: "Rooms", icon: BedDouble, path: "/rooms" },
    { name: "Bookings", icon: CalendarDays, path: "/bookings" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
  ];

  const confirmLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  const NavButton = ({ link }) => {
    const Icon = link.icon;
    const active = isActive(link.path);
    return (
      <button
        onClick={() => {
          navigate(link.path);
          setSidebarOpen(false);
        }}
        className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
          active
            ? "bg-primary text-white shadow-sm shadow-primary/30"
            : "text-slate-600 hover:bg-surface hover:text-slate-900"
        }`}
      >
        <Icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-muted"}`} />
        <span>{link.name}</span>
      </button>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-brand-border shadow-xl flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:shadow-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
          <button
            onClick={() => {
              navigate("/");
              setSidebarOpen(false);
            }}
            className="flex items-center space-x-3 group"
          >
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm shadow-primary/30 group-hover:bg-primary-dark transition-colors duration-200">
              <Hotel className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-display tracking-tight">
              Tripora
            </div>
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-muted hover:text-slate-600 hover:bg-surface transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Menu</p>
          {links.map((link) => (
            <NavButton key={link.name} link={link} />
          ))}
        </nav>

        {/* Hotel Profile + Logout */}
        <div className="px-3 py-4 border-t border-brand-border space-y-1">
          <p className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account</p>
          <NavButton link={{ name: "Hotel Profile", icon: Building2, path: "/hotel-profile" }} />
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Log out?"
        description="Are you sure you want to log out?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
};

export default Sidebar;
