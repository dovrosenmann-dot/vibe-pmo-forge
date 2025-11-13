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
import { AppRole } from "@/hooks/useRoles";
import { X, Plus } from "lucide-react";

interface RoleManagerProps {
  userId: string;
  currentRoles: AppRole[];
  onAddRole: (userId: string, role: AppRole) => void;
  onRemoveRole: (userId: string, role: AppRole) => void;
  disabled?: boolean;
}

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  pmo: "PMO",
  project_manager: "Gerente de Projeto",
  finance: "Financeiro",
  meal_coordinator: "Coordenador MEAL",
  viewer: "Visualizador",
  donor: "Doador",
};

const ROLE_COLORS: Record<AppRole, string> = {
  admin: "bg-red-500",
  pmo: "bg-blue-500",
  project_manager: "bg-purple-500",
  finance: "bg-green-500",
  meal_coordinator: "bg-orange-500",
  viewer: "bg-gray-500",
  donor: "bg-yellow-500",
};

export const RoleManager = ({
  userId,
  currentRoles,
  onAddRole,
  onRemoveRole,
  disabled,
}: RoleManagerProps) => {
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");

  const availableRoles = Object.keys(ROLE_LABELS).filter(
    (role) => !currentRoles.includes(role as AppRole)
  ) as AppRole[];

  const handleAddRole = () => {
    if (selectedRole) {
      onAddRole(userId, selectedRole);
      setSelectedRole("");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {currentRoles.length === 0 ? (
          <span className="text-sm text-muted-foreground">Nenhum role atribuído</span>
        ) : (
          currentRoles.map((role) => (
            <Badge
              key={role}
              variant="secondary"
              className={`${ROLE_COLORS[role]} text-white`}
            >
              {ROLE_LABELS[role]}
              {!disabled && (
                <button
                  onClick={() => onRemoveRole(userId, role)}
                  className="ml-2 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))
        )}
      </div>

      {!disabled && availableRoles.length > 0 && (
        <div className="flex gap-2">
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Adicionar role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddRole}
            disabled={!selectedRole}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      )}
    </div>
  );
};
