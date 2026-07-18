import { useState } from "react";
import { Upload, Image, Clock, Coffee, Check, AlertCircle, X } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useNotifications } from "../context/NotificationContext";
import { Modal, FormInput, FormSelect, Button, Alert, ToggleChip } from "./ui";
import {
  ROOM_TYPES, AC_TYPES, FLOOR_TYPES, BED_TYPES, PREDEFINED_ROOM_AMENITIES,
} from "../constants/hotel";

const MIN_ROOM_IMAGES = 5;

const emptyBedCounts = { SINGLE_BED: 0, DOUBLE_BED: 0, QUEEN: 0, KING_SIZE: 0 };

// Room creation and room images are two separate backend calls (POST /rooms/add
// takes no images at all — PUT /rooms/:room_id/images is a dedicated follow-up),
// same two-step pattern as hotel registration/photos.
const AddRoomModal = ({ isOpen, onClose, hotelId, onRoomAdded }) => {
  const { addNotification } = useNotifications();
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("FAMILY");
  const [bedCounts, setBedCounts] = useState(emptyBedCounts);

  const [price, setPrice] = useState("");
  const [acType, setAcType] = useState("AC");
  const [floor, setFloor] = useState("UPPER_FLOOR");
  const [defaultCheckInTime, setDefaultCheckInTime] = useState("14:00");
  const [defaultCheckOutTime, setDefaultCheckOutTime] = useState("12:00");

  const [airMattress, setAirMattress] = useState(false);
  const [clothingStorage, setClothingStorage] = useState(false);
  const [bedLinens, setBedLinens] = useState(false);
  const [attachedBathroom, setAttachedBathroom] = useState(false);

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [validationError, setValidationError] = useState("");

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setRoomName(""); setRoomType("FAMILY"); setBedCounts(emptyBedCounts);
    setPrice(""); setAcType("AC"); setFloor("UPPER_FLOOR");
    setDefaultCheckInTime("14:00"); setDefaultCheckOutTime("12:00");
    setAirMattress(false); setClothingStorage(false); setBedLinens(false); setAttachedBathroom(false);
    setSelectedAmenities([]); setCustomAmenity("");
    previews.forEach((p) => URL.revokeObjectURL(p));
    setImages([]); setPreviews([]); setValidationError("");
    setSubmitStatus(null); setSubmitMessage("");
  };

  const handleSubmit = async (e, skipImages = false) => {
    e.preventDefault();
    setValidationError(""); setSubmitStatus(null);

    if (!hotelId) { setValidationError("Hotel not found. Please try again."); return; }
    if (!roomName.trim()) { setValidationError("Please enter a room name"); return; }
    if (!price) { setValidationError("Please enter the price per night"); return; }
    if (!skipImages && images.length > 0 && images.length < MIN_ROOM_IMAGES) {
      setValidationError(`Add at least ${MIN_ROOM_IMAGES} images, or use "Skip photos" to add them later.`);
      return;
    }

    setLoading(true);
    try {
      const bedTypes = Object.entries(bedCounts)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => ({ type, count }));

      const res = await axiosInstance.post("/rooms/add", {
        hotel_id: hotelId,
        roomName,
        roomType,
        bedTypes,
        defaultCheckInTime,
        defaultCheckOutTime,
        acType,
        price: Number(price),
        airMattress,
        clothingStorage,
        bedLinens,
        attachedBathroom,
        floor,
        amenities: selectedAmenities,
      });

      const createdRoom = res.data.room;

      if (!skipImages && images.length >= MIN_ROOM_IMAGES) {
        const formData = new FormData();
        images.forEach((file) => formData.append("images", file));
        await axiosInstance.put(`/rooms/${createdRoom.room_id}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setSubmitStatus("success");
      setSubmitMessage("Room added!");

      addNotification("room_added", `Room "${createdRoom.roomName}" added successfully`, createdRoom);

      setTimeout(() => { resetForm(); onRoomAdded(); onClose(); }, 1200);
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(err.response?.data?.message || err.response?.data?.error || "Failed to add room");
      setTimeout(() => { setSubmitStatus(null); setSubmitMessage(""); }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const getSubmitButtonContent = () => {
    if (loading) return <>{<div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}Adding Room...</>;
    if (submitStatus === "success") return <><Check className="h-4 w-4" />{submitMessage}</>;
    if (submitStatus === "error") return <><AlertCircle className="h-4 w-4" />{submitMessage}</>;
    return "Add Room";
  };

  const getSubmitButtonStyle = () => {
    if (submitStatus === "success") return "bg-green-600 hover:bg-green-700";
    if (submitStatus === "error") return "bg-red-600 hover:bg-red-700";
    return "bg-primary hover:bg-primary-dark";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Room">
      <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 space-y-6">
        {validationError && <Alert variant="error">{validationError}</Alert>}

        <FormInput
          label="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="e.g. Double Deluxe Room, Deluxe Ocean View"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormSelect label="Room Type" value={roomType} onChange={(e) => setRoomType(e.target.value)} options={ROOM_TYPES} />
          <FormSelect label="AC Type" value={acType} onChange={(e) => setAcType(e.target.value)} options={AC_TYPES} />
          <FormSelect label="Floor" value={floor} onChange={(e) => setFloor(e.target.value)} options={FLOOR_TYPES} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Bed Types</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BED_TYPES.map(({ value, label }) => (
              <div key={value}>
                <label className="block text-xs text-slate-500 mb-1">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={bedCounts[value]}
                  onChange={(e) => handleBedCountChange(value, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-tint rounded-lg border border-brand-border">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-primary-dark">Pricing & Check-in / Check-out</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FormInput
              label="Price per night (LKR)"
              labelClassName="block text-xs text-slate-500 mb-1"
              type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="0" required
            />
            <FormInput label="Check-in Time" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={defaultCheckInTime} onChange={(e) => setDefaultCheckInTime(e.target.value)} required />
            <FormInput label="Check-out Time" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={defaultCheckOutTime} onChange={(e) => setDefaultCheckOutTime(e.target.value)} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Room Features</label>
          <div className="flex flex-wrap gap-2">
            <ToggleChip label="Air mattress available" selected={airMattress} onToggle={() => setAirMattress((v) => !v)} />
            <ToggleChip label="Clothing storage" selected={clothingStorage} onToggle={() => setClothingStorage((v) => !v)} />
            <ToggleChip label="Bed linens provided" selected={bedLinens} onToggle={() => setBedLinens((v) => !v)} />
            <ToggleChip label="Attached bathroom" selected={attachedBathroom} onToggle={() => setAttachedBathroom((v) => !v)} />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Coffee className="h-4 w-4 text-slate-600" />
            <label className="block text-sm font-medium text-slate-700">Room Amenities</label>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {PREDEFINED_ROOM_AMENITIES.map((amenity) => (
              <ToggleChip key={amenity} label={amenity} selected={selectedAmenities.includes(amenity)} onToggle={() => toggleAmenity(amenity)} />
            ))}
          </div>
          {selectedAmenities.filter((a) => !PREDEFINED_ROOM_AMENITIES.includes(a)).map((amenity) => (
            <ToggleChip key={amenity} label={amenity} removable onToggle={() => toggleAmenity(amenity)} className="mr-2 mb-2" />
          ))}
          <div className="flex gap-2">
            <input
              type="text" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
              placeholder="Add custom amenity..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button variant="secondary" size="sm" type="button" onClick={addCustomAmenity}>Add</Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Room Images ({images.length}/{MIN_ROOM_IMAGES} minimum, optional)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {previews.map((src, index) => (
              <div key={index} className="relative group aspect-square">
                <img src={src} alt={`Room ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-brand-border" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary hover:bg-tint transition-colors">
              <Upload className="h-6 w-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500">Upload</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
          </div>
          {images.length === 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Image className="h-4 w-4" />
              <span>Add at least {MIN_ROOM_IMAGES} photos now, or skip and add them later</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          {images.length === 0 && (
            <Button variant="secondary" type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading}>
              Skip photos
            </Button>
          )}
          <button
            type="submit"
            disabled={loading || submitStatus === "success"}
            className={`inline-flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getSubmitButtonStyle()}`}
          >
            {getSubmitButtonContent()}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddRoomModal;
