import { useState } from "react";
import { X, Plus, Trash2, Upload, Image, Clock, Coffee, Check, AlertCircle } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { useNotifications } from "../context/NotificationContext";

const PREDEFINED_AMENITIES = [
  "TV",
  "Smart TV",
  "Smart TV with Netflix",
  "Smoking Allowed",
  "No Smoking",
  "Tea/Coffee Maker",
  "WiFi",
  "Breakfast Included",
  "Attached Bathroom",
  "Upper Floor",
  "Ground Floor",
  "Clothes Rack",
  "Electric Kettle",
  "Telephone",
  "Iron",
  "Hairdryer",
  "Desk",
  "Sitting Area",
  "Towels",
  "Bathtub",
  "Refrigerator",
];

const AddRoomModal = ({ isOpen, onClose, hotelId, onRoomAdded }) => {
  const { addNotification } = useNotifications();
  const [roomName, setRoomName] = useState("");
  const [roomLabel, setRoomLabel] = useState("");
  const [roomCount, setRoomCount] = useState(1);
  const [roomType, setRoomType] = useState("family");
  const [bedTypes, setBedTypes] = useState({
    single: 0,
    double: 0,
    queen: 0,
    king: 0,
  });

  // Night stay fields
  const [nightStayPrice, setNightStayPrice] = useState("");
  const [nightStayAcType, setNightStayAcType] = useState("AC");
  const [defaultCheckInTime, setDefaultCheckInTime] = useState("14:00");
  const [defaultCheckOutTime, setDefaultCheckOutTime] = useState("12:00");

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState("");

  // Day-out packages
  const [packages, setPackages] = useState([]);

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inline feedback state
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'
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
    setRoomName("");
    setRoomLabel("");
    setRoomCount(1);
    setRoomType("family");
    setBedTypes({ single: 0, double: 0, queen: 0, king: 0 });
    setNightStayPrice("");
    setNightStayAcType("AC");
    setDefaultCheckInTime("14:00");
    setDefaultCheckOutTime("12:00");
    setSelectedAmenities([]);
    setCustomAmenity("");
    setPackages([]);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setImages([]);
    setPreviews([]);
    setValidationError("");
    setSubmitStatus(null);
    setSubmitMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");
    setSubmitStatus(null);

    if (!hotelId) {
      setValidationError("Hotel not found. Please try again.");
      return;
    }

    if (images.length < 3) {
      setValidationError("Please upload at least 3 images");
      return;
    }

    if (!nightStayPrice) {
      setValidationError("Please enter the night stay price");
      return;
    }

    const invalidPackages = packages.some(
      (pkg) => !pkg.packageName || !pkg.checkInTime || !pkg.checkOutTime || !pkg.price
    );
    if (invalidPackages) {
      setValidationError("Please fill in all day-out package fields");
      return;
    }

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
        JSON.stringify(
          packages.map((pkg) => ({ ...pkg, price: Number(pkg.price) }))
        )
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

      setTimeout(() => {
        resetForm();
        onRoomAdded();
        onClose();
      }, 1200);
    } catch (err) {
      setSubmitStatus("error");
      setSubmitMessage(err.response?.data?.message || err.response?.data?.error || "Failed to add room");
      setTimeout(() => {
        setSubmitStatus(null);
        setSubmitMessage("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getSubmitButtonContent = () => {
    if (loading) {
      return (
        <>
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {roomCount > 1 ? `Adding ${roomCount} Rooms...` : "Adding Room..."}
        </>
      );
    }
    if (submitStatus === "success") {
      return (
        <>
          <Check className="h-4 w-4" />
          {submitMessage}
        </>
      );
    }
    if (submitStatus === "error") {
      return (
        <>
          <AlertCircle className="h-4 w-4" />
          {submitMessage}
        </>
      );
    }
    return roomCount > 1 ? `Add ${roomCount} Rooms` : "Add Room";
  };

  const getSubmitButtonStyle = () => {
    if (submitStatus === "success") return "bg-green-600 hover:bg-green-700";
    if (submitStatus === "error") return "bg-red-600 hover:bg-red-700";
    return "bg-blue-600 hover:bg-blue-700";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-900">Add New Room</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Validation Error Banner */}
          {validationError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          {/* Room Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Double Deluxe Room, Deluxe Ocean View"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Room Count, Label & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Number of Rooms
              </label>
              <select
                value={roomCount}
                onChange={(e) => setRoomCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[1, 2, 3, 5, 10, 15, 20, 25, 50, 100, 200, 500].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "room" : "rooms"}
                  </option>
                ))}
              </select>
              {roomCount > 1 && (
                <p className="text-xs text-slate-500 mt-1">
                  Labels will be auto-generated
                </p>
              )}
            </div>
            {roomCount === 1 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room Label
                </label>
                <input
                  type="text"
                  value={roomLabel}
                  onChange={(e) => setRoomLabel(e.target.value)}
                  placeholder="e.g. R-101"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Room Type
              </label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="family">Family</option>
                <option value="couple">Couple</option>
              </select>
            </div>
          </div>

          {/* Bed Types */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bed Types
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(bedTypes).map(([type, count]) => (
                <div key={type}>
                  <label className="block text-xs text-slate-500 mb-1 capitalize">
                    {type}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={count}
                    onChange={(e) => handleBedTypeChange(type, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Night Stay Section */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">Night Stay (Per Night)</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Price (LKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={nightStayPrice}
                  onChange={(e) => setNightStayPrice(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  AC Type
                </label>
                <select
                  value={nightStayAcType}
                  onChange={(e) => setNightStayAcType(e.target.value)}
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AC">AC</option>
                  <option value="Non-AC">Non-AC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Check-in Time
                </label>
                <input
                  type="time"
                  value={defaultCheckInTime}
                  onChange={(e) => setDefaultCheckInTime(e.target.value)}
                  required
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Check-out Time
                </label>
                <input
                  type="time"
                  value={defaultCheckOutTime}
                  onChange={(e) => setDefaultCheckOutTime(e.target.value)}
                  required
                  className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Coffee className="h-4 w-4 text-slate-600" />
              <label className="block text-sm font-medium text-slate-700">
                Room Amenities
              </label>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {PREDEFINED_AMENITIES.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedAmenities.includes(amenity)
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
            {/* Custom amenities that aren't in the predefined list */}
            {selectedAmenities
              .filter((a) => !PREDEFINED_AMENITIES.includes(a))
              .map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300 mr-2 mb-2"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className="hover:text-red-600"
                  >
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
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAmenity();
                  }
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

          {/* Day-Out Packages (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Day-Out Packages (Optional)
              </label>
              <button
                type="button"
                onClick={addPackage}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
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
                <div
                  key={index}
                  className="p-4 bg-amber-50 rounded-lg border border-amber-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-amber-800">
                      Day-Out Package {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePackage(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">
                        Package Name
                      </label>
                      <input
                        type="text"
                        value={pkg.packageName}
                        onChange={(e) =>
                          handlePackageChange(index, "packageName", e.target.value)
                        }
                        placeholder="e.g. Day Out - Morning"
                        required
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Check-in Time
                      </label>
                      <input
                        type="time"
                        value={pkg.checkInTime}
                        onChange={(e) =>
                          handlePackageChange(index, "checkInTime", e.target.value)
                        }
                        required
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Check-out Time
                      </label>
                      <input
                        type="time"
                        value={pkg.checkOutTime}
                        onChange={(e) =>
                          handlePackageChange(index, "checkOutTime", e.target.value)
                        }
                        required
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        AC Type
                      </label>
                      <select
                        value={pkg.acType}
                        onChange={(e) =>
                          handlePackageChange(index, "acType", e.target.value)
                        }
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="AC">AC</option>
                        <option value="Non-AC">Non-AC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Price (LKR)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={pkg.price}
                        onChange={(e) =>
                          handlePackageChange(index, "price", e.target.value)
                        }
                        placeholder="0"
                        required
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
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
                  <img
                    src={src}
                    alt={`Room ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 7 && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Upload className="h-6 w-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-500">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
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
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || submitStatus === "success"}
              className={`inline-flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${getSubmitButtonStyle()}`}
            >
              {getSubmitButtonContent()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;