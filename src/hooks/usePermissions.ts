import { useRoles, AppRole } from "@/hooks/useRoles";

export const usePermissions = () => {
  const { currentUserRoles, isLoading } = useRoles();
  const roles = currentUserRoles || [];

  const hasRole = (role: AppRole | AppRole[]) => {
    if (roles.includes("admin")) return true;
    if (Array.isArray(role)) return role.some((r) => roles.includes(r));
    return roles.includes(role);
  };

  return {
    isLoading,
    roles,
    isAdmin: roles.includes("admin"),
    canManageSuppliers: hasRole(["admin", "pmo", "project_manager"]),
    canManageFinancials: hasRole(["admin", "finance"]),
    canEditProjects: hasRole(["admin", "pmo", "project_manager"]),
    canManageRoles: hasRole(["admin"]),
    isReadOnly: !hasRole(["admin", "pmo", "project_manager", "finance", "meal_coordinator"]),
    hasRole,
  };
};
