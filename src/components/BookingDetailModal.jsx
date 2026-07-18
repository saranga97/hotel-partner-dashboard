import { X, Calendar, User, Mail, Phone, BedDouble } from "lucide-react";
import { Modal, Badge } from "./ui";

// Read-only detail view — there is no approve/reject workflow on the current
// backend (every booking is created already status:'booked', no 'pending' state
// exists to approve). This whole page is showing sample data until a real
// partner-scoped bookings endpoint exists — see Bookings.jsx.
const BookingDetailModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A");

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900">Booking Details</h2>
          <Badge variant={booking.status === "booked" ? "success" : "danger"}>{booking.status}</Badge>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-tint rounded-lg">
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
            <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0">
              <User className="h-5 w-5 text-slate-600" />
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
            <p className="text-lg font-bold text-slate-900">LKR {booking.totalPrice?.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailModal;
