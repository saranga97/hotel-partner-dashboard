import { Calendar, Filter, Search, Plus, Clock, CheckCircle, XCircle } from "lucide-react";

const Bookings = () => {
  const bookingStats = [
    { label: "Total Bookings", value: "156", color: "bg-blue-500" },
    { label: "Pending", value: "23", color: "bg-yellow-500" },
    { label: "Confirmed", value: "98", color: "bg-green-500" },
    { label: "Cancelled", value: "35", color: "bg-red-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Bookings Management</h1>
          <p className="text-slate-600 mt-1">Manage all your hotel reservations and bookings</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors duration-200">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {bookingStats.map((stat, index) => (
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
                placeholder="Search bookings by guest name, booking ID..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Cancelled</option>
            </select>
            <input
              type="date"
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Bookings Management System</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Complete booking management interface with calendar view, booking list, and reservation processing capabilities
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900">Calendar View</h4>
              <p className="text-sm text-blue-700 mt-1">Visual booking calendar</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900">Accept Bookings</h4>
              <p className="text-sm text-green-700 mt-1">Approve reservations</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900">Manage Timeline</h4>
              <p className="text-sm text-purple-700 mt-1">Track booking status</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-600 font-medium">Implementation Coming Soon</p>
            <p className="text-slate-500 text-sm mt-1">Full booking management system with calendar integration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;