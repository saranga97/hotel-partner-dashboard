import { useState } from "react";
import { Calendar, Search, User, Info } from "lucide-react";
import BookingDetailModal from "../components/BookingDetailModal";
import { PageHeader, StatCard, Alert, EmptyState, Badge, Button } from "../components/ui";
import { SAMPLE_BOOKINGS, SAMPLE_STATS } from "../constants/sampleBookings";

// No hotel-owner-scoped booking list exists on the current backend yet — this
// page shows sample data (see constants/sampleBookings.js) so the layout is
// ready to wire up to a real endpoint once one exists.
const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const bookings = SAMPLE_BOOKINGS.filter((b) => {
    const term = searchTerm.toLowerCase();
    const guestName = `${b.user.firstName} ${b.user.lastName}`.toLowerCase();
    const matchesSearch = !term || guestName.includes(term);
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const bookingStats = [
    { label: "Total Bookings", value: SAMPLE_STATS.totalBookings, color: "bg-primary" },
    { label: "Active", value: SAMPLE_STATS.activeBookings, color: "bg-green-500" },
    { label: "Cancelled", value: SAMPLE_STATS.cancelledBookings, color: "bg-red-500" },
  ];

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const getRelativeTime = (timestamp) => {
    const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings Management" subtitle="Manage all your hotel reservations and bookings" />

      <Alert variant="info" icon={Info}>
        Sample data — the backend doesn't have a hotel-owner bookings endpoint yet. This page will show real reservations once that's added.
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bookingStats.map((stat, index) => (
          <StatCard key={index} value={stat.value} label={stat.label} color={stat.color} />
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by guest name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-brand-border p-12">
          <EmptyState icon={Calendar} message="No bookings found" description="Try adjusting your search or filters" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3 bg-surface border-b border-brand-border text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Room</div>
            <div className="col-span-3">Guest</div>
            <div className="col-span-3">Dates</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Time</div>
          </div>
          <div className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <div
                key={booking.booking_id}
                onClick={() => setSelectedBooking(booking)}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-6 py-3 hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="col-span-3">
                  <p className="text-xs font-medium text-slate-900">{booking.room.roomName}</p>
                  <Badge variant={booking.room.roomType === "FAMILY" ? "success" : "purple"} className="mt-0.5 px-1.5 py-0.5 text-[10px]">
                    {booking.room.roomType === "FAMILY" ? "Family" : "Couple"}
                  </Badge>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-border flex items-center justify-center flex-shrink-0">
                    <User className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">{booking.user.firstName} {booking.user.lastName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{booking.user.email}</p>
                  </div>
                </div>
                <div className="col-span-3 flex items-center">
                  <p className="text-xs text-slate-700">{formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}</p>
                </div>
                <div className="col-span-1 flex items-center">
                  <p className="text-xs font-medium text-slate-900">LKR {booking.totalPrice.toLocaleString()}</p>
                </div>
                <div className="col-span-1 flex items-center">
                  <Badge variant={booking.status === "booked" ? "success" : "danger"} className="px-2 py-0.5 text-[11px]">
                    {booking.status}
                  </Badge>
                </div>
                <div className="col-span-1 flex items-center">
                  <p className="text-[11px] text-slate-400">{getRelativeTime(booking.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedBooking && (
        <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
};

export default Bookings;
