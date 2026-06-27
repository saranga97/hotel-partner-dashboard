import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  BarChart3,
  Settings,
  LogOut,
  X,
  Hotel
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Hotel Profile", icon: Building2, path: "/hotel-profile" },
    { name: "Rooms", icon: BedDouble, path: "/rooms" },
    { name: "Bookings", icon: CalendarDays, path: "/bookings" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("ceylonstay_token");
    localStorage.removeItem("ceylonstay_user");
    window.location.href = `${import.meta.env.VITE_APP_URL}/login`;
  };

  const isActive = (path) => location.pathname === path;

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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-brand-border shadow-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:shadow-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Hotel className="h-5 w-5 text-white" />
            </div>
            <div className="text-xl font-bold text-primary font-display">
              Tripora
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-muted hover:text-slate-600 hover:bg-surface transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);

            return (
              <button
                key={link.name}
                onClick={() => {
                  navigate(link.path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-600 hover:bg-surface hover:text-slate-900"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${active ? "text-white" : "text-muted"}`} />
                <span>{link.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-brand-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
