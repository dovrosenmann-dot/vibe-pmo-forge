import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRoles } from "@/hooks/useRoles";
import { RoleManager } from "@/components/admin/RoleManager";
import { ProjectAccessManager } from "@/components/admin/ProjectAccessManager";
import { Shield, AlertTriangle, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navigate } from "react-router-dom";

export default function Admin() {
  const { users, isLoading, isAdmin, currentUserRoles, addRole, removeRole } = useRoles();

  // Show loading first to prevent UI flash before auth check completes
  if (isLoading || currentUserRoles === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Only redirect after roles have been fully loaded (server-side verified via RLS)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="p-8">
      <DashboardHeader
        title="Administração de Usuários"
        subtitle="Gerencie roles e permissões de acesso"
      />

      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertDescription className="text-amber-900 dark:text-amber-100">
          <strong>Atenção:</strong> Apenas administradores podem gerenciar roles e permissões.
          Usuários com role "admin" têm acesso total ao sistema e a todos os projetos.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Usuários do Sistema</CardTitle>
              <CardDescription>
                Gerencie roles e acesso a projetos para cada usuário
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Acesso a Projetos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || "Sem nome"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <RoleManager
                      userId={user.id}
                      currentRoles={user.roles}
                      onAddRole={(userId, role) =>
                        addRole.mutate({ userId, role })
                      }
                      onRemoveRole={(userId, role) =>
                        removeRole.mutate({ userId, role })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {user.roles.includes('admin') ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Acesso Total (Admin)</span>
                      </div>
                    ) : (
                      <ProjectAccessManager userId={user.id} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {users && users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário cadastrado no sistema
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Descrição dos Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Admin</h4>
              <p className="text-sm text-muted-foreground">
                Acesso total ao sistema. Pode gerenciar usuários, roles e todos os projetos.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">PMO</h4>
              <p className="text-sm text-muted-foreground">
                Pode gerenciar todos os projetos, criar novos projetos e programas.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Gerente de Projeto</h4>
              <p className="text-sm text-muted-foreground">
                Acesso aos projetos atribuídos. Pode editar informações dos projetos.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Coordenador MEAL</h4>
              <p className="text-sm text-muted-foreground">
                Pode gerenciar indicadores, entregas, beneficiários e relatórios MEAL.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Financeiro</h4>
              <p className="text-sm text-muted-foreground">
                Acesso a módulos financeiros, orçamentos, despesas e faturas.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Visualizador</h4>
              <p className="text-sm text-muted-foreground">
                Acesso somente leitura aos projetos atribuídos.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Doador</h4>
              <p className="text-sm text-muted-foreground">
                Acesso a relatórios e visualização de progresso dos projetos financiados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
