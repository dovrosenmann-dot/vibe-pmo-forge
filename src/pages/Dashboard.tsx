import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { ProjectCard } from "@/components/ProjectCard";
import { DashboardRiskSummary } from "@/components/dashboard/DashboardRiskSummary";
import { FolderKanban, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Projects",
      value: 24,
      icon: FolderKanban,
      trend: { value: "12% from last month", positive: true },
      variant: "default" as const,
    },
    {
      title: "Total Budget",
      value: "$2.4M",
      icon: DollarSign,
      trend: { value: "8% spent this quarter", positive: true },
      variant: "success" as const,
    },
    {
      title: "Key Indicators",
      value: "87%",
      icon: TrendingUp,
      trend: { value: "On target", positive: true },
      variant: "success" as const,
    },
    {
      title: "Active Risks",
      value: 8,
      icon: AlertTriangle,
      trend: { value: "3 require attention", positive: false },
      variant: "warning" as const,
    },
  ];

  const projects = [
    {
      id: "1",
      name: "Amazon Forest Conservation",
      code: "AFC-2024-001",
      status: "execution" as const,
      health: "green" as const,
      progress: 68,
      budget: { planned: 250000, spent: 170000 },
      manager: "Maria Silva",
      endDate: "Dec 2024",
      team: 12,
    },
    {
      id: "2",
      name: "Sustainable Palm Oil Initiative",
      code: "POI-2024-002",
      status: "execution" as const,
      health: "yellow" as const,
      progress: 45,
      budget: { planned: 180000, spent: 95000 },
      manager: "John Smith",
      endDate: "Jan 2025",
      team: 8,
    },
    {
      id: "3",
      name: "Community Engagement Program",
      code: "CEP-2024-003",
      status: "planning" as const,
      health: "green" as const,
      progress: 15,
      budget: { planned: 120000, spent: 18000 },
      manager: "Ana Costa",
      endDate: "Mar 2025",
      team: 6,
    },
  ];

  const recentActivity = [
    { action: "Project AFC-2024-001 milestone completed", time: "2 hours ago", type: "success" },
    { action: "Invoice #1245 approved - $45,000", time: "5 hours ago", type: "info" },
    { action: "Risk identified in POI-2024-002", time: "1 day ago", type: "warning" },
    { action: "New indicator added to CEP-2024-003", time: "2 days ago", type: "info" },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DashboardHeader 
        title="Portfolio Overview" 
        subtitle="Monitor and manage your projects portfolio"
      />
      
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Active Projects</h3>
              <a href="/projects" className="text-sm text-primary hover:underline">
                View all →
              </a>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} {...project} />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <DashboardRiskSummary />
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        activity.type === 'success' ? 'bg-success' :
                        activity.type === 'warning' ? 'bg-warning' :
                        'bg-primary'
                      }`} />
                      <div>
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
