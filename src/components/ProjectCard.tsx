import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface ProjectCardProps {
  id: string;
  name: string;
  code: string;
  status: "planning" | "execution" | "closing" | "completed";
  health: "green" | "yellow" | "red";
  progress: number;
  budget: {
    planned: number;
    spent: number;
  };
  manager: string;
  endDate: string;
  team: number;
}

export const ProjectCard = ({ 
  name, 
  code, 
  status, 
  health, 
  progress, 
  budget, 
  manager, 
  endDate,
  team 
}: ProjectCardProps) => {
  const statusLabels = {
    planning: "Planning",
    execution: "Execution",
    closing: "Closing",
    completed: "Completed",
  };

  const healthColors = {
    green: "bg-success",
    yellow: "bg-warning",
    red: "bg-destructive",
  };

  const statusClasses = {
    planning: "status-draft",
    execution: "status-progress",
    closing: "status-pending",
    completed: "status-active",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-[22px_24px] shadow-card cursor-pointer transition-all duration-200 hover:border-input hover:-translate-y-[1px]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${healthColors[health]}`} />
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{code}</span>
          </div>
          <h3 className="font-display font-bold text-[15px] text-foreground">{name}</h3>
        </div>
        <span className={`inline-flex items-center rounded-full border px-[9px] py-[3px] text-[10px] tracking-[0.06em] ${statusClasses[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      
      <div className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-[11px] mb-2">
            <span className="text-muted-foreground font-mono">Progress</span>
            <span className="font-mono font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-1 bg-border rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm bg-primary transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Budget & Date */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">Budget</p>
              <p className="text-[12px] font-mono font-medium text-sidebar-accent-foreground">
                ${budget.spent.toLocaleString()}/${budget.planned.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-mono">End Date</p>
              <p className="text-[12px] font-mono font-medium text-foreground">{endDate}</p>
            </div>
          </div>
        </div>

        {/* Team & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-mono">{team} members</span>
          </div>
          
          <Button variant="ghost" size="sm" className="text-[11px] h-7 px-3">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};
