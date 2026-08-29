import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  CalendarDays,
  BarChart3,
  LogOut,
  X,
  Hotel,
  ChevronDown,
  Check,
  Plus
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useHotel } from "../context/HotelContext";
import { ConfirmDialog } from "./ui";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { hotels, selectedHotel, selectHotel } = useHotel();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hotelDropdownOpen, setHotelDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setHotelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = [
    { name: "Home", icon: LayoutDashboard, path: "/" },
    { name: "Hotel Profile", icon: Building2, path: "/hotel-profile" },
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

        {/* Hotel Selector + Logout */}
        <div className="px-3 py-4 border-t border-brand-border space-y-2">
          {hotels.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setHotelDropdownOpen((prev) => !prev)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-tint border border-brand-border hover:border-primary/40 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Hotel className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted leading-none mb-0.5">Property</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{selectedHotel?.name || "Select"}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted flex-shrink-0 transition-transform duration-200 ${hotelDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {hotelDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-white rounded-xl border border-brand-border shadow-lg overflow-hidden animate-fadeIn z-50">
                  <div className="py-1 max-h-48 overflow-y-auto">
                    {hotels.map((h) => (
                      <button
                        key={h.hotel_id}
                        onClick={() => {
                          selectHotel(h.hotel_id);
                          setHotelDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                          selectedHotel?.hotel_id === h.hotel_id
                            ? "bg-tint text-primary font-semibold"
                            : "text-slate-700 hover:bg-surface"
                        }`}
                      >
                        <span className="truncate flex-1 text-left">{h.name}</span>
                        {selectedHotel?.hotel_id === h.hotel_id && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-brand-border">
                    <button
                      onClick={() => {
                        setHotelDropdownOpen(false);
                        navigate("/register-hotel");
                        setSidebarOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-primary hover:bg-tint transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add new property</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
