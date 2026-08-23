// Amenity option lists offered when registering/editing a hotel or a room. Free-form
// strings, not backend enums — partners can still type a custom amenity beyond these.
// Modeled on Airbnb's amenity categories (property types here are HOMESTAY / APARTMENT
// / CABANA short-stays, not resort hotels).
//
// Mirrored in tripora-frontend/src/constants/amenities.js — see both repos' READMEs
// for the sync requirement. Every entry here needs a matching icon in amenityIcons.js.

export const HOTEL_AMENITIES = [
  // Wellness & recreation
  "Swimming Pool", "Hot Tub / Jacuzzi", "Spa", "Fitness Center", "BBQ Facilities", "Fire Pit", "Board Games",
  // Food & drink
  "Restaurant", "Bar", "Room Service", "Breakfast Included",
  // Connectivity & workspace
  "Free WiFi", "Dedicated Workspace",
  // Parking & transport
  "Free Parking", "Paid Parking", "EV Charging Station", "Airport Shuttle", "Bicycle Rental",
  // Outdoor & views
  "Garden", "Terrace", "Backyard", "Outdoor Furniture", "Beach Access", "Lake / Waterfront Access",
  "Sea / Ocean View", "Mountain View", "City View",
  // Services & facilities
  "Laundry Service", "24-Hour Front Desk", "Concierge", "Luggage Storage", "Tour / Travel Desk",
  "Currency Exchange", "Gift Shop", "Business Center", "Meeting Rooms", "Library",
  // Family
  "Kids Play Area", "Family Rooms",
  // Safety
  "24-Hour Security", "CCTV Surveillance", "Smoke Alarm", "Carbon Monoxide Alarm",
  "Fire Extinguisher", "First Aid Kit",
  // Policies & accessibility
  "Pet Friendly", "Wheelchair Accessible", "Elevator / Lift", "Non-Smoking Property", "Eco-Friendly / Solar Powered",
];

export const ROOM_AMENITIES = [
  // Entertainment
  "TV", "Smart TV", "Smart TV with Netflix",
  // Food & drink
  "Tea/Coffee Maker", "Electric Kettle", "Mini Bar", "Breakfast Included", "Kitchenette", "Microwave", "Refrigerator",
  // Connectivity
  "Free WiFi", "USB Charging Ports", "Telephone",
  // Comfort
  "Sitting Area", "Balcony", "Extra Pillows & Blankets", "Blackout Curtains", "Reading Lamp",
  // Storage
  "Clothes Rack", "Wardrobe", "Desk", "In-Room Safe",
  // Bathroom
  "Bathtub", "Towels",
  // Practical
  "Iron", "Hairdryer",
  // Policy
  "Smoking Allowed", "No Smoking",
];
