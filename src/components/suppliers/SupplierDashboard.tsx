import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, FileText, DollarSign, Package, Star, Filter, X } from "lucide-react";
import { useSupplierDashboard, SupplierDashboardFilters } from "@/hooks/useSupplierDashboard";
import { useSuppliers } from "@/hooks/useSuppliers";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 65%, 60%)",
];

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
  const [filters, setFilters] = useState<SupplierDashboardFilters>({});
  const { suppliers } = useSuppliers(projectId);
  const { summaries, totals, isLoading } = useSupplierDashboard(projectId, filters);

  const hasActiveFilters = filters.supplierId || filters.status || filters.startDate || filters.endDate;

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando dashboard...</div>;
  }

  // Prepare chart data
  const spendingBySupplier = summaries
    .filter(s => s.totalSpent > 0)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10)
    .map(s => ({
      name: s.name.length > 15 ? s.name.substring(0, 15) + "..." : s.name,
      fullName: s.name,
      gasto: s.totalSpent,
      contratado: s.totalContractValue,
    }));

  const contractsByCategory = Object.entries(
    summaries.reduce((acc, s) => {
      const cat = categoryLabels[s.category] || s.category;
      acc[cat] = (acc[cat] || 0) + s.totalContractValue;
      return acc;
    }, {} as Record<string, number>)
  )
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fornecedor</label>
              <Select
                value={filters.supplierId || "all"}
                onValueChange={(v) => setFilters(f => ({ ...f, supplierId: v === "all" ? undefined : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os fornecedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {suppliers?.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(v) => setFilters(f => ({ ...f, status: v === "all" ? undefined : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value || undefined }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value || undefined }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Charts Section */}
      {(spendingBySupplier.length > 0 || contractsByCategory.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Spending by Supplier Bar Chart */}
          {spendingBySupplier.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gastos por Fornecedor</CardTitle>
                <CardDescription>Top 10 fornecedores por valor gasto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={spendingBySupplier}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                        className="text-xs"
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        className="text-xs"
                      />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `$${value.toLocaleString()}`,
                          name === "gasto" ? "Gasto" : "Contratado"
                        ]}
                        labelFormatter={(label, payload) => 
                          payload?.[0]?.payload?.fullName || label
                        }
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar 
                        dataKey="gasto" 
                        fill="hsl(var(--chart-1))" 
                        name="Gasto"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar 
                        dataKey="contratado" 
                        fill="hsl(var(--chart-2))" 
                        name="Contratado"
                        radius={[0, 4, 4, 0]}
                        fillOpacity={0.5}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contracts by Category Pie Chart */}
          {contractsByCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contratos por Categoria</CardTitle>
                <CardDescription>Distribuição do valor contratado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contractsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => 
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {contractsByCategory.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, "Valor"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
