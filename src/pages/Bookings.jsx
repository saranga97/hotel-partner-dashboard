import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Search, User } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import BookingDetailModal from "../components/BookingDetailModal";
import { PageHeader, StatCard, Alert, EmptyState, Badge, LoadingSpinner } from "../components/ui";
import { bookingTotalPrice, formatDate, getRelativeTime } from "../utils/bookings";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadErrorVariant, setLoadErrorVariant] = useState("error");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError("");
      setLoadErrorVariant("error");
      const hotelsRes = await axiosInstance.get("/hotels/my-hotels");
      const hotel = hotelsRes.data.hotels?.[0];
      if (!hotel) { setBookings([]); return; }

      const bookingsRes = await axiosInstance.get(`/bookings/hotel/${hotel.hotel_id}`, { params: { limit: 100 } });
      setBookings(bookingsRes.data.bookings);
    } catch (err) {
      if (err.response?.status === 403) {
        setLoadErrorVariant("warning");
        setLoadError("You're not authorized to view bookings for this hotel.");
      } else {
        setLoadErrorVariant("error");
        setLoadError("Failed to load bookings. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId && bookings.length > 0) {
      const found = bookings.find((b) => b._id === bookingId || b.booking_id === bookingId);
      if (found) {
        setSelectedBooking(found);
        searchParams.delete("bookingId");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [bookings, searchParams]);

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    const guestName = b.user ? `${b.user.firstName} ${b.user.lastName}`.toLowerCase() : "";
    const matchesSearch = !term || guestName.includes(term);
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const bookingStats = [
    { label: "Total Bookings", value: bookings.length, color: "bg-primary" },
    { label: "Active", value: bookings.filter((b) => b.status === "booked").length, color: "bg-green-500" },
    { label: "Cancelled", value: bookings.filter((b) => b.status === "cancelled").length, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings Management" subtitle="Manage all your hotel reservations and bookings" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {bookingStats.map((stat, index) => (
          <StatCard key={index} value={stat.value} label={stat.label} color={stat.color} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by guest name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-border rounded-xl transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 border border-brand-border rounded-xl text-sm transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loadError && <Alert variant={loadErrorVariant}>{loadError}</Alert>}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-12">
          <LoadingSpinner message="Loading bookings..." />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-12">
          <EmptyState
            icon={Calendar}
            message={bookings.length === 0 ? "No bookings yet" : "No bookings match your search"}
            description={
              bookings.length === 0
                ? "Bookings made for your rooms will show up here"
                : "Try adjusting your search or filters"
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3 bg-surface border-b border-brand-border text-xs font-semibold text-muted uppercase tracking-wider">
            <div className="col-span-3">Room</div>
            <div className="col-span-3">Guest</div>
            <div className="col-span-3">Dates</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Time</div>
          </div>
          <div className="divide-y divide-brand-border">
            {filteredBookings.map((booking) => {
              const totalPrice = bookingTotalPrice(booking);
              return (
                <div
                  key={booking.booking_id}
                  onClick={() => setSelectedBooking(booking)}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-6 py-3.5 hover:bg-surface transition-colors cursor-pointer"
                >
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-slate-900">{booking.room?.roomName || "Room removed"}</p>
                    {booking.room?.roomType && (
                      <Badge variant={booking.room.roomType === "FAMILY" ? "success" : "purple"} className="mt-1 px-1.5 py-0.5 text-[10px]">
                        {booking.room.roomType === "FAMILY" ? "Family" : "Couple"}
                      </Badge>
                    )}
                  </div>
                  <div className="col-span-3 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-tint flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : "Guest"}
                      </p>
                      <p className="text-xs text-muted truncate">{booking.user?.email}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <p className="text-sm text-slate-700">{formatDate(booking.checkInDate)} – {formatDate(booking.checkOutDate)}</p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <p className="text-sm font-medium text-slate-900 tabular-nums">{totalPrice != null ? `LKR ${totalPrice.toLocaleString()}` : "—"}</p>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Badge variant={booking.status === "booked" ? "success" : "danger"} className="px-2 py-0.5 text-[11px]">
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="col-span-1 flex items-center">
                    <p className="text-xs text-slate-400">{getRelativeTime(booking.createdAt)}</p>
                  </div>
                </div>
              );
            })}
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
