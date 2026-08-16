// Shared helpers for rendering real Booking documents from
// GET /bookings/hotel/:hotel_id. The backend doesn't store a totalPrice on
// the booking itself, so it's derived here from the populated room's price
// and the stay length — used by Dashboard, Bookings, and BookingDetailModal.

export const nightsBetween = (checkInDate, checkOutDate) => {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const nights = Math.round((end - start) / 86400000);
  return nights > 0 ? nights : 0;
};

export const bookingTotalPrice = (booking) => {
  const price = booking.room?.price;
  if (typeof price !== "number") return null;
  return price * nightsBetween(booking.checkInDate, booking.checkOutDate);
};

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

export const getRelativeTime = (timestamp) => {
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};
