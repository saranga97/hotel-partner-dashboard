import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BedDouble, Thermometer, Layers, Clock, Coffee,
  Upload, X, Check, AlertCircle, Loader2, ArrowLeft, Image,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useHotel } from "../context/HotelContext";
import { useNotifications } from "../context/NotificationContext";
import { FormInput, Alert, ToggleChip, CustomSelect } from "../components/ui";
import {
  ROOM_TYPES, AC_TYPES, FLOOR_TYPES, BED_TYPES, PREDEFINED_ROOM_AMENITIES,
} from "../constants/hotel";

const MIN_ROOM_IMAGES = 5;
const emptyBedCounts = { SINGLE_BED: 0, DOUBLE_BED: 0, QUEEN: 0, KING_SIZE: 0 };

const AddRoom = () => {
  const navigate = useNavigate();
  const { selectedHotel } = useHotel();
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
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!roomName.trim()) errs.roomName = "Required";
    if (!price) errs.price = "Required";
    if (images.length > 0 && images.length < MIN_ROOM_IMAGES) errs.images = `Add at least ${MIN_ROOM_IMAGES} images, or remove all to skip`;
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (skipImages = false) => {
    if (!skipImages && !validate()) return;
    if (skipImages) {
      // only validate non-image fields
      const errs = {};
      if (!roomName.trim()) errs.roomName = "Required";
      if (!price) errs.price = "Required";
      setFieldErrors(errs);
      if (Object.keys(errs).length > 0) return;
    }

    setLoading(true);
    setError("");
    try {
      const bedTypes = Object.entries(bedCounts)
        .filter(([, count]) => count > 0)
        .map(([type, count]) => ({ type, count }));

      const res = await axiosInstance.post("/rooms/add", {
        hotel_id: selectedHotel.hotel_id,
        roomName, roomType, bedTypes,
        defaultCheckInTime, defaultCheckOutTime,
        acType, price: Number(price),
        airMattress, clothingStorage, bedLinens, attachedBathroom,
        floor, amenities: selectedAmenities,
      });

      const createdRoom = res.data.room;

      if (!skipImages && images.length >= MIN_ROOM_IMAGES) {
        const formData = new FormData();
        images.forEach((file) => formData.append("images", file));
        await axiosInstance.put(`/rooms/${createdRoom.room_id}/images`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      addNotification("room_added", `Room "${createdRoom.roomName}" added successfully`, createdRoom);
      navigate("/rooms");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-surface p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/rooms")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white border border-brand-border transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 font-display tracking-tight leading-tight">Add New Room</h1>
            <p className="text-xs text-muted hidden sm:block">{selectedHotel?.name || "Select a hotel"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {images.length === 0 && (
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 border border-brand-border rounded-xl hover:bg-surface hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
            >
              Skip photos
            </button>
          )}
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm shadow-primary/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Creating...</> : <><Check className="h-4 w-4" />Add Room</>}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-5">

          {/* Left column: Details */}
          <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            {/* Basic info card */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-4 lg:p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-primary" />Room Details
              </h3>
              <div className="space-y-3">
                <div>
                  <FormInput label="Room name" placeholder="e.g. Deluxe Ocean View" value={roomName} onChange={(e) => { setRoomName(e.target.value); setFieldErrors((p) => { const n = {...p}; delete n.roomName; return n; }); }} />
                  {fieldErrors.roomName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.roomName}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <CustomSelect label="Room type" value={roomType} onChange={setRoomType} options={ROOM_TYPES} />
                  <CustomSelect label="AC type" value={acType} onChange={setAcType} options={AC_TYPES} />
                  <CustomSelect label="Floor" value={floor} onChange={setFloor} options={FLOOR_TYPES} />
                </div>
              </div>
            </div>

            {/* Pricing + Beds card */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-4 lg:p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />Pricing & Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <FormInput label="Price / night (LKR)" type="number" min="0" placeholder="0" value={price} onChange={(e) => { setPrice(e.target.value); setFieldErrors((p) => { const n = {...p}; delete n.price; return n; }); }} />
                  {fieldErrors.price && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.price}</p>}
                </div>
                <FormInput label="Check-in" type="time" value={defaultCheckInTime} onChange={(e) => setDefaultCheckInTime(e.target.value)} />
                <FormInput label="Check-out" type="time" value={defaultCheckOutTime} onChange={(e) => setDefaultCheckOutTime(e.target.value)} />
              </div>

              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Bed Types</h4>
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
            </div>

            {/* Features + Amenities card */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-4 lg:p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Coffee className="h-4 w-4 text-primary" />Features & Amenities
              </h3>

              <div className="flex flex-wrap gap-2 mb-4">
                <ToggleChip label="Air mattress" selected={airMattress} onToggle={() => setAirMattress((v) => !v)} />
                <ToggleChip label="Clothing storage" selected={clothingStorage} onToggle={() => setClothingStorage((v) => !v)} />
                <ToggleChip label="Bed linens" selected={bedLinens} onToggle={() => setBedLinens((v) => !v)} />
                <ToggleChip label="Attached bathroom" selected={attachedBathroom} onToggle={() => setAttachedBathroom((v) => !v)} />
              </div>

              <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PREDEFINED_ROOM_AMENITIES.map((amenity) => (
                  <ToggleChip key={amenity} label={amenity} selected={selectedAmenities.includes(amenity)} onToggle={() => toggleAmenity(amenity)} />
                ))}
                {selectedAmenities.filter((a) => !PREDEFINED_ROOM_AMENITIES.includes(a)).map((amenity) => (
                  <ToggleChip key={amenity} label={amenity} removable onToggle={() => toggleAmenity(amenity)} />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text" value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                  placeholder="Add custom amenity..."
                  className="flex-1 px-3.5 py-2 text-sm border border-brand-border rounded-xl transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <button onClick={addCustomAmenity} className="px-4 py-2 text-sm font-semibold border border-brand-border text-slate-700 bg-white hover:bg-surface rounded-xl transition-colors">Add</button>
              </div>
            </div>
          </div>

          {/* Right column: Photos */}
          <div className="lg:w-[340px] xl:w-[400px] flex-shrink-0">
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-4 lg:p-5 lg:h-full lg:flex lg:flex-col">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />Room Photos
              </h3>
              <p className="text-xs text-muted mb-3">
                {images.length > 0
                  ? <span>{images.length} selected <span className="text-primary">({MIN_ROOM_IMAGES} min)</span></span>
                  : `Add at least ${MIN_ROOM_IMAGES} photos, or skip for now`
                }
              </p>
              {fieldErrors.images && <Alert variant="error" className="mb-3 text-xs">{fieldErrors.images}</Alert>}

              <div className="grid grid-cols-3 gap-2 lg:flex-1 lg:content-start">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-brand-border">
                    <img src={src} alt={`Room ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-xl cursor-pointer hover:border-primary hover:bg-tint transition-all duration-200">
                  <Upload className="h-5 w-5 text-slate-400 mb-0.5" />
                  <span className="text-[10px] text-slate-500 font-medium">Upload</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddRoom;
