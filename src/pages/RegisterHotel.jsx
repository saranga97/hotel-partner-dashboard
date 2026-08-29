import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useHotel } from "../context/HotelContext";
import {
  Building2, MapPin, Users, DollarSign,
  ChevronRight, ChevronLeft, Check, AlertCircle, Loader2,
  ArrowLeft,
} from "lucide-react";
import { FormInput, Alert, ToggleChip, CustomSelect } from "../components/ui";
import {
  HOTEL_TYPES, PLACE_TYPES, BATHROOM_TYPES, BOOKING_METHODS, WHO_ELSE_OPTIONS,
  COUNTRIES, PREDEFINED_AMENITIES,
} from "../constants/hotel";

const formatBasePrice = (amount) => `${Number(amount).toLocaleString("en-LK")} LKR`;

const STEPS = [
  { key: "basics", label: "Basics", icon: Building2 },
  { key: "location", label: "Location", icon: MapPin },
  { key: "guests", label: "Guests", icon: Users },
  { key: "pricing", label: "Pricing", icon: DollarSign },
];

const STAR_OPTIONS = [
  { value: "", label: "Not rated" },
  ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} star${n > 1 ? "s" : ""}` })),
];

const COUNTRY_OPTIONS = COUNTRIES.map((c) => ({ value: c.iso, label: c.name }));

const emptyForm = {
  name: "", description: "", hotelType: "", placeType: "", starRating: "",
  country: "LK", streetAddress: "", apartmentNumber: "", city: "", province: "", postalCode: "", contactNumber: "",
  bathroomType: "", whoElseIsThere: [], checkInTime: "14:00", checkOutTime: "12:00",
  basePrice: "", bookingMethod: "INSTANT_BOOK",
  amenities: [],
};

const RegisterHotel = () => {
  const navigate = useNavigate();
  const { refreshHotels } = useHotel();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [customAmenity, setCustomAmenity] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [slideDir, setSlideDir] = useState("right");

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleWhoElse = (value) => {
    setField("whoElseIsThere", form.whoElseIsThere.includes(value)
      ? form.whoElseIsThere.filter((v) => v !== value)
      : [...form.whoElseIsThere, value]);
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

  const validateStep = (idx) => {
    const errs = {};
    if (idx === 0) {
      if (!form.name.trim()) errs.name = "Required";
      if (!form.hotelType) errs.hotelType = "Required";
      if (!form.placeType) errs.placeType = "Required";
    } else if (idx === 1) {
      if (!form.streetAddress.trim()) errs.streetAddress = "Required";
      if (!form.city.trim()) errs.city = "Required";
    } else if (idx === 2) {
      if (!form.bathroomType) errs.bathroomType = "Required";
      if (form.whoElseIsThere.length === 0) errs.whoElseIsThere = "Select at least one";
    } else if (idx === 3) {
      if (!form.basePrice) errs.basePrice = "Required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setSlideDir("right");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    setError("");
  };

  const goBack = () => {
    setSlideDir("left");
    setStep((s) => Math.max(s - 1, 0));
    setError("");
    setFieldErrors({});
  };

  const goToStep = (idx) => {
    if (idx < step) {
      setSlideDir("left");
      setStep(idx);
      setFieldErrors({});
    } else if (idx > step) {
      for (let i = step; i < idx; i++) {
        if (!validateStep(i)) return;
      }
      setSlideDir("right");
      setStep(idx);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;
    setCreating(true);
    setError("");
    try {
      await axiosInstance.post("/hotels/register", {
        name: form.name, hotelType: form.hotelType, placeType: form.placeType,
        starRating: form.starRating || undefined,
        country: form.country, streetAddress: form.streetAddress,
        apartmentNumber: form.apartmentNumber, city: form.city,
        province: form.province, postalCode: form.postalCode, contactNumber: form.contactNumber,
        bathroomType: form.bathroomType, whoElseIsThere: form.whoElseIsThere,
        checkInTime: form.checkInTime, checkOutTime: form.checkOutTime,
        basePrice: formatBasePrice(form.basePrice), bookingMethod: form.bookingMethod,
        amenities: form.amenities, description: form.description,
      });
      await refreshHotels();
      navigate("/hotel-profile");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create hotel. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="h-screen flex flex-col bg-surface p-4 sm:p-6 lg:p-8">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between mb-4 lg:mb-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white border border-brand-border transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-900 font-display tracking-tight leading-tight">New Property</h1>
            <p className="text-xs text-muted hidden sm:block">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Inline step pills */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const done = idx < step;
            const active = idx === step;
            return (
              <button
                key={s.key}
                onClick={() => goToStep(idx)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  active
                    ? "bg-primary text-white shadow-sm shadow-primary/25"
                    : done
                      ? "bg-green-50 text-green-700 hover:bg-green-100"
                      : "bg-surface text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form card (fills remaining space) ── */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl border border-brand-border shadow-sm flex flex-col overflow-hidden">

        {error && (
          <div className="px-5 lg:px-8 pt-4 flex-shrink-0">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {/* ── Step content (centered) ── */}
        <div
          key={step}
          className={`flex-1 min-h-0 flex items-start lg:items-center justify-center px-5 lg:px-8 py-5 lg:py-6 overflow-y-auto lg:overflow-hidden ${
            slideDir === "right" ? "animate-slideInRight" : "animate-slideInLeft"
          }`}
        >
          <div className="w-full max-w-3xl">

            {/* ── Step 0: Basics ── */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="mb-1">
                  <h2 className="text-base lg:text-lg font-bold text-slate-900">Tell us about your property</h2>
                  <p className="text-xs text-muted mt-0.5">Basic details that help guests discover your place.</p>
                </div>

                <FormInput
                  label="Property name"
                  placeholder="e.g. Ocean View Resort"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
                {fieldErrors.name && <p className="text-xs text-red-500 -mt-3 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.name}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <CustomSelect
                    label="Property type"
                    value={form.hotelType}
                    onChange={(v) => setField("hotelType", v)}
                    options={HOTEL_TYPES}
                    placeholder="Select type"
                    error={fieldErrors.hotelType}
                  />
                  <CustomSelect
                    label="Guests will have"
                    value={form.placeType}
                    onChange={(v) => setField("placeType", v)}
                    options={PLACE_TYPES}
                    placeholder="Select"
                    error={fieldErrors.placeType}
                  />
                  <CustomSelect
                    label="Star rating"
                    value={form.starRating}
                    onChange={(v) => setField("starRating", v)}
                    options={STAR_OPTIONS}
                    placeholder="Not rated"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description <span className="text-muted font-normal">(optional)</span></label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField("description", e.target.value)}
                    rows={3}
                    placeholder="Describe your property, unique features, surroundings..."
                    className="w-full px-3.5 py-2.5 text-sm border border-brand-border rounded-xl transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── Step 1: Location ── */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="mb-1">
                  <h2 className="text-base lg:text-lg font-bold text-slate-900">Where is your property?</h2>
                  <p className="text-xs text-muted mt-0.5">Help guests find you with an accurate address.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomSelect
                    label="Country"
                    value={form.country}
                    onChange={(v) => setField("country", v)}
                    options={COUNTRY_OPTIONS}
                  />
                  <div>
                    <FormInput label="Street address" placeholder="123 Beach Road" value={form.streetAddress} onChange={(e) => setField("streetAddress", e.target.value)} />
                    {fieldErrors.streetAddress && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.streetAddress}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormInput label="Apt / unit" placeholder="Optional" value={form.apartmentNumber} onChange={(e) => setField("apartmentNumber", e.target.value)} />
                  <div>
                    <FormInput label="City" placeholder="Galle" value={form.city} onChange={(e) => setField("city", e.target.value)} />
                    {fieldErrors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.city}</p>}
                  </div>
                  <FormInput label="Province" placeholder="Optional" value={form.province} onChange={(e) => setField("province", e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormInput label="Postal code" placeholder="Optional" value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
                  <FormInput label="Contact number" placeholder="+94 91 223 4567" value={form.contactNumber} onChange={(e) => setField("contactNumber", e.target.value)} />
                </div>
              </div>
            )}

            {/* ── Step 2: Guests ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="mb-1">
                  <h2 className="text-base lg:text-lg font-bold text-slate-900">Guest experience</h2>
                  <p className="text-xs text-muted mt-0.5">Set expectations about the stay.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <CustomSelect
                    label="Bathroom type"
                    value={form.bathroomType}
                    onChange={(v) => setField("bathroomType", v)}
                    options={BATHROOM_TYPES}
                    placeholder="Select"
                    error={fieldErrors.bathroomType}
                  />
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
                  {fieldErrors.whoElseIsThere && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.whoElseIsThere}</p>}
                </div>
              </div>
            )}

            {/* ── Step 3: Pricing & Amenities ── */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="mb-1">
                  <h2 className="text-base lg:text-lg font-bold text-slate-900">Pricing & amenities</h2>
                  <p className="text-xs text-muted mt-0.5">Set your rate and highlight what you offer.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <FormInput label="Price per night (LKR)" type="number" min="0" placeholder="13500" value={form.basePrice} onChange={(e) => setField("basePrice", e.target.value)} />
                    {fieldErrors.basePrice && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fieldErrors.basePrice}</p>}
                  </div>
                  <CustomSelect
                    label="Booking method"
                    value={form.bookingMethod}
                    onChange={(v) => setField("bookingMethod", v)}
                    options={BOOKING_METHODS}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amenities <span className="text-muted font-normal">(optional)</span></label>
                  <div className="flex flex-wrap gap-1.5">
                    {PREDEFINED_AMENITIES.map((amenity) => (
                      <ToggleChip key={amenity} label={amenity} selected={form.amenities.includes(amenity)} onToggle={() => toggleAmenity(amenity)} />
                    ))}
                    {form.amenities.filter((a) => !PREDEFINED_AMENITIES.includes(a)).map((amenity) => (
                      <ToggleChip key={amenity} label={amenity} removable onToggle={() => toggleAmenity(amenity)} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
                    placeholder="Add custom amenity..."
                    className="flex-1 px-3.5 py-2 text-sm border border-brand-border rounded-xl transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    className="px-4 py-2 text-sm font-semibold border border-brand-border text-slate-700 bg-white hover:bg-surface rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-brand-border px-5 lg:px-8 py-3 lg:py-4 bg-white">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <button
              onClick={goBack}
              disabled={step === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 active:scale-95 ${
                step === 0
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-600 hover:text-slate-900 border border-brand-border hover:border-slate-300 hover:bg-surface"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-full transition-all duration-300 ${
                    idx === step
                      ? "w-5 h-1.5 bg-primary"
                      : idx < step
                        ? "w-1.5 h-1.5 bg-green-500"
                        : "w-1.5 h-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={creating}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm shadow-primary/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {creating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Creating...</>
                ) : (
                  <><Check className="h-4 w-4" />Create</>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm shadow-primary/20 transition-all duration-200 active:scale-95"
              >
                <span className="hidden sm:inline">Continue</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterHotel;
