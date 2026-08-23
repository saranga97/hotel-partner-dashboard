import {
  Wifi, Waves, Sparkles, Dumbbell, UtensilsCrossed, Wine, BellRing, ParkingCircle, ParkingSquare,
  Bus, WashingMachine, Clock, UserCheck, Trees, Sun, BookOpen, Briefcase, Presentation, Baby, Flame,
  Bike, Tv, MonitorPlay, Cigarette, CigaretteOff, Coffee, Croissant, Shirt, CookingPot, Phone, Zap,
  Wind, Table2, Armchair, Droplets, Bath, Refrigerator, Check,
  BatteryCharging, ArrowUpDown, Accessibility, PawPrint, Siren, ShieldAlert, FireExtinguisher, HeartPulse,
  Shield, Cctv, Laptop, Luggage, Umbrella, Sailboat, DoorOpen, Fence, Sofa, Gamepad2, Leaf, Banknote,
  Compass, Gift, Sunrise, Mountain, Building2, Martini, LockKeyhole, Blinds, DoorClosed, Bed, LampDesk,
  PlugZap, ChefHat, Microwave, Users,
} from "lucide-react";

// Single shared icon per amenity label, used everywhere an amenity is displayed across
// the dashboard. Keep in sync with constants/amenities.js (every HOTEL_AMENITIES /
// ROOM_AMENITIES entry needs a matching icon here) and with tripora-frontend's
// src/constants/amenityIcons.js — see both repos' READMEs for the sync requirement.
export const AMENITY_ICONS = {
  // Property-level (HOTEL_AMENITIES)
  "Swimming Pool": Waves,
  "Hot Tub / Jacuzzi": Bath,
  "Spa": Sparkles,
  "Fitness Center": Dumbbell,
  "BBQ Facilities": Flame,
  "Fire Pit": Flame,
  "Board Games": Gamepad2,
  "Restaurant": UtensilsCrossed,
  "Bar": Wine,
  "Room Service": BellRing,
  "Breakfast Included": Croissant,
  "Free WiFi": Wifi,
  "Dedicated Workspace": Laptop,
  "Free Parking": ParkingCircle,
  "Paid Parking": ParkingSquare,
  "EV Charging Station": BatteryCharging,
  "Airport Shuttle": Bus,
  "Bicycle Rental": Bike,
  "Garden": Trees,
  "Terrace": Sun,
  "Backyard": Fence,
  "Outdoor Furniture": Sofa,
  "Beach Access": Umbrella,
  "Lake / Waterfront Access": Sailboat,
  "Sea / Ocean View": Sunrise,
  "Mountain View": Mountain,
  "City View": Building2,
  "Laundry Service": WashingMachine,
  "24-Hour Front Desk": Clock,
  "Concierge": UserCheck,
  "Luggage Storage": Luggage,
  "Tour / Travel Desk": Compass,
  "Currency Exchange": Banknote,
  "Gift Shop": Gift,
  "Business Center": Briefcase,
  "Meeting Rooms": Presentation,
  "Library": BookOpen,
  "Kids Play Area": Baby,
  "Family Rooms": Users,
  "24-Hour Security": Shield,
  "CCTV Surveillance": Cctv,
  "Smoke Alarm": Siren,
  "Carbon Monoxide Alarm": ShieldAlert,
  "Fire Extinguisher": FireExtinguisher,
  "First Aid Kit": HeartPulse,
  "Pet Friendly": PawPrint,
  "Wheelchair Accessible": Accessibility,
  "Elevator / Lift": ArrowUpDown,
  "Non-Smoking Property": CigaretteOff,
  "Eco-Friendly / Solar Powered": Leaf,

  // Room-level (ROOM_AMENITIES)
  "TV": Tv,
  "Smart TV": MonitorPlay,
  "Smart TV with Netflix": MonitorPlay,
  "Tea/Coffee Maker": Coffee,
  "Electric Kettle": CookingPot,
  "Mini Bar": Martini,
  "Kitchenette": ChefHat,
  "Microwave": Microwave,
  "Refrigerator": Refrigerator,
  "USB Charging Ports": PlugZap,
  "Telephone": Phone,
  "Sitting Area": Armchair,
  "Balcony": DoorOpen,
  "Extra Pillows & Blankets": Bed,
  "Blackout Curtains": Blinds,
  "Reading Lamp": LampDesk,
  "Clothes Rack": Shirt,
  "Wardrobe": DoorClosed,
  "Desk": Table2,
  "In-Room Safe": LockKeyhole,
  "Bathtub": Bath,
  "Towels": Droplets,
  "Iron": Zap,
  "Hairdryer": Wind,
  "Smoking Allowed": Cigarette,
  "No Smoking": CigaretteOff,
};

// Fallback for any amenity that isn't in the map above (custom, free-typed amenities).
export const DEFAULT_AMENITY_ICON = Check;

const NORMALIZED_AMENITY_ICONS = Object.fromEntries(
  Object.entries(AMENITY_ICONS).map(([label, icon]) => [label.trim().toLowerCase(), icon])
);

// Case-insensitive, whitespace-tolerant icon lookup — use this instead of indexing
// AMENITY_ICONS directly so minor casing drift still resolves correctly.
export const getAmenityIcon = (label) =>
  NORMALIZED_AMENITY_ICONS[String(label || "").trim().toLowerCase()] || DEFAULT_AMENITY_ICON;
