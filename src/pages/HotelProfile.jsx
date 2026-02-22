import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import LocationPicker from "../components/LocationPicker";
import {
  Building2, Image, MapPin, Phone, Coffee, HelpCircle, Shield,
  Upload, X, Plus, Trash2, Save, Loader2, Check, AlertCircle,
} from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", icon: Building2 },
  { key: "gallery", label: "Gallery", icon: Image },
  { key: "location", label: "Location", icon: MapPin },
  { key: "contact", label: "Contact", icon: Phone },
  { key: "facilities", label: "Facilities", icon: Coffee },
  { key: "faqs", label: "FAQs", icon: HelpCircle },
  { key: "policies", label: "Policies", icon: Shield },
];

const PREDEFINED_AMENITIES = [
  "Swimming Pool", "Spa", "Fitness Center", "Restaurant", "Bar",
  "Room Service", "Free WiFi", "Free Parking", "Airport Shuttle",
  "Laundry Service", "24-Hour Front Desk", "Concierge", "Garden",
  "Terrace", "Library", "Business Center", "Meeting Rooms",
  "Kids Play Area", "BBQ Facilities", "Bicycle Rental",
];

const PREDEFINED_ACTIVITIES = [
  "Fitness Center", "Game Room", "Spa & Wellness", "Swimming",
  "Yoga Classes", "Cooking Classes", "Guided Tours", "Water Sports",
  "Hiking", "Cycling", "Tennis", "Billiards", "Fishing",
];

const POLICY_SUGGESTIONS = [
  "Pet Policy", "Smoking Policy", "Cancellation Policy",
  "Check-in / Check-out Policy", "Children & Extra Beds",
  "Payment Policy", "Damage Policy",
];

