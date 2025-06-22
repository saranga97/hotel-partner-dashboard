import { BedDouble, Plus, Search, Filter, Wifi, Car, Coffee, Tv, Bath, Wind } from "lucide-react";

const Rooms = () => {
  const roomStats = [
    { label: "Total Rooms", value: "156", color: "bg-blue-500" },
    { label: "Available", value: "89", color: "bg-green-500" },
    { label: "Occupied", value: "52", color: "bg-orange-500" },
    { label: "Maintenance", value: "15", color: "bg-red-500" }
  ];

  const amenities = [
    { icon: Wifi, name: "WiFi" },
    { icon: Tv, name: "TV" },
    { icon: Wind, name: "AC" },
    { icon: Bath, name: "Bath" },
    { icon: Coffee, name: "Coffee" },
    { icon: Car, name: "Parking" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Room Management</h1>
          <p className="text-slate-600 mt-1">Manage your hotel rooms, availability, and pricing</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </button>
        </div>
      </div>

      {/* Room Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roomStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
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
                placeholder="Search rooms by number, type, or status..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Types</option>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Suite</option>
            </select>
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Available</option>
              <option>Occupied</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Room Type Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Standard Rooms</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">45 rooms</span>
          </div>
          <div className="space-y-3">
            <p className="text-slate-600">Basic amenities and comfortable stay</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-slate-900">$89</span>
              <span className="text-slate-600">/ night</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.slice(0, 4).map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded-md">
                    <Icon className="h-3 w-3 text-slate-600" />
                    <span className="text-xs text-slate-600">{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Deluxe Rooms</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">78 rooms</span>
          </div>
          <div className="space-y-3">
            <p className="text-slate-600">Enhanced amenities and premium experience</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-slate-900">$129</span>
              <span className="text-slate-600">/ night</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded-md">
                    <Icon className="h-3 w-3 text-slate-600" />
                    <span className="text-xs text-slate-600">{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Suite Rooms</h3>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">33 rooms</span>
          </div>
          <div className="space-y-3">
            <p className="text-slate-600">Luxury experience with premium amenities</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-slate-900">$199</span>
              <span className="text-slate-600">/ night</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div key={index} className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded-md">
                    <Icon className="h-3 w-3 text-slate-600" />
                    <span className="text-xs text-slate-600">{amenity.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="text-center py-16">
          <BedDouble className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Room Management System</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Complete room management interface with inventory tracking, pricing control, and availability management
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <BedDouble className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900">Room Inventory</h4>
              <p className="text-sm text-blue-700 mt-1">Track all room types & status</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Filter className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900">Pricing Management</h4>
              <p className="text-sm text-green-700 mt-1">Dynamic pricing & rates</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Plus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900">Add New Rooms</h4>
              <p className="text-sm text-purple-700 mt-1">Expand your inventory</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-600 font-medium">Room Management Interface Coming Soon</p>
            <p className="text-slate-500 text-sm mt-1">Complete room list, editing, and management capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rooms;