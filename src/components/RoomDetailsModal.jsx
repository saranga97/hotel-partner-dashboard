import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  BedDouble,
  Thermometer,
  Tag,
  Image,
} from "lucide-react";

const RoomDetailsModal = ({ room, onClose }) => {
  const [currentImage, setCurrentImage] = useState(0);

  if (!room) return null;

  const images = room.images || [];
  const imageCount = images.length;

  const handlePrev = () => {
    setCurrentImage((prev) => (prev - 1 + imageCount) % imageCount);
  };

  const handleNext = () => {
    setCurrentImage((prev) => (prev + 1) % imageCount);
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
        >
          <X className="h-5 w-5 text-slate-700" />
        </button>

        <div className="flex flex-col md:flex-row max-h-[85vh]">
          {/* Left: Image Gallery */}
          <div className="md:w-1/2 relative bg-slate-100">
            {imageCount > 0 ? (
              <>
                <div className="relative h-64 md:h-full min-h-[300px]">
                  <img
                    src={images[currentImage]}
                    alt={`${room.roomLabel} - ${currentImage + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Image counter */}
                  <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white rounded-full text-sm">
                    {currentImage + 1} / {imageCount}
                  </div>

                  {/* Navigation arrows */}
                  {imageCount > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute top-1/2 left-3 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5 text-slate-700" />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute top-1/2 right-3 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-colors"
                      >
                        <ChevronRight className="h-5 w-5 text-slate-700" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnail strip */}
                {imageCount > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
                    <div className="flex gap-2 justify-center">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImage(idx)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentImage
                              ? "border-white shadow-lg scale-110"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 md:h-full min-h-[300px] flex items-center justify-center">
                <Image className="h-16 w-16 text-slate-300" />
              </div>
            )}
          </div>

          {/* Right: Room Details */}
          <div className="md:w-1/2 overflow-y-auto p-6 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {room.roomLabel}
                </h2>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    room.roomType === "family"
                      ? "bg-green-100 text-green-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {room.roomType?.charAt(0).toUpperCase() +
                    room.roomType?.slice(1)}
                </span>
              </div>
              {room.hotel && (
                <p className="text-sm text-slate-500">
                  {room.hotel.name} - {room.hotel.location}
                </p>
              )}
            </div>

            {/* Night Stay */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-900">
                  Night Stay
                </h3>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold text-slate-900">
                  LKR {room.nightStayPrice?.toLocaleString()}
                </span>
                <span className="text-sm text-slate-500">/ night</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Thermometer className="h-3.5 w-3.5" />
                  <span>{room.nightStayAcType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {formatTime(room.defaultCheckInTime)} -{" "}
                    {formatTime(room.defaultCheckOutTime)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bed Types */}
            {room.bedTypes && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BedDouble className="h-4 w-4 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-700">
                    Bed Types
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(room.bedTypes)
                    .filter(([key, count]) => count > 0 && key !== "_id")
                    .map(([type, count]) => (
                      <span
                        key={type}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                      >
                        {count} {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Day-Out Packages */}
            {room.packages && room.packages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-semibold text-slate-700">
                    Day-Out Packages
                  </h3>
                </div>
                <div className="space-y-2">
                  {room.packages.map((pkg, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-amber-50 rounded-lg border border-amber-100"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-amber-900">
                          {pkg.packageName}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          LKR {pkg.price?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>
                          {formatTime(pkg.checkInTime)} -{" "}
                          {formatTime(pkg.checkOutTime)}
                        </span>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          {pkg.acType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    room.isManuallyBlocked ? "bg-red-500" : "bg-green-500"
                  }`}
                />
                <span className="text-sm text-slate-600">
                  {room.isManuallyBlocked ? "Room is blocked" : "Room is available"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;