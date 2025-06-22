import { BarChart3, TrendingUp, PieChart, Activity, Calendar, Users, DollarSign } from "lucide-react";

const Analytics = () => {
  const reportTypes = [
    {
      icon: BarChart3,
      title: "Revenue Analytics",
      description: "Track income, expenses, and profit margins",
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: Users,
      title: "Guest Analytics",
      description: "Analyze guest demographics and behavior",
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: Calendar,
      title: "Occupancy Reports",
      description: "Room utilization and availability trends",
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Performance Metrics",
      description: "Key performance indicators and benchmarks",
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  const timeframes = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-600 mt-1">Comprehensive insights into your hotel's performance</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Revenue</p>
              <p className="text-2xl font-bold text-slate-900">$45,231</p>
              <p className="text-sm text-green-600 mt-1">↑ 12.5%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Occupancy Rate</p>
              <p className="text-2xl font-bold text-slate-900">78.4%</p>
              <p className="text-sm text-green-600 mt-1">↑ 5.2%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg. Daily Rate</p>
              <p className="text-2xl font-bold text-slate-900">$156</p>
              <p className="text-sm text-red-600 mt-1">↓ 2.1%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Guest Satisfaction</p>
              <p className="text-2xl font-bold text-slate-900">4.8</p>
              <p className="text-sm text-green-600 mt-1">↑ 0.3</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${report.lightColor}`}>
                  <Icon className={`h-6 w-6 ${report.textColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                  <p className="text-slate-600 mt-1">{report.description}</p>
                  <button className={`mt-3 text-sm font-medium ${report.textColor} hover:underline`}>
                    View Report →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Period Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Report Timeframes</h3>
        <div className="flex flex-wrap gap-3">
          {timeframes.map((timeframe, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                index === 2 
                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Advanced Analytics Dashboard</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Comprehensive visual analytics with interactive charts, graphs, and detailed reporting capabilities
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900">Revenue Charts</h4>
              <p className="text-sm text-blue-700 mt-1">Daily, weekly, monthly trends</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <PieChart className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900">Occupancy Analysis</h4>
              <p className="text-sm text-green-700 mt-1">Room utilization breakdown</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900">Performance Metrics</h4>
              <p className="text-sm text-purple-700 mt-1">KPI tracking & benchmarks</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-600 font-medium">Interactive Charts Coming Soon</p>
            <p className="text-slate-500 text-sm mt-1">Visual graphs and detailed reports with export capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;