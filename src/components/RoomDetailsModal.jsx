import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Clock, BedDouble, Thermometer,
  Image, Pencil, Save, Coffee, Check, AlertCircle, XCircle, Layers,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useNotifications } from "../context/NotificationContext";
import { Modal, FormInput, Badge, Button, ToggleChip, CustomSelect } from "./ui";
import { ROOM_TYPES, AC_TYPES, FLOOR_TYPES, BED_TYPES, PREDEFINED_ROOM_AMENITIES } from "../constants/hotel";

const bedTypesToCounts = (bedTypes = []) => {
  const counts = { SINGLE_BED: 0, DOUBLE_BED: 0, QUEEN: 0, KING_SIZE: 0 };
  bedTypes.forEach((bt) => { counts[bt.type] = bt.count; });
  return counts;
};
const bedTypeLabel = (type) => ({ SINGLE_BED: "Single", DOUBLE_BED: "Double", QUEEN: "Queen", KING_SIZE: "King" }[type] || type);

const RoomDetailsModal = ({ room, onClose, onRoomUpdated }) => {
  const { addNotification } = useNotifications();
  const [currentImage, setCurrentImage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const [editData, setEditData] = useState({
    roomName: room?.roomName || "",
    roomType: room?.roomType || "FAMILY",
    price: room?.price || 0,
    acType: room?.acType || "AC",
    floor: room?.floor || "UPPER_FLOOR",
    defaultCheckInTime: room?.defaultCheckInTime || "14:00",
    defaultCheckOutTime: room?.defaultCheckOutTime || "12:00",
    airMattress: room?.airMattress || false,
    clothingStorage: room?.clothingStorage || false,
    bedLinens: room?.bedLinens || false,
    attachedBathroom: room?.attachedBathroom || false,
    isOnHold: room?.isOnHold || false,
  });

  const [bedCounts, setBedCounts] = useState(bedTypesToCounts(room?.bedTypes));
  const [selectedAmenities, setSelectedAmenities] = useState(room?.amenities || []);
  const [customAmenity, setCustomAmenity] = useState("");

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
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const showFeedback = (setter, msgSetter, status, message, duration = 2500) => {
    setter(status);
    msgSetter(message);
    setTimeout(() => { setter(null); msgSetter(""); }, duration);
  };

  const handleToggleBlock = async () => {
    const endpoint = editData.isOnHold
      ? `/rooms/${room.room_id}/release`
      : `/rooms/${room.room_id}/hold`;
    try {
      await axiosInstance.put(endpoint);
      const wasBlocked = editData.isOnHold;
      setEditData((prev) => ({ ...prev, isOnHold: !prev.isOnHold }));
      showFeedback(setBlockStatus, setBlockMessage, "success", wasBlocked ? "Room unblocked" : "Room blocked");
      if (onRoomUpdated) onRoomUpdated();
    } catch {
      showFeedback(setBlockStatus, setBlockMessage, "error", "Failed to update availability");
    }
  };

  const handleBedCountChange = (type, value) => {
    setBedCounts((prev) => ({ ...prev, [type]: Math.max(0, parseInt(value) || 0) }));
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

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      const bedTypes = Object.entries(bedCounts)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => ({ type, count }));

      await axiosInstance.put(`/rooms/${room.room_id}`, {
        roomName: editData.roomName,
        roomType: editData.roomType,
        price: Number(editData.price),
        acType: editData.acType,
        floor: editData.floor,
        defaultCheckInTime: editData.defaultCheckInTime,
        defaultCheckOutTime: editData.defaultCheckOutTime,
        airMattress: editData.airMattress,
        clothingStorage: editData.clothingStorage,
        bedLinens: editData.bedLinens,
        attachedBathroom: editData.attachedBathroom,
        bedTypes,
        amenities: selectedAmenities,
      });
      showFeedback(setSaveStatus, setSaveMessage, "success", "Saved successfully");
      setTimeout(() => setIsEditing(false), 1500);
      addNotification("room_updated", `Room updated: ${editData.roomName} has been modified`, { room_id: room.room_id, ...editData });
      if (onRoomUpdated) onRoomUpdated();
    } catch (err) {
      showFeedback(setSaveStatus, setSaveMessage, "error", err.response?.data?.message || "Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      roomName: room?.roomName || "", roomType: room?.roomType || "FAMILY",
      price: room?.price || 0, acType: room?.acType || "AC", floor: room?.floor || "UPPER_FLOOR",
      defaultCheckInTime: room?.defaultCheckInTime || "14:00",
      defaultCheckOutTime: room?.defaultCheckOutTime || "12:00",
      airMattress: room?.airMattress || false, clothingStorage: room?.clothingStorage || false,
      bedLinens: room?.bedLinens || false, attachedBathroom: room?.attachedBathroom || false,
      isOnHold: room?.isOnHold || false,
    });
    setBedCounts(bedTypesToCounts(room?.bedTypes));
    setSelectedAmenities(room?.amenities || []);
    setCustomAmenity("");
    setSaveStatus(null); setSaveMessage(""); setIsEditing(false);
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-6xl">
      <div className="flex flex-col md:flex-row max-h-[90vh]">
        {/* Image panel */}
        <div className="md:w-5/12 relative bg-slate-100">
          <button onClick={onClose} className="absolute top-3 left-3 z-20 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-colors">
            <X className="h-5 w-5 text-slate-700" />
          </button>
          {imageCount > 0 ? (
            <>
              <div className="relative h-64 md:h-full min-h-[300px]">
                <img src={images[currentImage]} alt={`${room.roomName} - ${currentImage + 1}`} className="w-full h-full object-cover" />
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
                          idx === currentImage ? "border-white shadow-lg scale-110" : "border-transparent opacity-70 hover:opacity-100"
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

        {/* Details panel */}
        <div className="md:w-7/12 overflow-y-auto p-6 sm:p-8 space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.roomName}
                    onChange={(e) => setEditData((d) => ({ ...d, roomName: e.target.value }))}
                    className="text-xl font-bold text-slate-900 border border-brand-border rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-full"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-slate-900 font-display truncate">{editData.roomName}</h2>
                )}
                {!isEditing && (
                  <Badge variant={editData.roomType === "FAMILY" ? "success" : "purple"}>
                    {editData.roomType === "FAMILY" ? "Family" : "Couple"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                {saveStatus && (
                  <span className={`text-xs font-medium flex items-center gap-1 ${saveStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                    {saveStatus === "success" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {saveMessage}
                  </span>
                )}
                {isEditing ? (
                  <>
                    <button onClick={handleCancel} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-brand-border rounded-lg hover:bg-surface transition-colors">
                      <XCircle className="h-3.5 w-3.5" />Cancel
                    </button>
                    <button
                      onClick={handleSave} disabled={saving}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {saving ? <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      {saving ? "Saving" : "Save"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-brand-border rounded-lg hover:bg-surface hover:text-slate-900 transition-colors">
                    <Pencil className="h-3.5 w-3.5" />Edit
                  </button>
                )}
              </div>
            </div>
            {room.hotel?.name && <p className="text-sm text-slate-500">{room.hotel.name}</p>}
          </div>

          {/* Availability toggle */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-brand-border">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${editData.isOnHold ? "bg-red-500" : "bg-green-500"}`} />
              <span className="text-sm text-slate-700">
                {editData.isOnHold ? "Room is blocked" : "Room is available"}
              </span>
              {blockStatus && (
                <Badge variant={blockStatus === "success" ? "success" : "danger"} className="text-xs px-2 py-0.5">
                  {blockStatus === "success" ? <Check className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                  {blockMessage}
                </Badge>
              )}
            </div>
            <button
              onClick={handleToggleBlock}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editData.isOnHold ? "bg-red-400" : "bg-green-500"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editData.isOnHold ? "translate-x-1" : "translate-x-6"}`} />
            </button>
          </div>

          {/* Pricing & schedule */}
          <div className="p-4 bg-tint rounded-xl border border-primary/15">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary-dark">Pricing & Schedule</h3>
            </div>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Price (LKR)" labelClassName="block text-xs text-slate-500 mb-1" type="number" value={editData.price} onChange={(e) => setEditData((d) => ({ ...d, price: Number(e.target.value) }))} />
                <CustomSelect label="AC Type" value={editData.acType} onChange={(v) => setEditData((d) => ({ ...d, acType: v }))} options={AC_TYPES} />
                <FormInput label="Check-in" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={editData.defaultCheckInTime} onChange={(e) => setEditData((d) => ({ ...d, defaultCheckInTime: e.target.value }))} />
                <FormInput label="Check-out" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={editData.defaultCheckOutTime} onChange={(e) => setEditData((d) => ({ ...d, defaultCheckOutTime: e.target.value }))} />
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-slate-900">LKR {editData.price?.toLocaleString()}</span>
                  <span className="text-sm text-slate-500">/ night</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" /><span>{editData.acType === "AC" ? "AC" : "Non-AC"}</span></div>
                  <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /><span>{formatTime(editData.defaultCheckInTime)} - {formatTime(editData.defaultCheckOutTime)}</span></div>
                </div>
              </>
            )}
          </div>

          {/* Room type + Floor (edit mode) */}
          {isEditing && (
            <div className="grid grid-cols-2 gap-3">
              <CustomSelect label="Room Type" value={editData.roomType} onChange={(v) => setEditData((d) => ({ ...d, roomType: v }))} options={ROOM_TYPES} />
              <CustomSelect label="Floor" value={editData.floor} onChange={(v) => setEditData((d) => ({ ...d, floor: v }))} options={FLOOR_TYPES} />
            </div>
          )}

          {/* Floor (view mode) */}
          {!isEditing && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Layers className="h-4 w-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-700">Floor</h3>
              </div>
              <span className="text-sm text-slate-600">{editData.floor === "UPPER_FLOOR" ? "Upper floor" : "Ground floor"}</span>
            </div>
          )}

          {/* Bed Types */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BedDouble className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-700">Bed Types</h3>
            </div>
            {isEditing ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BED_TYPES.map(({ value, label }) => (
                  <div key={value}>
                    <label className="block text-xs text-slate-500 mb-1">{label}</label>
                    <input
                      type="number" min="0" value={bedCounts[value]}
                      onChange={(e) => handleBedCountChange(value, e.target.value)}
                      className="w-full px-3 py-2 border border-brand-border rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors hover:border-slate-300"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(bedCounts).filter(([, count]) => count > 0).map(([type, count]) => (
                  <span key={type} className="px-3 py-1.5 bg-surface text-slate-700 rounded-lg text-sm font-medium border border-brand-border">
                    {count} {bedTypeLabel(type)}
                  </span>
                ))}
                {Object.values(bedCounts).every((c) => c === 0) && (
                  <span className="text-sm text-slate-400 italic">No bed types specified</span>
                )}
              </div>
            )}
          </div>

          {/* Room Features */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Room Features</h3>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                <ToggleChip label="Air mattress" selected={editData.airMattress} onToggle={() => setEditData((d) => ({ ...d, airMattress: !d.airMattress }))} />
                <ToggleChip label="Clothing storage" selected={editData.clothingStorage} onToggle={() => setEditData((d) => ({ ...d, clothingStorage: !d.clothingStorage }))} />
                <ToggleChip label="Bed linens" selected={editData.bedLinens} onToggle={() => setEditData((d) => ({ ...d, bedLinens: !d.bedLinens }))} />
                <ToggleChip label="Attached bathroom" selected={editData.attachedBathroom} onToggle={() => setEditData((d) => ({ ...d, attachedBathroom: !d.attachedBathroom }))} />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[
                  editData.airMattress && "Air mattress", editData.clothingStorage && "Clothing storage",
                  editData.bedLinens && "Bed linens", editData.attachedBathroom && "Attached bathroom",
                ].filter(Boolean).map((f) => (
                  <span key={f} className="px-3 py-1.5 bg-surface text-slate-700 rounded-lg text-sm border border-brand-border">{f}</span>
                ))}
                {![editData.airMattress, editData.clothingStorage, editData.bedLinens, editData.attachedBathroom].some(Boolean) && (
                  <span className="text-sm text-slate-400 italic">No features specified</span>
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
                  {PREDEFINED_ROOM_AMENITIES.map((amenity) => (
                    <ToggleChip key={amenity} label={amenity} selected={selectedAmenities.includes(amenity)} onToggle={() => toggleAmenity(amenity)} />
                  ))}
                </div>
                {selectedAmenities.filter((a) => !PREDEFINED_ROOM_AMENITIES.includes(a)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedAmenities.filter((a) => !PREDEFINED_ROOM_AMENITIES.includes(a)).map((amenity) => (
                      <ToggleChip key={amenity} label={amenity} removable onToggle={() => toggleAmenity(amenity)} />
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-3.5 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors hover:border-slate-300"
                  />
                  <button onClick={addCustomAmenity} className="px-4 py-2 text-sm font-semibold border border-brand-border text-slate-700 bg-white hover:bg-surface rounded-xl transition-colors">Add</button>
                </div>
              </div>
            ) : selectedAmenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map((amenity) => (
                  <span key={amenity} className="px-3 py-1.5 bg-tint text-primary-dark rounded-lg text-xs font-medium border border-primary/15">{amenity}</span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400 italic">No amenities specified</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RoomDetailsModal;
