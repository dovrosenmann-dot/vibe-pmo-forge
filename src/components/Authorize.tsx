import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { AppRole } from "@/hooks/useRoles";

interface AuthorizeProps {
  roles?: AppRole[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Authorize = ({ roles, requireAll = false, children, fallback = null }: AuthorizeProps) => {
  const { roles: userRoles, isAdmin, isLoading } = usePermissions();

  if (isLoading) return null;
  // Admins always bypass RBAC checks in UI components for convenience 
  if (isAdmin) return <>{children}</>;
  
  if (roles && roles.length > 0) {
    const hasAccess = requireAll 
      ? roles.every(r => userRoles.includes(r))
      : roles.some(r => userRoles.includes(r));
      
    if (!hasAccess) return <>{fallback}</>;
  }

  return <>{children}</>;
};
