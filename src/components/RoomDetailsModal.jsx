import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Clock, BedDouble, Thermometer,
  Image, Pencil, Save, Coffee, Check, AlertCircle, XCircle, Layers,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useNotifications } from "../context/NotificationContext";
import { Modal, FormInput, FormSelect, Badge, Button, ToggleChip } from "./ui";
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
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const showFeedback = (setter, msgSetter, status, message, duration = 2500) => {
    setter(status);
    msgSetter(message);
    setTimeout(() => { setter(null); msgSetter(""); }, duration);
  };

  // Backend renamed block/unblock -> hold/release (and the room field
  // isTemporaryBlocked -> isOnHold) — TRB-020.
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

  const getSaveButtonContent = () => {
    if (saving) return <><div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</>;
    if (saveStatus === "success") return <><Check className="h-3.5 w-3.5" />{saveMessage}</>;
    if (saveStatus === "error") return <><AlertCircle className="h-3.5 w-3.5" />{saveMessage}</>;
    return <><Save className="h-3.5 w-3.5" />Save</>;
  };

  const getSaveButtonStyle = () => {
    if (saveStatus === "success") return "bg-green-600 hover:bg-green-700";
    if (saveStatus === "error") return "bg-red-600 hover:bg-red-700";
    return "bg-primary hover:bg-primary-dark";
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-6xl">
      <div className="flex flex-col md:flex-row max-h-[90vh]">
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

        <div className="md:w-7/12 overflow-y-auto p-8 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.roomName}
                    onChange={(e) => setEditData((d) => ({ ...d, roomName: e.target.value }))}
                    className="text-xl font-bold text-slate-900 border border-brand-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-slate-900 font-display">{editData.roomName}</h2>
                )}
                {isEditing ? (
                  <select
                    value={editData.roomType}
                    onChange={(e) => setEditData((d) => ({ ...d, roomType: e.target.value }))}
                    className="px-2.5 py-1 rounded-full text-xs font-medium border border-brand-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {ROOM_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <Badge variant={editData.roomType === "FAMILY" ? "success" : "purple"}>
                    {editData.roomType === "FAMILY" ? "Family" : "Couple"}
                  </Badge>
                )}
              </div>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-primary hover:bg-tint rounded-lg transition-colors" title="Edit room">
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
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${getSaveButtonStyle()}`}
                  >
                    {getSaveButtonContent()}
                  </button>
                </div>
              )}
            </div>
            {room.hotel?.name && <p className="text-sm text-slate-500">{room.hotel.name}</p>}
          </div>

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

          <div className="p-4 bg-tint rounded-xl border border-primary/15">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-primary-dark">Pricing & Check-in / Check-out</h3>
            </div>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Price (LKR)" labelClassName="block text-xs text-slate-500 mb-1" type="number" value={editData.price} onChange={(e) => setEditData((d) => ({ ...d, price: Number(e.target.value) }))} />
                <FormSelect label="AC Type" labelClassName="block text-xs text-slate-500 mb-1" value={editData.acType} onChange={(e) => setEditData((d) => ({ ...d, acType: e.target.value }))} options={AC_TYPES} />
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

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-700">Floor</h3>
            </div>
            {isEditing ? (
              <FormSelect value={editData.floor} onChange={(e) => setEditData((d) => ({ ...d, floor: e.target.value }))} options={FLOOR_TYPES} />
            ) : (
              <span className="text-sm text-slate-600">{editData.floor === "UPPER_FLOOR" ? "Upper floor" : "Ground floor"}</span>
            )}
          </div>

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
                      className="w-full px-2 py-1.5 border border-brand-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Object.entries(bedCounts).filter(([, count]) => count > 0).map(([type, count]) => (
                  <span key={type} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                    {count} {bedTypeLabel(type)}
                  </span>
                ))}
                {Object.values(bedCounts).every((c) => c === 0) && (
                  <span className="text-sm text-slate-400 italic">No bed types specified</span>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Room Features</h3>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                <ToggleChip label="Air mattress available" selected={editData.airMattress} onToggle={() => setEditData((d) => ({ ...d, airMattress: !d.airMattress }))} />
                <ToggleChip label="Clothing storage" selected={editData.clothingStorage} onToggle={() => setEditData((d) => ({ ...d, clothingStorage: !d.clothingStorage }))} />
                <ToggleChip label="Bed linens provided" selected={editData.bedLinens} onToggle={() => setEditData((d) => ({ ...d, bedLinens: !d.bedLinens }))} />
                <ToggleChip label="Attached bathroom" selected={editData.attachedBathroom} onToggle={() => setEditData((d) => ({ ...d, attachedBathroom: !d.attachedBathroom }))} />
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[
                  editData.airMattress && "Air mattress", editData.clothingStorage && "Clothing storage",
                  editData.bedLinens && "Bed linens", editData.attachedBathroom && "Attached bathroom",
                ].filter(Boolean).map((f) => (
                  <span key={f} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm">{f}</span>
                ))}
                {![editData.airMattress, editData.clothingStorage, editData.bedLinens, editData.attachedBathroom].some(Boolean) && (
                  <span className="text-sm text-slate-400 italic">No features specified</span>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold text-slate-700">Amenities</h3>
            </div>
            {isEditing ? (
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PREDEFINED_ROOM_AMENITIES.map((amenity) => (
                    <ToggleChip key={amenity} label={amenity} selected={selectedAmenities.includes(amenity)} onToggle={() => toggleAmenity(amenity)} className="px-2.5 py-1" />
                  ))}
                </div>
                {selectedAmenities.filter((a) => !PREDEFINED_ROOM_AMENITIES.includes(a)).map((amenity) => (
                  <ToggleChip key={amenity} label={amenity} removable onToggle={() => toggleAmenity(amenity)} className="mr-1.5 mb-1.5 px-2.5 py-1" />
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-2.5 py-1.5 border border-brand-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <Button variant="secondary" size="sm" onClick={addCustomAmenity} className="text-xs px-2.5 py-1.5">Add</Button>
                </div>
              </div>
            ) : selectedAmenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map((amenity) => (
                  <span key={amenity} className="px-3 py-1.5 bg-tint text-primary-dark rounded-lg text-xs font-medium">{amenity}</span>
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
