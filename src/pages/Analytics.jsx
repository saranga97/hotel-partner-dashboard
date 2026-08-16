import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { PageHeader } from "../components/ui";

// Genuinely not built yet — no analytics/reporting endpoint exists on the
// backend. This is an honest "coming soon" placeholder rather than a mockup
// with fabricated numbers.
const Analytics = () => {
  const upcoming = [
    { icon: BarChart3, title: "Revenue trends", description: "Track income across days, weeks, and months" },
    { icon: PieChart, title: "Occupancy breakdown", description: "See how your rooms are utilized over time" },
    { icon: TrendingUp, title: "Performance metrics", description: "Booking rate, average stay length, and more" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics & Reports" subtitle="Comprehensive insights into your hotel's performance" />

      <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-6 lg:p-12">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-tint rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 font-display mb-2">Analytics is coming soon</h3>
          <p className="text-muted mb-8 max-w-md mx-auto">
            We're building reporting tools for your hotel. Check back later for revenue, occupancy, and performance insights.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            {upcoming.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="p-4 bg-surface rounded-xl border border-brand-border">
                  <Icon className="h-6 w-6 text-primary mb-2" />
                  <h4 className="font-medium text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-muted mt-1">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
