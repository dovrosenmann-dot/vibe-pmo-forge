import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import { X, Plus, Building2 } from "lucide-react";

interface ProjectAccessManagerProps {
  userId: string;
  disabled?: boolean;
}

export const ProjectAccessManager = ({ userId, disabled }: ProjectAccessManagerProps) => {
  const { userProjects, allProjects, grantAccess, revokeAccess } = useProjectAccess(userId);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const userProjectIds = userProjects?.map((p) => p.project_id) || [];
  const availableProjects = allProjects?.filter(
    (p) => !userProjectIds.includes(p.id)
  ) || [];

  const handleGrantAccess = () => {
    if (selectedProjectId) {
      grantAccess.mutate({ userId, projectId: selectedProjectId });
      setSelectedProjectId("");
    }
  };

  const handleRevokeAccess = (projectId: string) => {
    revokeAccess.mutate({ userId, projectId });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {!userProjects || userProjects.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>Acesso a todos os projetos (Admin)</span>
          </div>
        ) : (
          userProjects.map((access: any) => (
            <Badge key={access.id} variant="outline" className="pr-1">
              {access.projects.code} - {access.projects.name}
              {!disabled && (
                <button
                  onClick={() => handleRevokeAccess(access.project_id)}
                  className="ml-2 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))
        )}
      </div>

      {!disabled && availableProjects.length > 0 && (
        <div className="flex gap-2">
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Adicionar acesso a projeto" />
            </SelectTrigger>
            <SelectContent>
              {availableProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.code} - {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleGrantAccess}
            disabled={!selectedProjectId}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Conceder
          </Button>
        </div>
      )}
    </div>
  );
};
