import { TrendingUp, Users, Calendar, CheckCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "New Bookings",
      value: "263",
      change: "+12.5%",
      trend: "up",
      icon: Calendar,
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Available Rooms",
      value: "127",
      change: "-3.2%",
      trend: "down",
      icon: Users,
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Reservations",
      value: "42",
      change: "+8.1%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Check-ins",
      value: "28",
      change: "+5.4%",
      trend: "up",
      icon: CheckCircle,
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            All systems operational
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.lightColor}`}>
                  <Icon className={`h-5 w-5 ${stat.textColor}`} />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? 
                    <ArrowUpRight className="h-4 w-4 mr-1" /> : 
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  }
                  {stat.change}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                <p className="text-sm text-slate-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Reservation Analytics</h2>
            <p className="text-slate-600 mt-1">Track your hotel's performance over time</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
        </div>
        
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Reservation Analytics Chart</p>
            <p className="text-slate-500 text-sm mt-1">Chart implementation coming soon</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-slate-700">New booking received</span>
              </div>
              <span className="text-xs text-slate-500">2 min ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-slate-700">Guest checked in</span>
              </div>
              <span className="text-xs text-slate-500">15 min ago</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm text-slate-700">Room service requested</span>
              </div>
              <span className="text-xs text-slate-500">1 hour ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
              <div className="text-sm font-medium text-blue-900">Add New Booking</div>
              <div className="text-xs text-blue-700 mt-1">Create a new reservation</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors duration-200">
              <div className="text-sm font-medium text-emerald-900">Manage Rooms</div>
              <div className="text-xs text-emerald-700 mt-1">Update room availability</div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
              <div className="text-sm font-medium text-purple-900">View Reports</div>
              <div className="text-xs text-purple-700 mt-1">Check analytics & insights</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;