import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Calendar, CheckCircle, BedDouble, User, ChevronRight } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { PageHeader, StatCard, LoadingSpinner, Alert, EmptyState } from "../components/ui";
import { bookingTotalPrice, getRelativeTime } from "../utils/bookings";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ceylonstay_user") || "null");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState(null); // { message, variant } | null

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const hotelsRes = await axiosInstance.get("/hotels/my-hotels");
        const hotel = hotelsRes.data.hotels?.[0];
        if (!hotel) return;

        const [roomsRes, bookingsRes] = await Promise.all([
          axiosInstance.get(`/rooms/hotel/${hotel.hotel_id}`, { params: { limit: 100 } }),
          axiosInstance.get(`/bookings/hotel/${hotel.hotel_id}`, { params: { limit: 100 } }),
        ]);
        setRooms(roomsRes.data.rooms);
        setBookings(bookingsRes.data.bookings);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setDataError(
          err.response?.status === 403
            ? { message: "You're not authorized to view data for this hotel.", variant: "warning" }
            : { message: "Couldn't load some dashboard data — showing what's available.", variant: "error" }
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner className="py-24" />;
  }

  const activeBookings = bookings.filter((b) => b.status === "booked").length;
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Ordered by what a partner actually needs to act on first: active
  // reservations right now, then room availability, then the lower-priority
  // running totals. Only Active Bookings and Available Rooms carry semantic
  // color (they're a status); the two running totals stay neutral so the
  // row doesn't read as an arbitrary rainbow. Each tile is clickable and
  // jumps to where it's managed.
  const statCards = [
    { title: "Active Bookings", value: activeBookings, icon: TrendingUp, lightColor: "bg-tint", textColor: "text-primary", onClick: () => navigate("/bookings"), highlight: true },
    { title: "Available Rooms", value: rooms.filter((r) => !r.isTemporaryBlocked).length, icon: CheckCircle, lightColor: "bg-emerald-50", textColor: "text-emerald-600", onClick: () => navigate("/rooms") },
    { title: "Total Bookings", value: bookings.length, icon: Calendar, lightColor: "bg-surface", textColor: "text-slate-500", onClick: () => navigate("/bookings") },
    { title: "Total Rooms", value: rooms.length, icon: BedDouble, lightColor: "bg-surface", textColor: "text-slate-500", onClick: () => navigate("/rooms") },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back"}
        subtitle="Here's what's happening with your hotel today."
      />

      {dataError && <Alert variant={dataError.variant}>{dataError.message}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.title}
            lightColor={stat.lightColor}
            textColor={stat.textColor}
            onClick={stat.onClick}
            highlight={stat.highlight}
          />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-slate-900">Recent Bookings</h3>
          {bookings.length > 0 && (
            <button
              onClick={() => navigate("/bookings")}
              className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-0.5 transition-colors"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        {recentBookings.length === 0 ? (
          <EmptyState icon={Calendar} message="No bookings yet" description="New reservations will show up here" />
        ) : (
          <div className="divide-y divide-brand-border">
            {recentBookings.map((booking) => {
              const totalPrice = bookingTotalPrice(booking);
              const guestName = booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : "Guest";
              return (
                <button
                  key={booking.booking_id}
                  onClick={() => navigate(`/bookings?bookingId=${booking._id}`)}
                  className="w-full flex items-center justify-between gap-3 py-3.5 text-left rounded-xl hover:bg-surface px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-tint flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{guestName}</p>
                      <p className="text-xs text-muted truncate">
                        {booking.room?.roomName || "Room removed"}
                        {booking.status === "cancelled" && <span className="text-red-500"> · Cancelled</span>}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">{totalPrice != null ? `LKR ${totalPrice.toLocaleString()}` : "—"}</p>
                    <p className="text-xs text-slate-400">{getRelativeTime(booking.createdAt)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
