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
  Plus,
  Trash2,
  Coffee,
  Check,
  AlertCircle,
  XCircle,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useNotifications } from "../context/NotificationContext";
import { Modal, FormInput, FormSelect, Badge, Button, ToggleChip } from "./ui";

const PREDEFINED_AMENITIES = [
  "TV", "Smart TV", "Smart TV with Netflix", "Smoking Allowed", "No Smoking",
  "Tea/Coffee Maker", "WiFi", "Breakfast Included", "Attached Bathroom",
  "Upper Floor", "Ground Floor", "Clothes Rack", "Electric Kettle", "Telephone",
  "Iron", "Hairdryer", "Desk", "Sitting Area", "Towels", "Bathtub", "Refrigerator",
];

const RoomDetailsModal = ({ room, onClose, onRoomUpdated }) => {
  const { addNotification } = useNotifications();
  const [currentImage, setCurrentImage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

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

  const [bedTypes, setBedTypes] = useState({
    single: room?.bedTypes?.single || 0,
    double: room?.bedTypes?.double || 0,
    queen: room?.bedTypes?.queen || 0,
    king: room?.bedTypes?.king || 0,
  });

  const [selectedAmenities, setSelectedAmenities] = useState(room?.amenities || []);
  const [customAmenity, setCustomAmenity] = useState("");

  const [packages, setPackages] = useState(
    room?.packages?.map((pkg) => ({ ...pkg })) || []
  );

  const [blockStatus, setBlockStatus] = useState(null);
  const [blockMessage, setBlockMessage] = useState("");

  if (!room) return null;

  const images = room.images || [];
  const imageCount = images.length;

  const handlePrev = () => setCurrentImage((prev) => (prev - 1 + imageCount) % imageCount);
  const handleNext = () => setCurrentImage((prev) => (prev + 1) % imageCount);

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const showFeedback = (setter, msgSetter, status, message, duration = 2500) => {
    setter(status);
    msgSetter(message);
    setTimeout(() => { setter(null); msgSetter(""); }, duration);
  };

  const handleToggleBlock = async () => {
    const endpoint = editData.isManuallyBlocked
      ? `/rooms/unblock/${room._id}`
      : `/rooms/block/${room._id}`;
    try {
      await axiosInstance.put(endpoint);
      const wasBlocked = editData.isManuallyBlocked;
      setEditData((prev) => ({ ...prev, isManuallyBlocked: !prev.isManuallyBlocked }));
      showFeedback(setBlockStatus, setBlockMessage, "success", wasBlocked ? "Room unblocked" : "Room blocked");
      if (onRoomUpdated) onRoomUpdated();
    } catch {
      showFeedback(setBlockStatus, setBlockMessage, "error", "Failed to update availability");
    }
  };

  const handleBedTypeChange = (type, value) => {
    setBedTypes((prev) => ({ ...prev, [type]: Math.max(0, parseInt(value) || 0) }));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      setSelectedAmenities((prev) => [...prev, trimmed]);
      setCustomAmenity("");
    }
  };

  const handlePackageChange = (index, field, value) => {
    setPackages((prev) => prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg)));
  };

  const addPackage = () => {
    setPackages((prev) => [...prev, { packageName: "", checkInTime: "08:00", checkOutTime: "17:00", acType: "AC", price: "" }]);
  };

  const removePackage = (index) => {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const formData = new FormData();
      formData.append("roomName", editData.roomName);
      formData.append("roomLabel", editData.roomLabel);
      formData.append("roomType", editData.roomType);
      formData.append("nightStayPrice", editData.nightStayPrice);
      formData.append("nightStayAcType", editData.nightStayAcType);
      formData.append("defaultCheckInTime", editData.defaultCheckInTime);
      formData.append("defaultCheckOutTime", editData.defaultCheckOutTime);
      formData.append("bedTypes", JSON.stringify(bedTypes));
      formData.append("amenities", JSON.stringify(selectedAmenities));
      formData.append("packages", JSON.stringify(packages.map((pkg) => ({ ...pkg, price: Number(pkg.price) }))));

      await axiosInstance.put(`/rooms/update-room/${room._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showFeedback(setSaveStatus, setSaveMessage, "success", "Saved successfully");
      setTimeout(() => setIsEditing(false), 1500);
      addNotification(
        "room_updated",
        `Room updated: ${editData.roomName || room.roomLabel} has been modified`,
        { _id: room._id, ...editData }
      );
      if (onRoomUpdated) onRoomUpdated();
    } catch (err) {
      showFeedback(setSaveStatus, setSaveMessage, "error", err.response?.data?.message || "Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      roomName: room?.roomName || "", roomLabel: room?.roomLabel || "",
      roomType: room?.roomType || "family", nightStayPrice: room?.nightStayPrice || 0,
      nightStayAcType: room?.nightStayAcType || "AC",
      defaultCheckInTime: room?.defaultCheckInTime || "14:00",
      defaultCheckOutTime: room?.defaultCheckOutTime || "12:00",
      isManuallyBlocked: room?.isManuallyBlocked || false,
    });
    setBedTypes({
      single: room?.bedTypes?.single || 0, double: room?.bedTypes?.double || 0,
      queen: room?.bedTypes?.queen || 0, king: room?.bedTypes?.king || 0,
    });
    setSelectedAmenities(room?.amenities || []);
    setCustomAmenity("");
    setPackages(room?.packages?.map((pkg) => ({ ...pkg })) || []);
    setSaveStatus(null); setSaveMessage(""); setIsEditing(false);
  };

  const getSaveButtonContent = () => {
    if (saving) return <><div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>;
    if (saveStatus === "success") return <><Check className="h-3.5 w-3.5" />{saveMessage}</>;
    if (saveStatus === "error") return <><AlertCircle className="h-3.5 w-3.5" />{saveMessage}</>;
    return <><Save className="h-3.5 w-3.5" />Save</>;
  };

  const getSaveButtonStyle = () => {
    if (saveStatus === "success") return "bg-green-600 hover:bg-green-700";
    if (saveStatus === "error") return "bg-red-600 hover:bg-red-700";
    return "bg-blue-600 hover:bg-blue-700";
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-6xl">
      <div className="flex flex-col md:flex-row max-h-[90vh]">
        {/* Left: Image Gallery */}
        <div className="md:w-5/12 relative bg-slate-100">
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
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 text-white rounded-full text-sm">
                  {currentImage + 1} / {imageCount}
                </div>
                {imageCount > 1 && (
                  <>
                    <button onClick={handlePrev} className="absolute top-1/2 left-3 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-colors">
                      <ChevronLeft className="h-5 w-5 text-slate-700" />
                    </button>
                    <button onClick={handleNext} className="absolute top-1/2 right-3 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-colors">
                      <ChevronRight className="h-5 w-5 text-slate-700" />
                    </button>
                  </>
                )}
              </div>
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
                        <img src={img} alt="" className="w-full h-full object-cover" />
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
        <div className="md:w-7/12 overflow-y-auto p-8 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.roomName}
                    onChange={(e) => setEditData((d) => ({ ...d, roomName: e.target.value }))}
                    className="text-xl font-bold text-slate-900 border border-slate-300 rounded-lg px-2 py-1"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-slate-900">
                    {editData.roomName || room.roomLabel}
                  </h2>
                )}
                {isEditing ? (
                  <select
                    value={editData.roomType}
                    onChange={(e) => setEditData((d) => ({ ...d, roomType: e.target.value }))}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="family">Family</option>
                    <option value="couple">Couple</option>
                  </select>
                ) : (
                  <Badge variant={editData.roomType === "family" ? "success" : "purple"}>
                    {editData.roomType?.charAt(0).toUpperCase() + editData.roomType?.slice(1)}
                  </Badge>
                )}
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
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleCancel} disabled={saving}>
                    <XCircle className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${getSaveButtonStyle()}`}
                  >
                    {getSaveButtonContent()}
                  </button>
                </div>
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
              <div className={`w-2.5 h-2.5 rounded-full ${editData.isManuallyBlocked ? "bg-red-500" : "bg-green-500"}`} />
              <span className="text-sm text-slate-700">
                {editData.isManuallyBlocked ? "Room is blocked" : "Room is available"}
              </span>
              {blockStatus && (
                <Badge
                  variant={blockStatus === "success" ? "success" : "danger"}
                  className="text-xs px-2 py-0.5"
                >
                  {blockStatus === "success" ? <Check className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                  {blockMessage}
                </Badge>
              )}
            </div>
            <button
              onClick={handleToggleBlock}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                editData.isManuallyBlocked ? "bg-red-400" : "bg-green-500"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                editData.isManuallyBlocked ? "translate-x-1" : "translate-x-6"
              }`} />
            </button>
          </div>

          {/* Night Stay */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">Night Stay</h3>
            </div>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Price (LKR)" labelClassName="block text-xs text-slate-500 mb-1" type="number" value={editData.nightStayPrice} onChange={(e) => setEditData((d) => ({ ...d, nightStayPrice: Number(e.target.value) }))} />
                <FormSelect label="AC Type" labelClassName="block text-xs text-slate-500 mb-1" value={editData.nightStayAcType} onChange={(e) => setEditData((d) => ({ ...d, nightStayAcType: e.target.value }))} options={[{ value: "AC", label: "AC" }, { value: "Non-AC", label: "Non-AC" }]} />
                <FormInput label="Check-in" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={editData.defaultCheckInTime} onChange={(e) => setEditData((d) => ({ ...d, defaultCheckInTime: e.target.value }))} />
                <FormInput label="Check-out" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={editData.defaultCheckOutTime} onChange={(e) => setEditData((d) => ({ ...d, defaultCheckOutTime: e.target.value }))} />
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
                    <span>{formatTime(editData.defaultCheckInTime)} - {formatTime(editData.defaultCheckOutTime)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Bed Types */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BedDouble className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-700">Bed Types</h3>
            </div>
            {isEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(bedTypes)
                  .filter(([key]) => key !== "_id")
                  .map(([type, count]) => (
                    <div key={type}>
                      <label className="block text-xs text-slate-500 mb-1 capitalize">{type}</label>
                      <input
                        type="number" min="0" value={count}
                        onChange={(e) => handleBedTypeChange(type, e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-center"
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(bedTypes)
                  .filter(([key, count]) => count > 0 && key !== "_id")
                  .map(([type, count]) => (
                    <span key={type} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                      {count} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  ))}
                {Object.entries(bedTypes).filter(([key, count]) => count > 0 && key !== "_id").length === 0 && (
                  <span className="text-sm text-slate-400 italic">No bed types specified</span>
                )}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-700">Amenities</h3>
            </div>
            {isEditing ? (
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PREDEFINED_AMENITIES.map((amenity) => (
                    <ToggleChip
                      key={amenity}
                      label={amenity}
                      selected={selectedAmenities.includes(amenity)}
                      onToggle={() => toggleAmenity(amenity)}
                      className="px-2.5 py-1"
                    />
                  ))}
                </div>
                {selectedAmenities
                  .filter((a) => !PREDEFINED_AMENITIES.includes(a))
                  .map((amenity) => (
                    <ToggleChip
                      key={amenity}
                      label={amenity}
                      removable
                      onToggle={() => toggleAmenity(amenity)}
                      className="mr-1.5 mb-1.5 px-2.5 py-1"
                    />
                  ))}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button variant="secondary" size="sm" onClick={addCustomAmenity} className="text-xs px-2.5 py-1.5">Add</Button>
                </div>
              </div>
            ) : selectedAmenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map((amenity) => (
                  <span key={amenity} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                    {amenity}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400 italic">No amenities specified</span>
            )}
          </div>

          {/* Day-Out Packages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-700">Day-Out Packages</h3>
              </div>
              {isEditing && (
                <button type="button" onClick={addPackage} className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="h-3.5 w-3.5 mr-0.5" />
                  Add Package
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                {packages.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No day-out packages. Click "Add Package" to create one.</p>
                )}
                {packages.map((pkg, index) => (
                  <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-amber-800">Package {index + 1}</span>
                      <button type="button" onClick={() => removePackage(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mb-2">
                      <FormInput
                        label="Package Name"
                        labelClassName="block text-xs text-slate-500 mb-1"
                        value={pkg.packageName}
                        onChange={(e) => handlePackageChange(index, "packageName", e.target.value)}
                        placeholder="e.g. Day Out - Morning"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <FormInput label="Check-in" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={pkg.checkInTime} onChange={(e) => handlePackageChange(index, "checkInTime", e.target.value)} />
                      <FormInput label="Check-out" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={pkg.checkOutTime} onChange={(e) => handlePackageChange(index, "checkOutTime", e.target.value)} />
                      <FormSelect label="AC Type" labelClassName="block text-xs text-slate-500 mb-1" value={pkg.acType} onChange={(e) => handlePackageChange(index, "acType", e.target.value)} options={[{ value: "AC", label: "AC" }, { value: "Non-AC", label: "Non-AC" }]} />
                      <FormInput label="Price (LKR)" labelClassName="block text-xs text-slate-500 mb-1" type="number" min="0" value={pkg.price} onChange={(e) => handlePackageChange(index, "price", e.target.value)} placeholder="0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : packages.length > 0 ? (
              <div className="space-y-2">
                {packages.map((pkg, idx) => (
                  <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-amber-900">{pkg.packageName}</span>
                      <span className="text-sm font-bold text-slate-900">LKR {pkg.price?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatTime(pkg.checkInTime)} - {formatTime(pkg.checkOutTime)}</span>
                      <Badge variant="warning" className="px-1.5 py-0.5 text-xs">{pkg.acType}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400 italic">No day-out packages</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;
