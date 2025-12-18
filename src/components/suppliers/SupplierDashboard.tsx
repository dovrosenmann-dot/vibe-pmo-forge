import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, FileText, DollarSign, Package, Star } from "lucide-react";
import { useSupplierDashboard } from "@/hooks/useSupplierDashboard";

interface SupplierDashboardProps {
  projectId?: string;
}

const categoryLabels: Record<string, string> = {
  goods: "Bens",
  services: "Serviços",
  logistics: "Logística",
  consulting: "Consultoria",
  construction: "Construção",
  equipment: "Equipamentos",
  other: "Outros",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  inactive: { label: "Inativo", variant: "secondary" },
  blocked: { label: "Bloqueado", variant: "destructive" },
  pending_approval: { label: "Pendente", variant: "outline" },
};

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted-foreground text-sm">-</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
        />
      ))}
    </div>
  );
}

export function SupplierDashboard({ projectId }: SupplierDashboardProps) {
  const { summaries, totals, isLoading } = useSupplierDashboard(projectId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fornecedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {totals.activeSuppliers} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Contratos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totals.totalContractValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total contratado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${totals.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Transações aprovadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Entregas vinculadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Execution Summary */}
      {totals.totalContractValue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execução de Contratos</CardTitle>
            <CardDescription>
              ${totals.totalSpent.toLocaleString()} de ${totals.totalContractValue.toLocaleString()} executado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress 
              value={(totals.totalSpent / totals.totalContractValue) * 100} 
              className="h-3"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {((totals.totalSpent / totals.totalContractValue) * 100).toFixed(1)}% executado
            </p>
          </CardContent>
        </Card>
      )}

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Consolidada por Fornecedor</CardTitle>
          <CardDescription>
            Resumo de contratos, transações e entregas por fornecedor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum fornecedor cadastrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead className="text-right">Contratos</TableHead>
                  <TableHead className="text-right">Valor Contratado</TableHead>
                  <TableHead className="text-right">Total Gasto</TableHead>
                  <TableHead className="text-right">Entregas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((supplier) => {
                  const status = statusConfig[supplier.status] || { label: supplier.status, variant: "secondary" as const };
                  const executionRate = supplier.totalContractValue > 0 
                    ? (supplier.totalSpent / supplier.totalContractValue) * 100 
                    : 0;
                  
                  return (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{categoryLabels[supplier.category] || supplier.category}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <RatingStars rating={supplier.rating} />
                      </TableCell>
                      <TableCell className="text-right">
                        {supplier.totalContracts}
                        {supplier.activeContracts > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({supplier.activeContracts} ativos)
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${supplier.totalContractValue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-red-600 dark:text-red-400">
                            ${supplier.totalSpent.toLocaleString()}
                          </span>
                          {supplier.totalContractValue > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {executionRate.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {supplier.totalDeliveries}
                        {supplier.deliveredQty > 0 && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({supplier.deliveredQty} un)
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
