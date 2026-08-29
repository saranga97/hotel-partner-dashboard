import { useState } from "react";
import { X, Calendar, User, Mail, Phone, BedDouble, Check, XCircle, Loader2 } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { Modal, Badge } from "./ui";
import { bookingTotalPrice, formatDate } from "../utils/bookings";

const STATUS_CONFIG = {
  pending: { variant: "warning", label: "Pending Approval" },
  booked: { variant: "success", label: "Booked" },
  cancelled: { variant: "danger", label: "Cancelled" },
  rejected: { variant: "danger", label: "Rejected" },
};

const BookingDetailModal = ({ booking, onClose, onBookingUpdated }) => {
  const [actionLoading, setActionLoading] = useState(null); // 'approve' | 'reject' | null
  const [actionError, setActionError] = useState("");
  const [currentStatus, setCurrentStatus] = useState(booking?.status);

  if (!booking) return null;

  const totalPrice = bookingTotalPrice(booking);
  const statusCfg = STATUS_CONFIG[currentStatus] || { variant: "neutral", label: currentStatus };

  const handleApprove = async () => {
    setActionLoading("approve");
    setActionError("");
    try {
      await axiosInstance.put(`/bookings/${booking.booking_id}/approve`);
      setCurrentStatus("booked");
      if (onBookingUpdated) onBookingUpdated();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to approve booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject this booking? The guest will be notified.")) return;
    setActionLoading("reject");
    setActionError("");
    try {
      await axiosInstance.put(`/bookings/${booking.booking_id}/reject`);
      setCurrentStatus("rejected");
      if (onBookingUpdated) onBookingUpdated();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject booking");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 font-display">Booking Details</h2>
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-surface rounded-lg transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-tint rounded-xl">
            <BedDouble className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{booking.room?.roomName || "N/A"}</p>
            <Badge variant={booking.room?.roomType === "FAMILY" ? "success" : "purple"} className="mt-0.5 px-1.5 py-0.5 text-xs">
              {booking.room?.roomType === "FAMILY" ? "Family" : "Couple"}
            </Badge>
          </div>
        </div>

        <div className="flex items-start gap-3">
          {booking.user?.profileImage ? (
            <img src={booking.user.profileImage} alt={booking.user.firstName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="p-2.5 bg-surface rounded-xl flex-shrink-0">
              <User className="h-5 w-5 text-slate-500" />
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-slate-900">
              {booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : "Guest"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Mail className="h-3 w-3 text-slate-400" />
              <p className="text-xs text-slate-500">{booking.user?.email || "N/A"}</p>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3 text-slate-400" />
              <p className="text-xs text-slate-500">{booking.user?.phoneNumber || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl border border-brand-border grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> Check in</p>
            <p className="text-sm font-medium text-slate-900">{formatDate(booking.checkInDate)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> Check out</p>
            <p className="text-sm font-medium text-slate-900">{formatDate(booking.checkOutDate)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500">Total (per night × nights)</p>
            <p className="text-lg font-bold text-slate-900">{totalPrice != null ? `LKR ${totalPrice.toLocaleString()}` : "N/A"}</p>
          </div>
        </div>

        {booking.bookingMethod === "NEED_APPROVAL" && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-700">
              This booking requires approval. The hotel's booking method is set to <strong>Need Approval</strong>.
            </p>
          </div>
        )}

        {actionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-xs text-red-700">{actionError}</p>
          </div>
        )}

        {currentStatus === "pending" && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleApprove}
              disabled={actionLoading !== null}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading === "approve" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Approving...</>
              ) : (
                <><Check className="h-4 w-4" /> Approve Booking</>
              )}
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading !== null}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50"
            >
              {actionLoading === "reject" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Rejecting...</>
              ) : (
                <><XCircle className="h-4 w-4" /> Reject</>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BookingDetailModal;
