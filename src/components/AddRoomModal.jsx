import { useState } from "react";
import { X, Plus, Trash2, Upload, Image } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

const AddRoomModal = ({ isOpen, onClose, hotelId, onRoomAdded }) => {
  const [roomLabel, setRoomLabel] = useState("");
  const [roomType, setRoomType] = useState("family");
  const [bedTypes, setBedTypes] = useState({
    single: 0,
    double: 0,
    queen: 0,
    king: 0,
  });
  const [packages, setPackages] = useState([
    { checkIn: "", checkOut: "", acType: "AC", price: "" },
  ]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBedTypeChange = (type, value) => {
    setBedTypes((prev) => ({
      ...prev,
      [type]: Math.max(0, parseInt(value) || 0),
    }));
  };

  const handlePackageChange = (index, field, value) => {
    setPackages((prev) =>
      prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg))
    );
  };

  const addPackage = () => {
    setPackages((prev) => [
      ...prev,
      { checkIn: "", checkOut: "", acType: "AC", price: "" },
    ]);
  };

  const removePackage = (index) => {
    if (packages.length <= 1) return;
    setPackages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + files.length;

    if (totalImages > 7) {
      toast.error("Maximum 7 images allowed");
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
    setRoomLabel("");
    setRoomType("family");
    setBedTypes({ single: 0, double: 0, queen: 0, king: 0 });
    setPackages([{ checkIn: "", checkOut: "", acType: "AC", price: "" }]);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setImages([]);
    setPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hotelId) {
      toast.error("Hotel not found. Please try again.");
      return;
    }

    if (images.length < 3) {
      toast.error("Please upload at least 3 images");
      return;
    }

    const invalidPackages = packages.some(
      (pkg) => !pkg.checkIn || !pkg.checkOut || !pkg.price
    );
    if (invalidPackages) {
      toast.error("Please fill in all package fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("hotelId", hotelId);
      formData.append("roomType", roomType);
      formData.append("roomLabel", roomLabel);
      formData.append("bedTypes", JSON.stringify(bedTypes));
      formData.append(
        "packages",
        JSON.stringify(
          packages.map((pkg) => ({ ...pkg, price: Number(pkg.price) }))
        )
      );
      images.forEach((file) => formData.append("images", file));

      await axiosInstance.post("/rooms/add-room", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Room added successfully!");
      resetForm();
      onRoomAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          {/* Room Label & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Packages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Packages
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
            <div className="space-y-3">
              {packages.map((pkg, index) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-600">
                      Package {index + 1}
                    </span>
                    {packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePackage(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Check-in
                      </label>
                      <input
                        type="date"
                        value={pkg.checkIn}
                        onChange={(e) =>
                          handlePackageChange(index, "checkIn", e.target.value)
                        }
                        required
                        className="w-full px-2 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">
                        Check-out
                      </label>
                      <input
                        type="date"
                        value={pkg.checkOut}
                        onChange={(e) =>
                          handlePackageChange(index, "checkOut", e.target.value)
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
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding Room..." : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;