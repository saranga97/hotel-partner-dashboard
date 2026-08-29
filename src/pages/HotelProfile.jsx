import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useHotel } from "../context/HotelContext";
import {
  Building2, Image, MapPin, Users, DollarSign, Coffee,
  Upload, X, Save, Loader2, Check, AlertCircle, Camera, Plus,
  Pencil, XCircle, Clock, Phone, Star, Home,
} from "lucide-react";
import { FormInput, Alert, LoadingSpinner, Button, ToggleChip, Badge, CustomSelect } from "../components/ui";
import {
  HOTEL_TYPES, PLACE_TYPES, BATHROOM_TYPES, BOOKING_METHODS, WHO_ELSE_OPTIONS,
  COUNTRIES, PREDEFINED_AMENITIES,
} from "../constants/hotel";

const TABS = [
  { key: "overview", label: "Overview", icon: Building2 },
  { key: "location", label: "Location", icon: MapPin },
  { key: "guests", label: "Guests", icon: Users },
  { key: "pricing", label: "Pricing", icon: DollarSign },
  { key: "amenities", label: "Amenities", icon: Coffee },
];

const STAR_OPTIONS = [
  { value: "", label: "Not rated" },
  ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` })),
];
const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.iso, label: c.name }));
const MIN_GALLERY_IMAGES = 5;

const formatBasePrice = (amount) => `${Number(amount).toLocaleString("en-LK")} LKR`;
const parseBasePrice = (basePrice) => {
  const parsed = parseFloat(String(basePrice || "").replace(/[^0-9.]/g, ""));
  return isNaN(parsed) ? "" : parsed;
};

const emptyFormState = {
  name: "", description: "", hotelType: "", placeType: "", starRating: "",
  country: "LK", streetAddress: "", apartmentNumber: "", city: "", province: "", postalCode: "", contactNumber: "",
  bathroomType: "", whoElseIsThere: [], checkInTime: "14:00", checkOutTime: "12:00",
  basePrice: "", bookingMethod: "INSTANT_BOOK",
  amenities: [],
};

const formatTime = (time) => {
  if (!time) return "";
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

const HotelProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("ceylonstay_user") || "null");
  const { selectedHotel, refreshHotels, loading: hotelLoading } = useHotel();
  const [hotel, setHotel] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");

  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");

  const [form, setForm] = useState(emptyFormState);
  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const [existingProfileImage, setExistingProfileImage] = useState("");
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [newProfileFile, setNewProfileFile] = useState(null);
  const [newProfilePreview, setNewProfilePreview] = useState("");
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);
  const [imageError, setImageError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (hotelLoading) return;
    if (selectedHotel) {
      setHotel(selectedHotel);
      populateState(selectedHotel);
    } else {
      setHotel(null);
    }
    setLoading(false);
  }, [selectedHotel, hotelLoading]);

  const showSaveFeedback = (status, message, duration = 2500) => {
    setSaveStatus(status);
    setSaveMessage(message);
    setTimeout(() => { setSaveStatus(null); setSaveMessage(""); }, duration);
  };

  const populateState = (h) => {
    setForm({
      name: h.name || "", description: h.description || "",
      hotelType: h.hotelType || "", placeType: h.placeType || "",
      starRating: h.starRating ? String(h.starRating) : "",
      country: h.country || "LK", streetAddress: h.streetAddress || "",
      apartmentNumber: h.apartmentNumber || "", city: h.city || "",
      province: h.province || "", postalCode: h.postalCode || "",
      contactNumber: h.contactNumber || "", bathroomType: h.bathroomType || "",
      whoElseIsThere: h.whoElseIsThere || [],
      checkInTime: h.checkInTime || "14:00", checkOutTime: h.checkOutTime || "12:00",
      basePrice: parseBasePrice(h.basePrice),
      bookingMethod: h.bookingMethod || "INSTANT_BOOK",
      amenities: h.amenities || [],
    });
    setExistingProfileImage(h.profileImage || "");
    setExistingGalleryImages(h.images || []);
  };

  const cancelEdit = () => {
    if (hotel) populateState(hotel);
    setEditing(false);
    setSaveStatus(null);
  };

  const saveSection = async (data) => {
    if (!hotel) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await axiosInstance.put(`/hotels/${hotel.hotel_id}`, data);
      setHotel(res.data.hotel);
      populateState(res.data.hotel);
      refreshHotels();
      setEditing(false);
      showSaveFeedback("success", "Saved!");
    } catch (err) {
      showSaveFeedback("error", err.response?.data?.message || err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (activeTab === "overview") {
      saveSection({ name: form.name, description: form.description, hotelType: form.hotelType, placeType: form.placeType, starRating: form.starRating || undefined });
    } else if (activeTab === "location") {
      saveSection({ country: form.country, streetAddress: form.streetAddress, apartmentNumber: form.apartmentNumber, city: form.city, province: form.province, postalCode: form.postalCode, contactNumber: form.contactNumber });
    } else if (activeTab === "guests") {
      saveSection({ bathroomType: form.bathroomType, whoElseIsThere: form.whoElseIsThere, checkInTime: form.checkInTime, checkOutTime: form.checkOutTime });
    } else if (activeTab === "pricing") {
      saveSection({ basePrice: formatBasePrice(form.basePrice), bookingMethod: form.bookingMethod });
    } else if (activeTab === "amenities") {
      saveSection({ amenities: form.amenities });
    }
  };

  const toggleAmenity = (amenity) => {
    setField("amenities", form.amenities.includes(amenity)
      ? form.amenities.filter((a) => a !== amenity)
      : [...form.amenities, amenity]);
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !form.amenities.includes(trimmed)) {
      setField("amenities", [...form.amenities, trimmed]);
      setCustomAmenity("");
    }
  };

  const toggleWhoElse = (value) => {
    setField("whoElseIsThere", form.whoElseIsThere.includes(value)
      ? form.whoElseIsThere.filter((v) => v !== value)
      : [...form.whoElseIsThere, value]);
  };

  const handleProfileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewProfileFile(file);
    setNewProfilePreview(URL.createObjectURL(file));
  };

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewGalleryFiles((prev) => [...prev, ...files]);
    setNewGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeGalleryFile = (index) => {
    URL.revokeObjectURL(newGalleryPreviews[index]);
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setNewGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveGallery = async () => {
    if (newGalleryFiles.length < MIN_GALLERY_IMAGES) {
      setImageError(`Select at least ${MIN_GALLERY_IMAGES} gallery images to upload (replaces current gallery).`);
      setTimeout(() => setImageError(""), 4000);
      return;
    }
    setUploadingImages(true);
    setSaveStatus(null);
    try {
      const formData = new FormData();
      if (newProfileFile) formData.append("profileImage", newProfileFile);
      newGalleryFiles.forEach((f) => formData.append("images", f));
      const res = await axiosInstance.put(`/hotels/${hotel.hotel_id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExistingProfileImage(res.data.profileImage || existingProfileImage);
      setExistingGalleryImages(res.data.images || []);
      newGalleryPreviews.forEach((p) => URL.revokeObjectURL(p));
      if (newProfilePreview) URL.revokeObjectURL(newProfilePreview);
      setNewGalleryFiles([]); setNewGalleryPreviews([]);
      setNewProfileFile(null); setNewProfilePreview("");
      showSaveFeedback("success", "Photos uploaded!");
    } catch (err) {
      showSaveFeedback("error", err.response?.data?.message || "Failed to upload photos");
    } finally {
      setUploadingImages(false);
    }
  };

  // --- Helpers for read-only display ---
  const labelFor = (list, val) => list.find((o) => o.value === val)?.label || val || "—";
  const countryName = (iso) => COUNTRIES.find((c) => c.iso === iso)?.name || iso || "—";

  if (loading || hotelLoading) return <LoadingSpinner className="py-20" />;

  if (loadError) {
    return (
      <div className="flex flex-col items-center py-20 gap-3 animate-fadeIn">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-red-600 font-medium">{loadError}</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5 animate-fadeIn">
        <div className="w-16 h-16 bg-tint rounded-2xl flex items-center justify-center">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 font-display mb-1">No property registered</h2>
          <p className="text-sm text-muted max-w-sm">Register your first property to start receiving bookings on Tripora.</p>
        </div>
        <Button onClick={() => navigate("/register-hotel")} size="lg">
          <Plus className="h-4 w-4" />
          Register Property
        </Button>
      </div>
    );
  }

  // --- Read-only info row helper ---
  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted font-medium">{label}</p>
        <p className="text-sm text-slate-900 font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Hero: Gallery + Profile Image ── */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {/* Gallery banner */}
        <div className="relative">
          {existingGalleryImages.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-0.5 max-h-44 overflow-hidden">
              {existingGalleryImages.slice(0, 8).map((url, idx) => (
                <div key={idx} className="aspect-square relative">
                  <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 7 && existingGalleryImages.length > 8 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">+{existingGalleryImages.length - 8}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-tint to-surface flex items-center justify-center">
              <div className="text-center">
                <Image className="h-8 w-8 text-primary/40 mx-auto mb-1" />
                <p className="text-xs text-muted">No gallery photos yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile row */}
        <div className="px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="-mt-12 sm:-mt-10 relative z-10 flex-shrink-0">
            {existingProfileImage ? (
              <img src={existingProfileImage} alt="Profile" className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-tint border-4 border-white shadow-md flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary/50" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display tracking-tight truncate">{hotel.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {hotel.city && <span className="text-sm text-muted flex items-center gap-1"><MapPin className="h-3 w-3" />{hotel.city}{hotel.country ? `, ${countryName(hotel.country)}` : ""}</span>}
              {hotel.starRating && <Badge variant="neutral" className="text-xs">{hotel.starRating} Star</Badge>}
              {hotel.hotelType && <Badge variant="info" className="text-xs">{labelFor(HOTEL_TYPES, hotel.hotelType)}</Badge>}
            </div>
          </div>
          {user?.user_id && <Badge variant="neutral" className="hidden sm:flex text-xs self-start">ID: {user.user_id}</Badge>}
        </div>
      </div>

      {/* ── Photo Management Card ── */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-tint flex items-center justify-center">
              <Camera className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Photos</h3>
              <p className="text-xs text-muted">Profile image & gallery ({existingGalleryImages.length} photos)</p>
            </div>
          </div>
          {(newGalleryFiles.length >= MIN_GALLERY_IMAGES || newProfileFile) && (
            <button
              onClick={handleSaveGallery}
              disabled={uploadingImages}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm shadow-primary/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {uploadingImages ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</> : <><Upload className="h-4 w-4" />Save Photos</>}
            </button>
          )}
        </div>

        {imageError && <Alert variant="error" className="mb-4">{imageError}</Alert>}
        {saveStatus && activeTab !== "overview" && activeTab !== "location" && activeTab !== "guests" && activeTab !== "pricing" && activeTab !== "amenities" && (
          <Alert variant={saveStatus} className="mb-4">{saveMessage}</Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5">
          {/* Profile photo */}
          <div>
            <p className="text-xs font-medium text-muted mb-2">Profile photo</p>
            <label className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-brand-border cursor-pointer hover:border-primary hover:bg-tint transition-all duration-200 overflow-hidden group">
              {newProfilePreview || existingProfileImage ? (
                <>
                  <img src={newProfilePreview || existingProfileImage} alt="Profile" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              ) : (
                <span className="flex flex-col items-center text-slate-400">
                  <Camera className="h-6 w-6" />
                  <span className="text-[10px] mt-1 font-medium">Add photo</span>
                </span>
              )}
              <input type="file" accept="image/*" onChange={handleProfileFileChange} className="hidden" />
            </label>
          </div>

          {/* Gallery upload */}
          <div>
            <p className="text-xs font-medium text-muted mb-2">
              Gallery {newGalleryFiles.length > 0 && <span className="text-primary">({newGalleryFiles.length}/{MIN_GALLERY_IMAGES} min)</span>}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {newGalleryPreviews.map((src, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-brand-border">
                  <img src={src} alt={`New ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryFile(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-xl cursor-pointer hover:border-primary hover:bg-tint transition-all duration-200">
                <Upload className="h-5 w-5 text-slate-400 mb-0.5" />
                <span className="text-[10px] text-slate-500 font-medium">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── Details Card with Tabs ── */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {/* Tab bar + Edit/Save */}
        <div className="border-b border-brand-border flex items-center justify-between">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setEditing(false); setSaveStatus(null); }}
                  className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="px-4 flex items-center gap-2 flex-shrink-0">
            {saveStatus && (
              <span className={`text-xs font-medium flex items-center gap-1 ${saveStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                {saveStatus === "success" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {saveMessage}
              </span>
            )}
            {editing ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-brand-border rounded-lg hover:bg-surface transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? "Saving" : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-brand-border rounded-lg hover:bg-surface hover:text-slate-900 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">

          {/* Overview */}
          {activeTab === "overview" && (
            editing ? (
              <div className="space-y-4 max-w-2xl animate-fadeIn">
                <FormInput label="Property name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <CustomSelect label="Property type" value={form.hotelType} onChange={(v) => setField("hotelType", v)} options={HOTEL_TYPES} placeholder="Select" />
                  <CustomSelect label="Guests will have" value={form.placeType} onChange={(v) => setField("placeType", v)} options={PLACE_TYPES} placeholder="Select" />
                  <CustomSelect label="Star rating" value={form.starRating} onChange={(v) => setField("starRating", v)} options={STAR_OPTIONS} placeholder="Not rated" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea
                    value={form.description} onChange={(e) => setField("description", e.target.value)}
                    rows={5} placeholder="Describe your property..."
                    className="w-full px-3.5 py-2.5 text-sm border border-brand-border rounded-xl transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 mb-4">
                  <InfoRow icon={Building2} label="Property type" value={labelFor(HOTEL_TYPES, hotel.hotelType)} />
                  <InfoRow icon={Home} label="Guests will have" value={labelFor(PLACE_TYPES, hotel.placeType)} />
                  <InfoRow icon={Star} label="Star rating" value={hotel.starRating ? `${hotel.starRating} Star` : "Not rated"} />
                </div>
                {hotel.description && (
                  <div className="pt-3 border-t border-brand-border">
                    <p className="text-xs text-muted font-medium mb-1">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{hotel.description}</p>
                  </div>
                )}
              </div>
            )
          )}

          {/* Location */}
          {activeTab === "location" && (
            editing ? (
              <div className="space-y-4 max-w-2xl animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomSelect label="Country" value={form.country} onChange={(v) => setField("country", v)} options={COUNTRY_OPTIONS} />
                  <FormInput label="Street address" value={form.streetAddress} onChange={(e) => setField("streetAddress", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput label="Apt / unit" placeholder="Optional" value={form.apartmentNumber} onChange={(e) => setField("apartmentNumber", e.target.value)} />
                  <FormInput label="City" value={form.city} onChange={(e) => setField("city", e.target.value)} />
                  <FormInput label="Province" placeholder="Optional" value={form.province} onChange={(e) => setField("province", e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput label="Postal code" placeholder="Optional" value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
                  <FormInput label="Contact number" placeholder="Optional" value={form.contactNumber} onChange={(e) => setField("contactNumber", e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 animate-fadeIn">
                <InfoRow icon={MapPin} label="Street address" value={hotel.streetAddress} />
                <InfoRow icon={Building2} label="Apt / unit" value={hotel.apartmentNumber} />
                <InfoRow icon={MapPin} label="City" value={hotel.city} />
                <InfoRow icon={MapPin} label="Province" value={hotel.province} />
                <InfoRow icon={MapPin} label="Postal code" value={hotel.postalCode} />
                <InfoRow icon={MapPin} label="Country" value={countryName(hotel.country)} />
                <InfoRow icon={Phone} label="Contact" value={hotel.contactNumber} />
              </div>
            )
          )}

          {/* Guests */}
          {activeTab === "guests" && (
            editing ? (
              <div className="space-y-4 max-w-2xl animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <CustomSelect label="Bathroom type" value={form.bathroomType} onChange={(v) => setField("bathroomType", v)} options={BATHROOM_TYPES} placeholder="Select" />
                  <FormInput label="Check-in" type="time" value={form.checkInTime} onChange={(e) => setField("checkInTime", e.target.value)} />
                  <FormInput label="Check-out" type="time" value={form.checkOutTime} onChange={(e) => setField("checkOutTime", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Who else might be there</label>
                  <div className="flex flex-wrap gap-2">
                    {WHO_ELSE_OPTIONS.map((o) => (
                      <ToggleChip key={o.value} label={o.label} selected={form.whoElseIsThere.includes(o.value)} onToggle={() => toggleWhoElse(o.value)} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1 mb-4">
                  <InfoRow icon={Users} label="Bathroom" value={labelFor(BATHROOM_TYPES, hotel.bathroomType)} />
                  <InfoRow icon={Clock} label="Check-in" value={formatTime(hotel.checkInTime)} />
                  <InfoRow icon={Clock} label="Check-out" value={formatTime(hotel.checkOutTime)} />
                </div>
                {hotel.whoElseIsThere?.length > 0 && (
                  <div className="pt-3 border-t border-brand-border">
                    <p className="text-xs text-muted font-medium mb-2">Who else might be there</p>
                    <div className="flex flex-wrap gap-2">
                      {hotel.whoElseIsThere.map((v) => (
                        <span key={v} className="px-3 py-1 rounded-full text-xs font-medium bg-tint text-primary-dark border border-primary/20">{labelFor(WHO_ELSE_OPTIONS, v)}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* Pricing */}
          {activeTab === "pricing" && (
            editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl animate-fadeIn">
                <FormInput label="Price per night (LKR)" type="number" min="0" value={form.basePrice} onChange={(e) => setField("basePrice", e.target.value)} />
                <CustomSelect label="Booking method" value={form.bookingMethod} onChange={(v) => setField("bookingMethod", v)} options={BOOKING_METHODS} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 animate-fadeIn">
                <InfoRow icon={DollarSign} label="Price per night" value={hotel.basePrice || "—"} />
                <InfoRow icon={DollarSign} label="Booking method" value={labelFor(BOOKING_METHODS, hotel.bookingMethod)} />
              </div>
            )
          )}

          {/* Amenities */}
          {activeTab === "amenities" && (
            editing ? (
              <div className="space-y-4 max-w-3xl animate-fadeIn">
                <div className="flex flex-wrap gap-1.5">
                  {PREDEFINED_AMENITIES.map((amenity) => (
                    <ToggleChip key={amenity} label={amenity} selected={form.amenities.includes(amenity)} onToggle={() => toggleAmenity(amenity)} />
                  ))}
                  {form.amenities.filter((a) => !PREDEFINED_AMENITIES.includes(a)).map((amenity) => (
                    <ToggleChip key={amenity} label={amenity} removable onToggle={() => toggleAmenity(amenity)} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-3.5 py-2 text-sm border border-brand-border rounded-xl transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button onClick={addCustomAmenity} className="px-4 py-2 text-sm font-semibold border border-brand-border text-slate-700 bg-white hover:bg-surface rounded-xl transition-colors">Add</button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                {hotel.amenities?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map((amenity) => (
                      <span key={amenity} className="px-3 py-1.5 rounded-full text-xs font-medium bg-tint text-primary-dark border border-primary/20">{amenity}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted italic">No amenities added yet.</p>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelProfile;
