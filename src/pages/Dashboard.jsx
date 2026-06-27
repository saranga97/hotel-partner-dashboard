import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  BedDouble,
  Ban,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { PageHeader, StatCard, LoadingSpinner, EmptyState, Badge } from "../components/ui";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/rooms/partner-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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

  if (loading) {
    return <LoadingSpinner className="py-24" />;
  }

  const statCards = [
    {
      title: "Total Rooms",
      value: stats?.totalRooms || 0,
      icon: BedDouble,
      lightColor: "bg-tint",
      textColor: "text-primary",
    },
    {
      title: "Available Rooms",
      value: stats?.availableRooms || 0,
      icon: CheckCircle,
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      lightColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: "Active Bookings",
      value: stats?.activeBookings || 0,
      icon: TrendingUp,
      lightColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader title="Dashboard" subtitle="Overview of your hotel performance">
        <Badge variant="success" dot>All systems operational</Badge>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.title}
            lightColor={stat.lightColor}
            textColor={stat.textColor}
          />
        ))}
      </div>

      {/* Room Type Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats?.familyRooms || 0}
              </p>
              <p className="text-sm text-slate-600">Family Rooms</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats?.coupleRooms || 0}
              </p>
              <p className="text-sm text-slate-600">Couple Rooms</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {stats?.blockedRooms || 0}
              </p>
              <p className="text-sm text-slate-600">Blocked Rooms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Recent Bookings
          </h3>
          {stats?.recentBookings && stats.recentBookings.length > 0 ? (
            <div className="space-y-3">
              {stats.recentBookings.map((booking, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        booking.status === "booked"
                          ? "bg-green-500"
                          : booking.status === "pending"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-medium">
                          {booking.room?.roomName || booking.room?.roomLabel || "Room"}
                        </span>
                        {booking.room?.roomName && (
                          <span className="text-slate-400 ml-1 text-xs">
                            ({booking.room?.roomLabel})
                          </span>
                        )}
                        {" - "}
                        {booking.selectedPackage?.type === "night"
                          ? "Night Stay"
                          : booking.selectedPackage?.packageName || "Booking"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {booking.user?.fullName || "Guest"} - {booking.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      LKR {booking.selectedPackage?.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {getRelativeTime(booking.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              description="No bookings yet"
              className="py-8"
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/rooms")}
              className="w-full text-left px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <BedDouble className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-sm font-medium text-emerald-900">
                    Manage Rooms
                  </div>
                  <div className="text-xs text-emerald-700 mt-0.5">
                    Add, edit, or block rooms
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/bookings")}
              className="w-full text-left px-4 py-3 bg-tint hover:bg-[#ffe8df] rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-medium text-primary-dark">
                    View Bookings
                  </div>
                  <div className="text-xs text-primary mt-0.5">
                    Manage all reservations
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-purple-900">
                    View Analytics
                  </div>
                  <div className="text-xs text-purple-700 mt-0.5">
                    Check performance insights
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
