import { useState, useEffect } from "react";
import { Calendar, Search, Clock } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, booked: 0, cancelled: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async () => {
    try {
      setLoading(true);
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
        booked: res.data.booked,
        cancelled: res.data.cancelled,
      });
      setTotalPages(res.data.totalPages);
    } catch (err) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter, page]);

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

  const bookingStats = [
    { label: "Total Bookings", value: stats.total, color: "bg-blue-500" },
    { label: "Booked", value: stats.booked, color: "bg-green-500" },
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
      <div className="grid grid-cols-3 gap-4">
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
              <option value="booked">Booked</option>
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
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Room</div>
            <div className="col-span-2">Guest</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Package</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Time</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                {/* Room */}
                <div className="col-span-3">
                  <p className="text-sm font-medium text-slate-900">
                    {booking.room?.roomName || booking.room?.roomLabel || "N/A"}
                  </p>
                  {booking.room?.roomName && (
                    <p className="text-xs text-slate-500">
                      {booking.room?.roomLabel}
                    </p>
                  )}
                  <span
                    className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                      booking.room?.roomType === "family"
                        ? "bg-green-50 text-green-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {booking.room?.roomType}
                  </span>
                </div>

                {/* Guest */}
                <div className="col-span-2">
                  <p className="text-sm text-slate-900">
                    {booking.user?.fullName || "Guest"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {booking.user?.email}
                  </p>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <p className="text-sm text-slate-700">{booking.date}</p>
                </div>

                {/* Package */}
                <div className="col-span-2">
                  <p className="text-sm text-slate-700">
                    {booking.selectedPackage?.type === "night"
                      ? "Night Stay"
                      : booking.selectedPackage?.packageName || "Day Out"}
                  </p>
                  {booking.selectedPackage?.checkInTime && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(booking.selectedPackage.checkInTime)} -{" "}
                      {formatTime(booking.selectedPackage.checkOutTime)}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="col-span-1">
                  <p className="text-sm font-medium text-slate-900">
                    LKR{" "}
                    {booking.selectedPackage?.price?.toLocaleString()}
                  </p>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "booked"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Time */}
                <div className="col-span-1">
                  <p className="text-xs text-slate-400">
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
    </div>
  );
};

export default Bookings;
