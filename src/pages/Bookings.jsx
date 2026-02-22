import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Search, Clock, AlertCircle, Phone, User } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import BookingDetailModal from "../components/BookingDetailModal";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, booked: 0, cancelled: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      if (dateFilter) params.append("date", dateFilter);
      params.append("page", page);
      params.append("limit", 20);

      const res = await axiosInstance.get(
        `/rooms/hotel-bookings?${params.toString()}`
      );
      setBookings(res.data.bookings);
      setStats({
        total: res.data.total,
        pending: res.data.pending,
        booked: res.data.booked,
        cancelled: res.data.cancelled,
      });
      setTotalPages(res.data.totalPages);
      return res.data.bookings;
    } catch {
      setLoadError("Failed to load bookings. Please refresh the page.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter, page]);

  // Handle bookingId URL param to auto-open modal
  useEffect(() => {
    const bookingId = searchParams.get("bookingId");
    if (bookingId && bookings.length > 0) {
      const found = bookings.find((b) => b._id === bookingId);
      if (found) {
        setSelectedBooking(found);
        // Clear the param after opening
        searchParams.delete("bookingId");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [bookings, searchParams]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBookings();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getStatusStyle = (status) => {
    if (status === "pending") return "bg-amber-100 text-amber-800";
    if (status === "booked") return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusLabel = (status) => {
    if (status === "booked") return "approved";
    return status;
  };

  const handleStatusChange = (updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) =>
        b._id === updatedBooking._id ? { ...b, status: updatedBooking.status } : b
      )
    );
    // Refresh stats
    fetchBookings();
  };

  const bookingStats = [
    { label: "Total Bookings", value: stats.total, color: "bg-blue-500" },
    { label: "Pending", value: stats.pending, color: "bg-amber-500" },
    { label: "Approved", value: stats.booked, color: "bg-green-500" },
    { label: "Cancelled", value: stats.cancelled, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Bookings Management
        </h1>
        <p className="text-slate-600 mt-1">
          Manage all your hotel reservations and bookings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {bookingStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-3 h-8 ${stat.color} rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by guest name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="booked">Approved</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Load Error */}
      {loadError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No bookings found
          </h3>
          <p className="text-slate-500">
            {searchTerm || statusFilter !== "all" || dateFilter
              ? "Try adjusting your search or filters"
              : "Bookings will appear here when guests make reservations"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-14 gap-3 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider"
               style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
            <div className="col-span-2">Room</div>
            <div className="col-span-3">Guest</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-2">Package</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Time</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                onClick={() => setSelectedBooking(booking)}
                className={`grid grid-cols-1 md:grid-cols-14 gap-2 md:gap-3 px-6 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                  booking.status === "pending"
                    ? "border-l-4 border-l-amber-400"
                    : ""
                }`}
                style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}
              >
                {/* Room */}
                <div className="col-span-2">
                  <p className="text-xs font-medium text-slate-900">
                    {booking.room?.roomName || booking.room?.roomLabel || "N/A"}
                  </p>
                  {booking.room?.roomName && (
                    <p className="text-[11px] text-slate-500">
                      {booking.room?.roomLabel}
                    </p>
                  )}
                  <span
                    className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                      booking.room?.roomType === "family"
                        ? "bg-green-50 text-green-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {booking.room?.roomType}
                  </span>
                </div>

                {/* Guest */}
                <div className="col-span-3 flex items-center gap-2">
                  {booking.user?.profileImage ? (
                    <img
                      src={booking.user.profileImage}
                      alt={booking.user.fullName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 truncate">
                      {booking.user?.fullName || "Guest"}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {booking.user?.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="col-span-2 flex items-center">
                  <p className="text-xs text-slate-700 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
                    {booking.user?.mobile || "N/A"}
                  </p>
                </div>

                {/* Date */}
                <div className="col-span-1 flex items-center">
                  <p className="text-xs text-slate-700">{booking.date}</p>
                </div>

                {/* Package */}
                <div className="col-span-2 flex flex-col justify-center">
                  <p className="text-xs text-slate-700">
                    {booking.selectedPackage?.type === "night"
                      ? "Night Stay"
                      : booking.selectedPackage?.packageName || "Day Out"}
                  </p>
                  {booking.selectedPackage?.checkInTime && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(booking.selectedPackage.checkInTime)} -{" "}
                      {formatTime(booking.selectedPackage.checkOutTime)}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="col-span-1 flex items-center">
                  <p className="text-xs font-medium text-slate-900">
                    LKR{" "}
                    {booking.selectedPackage?.price?.toLocaleString()}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-1 flex items-center">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${getStatusStyle(booking.status)}`}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                {/* Time */}
                <div className="col-span-2 flex items-center">
                  <p className="text-[11px] text-slate-400">
                    {getRelativeTime(booking.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default Bookings;
