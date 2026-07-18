import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Users, Calendar, CheckCircle, BedDouble, Ban, Info } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { PageHeader, StatCard, LoadingSpinner, Alert, Badge } from "../components/ui";
import { SAMPLE_BOOKINGS, SAMPLE_STATS } from "../constants/sampleBookings";

const Dashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const hotelsRes = await axiosInstance.get("/hotels/my-hotels");
        const hotel = hotelsRes.data.hotels?.[0];
        if (!hotel) return;
        const roomsRes = await axiosInstance.get(`/rooms/hotel/${hotel.hotel_id}`, { params: { limit: 100 } });
        setRooms(roomsRes.data.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms for dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const getRelativeTime = (timestamp) => {
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return <LoadingSpinner className="py-24" />;
  }

  // Room stats are real (GET /rooms/hotel/:hotel_id). Booking stats are sample
  // data — no hotel-owner-scoped bookings endpoint exists yet.
  const statCards = [
    { title: "Total Rooms", value: rooms.length, icon: BedDouble, lightColor: "bg-tint", textColor: "text-primary" },
    { title: "Available Rooms", value: rooms.filter((r) => !r.isTemporaryBlocked).length, icon: CheckCircle, lightColor: "bg-emerald-50", textColor: "text-emerald-600" },
    { title: "Total Bookings (sample)", value: SAMPLE_STATS.totalBookings, icon: Calendar, lightColor: "bg-orange-50", textColor: "text-orange-600" },
    { title: "Active Bookings (sample)", value: SAMPLE_STATS.activeBookings, icon: TrendingUp, lightColor: "bg-purple-50", textColor: "text-purple-600" },
  ];

  const familyRooms = rooms.filter((r) => r.roomType === "FAMILY").length;
  const coupleRooms = rooms.filter((r) => r.roomType === "COUPLE").length;
  const blockedRooms = rooms.filter((r) => r.isTemporaryBlocked).length;

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle="Overview of your hotel performance">
        <Badge variant="success" dot>All systems operational</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} icon={stat.icon} value={stat.value} label={stat.title} lightColor={stat.lightColor} textColor={stat.textColor} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg"><Users className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{familyRooms}</p>
              <p className="text-sm text-slate-600">Family Rooms</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg"><Users className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{coupleRooms}</p>
              <p className="text-sm text-slate-600">Couple Rooms</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg"><Ban className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{blockedRooms}</p>
              <p className="text-sm text-slate-600">Blocked Rooms</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-slate-900">Recent Bookings</h3>
          </div>
          <Alert variant="info" icon={Info} className="mb-4">
            Sample data — connects to live bookings once the backend adds a partner bookings endpoint.
          </Alert>
          <div className="space-y-3">
            {SAMPLE_BOOKINGS.map((booking) => (
              <div key={booking.booking_id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${booking.status === "booked" ? "bg-green-500" : "bg-red-500"}`} />
                  <div>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{booking.room.roomName}</span>
                    </p>
                    <p className="text-xs text-slate-500">{booking.user.firstName} {booking.user.lastName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">LKR {booking.totalPrice.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{getRelativeTime(booking.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => navigate("/rooms")} className="w-full text-left px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center gap-3">
                <BedDouble className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-sm font-medium text-emerald-900">Manage Rooms</div>
                  <div className="text-xs text-emerald-700 mt-0.5">Add, edit, or block rooms</div>
                </div>
              </div>
            </button>
            <button onClick={() => navigate("/bookings")} className="w-full text-left px-4 py-3 bg-tint hover:bg-[#ffe8df] rounded-lg transition-colors duration-200">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm font-medium text-primary-dark">View Bookings</div>
                  <div className="text-xs text-primary mt-0.5">Manage all reservations</div>
                </div>
              </div>
            </button>
            <button onClick={() => navigate("/analytics")} className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-purple-900">View Analytics</div>
                  <div className="text-xs text-purple-700 mt-0.5">Check performance insights</div>
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
