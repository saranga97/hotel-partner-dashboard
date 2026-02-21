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
  Pencil,
  Save,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const RoomDetailsModal = ({ room, onClose, onRoomUpdated }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editData, setEditData] = useState({
    roomName: room?.roomName || "",
    roomLabel: room?.roomLabel || "",
    roomType: room?.roomType || "family",
    nightStayPrice: room?.nightStayPrice || 0,
    nightStayAcType: room?.nightStayAcType || "AC",
    defaultCheckInTime: room?.defaultCheckInTime || "14:00",
    defaultCheckOutTime: room?.defaultCheckOutTime || "12:00",
    isManuallyBlocked: room?.isManuallyBlocked || false,
  });

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

  const handleToggleBlock = async () => {
    const endpoint = editData.isManuallyBlocked
      ? `/rooms/unblock/${room._id}`
      : `/rooms/block/${room._id}`;
    try {
      await axiosInstance.put(endpoint);
      setEditData((prev) => ({
        ...prev,
        isManuallyBlocked: !prev.isManuallyBlocked,
      }));
      toast.success(
        editData.isManuallyBlocked ? "Room unblocked" : "Room blocked"
      );
      if (onRoomUpdated) onRoomUpdated();
    } catch (err) {
      toast.error("Failed to update room availability");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("roomName", editData.roomName);
      formData.append("roomLabel", editData.roomLabel);
      formData.append("roomType", editData.roomType);
      formData.append("nightStayPrice", editData.nightStayPrice);
      formData.append("nightStayAcType", editData.nightStayAcType);
      formData.append("defaultCheckInTime", editData.defaultCheckInTime);
      formData.append("defaultCheckOutTime", editData.defaultCheckOutTime);

      await axiosInstance.put(`/rooms/update-room/${room._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Room updated successfully");
      setIsEditing(false);
      if (onRoomUpdated) onRoomUpdated();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update room"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden mx-4">
        <div className="flex flex-col md:flex-row max-h-[85vh]">
          {/* Left: Image Gallery */}
          <div className="md:w-1/2 relative bg-slate-100">
            {/* Close button - positioned on image side */}
            <button
              onClick={onClose}
              className="absolute top-3 left-3 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors"
            >
              <X className="h-5 w-5 text-slate-700" />
            </button>
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
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.roomName}
                      onChange={(e) =>
                        setEditData((d) => ({ ...d, roomName: e.target.value }))
                      }
                      className="text-xl font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-slate-900">
                      {editData.roomName || room.roomLabel}
                    </h2>
                  )}
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
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit room"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
              {editData.roomName && (
                <p className="text-sm text-slate-500 mb-1">{room.roomLabel}</p>
              )}
              {room.hotel && (
                <p className="text-sm text-slate-500">
                  {room.hotel.name} - {room.hotel.location}
                </p>
              )}
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    editData.isManuallyBlocked ? "bg-red-500" : "bg-green-500"
                  }`}
                />
                <span className="text-sm text-slate-700">
                  {editData.isManuallyBlocked
                    ? "Room is blocked"
                    : "Room is available"}
                </span>
              </div>
              <button
                onClick={handleToggleBlock}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  editData.isManuallyBlocked ? "bg-red-400" : "bg-green-500"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    editData.isManuallyBlocked
                      ? "translate-x-1"
                      : "translate-x-6"
                  }`}
                />
              </button>
            </div>

            {/* Night Stay */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-900">
                  Night Stay
                </h3>
              </div>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Price (LKR)
                    </label>
                    <input
                      type="number"
                      value={editData.nightStayPrice}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          nightStayPrice: Number(e.target.value),
                        }))
                      }
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      AC Type
                    </label>
                    <select
                      value={editData.nightStayAcType}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          nightStayAcType: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Check-in
                    </label>
                    <input
                      type="time"
                      value={editData.defaultCheckInTime}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          defaultCheckInTime: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Check-out
                    </label>
                    <input
                      type="time"
                      value={editData.defaultCheckOutTime}
                      onChange={(e) =>
                        setEditData((d) => ({
                          ...d,
                          defaultCheckOutTime: e.target.value,
                        }))
                      }
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-2xl font-bold text-slate-900">
                      LKR {editData.nightStayPrice?.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-500">/ night</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5" />
                      <span>{editData.nightStayAcType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {formatTime(editData.defaultCheckInTime)} -{" "}
                        {formatTime(editData.defaultCheckOutTime)}
                      </span>
                    </div>
                  </div>
                </>
              )}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal;
