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
import { Modal, Badge, Alert, Button } from "./ui";

const BookingDetailModal = ({ booking, onClose, onStatusChange }) => {
  const [actionLoading, setActionLoading] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
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

  const getStatusVariant = (status) => {
    if (status === "pending") return "warning";
    if (status === "booked") return "success";
    return "danger";
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
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900">Booking Details</h2>
          <Badge variant={getStatusVariant(currentStatus)}>
            {getStatusLabel(currentStatus)}
          </Badge>
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
          <div className="p-2 bg-tint rounded-lg">
            <BedDouble className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {booking.room?.roomName || booking.room?.roomLabel || "N/A"}
            </p>
            {booking.room?.roomName && (
              <p className="text-xs text-slate-500">{booking.room?.roomLabel}</p>
            )}
            <Badge
              variant={booking.room?.roomType === "family" ? "success" : "purple"}
              className="mt-0.5 px-1.5 py-0.5 text-xs"
            >
              {booking.room?.roomType}
            </Badge>
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
              <p className="text-xs text-slate-500">{booking.user?.email || "N/A"}</p>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3 text-slate-400" />
              <p className="text-xs text-slate-500">{booking.user?.mobile || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{booking.date}</p>
            <p className="text-xs text-slate-500">Booking Date</p>
          </div>
        </div>

        {/* Package Details */}
        <div className="p-4 bg-surface rounded-xl border border-brand-border space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Package Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500">Type</p>
              <p className="text-sm font-medium text-slate-900">
                {pkg?.type === "night" ? "Night Stay" : pkg?.packageName || "Day Out"}
              </p>
            </div>
            {pkg?.checkInTime && (
              <div>
                <p className="text-xs text-slate-500">Time Slot</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <p className="text-sm font-medium text-slate-900">
                    {formatTime(pkg.checkInTime)} - {formatTime(pkg.checkOutTime)}
                  </p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500">AC Type</p>
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3 text-slate-400" />
                <p className="text-sm font-medium text-slate-900">{pkg?.acType || "N/A"}</p>
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
              <p className="text-sm font-medium text-slate-900">{booking.hotel.name}</p>
              <p className="text-xs text-slate-500">{booking.hotel.location}</p>
            </div>
          </div>
        )}

        {/* Action Feedback */}
        {actionStatus && (
          <Alert
            variant={actionStatus === "error" ? "error" : actionStatus === "approved" ? "success" : "warning"}
            className="font-medium"
          >
            {actionMessage}
          </Alert>
        )}

        {/* Approve/Reject Buttons */}
        {booking.status === "pending" && !actionStatus && (
          <div className="flex gap-3 pt-2">
            <Button
              variant="success"
              onClick={handleApprove}
              disabled={!!actionLoading}
              loading={actionLoading === "approve"}
              className="flex-1"
            >
              {actionLoading !== "approve" && <Check className="h-4 w-4" />}
              {actionLoading === "approve" ? "Approving..." : "Approve"}
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={!!actionLoading}
              loading={actionLoading === "reject"}
              className="flex-1"
            >
              {actionLoading !== "reject" && <X className="h-4 w-4" />}
              {actionLoading === "reject" ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BookingDetailModal;
