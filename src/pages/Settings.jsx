import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Database, Key } from "lucide-react";

const Settings = () => {
  const settingsCategories = [
    {
      icon: User,
      title: "Profile Settings",
      description: "Manage your account information and preferences",
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure email and push notification preferences",
      color: "bg-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      icon: Shield,
      title: "Security",
      description: "Password, two-factor authentication, and security settings",
      color: "bg-red-500",
      lightColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize dashboard theme and display preferences",
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: Globe,
      title: "Hotel Information",
      description: "Update hotel details, contact info, and policies",
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Backup, export, and data retention settings",
      color: "bg-teal-500",
      lightColor: "bg-teal-50",
      textColor: "text-teal-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account and application preferences</p>
        </div>
      </div>

      {/* Quick Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            H
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Hotel Partner</h3>
            <p className="text-slate-600">partner@ceylonstay.com</p>
            <p className="text-sm text-slate-500 mt-1">Last login: Today at 9:30 AM</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${category.lightColor}`}>
                  <Icon className={`h-6 w-6 ${category.textColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
                  <p className="text-slate-600 mt-1 text-sm">{category.description}</p>
                  <button className={`mt-3 text-sm font-medium ${category.textColor} hover:underline`}>
                    Configure →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">v2.1.0</div>
            <div className="text-sm text-slate-600 mt-1">Application Version</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">Online</div>
            <div className="text-sm text-slate-600 mt-1">System Status</div>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900">99.9%</div>
            <div className="text-sm text-slate-600 mt-1">Uptime</div>
          </div>
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="text-center py-16">
          <SettingsIcon className="h-16 w-16 text-slate-400 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Advanced Settings Panel</h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Comprehensive configuration interface for all system settings and preferences
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <User className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-900">Account Settings</h4>
              <p className="text-sm text-blue-700 mt-1">Profile & preferences</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900">Security Center</h4>
              <p className="text-sm text-green-700 mt-1">Password & authentication</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Key className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-900">API Management</h4>
              <p className="text-sm text-purple-700 mt-1">Integration settings</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-600 font-medium">Settings Interface Coming Soon</p>
            <p className="text-slate-500 text-sm mt-1">Complete settings management with all configuration options</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;