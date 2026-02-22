import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  BedDouble,
  Thermometer,
  MapPin,
  Check,
  AlertCircle,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const BookingDetailModal = ({ booking, onClose, onStatusChange }) => {
  const [actionLoading, setActionLoading] = useState(null); // 'approve' | 'reject'
  const [actionStatus, setActionStatus] = useState(null); // null | 'approved' | 'rejected' | 'error'
  const [actionMessage, setActionMessage] = useState("");

  if (!booking) return null;

  const pkg = booking.selectedPackage;

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
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

  const handleApprove = async () => {
    setActionLoading("approve");
    setActionStatus(null);
    try {
      const res = await axiosInstance.put(`/rooms/${booking._id}/approve`);
      setActionStatus("approved");
      setActionMessage("Booking approved");
      if (onStatusChange) onStatusChange(res.data.booking);
    } catch (err) {
      setActionStatus("error");
      setActionMessage(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    setActionLoading("reject");
    setActionStatus(null);
    try {
      const res = await axiosInstance.put(`/rooms/${booking._id}/reject`);
      setActionStatus("rejected");
      setActionMessage("Booking rejected");
      if (onStatusChange) onStatusChange(res.data.booking);
    } catch (err) {
      setActionStatus("error");
      setActionMessage(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const currentStatus = actionStatus === "approved"
    ? "booked"
    : actionStatus === "rejected"
    ? "cancelled"
    : booking.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              Booking Details
            </h2>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(currentStatus)}`}
            >
              {getStatusLabel(currentStatus)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Room Info */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BedDouble className="h-5 w-5 text-blue-600" />
            </div>
            <div>
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
          </div>

          {/* Guest Info */}
          <div className="flex items-start gap-3">
            {booking.user?.profileImage ? (
              <img
                src={booking.user.profileImage}
                alt={booking.user.fullName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0">
                <User className="h-5 w-5 text-slate-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-900">
                {booking.user?.fullName || "Guest"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Mail className="h-3 w-3 text-slate-400" />
                <p className="text-xs text-slate-500">
                  {booking.user?.email || "N/A"}
                </p>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3 text-slate-400" />
                <p className="text-xs text-slate-500">
                  {booking.user?.mobile || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {booking.date}
              </p>
              <p className="text-xs text-slate-500">Booking Date</p>
            </div>
          </div>

          {/* Package Details */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700">
              Package Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500">Type</p>
                <p className="text-sm font-medium text-slate-900">
                  {pkg?.type === "night"
                    ? "Night Stay"
                    : pkg?.packageName || "Day Out"}
                </p>
              </div>
              {pkg?.checkInTime && (
                <div>
                  <p className="text-xs text-slate-500">Time Slot</p>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900">
                      {formatTime(pkg.checkInTime)} -{" "}
                      {formatTime(pkg.checkOutTime)}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500">AC Type</p>
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3 w-3 text-slate-400" />
                  <p className="text-sm font-medium text-slate-900">
                    {pkg?.acType || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500">Price</p>
                <p className="text-lg font-bold text-slate-900">
                  LKR {pkg?.price?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Hotel Info */}
          {booking.hotel && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {booking.hotel.name}
                </p>
                <p className="text-xs text-slate-500">
                  {booking.hotel.location}
                </p>
              </div>
            </div>
          )}

          {/* Action Feedback */}
          {actionStatus && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
                actionStatus === "error"
                  ? "bg-red-50 text-red-700"
                  : actionStatus === "approved"
                  ? "bg-green-50 text-green-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {actionStatus === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {actionMessage}
            </div>
          )}

          {/* Approve/Reject Buttons */}
          {booking.status === "pending" && !actionStatus && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === "approve" ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Approve
                  </>
                )}
              </button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === "reject" ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Reject
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailModal;
