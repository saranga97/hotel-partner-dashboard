// Mirrors the ALLOWED_* enums in tripora-backend/models/Hotel.js and Room.js exactly.
// Amenity option lists live in constants/amenities.js, and their icons in
// constants/amenityIcons.js — kept separate so each can be edited independently.

export const HOTEL_TYPES = [
  { value: "HOMESTAY", label: "Homestay" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CABANA", label: "Cabana" },
];

export const PLACE_TYPES = [
  { value: "ENTIRE_HOTEL", label: "Entire place" },
  { value: "A_ROOM", label: "A room" },
];

export const BATHROOM_TYPES = [
  { value: "PRIVATE_AND_ATTACHED", label: "Private & attached" },
  { value: "SHARED", label: "Shared" },
];

export const BOOKING_METHODS = [
  { value: "INSTANT_BOOK", label: "Instant book" },
  { value: "NEED_APPROVAL", label: "Needs approval" },
];

export const WHO_ELSE_OPTIONS = [
  { value: "ME", label: "Just me" },
  { value: "MY_FAMILY", label: "My family" },
  { value: "OTHER_GUESTS", label: "Other guests" },
];

export const ROOM_TYPES = [
  { value: "FAMILY", label: "Family" },
  { value: "COUPLE", label: "Couple" },
];

export const AC_TYPES = [
  { value: "AC", label: "AC" },
  { value: "NON_AC", label: "Non-AC" },
];

export const FLOOR_TYPES = [
  { value: "UPPER_FLOOR", label: "Upper floor" },
  { value: "GROUND_FLOOR", label: "Ground floor" },
];

export const BED_TYPES = [
  { value: "SINGLE_BED", label: "Single" },
  { value: "DOUBLE_BED", label: "Double" },
  { value: "QUEEN", label: "Queen" },
  { value: "KING_SIZE", label: "King" },
];

// Countries a partner can register a hotel in — mirrors the backend's
// ALLOWED_COUNTRIES (derived from PHONE_COUNTRY_MAP in tripora-backend/utils/countryMap.js).
export const COUNTRIES = [
  { iso: "LK", name: "Sri Lanka" },
  { iso: "AU", name: "Australia" },
  { iso: "AT", name: "Austria" },
  { iso: "BD", name: "Bangladesh" },
  { iso: "BE", name: "Belgium" },
  { iso: "BR", name: "Brazil" },
  { iso: "CN", name: "China" },
  { iso: "CZ", name: "Czech Republic" },
  { iso: "DK", name: "Denmark" },
  { iso: "EG", name: "Egypt" },
  { iso: "FI", name: "Finland" },
  { iso: "FR", name: "France" },
  { iso: "DE", name: "Germany" },
  { iso: "GR", name: "Greece" },
  { iso: "HK", name: "Hong Kong" },
  { iso: "HU", name: "Hungary" },
  { iso: "IN", name: "India" },
  { iso: "ID", name: "Indonesia" },
  { iso: "IE", name: "Ireland" },
  { iso: "IT", name: "Italy" },
  { iso: "JP", name: "Japan" },
  { iso: "KE", name: "Kenya" },
  { iso: "MY", name: "Malaysia" },
  { iso: "MX", name: "Mexico" },
  { iso: "NL", name: "Netherlands" },
  { iso: "NZ", name: "New Zealand" },
  { iso: "NG", name: "Nigeria" },
  { iso: "NO", name: "Norway" },
  { iso: "PK", name: "Pakistan" },
  { iso: "PH", name: "Philippines" },
  { iso: "PL", name: "Poland" },
  { iso: "PT", name: "Portugal" },
  { iso: "RO", name: "Romania" },
  { iso: "RU", name: "Russia" },
  { iso: "SA", name: "Saudi Arabia" },
  { iso: "SG", name: "Singapore" },
  { iso: "ZA", name: "South Africa" },
  { iso: "KR", name: "South Korea" },
  { iso: "ES", name: "Spain" },
  { iso: "SE", name: "Sweden" },
  { iso: "CH", name: "Switzerland" },
  { iso: "TW", name: "Taiwan" },
  { iso: "TH", name: "Thailand" },
  { iso: "TR", name: "Turkey" },
  { iso: "AE", name: "United Arab Emirates" },
  { iso: "GB", name: "United Kingdom" },
  { iso: "US", name: "United States" },
  { iso: "VN", name: "Vietnam" },
];