const HotelProfile = () => {
  const [hotel, setHotel] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  // Save feedback state
  const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error' | 'info'
  const [saveMessage, setSaveMessage] = useState("");

  // Overview state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Gallery state
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [imageError, setImageError] = useState("");

  // Location state
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);

  // Contact state
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Facilities state
  const [amenities, setAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");
  const [activities, setActivities] = useState([]);
  const [customActivity, setCustomActivity] = useState("");

  // FAQs state
  const [faqs, setFaqs] = useState([]);

  // Policies state
  const [policies, setPolicies] = useState([]);

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
      if (res.data.length > 0) {
        const h = res.data[0];
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
    setName(h.name || "");
    setDescription(h.description || "");
    setExistingImages(h.images || []);
    setAddress(h.address || "");
    setLocation(h.location || "");
    setCoordinates(h.coordinates || null);
    setMobile(h.mobile || "");
    setEmail(h.email || "");
    setAmenities(h.amenities || []);
    setActivities(h.activities || []);
    setFaqs(h.faqs && h.faqs.length > 0 ? h.faqs : []);
    setPolicies(h.policies && h.policies.length > 0 ? h.policies : []);
  };

  const saveSection = async (data) => {
    if (!hotel) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const res = await axiosInstance.put(
        `/hotels/update-hotel/${hotel._id}`,
        data,
        data instanceof FormData
          ? { headers: { "Content-Type": "multipart/form-data" } }
          : {}
      );
      setHotel(res.data.hotel);
      showSaveFeedback("success", "Saved successfully!");
    } catch (err) {
      showSaveFeedback("error", err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOverview = () => {
    saveSection({ name, description });
  };

  const handleSaveGallery = () => {
    if (newImages.length === 0 && existingImages.length > 0) {
      showSaveFeedback("info", "No new images to upload");
      return;
    }
    const formData = new FormData();
    newImages.forEach((file) => formData.append("images", file));
    saveSection(formData);
    // Clear new image state after upload
    newPreviews.forEach((p) => URL.revokeObjectURL(p));
    setNewImages([]);
    setNewPreviews([]);
  };

  const handleSaveLocation = () => {
    saveSection({
      location,
      address,
      coordinates: coordinates ? JSON.stringify(coordinates) : undefined,
    });
  };

  const handleSaveContact = () => {
    saveSection({ mobile, email });
  };

  const handleSaveFacilities = () => {
    saveSection({
      amenities: JSON.stringify(amenities),
      activities: JSON.stringify(activities),
    });
  };

  const handleSaveFaqs = () => {
    const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());
    saveSection({ faqs: JSON.stringify(validFaqs) });
  };

  const handleSavePolicies = () => {
    const validPolicies = policies.filter((p) => p.title.trim() && p.description.trim());
    saveSection({ policies: JSON.stringify(validPolicies) });
  };

  // Image handlers
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImages.length + files.length;
    if (total > 10) {
      setImageError("Maximum 10 images allowed");
      setTimeout(() => setImageError(""), 3000);
      return;
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewImages((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Amenity handlers
  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities((prev) => [...prev, trimmed]);
      setCustomAmenity("");
    }
  };

  // Activity handlers
  const toggleActivity = (activity) => {
    setActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const addCustomActivity = () => {
    const trimmed = customActivity.trim();
    if (trimmed && !activities.includes(trimmed)) {
      setActivities((prev) => [...prev, trimmed]);
      setCustomActivity("");
    }
  };

  // FAQ handlers
  const addFaq = () => setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  const updateFaq = (index, field, value) => {
    setFaqs((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };
  const removeFaq = (index) => setFaqs((prev) => prev.filter((_, i) => i !== index));

  // Policy handlers
  const addPolicy = (title = "") => {
    setPolicies((prev) => [...prev, { title, description: "" }]);
  };
  const updatePolicy = (index, field, value) => {
    setPolicies((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };
  const removePolicy = (index) => setPolicies((prev) => prev.filter((_, i) => i !== index));

  // Location handler
  const handleLocationSelect = (data) => {
    setAddress(data.address);
    setCoordinates(data.coordinates);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-red-600 font-medium">{loadError}</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-20">
        <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">No Hotel Found</h2>
        <p className="text-slate-500 mt-2">
          You haven't registered a hotel yet.
        </p>
      </div>
    );
  }

  const SaveButton = ({ onClick }) => {
    const getButtonContent = () => {
      if (saving) {
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        );
      }
      if (saveStatus === "success") {
        return (
          <>
            <Check className="h-4 w-4" />
            {saveMessage}
          </>
        );
      }
      if (saveStatus === "error") {
        return (
          <>
            <AlertCircle className="h-4 w-4" />
            {saveMessage}
          </>
        );
      }
      if (saveStatus === "info") {
        return (
          <>
            <AlertCircle className="h-4 w-4" />
            {saveMessage}
          </>
        );
      }
      return (
        <>
          <Save className="h-4 w-4" />
          Save Changes
        </>
      );
    };

    const getButtonStyle = () => {
      if (saveStatus === "success") return "bg-green-600 hover:bg-green-700";
      if (saveStatus === "error") return "bg-red-600 hover:bg-red-700";
      if (saveStatus === "info") return "bg-amber-600 hover:bg-amber-700";
      return "bg-blue-600 hover:bg-blue-700";
    };

    return (
      <button
        onClick={onClick}
        disabled={saving}
        className={`inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 ${getButtonStyle()}`}
      >
        {getButtonContent()}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hotel Profile</h1>
        <p className="text-slate-600 mt-1">Manage your hotel information and settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setSaveStatus(null); }}
                  className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
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
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hotel Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hotel Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  placeholder="Describe your hotel, its unique features, surroundings, and what makes it special..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Write a compelling description that highlights your hotel's unique selling points.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton onClick={handleSaveOverview} />
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <div className="space-y-5">
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Current Images ({existingImages.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={url}
                          alt={`Hotel ${idx + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-slate-200"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                            Profile
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image error */}
              {imageError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {imageError}
                </div>
              )}

              {/* New images upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Upload New Images (replaces current gallery)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {newPreviews.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square">
                      <img
                        src={src}
                        alt={`New ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {existingImages.length + newImages.length < 10 && (
                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                      <Upload className="h-6 w-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-500">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewImages}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Upload up to 10 images. The first image will be used as the hotel profile picture.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton onClick={handleSaveGallery} />
              </div>
            </div>
          )}

          {/* Location Tab */}
          {activeTab === "location" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sigiriya, Sri Lanka"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Pick Location on Map
                </label>
                <LocationPicker
                  onSelect={handleLocationSelect}
                  initialPosition={
                    coordinates ? [coordinates.lat, coordinates.lng] : null
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Auto-filled from map or enter manually"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {coordinates && (
                <p className="text-xs text-slate-400">
                  Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </p>
              )}
              <div className="flex justify-end pt-2">
                <SaveButton onClick={handleSaveLocation} />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+94 XX XXX XXXX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hotel@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton onClick={handleSaveContact} />
              </div>
            </div>
          )}

          {/* Facilities Tab */}
          {activeTab === "facilities" && (
            <div className="space-y-6">
              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Hotel Amenities</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PREDEFINED_AMENITIES.map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        amenities.includes(amenity)
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
                {/* Custom amenities */}
                {amenities
                  .filter((a) => !PREDEFINED_AMENITIES.includes(a))
                  .map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300 mr-2 mb-2"
                    >
                      {amenity}
                      <button type="button" onClick={() => toggleAmenity(amenity)} className="hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); }
                    }}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Activities */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Activities</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PREDEFINED_ACTIVITIES.map((activity) => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => toggleActivity(activity)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        activities.includes(activity)
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
                {activities
                  .filter((a) => !PREDEFINED_ACTIVITIES.includes(a))
                  .map((activity) => (
                    <span
                      key={activity}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 mr-2 mb-2"
                    >
                      {activity}
                      <button type="button" onClick={() => toggleActivity(activity)} className="hover:text-red-600">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); addCustomActivity(); }
                    }}
                    placeholder="Add custom activity..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addCustomActivity}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <SaveButton onClick={handleSaveFacilities} />
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  Frequently Asked Questions
                </h3>
                <button
                  type="button"
                  onClick={addFaq}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add FAQ
                </button>
              </div>
              {faqs.length === 0 && (
                <p className="text-sm text-slate-400 italic">
                  No FAQs added yet. Click "Add FAQ" to create one.
                </p>
              )}
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-sm font-medium text-slate-600">
                        FAQ {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(idx, "question", e.target.value)}
                        placeholder="Question"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                        placeholder="Answer"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton onClick={handleSaveFaqs} />
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {activeTab === "policies" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">
                  Hotel Policies
                </h3>
                <button
                  type="button"
                  onClick={() => addPolicy()}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Policy
                </button>
              </div>

              {/* Quick add suggestions */}
              {POLICY_SUGGESTIONS.filter(
                (s) => !policies.some((p) => p.title === s)
              ).length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Quick add:</p>
                  <div className="flex flex-wrap gap-2">
                    {POLICY_SUGGESTIONS.filter(
                      (s) => !policies.some((p) => p.title === s)
                    ).map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addPolicy(suggestion)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs transition-colors"
                      >
                        + {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {policies.length === 0 && (
                <p className="text-sm text-slate-400 italic">
                  No policies added yet. Use the quick add buttons above or click "Add Policy".
                </p>
              )}

              <div className="space-y-4">
                {policies.map((policy, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-sm font-medium text-slate-600">
                        Policy {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePolicy(idx)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={policy.title}
                        onChange={(e) => updatePolicy(idx, "title", e.target.value)}
                        placeholder="Policy title (e.g. Pet Policy)"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <textarea
                        value={policy.description}
                        onChange={(e) => updatePolicy(idx, "description", e.target.value)}
                        placeholder="Describe the policy details..."
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <SaveButton onClick={handleSavePolicies} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelProfile;