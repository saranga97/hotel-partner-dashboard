import { useState, useEffect } from "react";
import { BedDouble, Plus, Search, Filter, Trash2, Image, Clock, Coffee } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import AddRoomModal from "../components/AddRoomModal";
import RoomDetailsModal from "../components/RoomDetailsModal";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotelId, setHotelId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, roomsRes] = await Promise.all([
        axiosInstance.get("/hotels/my-hotels"),
        axiosInstance.get("/rooms/my-rooms"),
      ]);

      if (hotelsRes.data.length > 0) {
        setHotelId(hotelsRes.data[0]._id);
      }
      setRooms(roomsRes.data);
    } catch (err) {
      toast.error("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await axiosInstance.delete(`/rooms/delete-room/${roomId}`);
      toast.success("Room deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  const handleToggleBlock = async (e, room) => {
    e.stopPropagation();
    const endpoint = room.isManuallyBlocked
      ? `/rooms/unblock/${room._id}`
      : `/rooms/block/${room._id}`;
    try {
      await axiosInstance.put(endpoint);
      setRooms((prev) =>
        prev.map((r) =>
          r._id === room._id
            ? { ...r, isManuallyBlocked: !r.isManuallyBlocked }
            : r
        )
      );
      toast.success(room.isManuallyBlocked ? "Room unblocked" : "Room blocked");
    } catch (err) {
      toast.error("Failed to update room availability");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      room.roomLabel?.toLowerCase().includes(term) ||
      room.roomName?.toLowerCase().includes(term);
    const matchesType =
      filterType === "all" || room.roomType === filterType;
    return matchesSearch && matchesType;
  });

  const familyCount = rooms.filter((r) => r.roomType === "family").length;
  const coupleCount = rooms.filter((r) => r.roomType === "couple").length;
  const blockedCount = rooms.filter((r) => r.isManuallyBlocked).length;

  const roomStats = [
    { label: "Total Rooms", value: rooms.length, color: "bg-blue-500" },
    { label: "Family", value: familyCount, color: "bg-green-500" },
    { label: "Couple", value: coupleCount, color: "bg-orange-500" },
    { label: "Blocked", value: blockedCount, color: "bg-red-500" },
  ];

  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Room Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your hotel rooms, availability, and pricing
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </button>
        </div>
      </div>

      {/* Room Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roomStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-3 h-8 ${stat.color} rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search rooms by name or label..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="family">Family</option>
              <option value="couple">Couple</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading rooms...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <BedDouble className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {rooms.length === 0 ? "No rooms yet" : "No rooms match your search"}
          </h3>
          <p className="text-slate-500 mb-6">
            {rooms.length === 0
              ? "Click 'Add Room' to add your first room"
              : "Try adjusting your search or filters"}
          </p>
          {rooms.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room._id}
              onClick={() => setSelectedRoom(room)}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
            >
              {/* Room Image */}
              <div className="relative h-48 bg-slate-100">
                {room.images && room.images.length > 0 ? (
                  <img
                    src={room.images[0]}
                    alt={room.roomLabel}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.roomType === "family"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {room.roomType.charAt(0).toUpperCase() +
                      room.roomType.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    room.nightStayAcType === "AC"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-800"
                  }`}>
                    {room.nightStayAcType}
                  </span>
                </div>
                {room.isManuallyBlocked && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Blocked
                    </span>
                  </div>
                )}
                {room.images && room.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white rounded text-xs">
                    {room.images.length} photos
                  </div>
                )}
              </div>

              {/* Room Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {room.roomName || room.roomLabel}
                    </h3>
                    {room.roomName && (
                      <p className="text-xs text-slate-500">{room.roomLabel}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Availability Toggle */}
                    <button
                      onClick={(e) => handleToggleBlock(e, room)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        room.isManuallyBlocked ? "bg-red-400" : "bg-green-500"
                      }`}
                      title={room.isManuallyBlocked ? "Click to unblock" : "Click to block"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          room.isManuallyBlocked ? "translate-x-1" : "translate-x-6"
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(room._id); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Bed Types */}
                {room.bedTypes && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(room.bedTypes)
                      .filter(([_, count]) => count > 0)
                      .map(([type, count]) => (
                        <span
                          key={type}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs"
                        >
                          {count} {type}
                        </span>
                      ))}
                  </div>
                )}

                {/* Night Stay Price & Times */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-900">
                        LKR {room.nightStayPrice?.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500 ml-1">/ night</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {formatTime(room.defaultCheckInTime)} - {formatTime(room.defaultCheckOutTime)}
                    </span>
                  </div>
                </div>

                {/* Day-Out Packages */}
                {room.packages && room.packages.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-500 mb-1">
                      {room.packages.length} day-out package{room.packages.length > 1 ? "s" : ""}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-amber-700">
                        From LKR{" "}
                        {Math.min(
                          ...room.packages.map((p) => p.price)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 4).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">
                          +{room.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        hotelId={hotelId}
        onRoomAdded={fetchData}
      />

      {/* Room Details Modal */}
      {selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onRoomUpdated={fetchData}
        />
      )}
    </div>
  );
};

export default Rooms;