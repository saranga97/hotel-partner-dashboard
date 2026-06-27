import { useState } from "react";
import { Plus, Trash2, Upload, Image, Clock, Coffee, Check, AlertCircle } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useNotifications } from "../context/NotificationContext";
import { Modal, FormInput, FormSelect, Button, Alert, ToggleChip } from "./ui";

const PREDEFINED_AMENITIES = [
  "TV", "Smart TV", "Smart TV with Netflix", "Smoking Allowed", "No Smoking",
  "Tea/Coffee Maker", "WiFi", "Breakfast Included", "Attached Bathroom",
  "Upper Floor", "Ground Floor", "Clothes Rack", "Electric Kettle", "Telephone",
  "Iron", "Hairdryer", "Desk", "Sitting Area", "Towels", "Bathtub", "Refrigerator",
];

const AddRoomModal = ({ isOpen, onClose, hotelId, onRoomAdded }) => {
  const { addNotification } = useNotifications();
  const [roomName, setRoomName] = useState("");
  const [roomLabel, setRoomLabel] = useState("");
  const [roomCount, setRoomCount] = useState(1);
  const [roomType, setRoomType] = useState("family");
  const [bedTypes, setBedTypes] = useState({
    single: 0, double: 0, queen: 0, king: 0,
  });

  const [nightStayPrice, setNightStayPrice] = useState("");
  const [nightStayAcType, setNightStayAcType] = useState("AC");
  const [defaultCheckInTime, setDefaultCheckInTime] = useState("14:00");
  const [defaultCheckOutTime, setDefaultCheckOutTime] = useState("12:00");

  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");

  const [packages, setPackages] = useState([]);

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleBedTypeChange = (type, value) => {
    setBedTypes((prev) => ({
      ...prev,
      [type]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
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
    setPackages((prev) =>
      prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg))
    );
  };

  const addPackage = () => {
    setPackages((prev) => [
      ...prev,
      { packageName: "", checkInTime: "08:00", checkOutTime: "17:00", acType: "AC", price: "" },
    ]);
  };

  const removePackage = (index) => {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + files.length;

    if (totalImages > 7) {
      setValidationError("Maximum 7 images allowed");
      setTimeout(() => setValidationError(""), 3000);
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setRoomName(""); setRoomLabel(""); setRoomCount(1); setRoomType("family");
    setBedTypes({ single: 0, double: 0, queen: 0, king: 0 });
    setNightStayPrice(""); setNightStayAcType("AC");
    setDefaultCheckInTime("14:00"); setDefaultCheckOutTime("12:00");
    setSelectedAmenities([]); setCustomAmenity(""); setPackages([]);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setImages([]); setPreviews([]); setValidationError("");
    setSubmitStatus(null); setSubmitMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(""); setSubmitStatus(null);

    if (!hotelId) { setValidationError("Hotel not found. Please try again."); return; }
    if (images.length < 3) { setValidationError("Please upload at least 3 images"); return; }
    if (!nightStayPrice) { setValidationError("Please enter the night stay price"); return; }

    const invalidPackages = packages.some(
      (pkg) => !pkg.packageName || !pkg.checkInTime || !pkg.checkOutTime || !pkg.price
    );
    if (invalidPackages) { setValidationError("Please fill in all day-out package fields"); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("hotelId", hotelId);
      formData.append("roomType", roomType);
      formData.append("roomName", roomName);
      if (roomCount > 1) {
        formData.append("roomCount", roomCount);
      } else {
        formData.append("roomLabel", roomLabel);
      }
      formData.append("bedTypes", JSON.stringify(bedTypes));
      formData.append("nightStayPrice", nightStayPrice);
      formData.append("nightStayAcType", nightStayAcType);
      formData.append("defaultCheckInTime", defaultCheckInTime);
      formData.append("defaultCheckOutTime", defaultCheckOutTime);
      formData.append("amenities", JSON.stringify(selectedAmenities));
      formData.append(
        "packages",
        JSON.stringify(packages.map((pkg) => ({ ...pkg, price: Number(pkg.price) })))
      );
      images.forEach((file) => formData.append("images", file));

      const res = await axiosInstance.post("/rooms/add-room", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const count = res.data.count || 1;
      const createdRoom = res.data.room || (res.data.rooms && res.data.rooms[0]);

      setSubmitStatus("success");
      setSubmitMessage(count > 1 ? `${count} rooms added!` : "Room added!");

      addNotification(
        "room_added",
        count > 1
          ? `${count} "${roomName}" rooms added successfully`
          : `Room "${createdRoom?.roomLabel}" added successfully`,
        createdRoom
      );

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
    if (loading) return <>{<div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}{roomCount > 1 ? `Adding ${roomCount} Rooms...` : "Adding Room..."}</>;
    if (submitStatus === "success") return <><Check className="h-4 w-4" />{submitMessage}</>;
    if (submitStatus === "error") return <><AlertCircle className="h-4 w-4" />{submitMessage}</>;
    return roomCount > 1 ? `Add ${roomCount} Rooms` : "Add Room";
  };

  const getSubmitButtonStyle = () => {
    if (submitStatus === "success") return "bg-green-600 hover:bg-green-700";
    if (submitStatus === "error") return "bg-red-600 hover:bg-red-700";
    return "bg-primary hover:bg-primary-dark";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Room">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {validationError && <Alert variant="error">{validationError}</Alert>}

        {/* Room Name */}
        <FormInput
          label="Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="e.g. Double Deluxe Room, Deluxe Ocean View"
          required
        />

        {/* Room Count, Label & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormSelect label="Number of Rooms" value={roomCount} onChange={(e) => setRoomCount(parseInt(e.target.value))}>
            {[1, 2, 3, 5, 10, 15, 20, 25, 50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "room" : "rooms"}</option>
            ))}
          </FormSelect>
          {roomCount > 1 && (
            <p className="text-xs text-slate-500 mt-1 sm:col-span-2 self-end">
              Labels will be auto-generated
            </p>
          )}
          {roomCount === 1 && (
            <FormInput
              label="Room Label"
              value={roomLabel}
              onChange={(e) => setRoomLabel(e.target.value)}
              placeholder="e.g. R-101"
              required
            />
          )}
          <FormSelect
            label="Room Type"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            options={[
              { value: "family", label: "Family" },
              { value: "couple", label: "Couple" },
            ]}
          />
        </div>

        {/* Bed Types */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Bed Types
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(bedTypes).map(([type, count]) => (
              <div key={type}>
                <label className="block text-xs text-slate-500 mb-1 capitalize">{type}</label>
                <input
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => handleBedTypeChange(type, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Night Stay Section */}
        <div className="p-4 bg-tint rounded-lg border border-brand-border">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-primary-dark">Night Stay (Per Night)</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormInput
              label="Price (LKR)"
              labelClassName="block text-xs text-slate-500 mb-1"
              type="number"
              min="0"
              value={nightStayPrice}
              onChange={(e) => setNightStayPrice(e.target.value)}
              placeholder="0"
              required
            />
            <FormSelect
              label="AC Type"
              labelClassName="block text-xs text-slate-500 mb-1"
              value={nightStayAcType}
              onChange={(e) => setNightStayAcType(e.target.value)}
              options={[{ value: "AC", label: "AC" }, { value: "Non-AC", label: "Non-AC" }]}
            />
            <FormInput
              label="Check-in Time"
              labelClassName="block text-xs text-slate-500 mb-1"
              type="time"
              value={defaultCheckInTime}
              onChange={(e) => setDefaultCheckInTime(e.target.value)}
              required
            />
            <FormInput
              label="Check-out Time"
              labelClassName="block text-xs text-slate-500 mb-1"
              type="time"
              value={defaultCheckOutTime}
              onChange={(e) => setDefaultCheckOutTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Coffee className="h-4 w-4 text-slate-600" />
            <label className="block text-sm font-medium text-slate-700">Room Amenities</label>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {PREDEFINED_AMENITIES.map((amenity) => (
              <ToggleChip
                key={amenity}
                label={amenity}
                selected={selectedAmenities.includes(amenity)}
                onToggle={() => toggleAmenity(amenity)}
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
                className="mr-2 mb-2"
              />
            ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomAmenity(); } }}
              placeholder="Add custom amenity..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button variant="secondary" size="sm" onClick={addCustomAmenity}>Add</Button>
          </div>
        </div>

        {/* Day-Out Packages */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">Day-Out Packages (Optional)</label>
            <button
              type="button"
              onClick={addPackage}
              className="inline-flex items-center text-sm text-primary hover:text-primary-dark font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Package
            </button>
          </div>
          {packages.length === 0 && (
            <p className="text-xs text-slate-400 italic">
              No day-out packages added. Click "Add Package" to create one.
            </p>
          )}
          <div className="space-y-3">
            {packages.map((pkg, index) => (
              <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-amber-800">Day-Out Package {index + 1}</span>
                  <button type="button" onClick={() => removePackage(index)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="sm:col-span-2">
                    <FormInput
                      label="Package Name"
                      labelClassName="block text-xs text-slate-500 mb-1"
                      value={pkg.packageName}
                      onChange={(e) => handlePackageChange(index, "packageName", e.target.value)}
                      placeholder="e.g. Day Out - Morning"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FormInput label="Check-in Time" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={pkg.checkInTime} onChange={(e) => handlePackageChange(index, "checkInTime", e.target.value)} required />
                  <FormInput label="Check-out Time" labelClassName="block text-xs text-slate-500 mb-1" type="time" value={pkg.checkOutTime} onChange={(e) => handlePackageChange(index, "checkOutTime", e.target.value)} required />
                  <FormSelect label="AC Type" labelClassName="block text-xs text-slate-500 mb-1" value={pkg.acType} onChange={(e) => handlePackageChange(index, "acType", e.target.value)} options={[{ value: "AC", label: "AC" }, { value: "Non-AC", label: "Non-AC" }]} />
                  <FormInput label="Price (LKR)" labelClassName="block text-xs text-slate-500 mb-1" type="number" min="0" value={pkg.price} onChange={(e) => handlePackageChange(index, "price", e.target.value)} placeholder="0" required />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Room Images ({images.length}/7, minimum 3)
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
                  <span className="h-3 w-3 block text-xs leading-none">&times;</span>
                </button>
              </div>
            ))}
            {images.length < 7 && (
              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary hover:bg-tint transition-colors">
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-500">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
          {images.length === 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Image className="h-4 w-4" />
              <span>Upload 3 to 7 images of the room</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
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
