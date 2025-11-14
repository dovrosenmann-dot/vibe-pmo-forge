import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AppRole = 'admin' | 'pmo' | 'project_manager' | 'finance' | 'meal_coordinator' | 'viewer' | 'donor';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface UserWithRoles {
  id: string;
  email: string;
  full_name: string | null;
  roles: AppRole[];
}

export const useRoles = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Get user emails from auth.users via RPC or metadata
      const usersWithRoles: UserWithRoles[] = await Promise.all(
        profiles.map(async (profile) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id);
          
          const roles = userRoles
            .filter(r => r.user_id === profile.user_id)
            .map(r => r.role as AppRole);

          return {
            id: profile.user_id,
            email: user?.email || "",
            full_name: profile.full_name,
            roles,
          };
        })
      );

      return usersWithRoles;
    },
  });

  const { data: currentUserRoles } = useQuery({
    queryKey: ["current-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return data.map(r => r.role as AppRole);
    },
  });

  const isAdmin = currentUserRoles?.includes('admin') || false;

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });

      if (error) throw error;

      // Buscar informações do usuário para enviar email
      const user = users?.find(u => u.id === userId);
      if (user?.email) {
        try {
          await supabase.functions.invoke("send-notification-email", {
            body: {
              to: user.email,
              userName: user.full_name || user.email,
              notificationType: "role",
              roleName: role,
            },
          });
        } catch (emailError) {
          console.error("Erro ao enviar email de notificação:", emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Role adicionado com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar role: " + error.message);
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast.success("Role removido com sucesso");
    },
    onError: (error: any) => {
      toast.error("Erro ao remover role: " + error.message);
    },
  });

  return {
    users,
    isLoading,
    isAdmin,
    currentUserRoles,
    addRole,
    removeRole,
  };
};
