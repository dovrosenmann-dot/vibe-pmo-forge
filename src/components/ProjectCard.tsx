import { Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
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

  const statusVariants = {
    planning: "secondary",
    execution: "default",
    closing: "secondary",
    completed: "outline",
  } as const;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${healthColors[health]}`} />
              <span className="text-xs font-medium text-muted-foreground">{code}</span>
            </div>
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-medium">
                ${budget.spent.toLocaleString()}/${budget.planned.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">End Date</p>
              <p className="text-sm font-medium">{endDate}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{team} members</span>
          </div>
          
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
