import { DashboardHeader } from "@/components/DashboardHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";

const Projects = () => {
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
    {
      id: "4",
      name: "Biodiversity Monitoring System",
      code: "BMS-2024-004",
      status: "execution" as const,
      health: "red" as const,
      progress: 32,
      budget: { planned: 200000, spent: 145000 },
      manager: "Carlos Rodriguez",
      endDate: "Nov 2024",
      team: 10,
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DashboardHeader 
        title="Project Portfolio" 
        subtitle="Manage all projects across programs"
      />
      
      <main className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Projects;
