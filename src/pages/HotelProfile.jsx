import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import {
  Building2, Image, MapPin, Users, DollarSign, Coffee,
  Upload, X, Save, Loader2, Check, AlertCircle, Camera,
} from "lucide-react";
import { PageHeader, FormInput, FormSelect, Alert, LoadingSpinner, Button, ToggleChip, Badge } from "../components/ui";
import {
  HOTEL_TYPES, PLACE_TYPES, BATHROOM_TYPES, BOOKING_METHODS, WHO_ELSE_OPTIONS,
  COUNTRIES, PREDEFINED_AMENITIES,
} from "../constants/hotel";

const TABS = [
  { key: "overview", label: "Overview", icon: Building2 },
  { key: "location", label: "Location", icon: MapPin },
  { key: "guests", label: "Guest Experience", icon: Users },
  { key: "pricing", label: "Pricing & Booking", icon: DollarSign },
  { key: "amenities", label: "Amenities", icon: Coffee },
  { key: "gallery", label: "Gallery", icon: Image },
];

const MIN_GALLERY_IMAGES = 5;

// Matches tripora-frontend's formatBasePrice — the backend stores basePrice as a
// pre-formatted string (e.g. "13,500 LKR"), not a number.
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

const HotelProfile = () => {
  const user = JSON.parse(localStorage.getItem("ceylonstay_user") || "null");
  const [hotel, setHotel] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Register-hotel form (shown when the partner has no hotel yet)
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState(emptyFormState);
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

  useEffect(() => {
    fetchHotel();
  }, []);

  const showSaveFeedback = (status, message, duration = 2500) => {
    setSaveStatus(status);
    setSaveMessage(message);
    setTimeout(() => {
      setSaveStatus(null);
      setSaveMessage("");
    }, duration);
  };

  const fetchHotel = async () => {
    try {
      const res = await axiosInstance.get("/hotels/my-hotels");
      if (res.data.hotels?.length > 0) {
        const h = res.data.hotels[0];
        setHotel(h);
        populateState(h);
      }
    } catch {
      setLoadError("Failed to load hotel data");
    } finally {
      setLoading(false);
    }
  };

  const populateState = (h) => {
    setForm({
      name: h.name || "",
      description: h.description || "",
      hotelType: h.hotelType || "",
      placeType: h.placeType || "",
      starRating: h.starRating || "",
      country: h.country || "LK",
      streetAddress: h.streetAddress || "",
      apartmentNumber: h.apartmentNumber || "",
      city: h.city || "",
      province: h.province || "",
      postalCode: h.postalCode || "",
      contactNumber: h.contactNumber || "",
      bathroomType: h.bathroomType || "",
      whoElseIsThere: h.whoElseIsThere || [],
      checkInTime: h.checkInTime || "14:00",
      checkOutTime: h.checkOutTime || "12:00",
      basePrice: parseBasePrice(h.basePrice),
      bookingMethod: h.bookingMethod || "INSTANT_BOOK",
      amenities: h.amenities || [],
    });
    setExistingProfileImage(h.profileImage || "");
    setExistingGalleryImages(h.images || []);
  };

  const saveSection = async (data) => {
    if (!hotel) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await axiosInstance.put(`/hotels/${hotel.hotel_id}`, data);
      setHotel(res.data.hotel);
      populateState(res.data.hotel);
      showSaveFeedback("success", "Saved successfully!");
    } catch (err) {
      showSaveFeedback("error", err.response?.data?.message || err.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOverview = () => saveSection({
    name: form.name, description: form.description, hotelType: form.hotelType,
    placeType: form.placeType, starRating: form.starRating || undefined,
  });

  const handleSaveLocation = () => saveSection({
    country: form.country, streetAddress: form.streetAddress, apartmentNumber: form.apartmentNumber,
    city: form.city, province: form.province, postalCode: form.postalCode, contactNumber: form.contactNumber,
  });

  const handleSaveGuests = () => saveSection({
    bathroomType: form.bathroomType, whoElseIsThere: form.whoElseIsThere,
    checkInTime: form.checkInTime, checkOutTime: form.checkOutTime,
  });

  const handleSavePricing = () => saveSection({
    basePrice: formatBasePrice(form.basePrice), bookingMethod: form.bookingMethod,
  });

  const handleSaveAmenities = () => saveSection({ amenities: form.amenities });

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
      setImageError(`Select at least ${MIN_GALLERY_IMAGES} gallery images to upload (this replaces the current gallery).`);
      setTimeout(() => setImageError(""), 4000);
      return;
    }
    setSaving(true);
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
      setSaving(false);
    }
  };

  // ── Register-hotel form (no hotel yet) ──────────────────────────────

  const setCreateField = (field, value) => setCreateForm((f) => ({ ...f, [field]: value }));

  const toggleCreateWhoElse = (value) => {
    setCreateField("whoElseIsThere", createForm.whoElseIsThere.includes(value)
      ? createForm.whoElseIsThere.filter((v) => v !== value)
      : [...createForm.whoElseIsThere, value]);
  };

  const toggleCreateAmenity = (amenity) => {
    setCreateField("amenities", createForm.amenities.includes(amenity)
      ? createForm.amenities.filter((a) => a !== amenity)
      : [...createForm.amenities, amenity]);
  };

  const addCreateCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !createForm.amenities.includes(trimmed)) {
      setCreateField("amenities", [...createForm.amenities, trimmed]);
      setCustomAmenity("");
    }
  };

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setCreateError("");
    if (!createForm.name.trim()) return setCreateError("Property name is required.");
    if (!createForm.hotelType) return setCreateError("Select a property type.");
    if (!createForm.placeType) return setCreateError("Select what guests will have.");
    if (!createForm.streetAddress.trim()) return setCreateError("Street address is required.");
    if (!createForm.city.trim()) return setCreateError("City is required.");
    if (!createForm.bathroomType) return setCreateError("Select a bathroom type.");
    if (createForm.whoElseIsThere.length === 0) return setCreateError("Select at least one option for who else might be there.");
    if (!createForm.basePrice) return setCreateError("Enter a nightly price.");

    setCreating(true);
    try {
      const payload = {
        name: createForm.name, hotelType: createForm.hotelType, placeType: createForm.placeType,
        starRating: createForm.starRating || undefined,
        country: createForm.country, streetAddress: createForm.streetAddress,
        apartmentNumber: createForm.apartmentNumber, city: createForm.city,
        province: createForm.province, postalCode: createForm.postalCode, contactNumber: createForm.contactNumber,
        bathroomType: createForm.bathroomType, whoElseIsThere: createForm.whoElseIsThere,
        checkInTime: createForm.checkInTime, checkOutTime: createForm.checkOutTime,
        basePrice: formatBasePrice(createForm.basePrice), bookingMethod: createForm.bookingMethod,
        amenities: createForm.amenities, description: createForm.description,
      };
      const res = await axiosInstance.post("/hotels/register", payload);
      setHotel(res.data.hotel);
      populateState(res.data.hotel);
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create hotel. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-20" />;
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-red-600 font-medium">{loadError}</p>
      </div>
    );
  }

  const SaveButton = ({ onClick }) => {
    const getButtonContent = () => {
      if (saving) return <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>;
      if (saveStatus === "success") return <><Check className="h-4 w-4" />{saveMessage}</>;
      if (saveStatus === "error") return <><AlertCircle className="h-4 w-4" />{saveMessage}</>;
      return <><Save className="h-4 w-4" />Save Changes</>;
    };
    const getButtonStyle = () => {
      if (saveStatus === "success") return "bg-green-600 hover:bg-green-700";
      if (saveStatus === "error") return "bg-red-600 hover:bg-red-700";
      return "bg-primary hover:bg-primary-dark";
    };
    return (
      <button
        onClick={onClick}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${getButtonStyle()}`}
      >
        {getButtonContent()}
      </button>
    );
  };

  if (!hotel) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-tint rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-display">Register your hotel</h2>
          </div>
          <p className="text-muted text-sm mb-6">Add your property details to start receiving bookings.</p>

          {createError && <Alert variant="error" className="mb-4">{createError}</Alert>}

          <form onSubmit={handleCreateHotel} className="space-y-5">
            <h3 className="text-sm font-semibold text-slate-700">Basics</h3>
            <FormInput label="Property name" placeholder="e.g. Ocean View Resort" value={createForm.name} onChange={(e) => setCreateField("name", e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <FormSelect label="Property type" value={createForm.hotelType} onChange={(e) => setCreateField("hotelType", e.target.value)}>
                <option value="">Select</option>
                {HOTEL_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FormSelect>
              <FormSelect label="Guests will have" value={createForm.placeType} onChange={(e) => setCreateField("placeType", e.target.value)}>
                <option value="">Select</option>
                {PLACE_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FormSelect>
            </div>
            <FormSelect label="Star rating (optional)" value={createForm.starRating} onChange={(e) => setCreateField("starRating", e.target.value)}>
              <option value="">Not rated</option>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
            </FormSelect>

            <h3 className="text-sm font-semibold text-slate-700 pt-2">Location</h3>
            <FormSelect label="Country" value={createForm.country} onChange={(e) => setCreateField("country", e.target.value)}>
              {COUNTRIES.map((c) => <option key={c.iso} value={c.iso}>{c.name}</option>)}
            </FormSelect>
            <FormInput label="Street address" placeholder="123 Beach Road" value={createForm.streetAddress} onChange={(e) => setCreateField("streetAddress", e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Apartment / unit (optional)" value={createForm.apartmentNumber} onChange={(e) => setCreateField("apartmentNumber", e.target.value)} />
              <FormInput label="City" placeholder="Galle" value={createForm.city} onChange={(e) => setCreateField("city", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Province (optional)" value={createForm.province} onChange={(e) => setCreateField("province", e.target.value)} />
              <FormInput label="Postal code (optional)" value={createForm.postalCode} onChange={(e) => setCreateField("postalCode", e.target.value)} />
            </div>
            <FormInput label="Contact number (optional)" placeholder="+94912234567" value={createForm.contactNumber} onChange={(e) => setCreateField("contactNumber", e.target.value)} />

            <h3 className="text-sm font-semibold text-slate-700 pt-2">Guest experience</h3>
            <FormSelect label="Bathroom" value={createForm.bathroomType} onChange={(e) => setCreateField("bathroomType", e.target.value)}>
              <option value="">Select</option>
              {BATHROOM_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </FormSelect>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Who else might be there</label>
              <div className="flex flex-wrap gap-2">
                {WHO_ELSE_OPTIONS.map((o) => (
                  <ToggleChip key={o.value} label={o.label} selected={createForm.whoElseIsThere.includes(o.value)} onToggle={() => toggleCreateWhoElse(o.value)} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Check-in time" type="time" value={createForm.checkInTime} onChange={(e) => setCreateField("checkInTime", e.target.value)} />
              <FormInput label="Check-out time" type="time" value={createForm.checkOutTime} onChange={(e) => setCreateField("checkOutTime", e.target.value)} />
            </div>

            <h3 className="text-sm font-semibold text-slate-700 pt-2">Pricing & booking</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Price per night (LKR)" type="number" min="0" placeholder="13500" value={createForm.basePrice} onChange={(e) => setCreateField("basePrice", e.target.value)} required />
              <FormSelect label="Booking method" value={createForm.bookingMethod} onChange={(e) => setCreateField("bookingMethod", e.target.value)}>
                {BOOKING_METHODS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FormSelect>
            </div>

            <h3 className="text-sm font-semibold text-slate-700 pt-2">Amenities (optional)</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {PREDEFINED_AMENITIES.map((amenity) => (
                <ToggleChip key={amenity} label={amenity} selected={createForm.amenities.includes(amenity)} onToggle={() => toggleCreateAmenity(amenity)} />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCreateCustomAmenity(); } }}
                placeholder="Add custom amenity..."
                className="flex-1 px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <Button variant="secondary" size="sm" type="button" onClick={addCreateCustomAmenity}>Add</Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
              <textarea
                value={createForm.description} onChange={(e) => setCreateField("description", e.target.value)}
                rows={4} placeholder="Describe your hotel, its unique features, surroundings..."
                className="w-full px-3 py-2 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
              />
            </div>

            <Button type="submit" loading={creating} className="w-full" size="lg">
              {creating ? "Creating..." : "Create Hotel"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hotel Profile" subtitle="Manage your hotel information and settings">
        {user?.user_id && <Badge variant="neutral">Partner ID: {user.user_id}</Badge>}
      </PageHeader>

      <div className="bg-white rounded-2xl shadow-sm border border-brand-border">
        <div className="border-b border-brand-border overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSaveStatus(null); }}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <FormInput label="Property name" value={form.name} onChange={(e) => setField("name", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Property type" value={form.hotelType} onChange={(e) => setField("hotelType", e.target.value)}>
                  {HOTEL_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </FormSelect>
                <FormSelect label="Guests will have" value={form.placeType} onChange={(e) => setField("placeType", e.target.value)}>
                  {PLACE_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </FormSelect>
              </div>
              <FormSelect label="Star rating (optional)" value={form.starRating} onChange={(e) => setField("starRating", e.target.value)}>
                <option value="">Not rated</option>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
              </FormSelect>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={8}
                  placeholder="Describe your hotel, its unique features, surroundings, and what makes it special..."
                  className="w-full px-3 py-2 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y"
                />
              </div>
              <div className="flex justify-end pt-2"><SaveButton onClick={handleSaveOverview} /></div>
            </div>
          )}

          {activeTab === "location" && (
            <div className="space-y-5">
              <FormInput label="Apartment / unit (optional)" value={form.apartmentNumber} onChange={(e) => setField("apartmentNumber", e.target.value)} />
              <FormInput label="Street address" value={form.streetAddress} onChange={(e) => setField("streetAddress", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="City" value={form.city} onChange={(e) => setField("city", e.target.value)} />
                <FormInput label="Postal code (optional)" value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Province (optional)" value={form.province} onChange={(e) => setField("province", e.target.value)} />
                <FormSelect label="Country" value={form.country} onChange={(e) => setField("country", e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c.iso} value={c.iso}>{c.name}</option>)}
                </FormSelect>
              </div>
              <FormInput label="Contact number (optional)" value={form.contactNumber} onChange={(e) => setField("contactNumber", e.target.value)} />
              <div className="flex justify-end pt-2"><SaveButton onClick={handleSaveLocation} /></div>
            </div>
          )}

          {activeTab === "guests" && (
            <div className="space-y-5">
              <FormSelect label="Bathroom" value={form.bathroomType} onChange={(e) => setField("bathroomType", e.target.value)}>
                {BATHROOM_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </FormSelect>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Who else might be there</label>
                <div className="flex flex-wrap gap-2">
                  {WHO_ELSE_OPTIONS.map((o) => (
                    <ToggleChip key={o.value} label={o.label} selected={form.whoElseIsThere.includes(o.value)} onToggle={() => toggleWhoElse(o.value)} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Check-in time" type="time" value={form.checkInTime} onChange={(e) => setField("checkInTime", e.target.value)} />
                <FormInput label="Check-out time" type="time" value={form.checkOutTime} onChange={(e) => setField("checkOutTime", e.target.value)} />
              </div>
              <div className="flex justify-end pt-2"><SaveButton onClick={handleSaveGuests} /></div>
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Price per night (LKR)" type="number" min="0" value={form.basePrice} onChange={(e) => setField("basePrice", e.target.value)} />
                <FormSelect label="Booking method" value={form.bookingMethod} onChange={(e) => setField("bookingMethod", e.target.value)}>
                  {BOOKING_METHODS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </FormSelect>
              </div>
              <div className="flex justify-end pt-2"><SaveButton onClick={handleSavePricing} /></div>
            </div>
          )}

          {activeTab === "amenities" && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2 mb-3">
                {PREDEFINED_AMENITIES.map((amenity) => (
                  <ToggleChip key={amenity} label={amenity} selected={form.amenities.includes(amenity)} onToggle={() => toggleAmenity(amenity)} />
                ))}
              </div>
              {form.amenities.filter((a) => !PREDEFINED_AMENITIES.includes(a)).map((amenity) => (
                <ToggleChip key={amenity} label={amenity} removable onToggle={() => toggleAmenity(amenity)} className="mr-2 mb-2" />
              ))}
              <div className="flex gap-2">
                <input
                  type="text" value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                  placeholder="Add custom amenity..."
                  className="flex-1 px-3 py-2 border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <Button variant="secondary" size="sm" onClick={addCustomAmenity}>Add</Button>
              </div>
              <div className="flex justify-end pt-2"><SaveButton onClick={handleSaveAmenities} /></div>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Current profile photo</h3>
                {existingProfileImage ? (
                  <img src={existingProfileImage} alt="Profile" className="w-32 h-32 object-cover rounded-xl border border-brand-border" />
                ) : (
                  <p className="text-sm text-slate-400 italic">No profile photo set yet.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Current gallery ({existingGalleryImages.length})</h3>
                {existingGalleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {existingGalleryImages.map((url, idx) => (
                      <img key={idx} src={url} alt={`Gallery ${idx + 1}`} className="aspect-square w-full object-cover rounded-lg border border-brand-border" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No gallery photos yet.</p>
                )}
              </div>

              {imageError && <Alert variant="error">{imageError}</Alert>}

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">New profile photo (optional)</h3>
                <label className="relative flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-brand-border cursor-pointer hover:border-primary hover:bg-tint transition-colors overflow-hidden">
                  {newProfilePreview ? (
                    <img src={newProfilePreview} alt="New profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex flex-col items-center text-slate-400">
                      <Camera className="h-5 w-5" />
                      <span className="text-[10px] mt-1">Add photo</span>
                    </span>
                  )}
                  <input type="file" accept="image/*" onChange={handleProfileFileChange} className="hidden" />
                </label>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">
                  Upload new gallery — replaces the whole gallery ({newGalleryFiles.length}/{MIN_GALLERY_IMAGES} minimum)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {newGalleryPreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img src={src} alt={`New ${idx + 1}`} className="w-full h-full object-cover rounded-lg border border-brand-border" />
                      <button
                        type="button" onClick={() => removeGalleryFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-xl cursor-pointer hover:border-primary hover:bg-tint transition-colors">
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">Upload</span>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="flex justify-end pt-2"><SaveButton onClick={handleSaveGallery} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelProfile;
