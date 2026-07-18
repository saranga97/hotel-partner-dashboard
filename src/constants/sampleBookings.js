// Placeholder data for Bookings/Dashboard — there is no partner-scoped booking
// list or stats endpoint on the current backend yet (bookings are only ever
// queryable as GET /bookings/my-bookings, scoped to the guest who made them,
// not the hotel owner). This file exists so those two pages have something
// realistic to render and a single place to swap for a real API call once
// that endpoint exists — see Bookings.jsx / Dashboard.jsx for the "Sample data"
// banner that makes this obvious when visiting either page.

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();
const dateStr = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

export const SAMPLE_BOOKINGS = [
  {
    booking_id: "SAMPLE-1", status: "booked",
    checkInDate: dateStr(3), checkOutDate: dateStr(6), totalPrice: 45000,
    createdAt: daysAgo(0.1),
    room: { room_id: "SR1", roomName: "Deluxe Ocean View", roomType: "COUPLE" },
    user: { firstName: "Amaya", lastName: "Perera", email: "amaya@example.com", phoneNumber: "712345678" },
  },
  {
    booking_id: "SAMPLE-2", status: "booked",
    checkInDate: dateStr(10), checkOutDate: dateStr(14), totalPrice: 68000,
    createdAt: daysAgo(1),
    room: { room_id: "SR2", roomName: "Family Suite", roomType: "FAMILY" },
    user: { firstName: "Kasun", lastName: "Silva", email: "kasun@example.com", phoneNumber: "719876543" },
  },
  {
    booking_id: "SAMPLE-3", status: "cancelled",
    checkInDate: dateStr(-2), checkOutDate: dateStr(1), totalPrice: 22000,
    createdAt: daysAgo(3),
    room: { room_id: "SR1", roomName: "Deluxe Ocean View", roomType: "COUPLE" },
    user: { firstName: "Nadia", lastName: "Fernando", email: "nadia@example.com", phoneNumber: "715551234" },
  },
];

export const SAMPLE_STATS = {
  totalBookings: SAMPLE_BOOKINGS.length,
  activeBookings: SAMPLE_BOOKINGS.filter((b) => b.status === "booked").length,
  cancelledBookings: SAMPLE_BOOKINGS.filter((b) => b.status === "cancelled").length,
};
