import { BarChart3, TrendingUp, PieChart, Activity, Calendar, Users, DollarSign } from "lucide-react";
import { PageHeader, StatCard } from "../components/ui";

const Analytics = () => {
  const reportTypes = [
    {
      icon: BarChart3,
      title: "Revenue Analytics",
      description: "Track income, expenses, and profit margins",
      color: "bg-tint0",
      lightColor: "bg-tint",
      textColor: "text-primary"
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

  const quickStats = [
    { icon: DollarSign, value: "$45,231", label: "Revenue", trend: "↑ 12.5%", trendColor: "text-green-600", lightColor: "bg-tint", textColor: "text-primary" },
    { icon: Activity, value: "78.4%", label: "Occupancy Rate", trend: "↑ 5.2%", trendColor: "text-green-600", lightColor: "bg-green-50", textColor: "text-green-600" },
    { icon: TrendingUp, value: "$156", label: "Avg. Daily Rate", trend: "↓ 2.1%", trendColor: "text-red-600", lightColor: "bg-purple-50", textColor: "text-purple-600" },
    { icon: Users, value: "4.8", label: "Guest Satisfaction", trend: "↑ 0.3", trendColor: "text-green-600", lightColor: "bg-orange-50", textColor: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Reports" subtitle="Comprehensive insights into your hotel's performance">
        <select className="px-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>Last 6 months</option>
          <option>Last year</option>
        </select>
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className={`text-sm ${stat.trendColor} mt-1`}>{stat.trend}</p>
                </div>
                <div className={`p-3 ${stat.lightColor} rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-brand-border p-6 hover:shadow-md transition-shadow duration-200">
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
      <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Report Timeframes</h3>
        <div className="flex flex-wrap gap-3">
          {timeframes.map((timeframe, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                index === 2
                  ? "bg-blue-100 text-primary-dark border border-blue-200"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6 lg:p-8">
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Advanced Analytics Dashboard</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Comprehensive visual analytics with interactive charts, graphs, and detailed reporting capabilities
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="p-4 bg-tint rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <h4 className="font-medium text-primary-dark">Revenue Charts</h4>
              <p className="text-sm text-primary-dark mt-1">Daily, weekly, monthly trends</p>
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

          <div className="mt-8 p-4 bg-surface rounded-lg border-2 border-dashed border-brand-border">
            <p className="text-slate-600 font-medium">Interactive Charts Coming Soon</p>
            <p className="text-slate-500 text-sm mt-1">Visual graphs and detailed reports with export capabilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
