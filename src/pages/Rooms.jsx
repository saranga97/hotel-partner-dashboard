import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BedDouble, Plus, Search, Trash2, Image, Clock, Check, AlertCircle } from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import AddRoomModal from "../components/AddRoomModal";
import RoomDetailsModal from "../components/RoomDetailsModal";
import { PageHeader, StatCard, Alert, LoadingSpinner, EmptyState, Badge, Button } from "../components/ui";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hotelId, setHotelId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loadError, setLoadError] = useState("");
  const [loadErrorVariant, setLoadErrorVariant] = useState("error");
  const [searchParams, setSearchParams] = useSearchParams();

  const [roomFeedback, setRoomFeedback] = useState({});

  const showRoomFeedback = (roomId, status, message) => {
    setRoomFeedback((prev) => ({ ...prev, [roomId]: { status, message } }));
    setTimeout(() => {
      setRoomFeedback((prev) => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    }, 2500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadError("");
      setLoadErrorVariant("error");
      const hotelsRes = await axiosInstance.get("/hotels/my-hotels");
      const hotel = hotelsRes.data.hotels?.[0];
      if (!hotel) { setRooms([]); return; }
      setHotelId(hotel.hotel_id);

      const roomsRes = await axiosInstance.get(`/rooms/hotel/${hotel.hotel_id}`, { params: { limit: 100 } });
      setRooms(roomsRes.data.rooms);
    } catch (err) {
      if (err.response?.status === 403) {
        setLoadErrorVariant("warning");
        setLoadError("You're not authorized to view rooms for this hotel.");
      } else {
        setLoadErrorVariant("error");
        setLoadError("Failed to load rooms. Please refresh the page.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const roomId = searchParams.get("roomId");
    if (roomId && rooms.length > 0) {
      const found = rooms.find((r) => r.room_id === roomId);
      if (found) {
        setSelectedRoom(found);
        searchParams.delete("roomId");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [rooms, searchParams]);

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await axiosInstance.delete(`/rooms/${roomId}`);
      showRoomFeedback(roomId, "success", "Deleted");
      setTimeout(() => fetchData(), 1000);
    } catch {
      showRoomFeedback(roomId, "error", "Failed to delete");
    }
  };

  // Backend renamed block/unblock -> hold/release (and the room field
  // isTemporaryBlocked -> isOnHold) — TRB-020. Keeping the user-facing
  // "Blocked"/"Unblocked" wording since that's still the clearest label for
  // this toggle; only the field name and endpoint paths needed to change.
  const handleToggleBlock = async (e, room) => {
    e.stopPropagation();
    const endpoint = room.isOnHold
      ? `/rooms/${room.room_id}/release`
      : `/rooms/${room.room_id}/hold`;
    try {
      await axiosInstance.put(endpoint);
      setRooms((prev) =>
        prev.map((r) =>
          r.room_id === room.room_id
            ? { ...r, isOnHold: !r.isOnHold }
            : r
        )
      );
      showRoomFeedback(room.room_id, "success", room.isOnHold ? "Unblocked" : "Blocked");
    } catch {
      showRoomFeedback(room.room_id, "error", "Failed");
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = room.roomName?.toLowerCase().includes(term);
    const matchesType = filterType === "all" || room.roomType === filterType;
    return matchesSearch && matchesType;
  });

  const familyCount = rooms.filter((r) => r.roomType === "FAMILY").length;
  const coupleCount = rooms.filter((r) => r.roomType === "COUPLE").length;
  const blockedCount = rooms.filter((r) => r.isOnHold).length;

  // Family/Couple mirror the badge colors used on the room cards below
  // (success green / purple) so the same room type always reads the same
  // color everywhere on this page.
  const roomStats = [
    { label: "Total Rooms", value: rooms.length, color: "bg-primary" },
    { label: "Family", value: familyCount, color: "bg-green-500" },
    { label: "Couple", value: coupleCount, color: "bg-purple-500" },
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

  const bedTypeLabel = (type) => ({ SINGLE_BED: "single", DOUBLE_BED: "double", QUEEN: "queen", KING_SIZE: "king" }[type] || type);

  return (
    <div className="space-y-6">
      <PageHeader title="Room Management" subtitle="Manage your hotel rooms, availability, and pricing">
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roomStats.map((stat, index) => (
          <StatCard key={index} value={stat.value} label={stat.label} color={stat.color} />
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search rooms by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-border rounded-xl transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3.5 py-2.5 border border-brand-border rounded-xl text-sm transition-colors hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="all">All Types</option>
              <option value="FAMILY">Family</option>
              <option value="COUPLE">Couple</option>
            </select>
          </div>
        </div>
      </div>

      {loadError && <Alert variant={loadErrorVariant}>{loadError}</Alert>}

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-12">
          <LoadingSpinner message="Loading rooms..." />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-12">
          <EmptyState
            icon={BedDouble}
            message={rooms.length === 0 ? "No rooms yet" : "No rooms match your search"}
            description={
              rooms.length === 0
                ? "Click 'Add Room' to add your first room"
                : "Try adjusting your search or filters"
            }
            action={
              rooms.length === 0 && (
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.room_id}
              onClick={() => setSelectedRoom(room)}
              className="bg-white rounded-2xl shadow-sm border border-brand-border overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="relative h-48 bg-slate-100">
                {room.images && room.images.length > 0 ? (
                  <img src={room.images[0]} alt={room.roomName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-12 w-12 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant={room.roomType === "FAMILY" ? "success" : "purple"} className="px-2 py-1">
                    {room.roomType === "FAMILY" ? "Family" : "Couple"}
                  </Badge>
                  <Badge variant={room.acType === "AC" ? "info" : "neutral"} className="px-2 py-1">
                    {room.acType === "AC" ? "AC" : "Non-AC"}
                  </Badge>
                </div>
                {room.isOnHold && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="danger" className="px-2 py-1">Blocked</Badge>
                  </div>
                )}
                {room.images && room.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 text-white rounded text-xs">
                    {room.images.length} photos
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">{room.roomName}</h3>
                  <div className="flex items-center gap-2">
                    {roomFeedback[room.room_id] && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          roomFeedback[room.room_id].status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {roomFeedback[room.room_id].status === "success" ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {roomFeedback[room.room_id].message}
                      </span>
                    )}
                    <button
                      onClick={(e) => handleToggleBlock(e, room)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        room.isOnHold ? "bg-red-400" : "bg-green-500"
                      }`}
                      title={room.isOnHold ? "Click to unblock" : "Click to block"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          room.isOnHold ? "translate-x-1" : "translate-x-6"
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(room.room_id); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {room.bedTypes && room.bedTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {room.bedTypes.filter((bt) => bt.count > 0).map((bt) => (
                      <span key={bt.type} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">
                        {bt.count} {bedTypeLabel(bt.type)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-slate-900">
                        LKR {room.price?.toLocaleString()}
                      </span>
                      <span className="text-sm text-slate-500 ml-1">/ night</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(room.defaultCheckInTime)} - {formatTime(room.defaultCheckOutTime)}</span>
                  </div>
                </div>

                {room.amenities && room.amenities.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1">
                      {room.amenities.slice(0, 4).map((amenity) => (
                        <span key={amenity} className="px-2 py-0.5 bg-tint text-primary-dark rounded-md text-xs">
                          {amenity}
                        </span>
                      ))}
                      {room.amenities.length > 4 && (
                        <span className="px-2 py-0.5 bg-surface text-slate-500 rounded-md text-xs">
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

      <AddRoomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        hotelId={hotelId}
        onRoomAdded={fetchData}
      />

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
