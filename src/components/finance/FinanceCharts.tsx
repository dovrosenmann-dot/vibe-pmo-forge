import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart,
  Area,
} from "recharts";

interface BudgetAllocation {
  id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  committed_amount: number;
  currency: string;
  fiscal_year: number;
  quarter: number | null;
}

interface FinancialTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  transaction_date: string;
  category?: string | null;
}

interface Grant {
  id: string;
  donor_name: string;
  total_amount: number;
  disbursed_amount: number;
  status: string;
}

interface FinanceChartsProps {
  allocations: BudgetAllocation[];
  transactions: FinancialTransaction[];
  grants: Grant[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted-foreground))",
];

const categoryLabels: Record<string, string> = {
  personnel: "Pessoal",
  travel: "Viagens",
  equipment: "Equipamentos",
  supplies: "Suprimentos",
  services: "Serviços",
  infrastructure: "Infraestrutura",
  overhead: "Overhead",
  other: "Outros",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  disbursed: "Desembolsado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export function FinanceCharts({ allocations, transactions, grants }: FinanceChartsProps) {
  // Budget allocation by category
  const budgetByCategory = useMemo(() => {
    const categoryMap = new Map<string, { allocated: number; spent: number; committed: number }>();
    
    allocations.forEach((allocation) => {
      const category = categoryLabels[allocation.category] || allocation.category;
      const current = categoryMap.get(category) || { allocated: 0, spent: 0, committed: 0 };
      categoryMap.set(category, {
        allocated: current.allocated + allocation.allocated_amount,
        spent: current.spent + allocation.spent_amount,
        committed: current.committed + allocation.committed_amount,
      });
    });

    return Array.from(categoryMap.entries()).map(([category, values]) => ({
      category,
      planejado: values.allocated,
      realizado: values.spent,
      comprometido: values.committed,
      execucao: values.allocated > 0 ? Math.round((values.spent / values.allocated) * 100) : 0,
    }));
  }, [allocations]);

  // Budget by period (year/quarter)
  const budgetByPeriod = useMemo(() => {
    const periodMap = new Map<string, { allocated: number; spent: number }>();
    
    allocations.forEach((allocation) => {
      const periodKey = allocation.quarter 
        ? `${allocation.fiscal_year} Q${allocation.quarter}`
        : `${allocation.fiscal_year}`;
      const current = periodMap.get(periodKey) || { allocated: 0, spent: 0 };
      periodMap.set(periodKey, {
        allocated: current.allocated + allocation.allocated_amount,
        spent: current.spent + allocation.spent_amount,
      });
    });

    return Array.from(periodMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, values]) => ({
        periodo: period,
        planejado: values.allocated,
        realizado: values.spent,
        variacao: values.allocated - values.spent,
      }));
  }, [allocations]);

  // Transaction trends by month
  const transactionsByMonth = useMemo(() => {
    const monthMap = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach((transaction) => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const current = monthMap.get(monthKey) || { income: 0, expense: 0 };
      
      if (transaction.transaction_type === "income") {
        current.income += transaction.amount;
      } else if (transaction.transaction_type === "expense") {
        current.expense += transaction.amount;
      }
      
      monthMap.set(monthKey, current);
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, values]) => ({
        month,
        receitas: values.income,
        despesas: values.expense,
        saldo: values.income - values.expense,
      }));
  }, [transactions]);

  // Grant status distribution
  const grantStatusData = useMemo(() => {
    const statusMap = new Map<string, { value: number; count: number }>();
    
    grants.forEach((grant) => {
      const current = statusMap.get(grant.status) || { value: 0, count: 0 };
      statusMap.set(grant.status, {
        value: current.value + grant.total_amount,
        count: current.count + 1,
      });
    });

    return Array.from(statusMap.entries()).map(([status, values]) => ({
      status: statusLabels[status] || status,
      value: values.value,
      count: values.count,
    }));
  }, [grants]);

  // Overall totals
  const totals = useMemo(() => {
    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_amount, 0);
    const totalSpent = allocations.reduce((sum, a) => sum + a.spent_amount, 0);
    const totalCommitted = allocations.reduce((sum, a) => sum + a.committed_amount, 0);
    const executionRate = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const variance = totalAllocated - totalSpent;
    
    return { totalAllocated, totalSpent, totalCommitted, executionRate, variance };
  }, [allocations]);

  if (allocations.length === 0 && transactions.length === 0 && grants.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Selecione um projeto para visualizar os gráficos financeiros
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 mb-6">
      {/* Summary Cards */}
      {allocations.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Execução</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totals.executionRate.toFixed(1)}%</div>
              <Progress value={Math.min(totals.executionRate, 100)} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Variância</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.variance >= 0 ? "text-green-600" : "text-destructive"}`}>
                ${Math.abs(totals.variance).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.variance >= 0 ? "Abaixo do orçamento" : "Acima do orçamento"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Comprometido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totals.totalCommitted.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totals.totalAllocated > 0 
                  ? `${((totals.totalCommitted / totals.totalAllocated) * 100).toFixed(1)}% do orçamento`
                  : "0%"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${Math.max(0, totals.totalAllocated - totals.totalSpent - totals.totalCommitted).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Saldo livre para uso
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Budget Planned vs Actual by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Planejado vs Realizado por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Bar dataKey="planejado" name="Planejado" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="realizado" name="Realizado" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem alocações cadastradas
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Evolution by Period */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução Orçamentária por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetByPeriod.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={budgetByPeriod} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="periodo" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="planejado" 
                    name="Planejado" 
                    fill="hsl(var(--primary) / 0.2)" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="realizado" 
                    name="Realizado" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Transaction Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fluxo Financeiro Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionsByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Legend />
                  <Bar dataKey="receitas" name="Receitas" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" name="Despesas" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem transações no período
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grant Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição de Grants por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {grantStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={grantStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="status"
                    label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {grantStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `$${value.toLocaleString()} (${props.payload.count} grants)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem grants cadastrados
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Execution Progress by Category */}
      {budgetByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Execução Orçamentária por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetByCategory.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-sm text-muted-foreground">
                      ${item.realizado.toLocaleString()} / ${item.planejado.toLocaleString()} ({item.execucao}%)
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(item.execucao, 100)} 
                    className={item.execucao > 100 ? "[&>div]:bg-destructive" : ""}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
