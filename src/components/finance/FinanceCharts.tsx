import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";

interface BudgetAllocation {
  id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  committed_amount: number;
  currency: string;
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

export function FinanceCharts({ allocations, transactions, grants }: FinanceChartsProps) {
  // Budget allocation by category
  const budgetByCategory = allocations.reduce((acc, allocation) => {
    const category = categoryLabels[allocation.category] || allocation.category;
    const existing = acc.find((item) => item.category === category);
    if (existing) {
      existing.allocated += allocation.allocated_amount;
      existing.spent += allocation.spent_amount;
    } else {
      acc.push({
        category,
        allocated: allocation.allocated_amount,
        spent: allocation.spent_amount,
      });
    }
    return acc;
  }, [] as { category: string; allocated: number; spent: number }[]);

  // Transaction trends by month
  const transactionsByMonth = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.transaction_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = acc.find((item) => item.month === monthKey);
    
    if (existing) {
      if (transaction.transaction_type === "income") {
        existing.income += transaction.amount;
      } else if (transaction.transaction_type === "expense") {
        existing.expense += transaction.amount;
      }
    } else {
      acc.push({
        month: monthKey,
        income: transaction.transaction_type === "income" ? transaction.amount : 0,
        expense: transaction.transaction_type === "expense" ? transaction.amount : 0,
      });
    }
    return acc;
  }, [] as { month: string; income: number; expense: number }[]);

  const sortedTransactions = transactionsByMonth.sort((a, b) => a.month.localeCompare(b.month));

  // Grant status distribution
  const grantStatusData = grants.reduce((acc, grant) => {
    const existing = acc.find((item) => item.status === grant.status);
    if (existing) {
      existing.value += grant.total_amount;
      existing.count += 1;
    } else {
      acc.push({
        status: grant.status,
        value: grant.total_amount,
        count: 1,
      });
    }
    return acc;
  }, [] as { status: string; value: number; count: number }[]);

  // Expense by category pie chart data
  const expenseByCategory = transactions
    .filter((t) => t.transaction_type === "expense" && t.category)
    .reduce((acc, transaction) => {
      const category = categoryLabels[transaction.category!] || transaction.category!;
      const existing = acc.find((item) => item.name === category);
      if (existing) {
        existing.value += transaction.amount;
      } else {
        acc.push({ name: category, value: transaction.amount });
      }
      return acc;
    }, [] as { name: string; value: number }[]);

  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      {/* Budget Allocation vs Spent */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Orçamento por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetByCategory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="category" 
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
              <Bar dataKey="allocated" name="Alocado" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Gasto" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transaction Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fluxo Financeiro Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sortedTransactions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Receitas" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Despesas" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--destructive))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grant Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status dos Grants</CardTitle>
        </CardHeader>
        <CardContent>
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
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Valor"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {expenseByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)"
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Valor"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
