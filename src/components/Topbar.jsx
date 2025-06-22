import { Menu, Bell, Search, User } from "lucide-react";

const Topbar = ({ setSidebarOpen }) => {
  const user = JSON.parse(localStorage.getItem("ceylonstay_user"));
  const hotelName = user?.fullName || "Partner";

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Hotel name */}
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-slate-900">{hotelName}</h1>
            <p className="text-sm text-slate-600">Hotel Management</p>
          </div>
        </div>

        {/* Search bar - hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings, rooms, guests..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors duration-200"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-slate-900">{hotelName}</div>
              <div className="text-xs text-slate-600">{user?.user_id}</div>
            </div>
            <div className="relative">
              <button className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full text-white flex items-center justify-center text-sm font-semibold shadow-md hover:shadow-lg transition-shadow duration-200">
                {hotelName.charAt(0).toUpperCase()}
              </button>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;