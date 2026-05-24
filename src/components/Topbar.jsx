import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Bell, Search, BedDouble, Calendar, Trash2, Pencil } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { EmptyState } from "./ui";

const Topbar = ({ setSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("ceylonstay_user"));
  const hotelName = user?.fullName || "Partner";
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { notifications, markAsRead, clearAll, unreadCount } =
    useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    setShowNotifications(false);

    if (notification.type === "new_booking" && notification.data?._id) {
      navigate(`/bookings?bookingId=${notification.data._id}`);
    } else if (
      (notification.type === "room_added" || notification.type === "room_updated") &&
      notification.data?._id
    ) {
      navigate(`/rooms?roomId=${notification.data._id}`);
    }
  };

  const getNotificationIcon = (type) => {
    if (type === "new_booking") return Calendar;
    if (type === "room_updated") return Pencil;
    return BedDouble;
  };

  const getNotificationColors = (type) => {
    if (type === "new_booking") return "bg-blue-100 text-blue-600";
    if (type === "room_added") return "bg-green-100 text-green-600";
    if (type === "room_updated") return "bg-amber-100 text-amber-600";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-slate-900">
              {hotelName}
            </h1>
            <p className="text-sm text-slate-600">Hotel Management</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings, rooms, guests..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors duration-200"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifications
                  </h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">
                        No notifications yet
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                          !notification.read ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {(() => {
                            const Icon = getNotificationIcon(notification.type);
                            return (
                              <div
                                className={`mt-0.5 p-1.5 rounded-lg ${getNotificationColors(notification.type)}`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                            );
                          })()}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                !notification.read
                                  ? "font-medium text-slate-900"
                                  : "text-slate-700"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {getRelativeTime(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-slate-900">
                {hotelName}
              </div>
              <div className="text-xs text-slate-600">{user?.user_id}</div>
            </div>
            <div className="relative">
              <button className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white flex items-center justify-center text-sm font-semibold shadow-md hover:shadow-lg transition-shadow duration-200">
                {hotelName.charAt(0).toUpperCase()}
              </button>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
