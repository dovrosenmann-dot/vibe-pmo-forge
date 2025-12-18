import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRightLeft, Settings2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  currency: string;
  transaction_date: string;
  approval_status: string;
}

interface TransactionSummaryReportProps {
  transactions: Transaction[];
  dateFrom?: Date;
  dateTo?: Date;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; colorClass: string }> = {
  income: { label: "Receitas", icon: TrendingUp, colorClass: "text-green-600 dark:text-green-400" },
  expense: { label: "Despesas", icon: TrendingDown, colorClass: "text-red-600 dark:text-red-400" },
  transfer: { label: "Transferências", icon: ArrowRightLeft, colorClass: "text-blue-600 dark:text-blue-400" },
  adjustment: { label: "Ajustes", icon: Settings2, colorClass: "text-amber-600 dark:text-amber-400" },
};

export function TransactionSummaryReport({ transactions, dateFrom, dateTo }: TransactionSummaryReportProps) {
  const summaryByType = useMemo(() => {
    const summary: Record<string, { count: number; total: number; approved: number; pending: number; rejected: number }> = {};
    
    transactions.forEach((t) => {
      if (!summary[t.transaction_type]) {
        summary[t.transaction_type] = { count: 0, total: 0, approved: 0, pending: 0, rejected: 0 };
      }
      summary[t.transaction_type].count += 1;
      summary[t.transaction_type].total += t.amount;
      
      if (t.approval_status === "approved") {
        summary[t.transaction_type].approved += t.amount;
      } else if (t.approval_status === "pending") {
        summary[t.transaction_type].pending += t.amount;
      } else if (t.approval_status === "rejected") {
        summary[t.transaction_type].rejected += t.amount;
      }
    });
    
    return summary;
  }, [transactions]);

  const totals = useMemo(() => {
    const income = summaryByType.income?.total || 0;
    const expense = summaryByType.expense?.total || 0;
    const transfer = summaryByType.transfer?.total || 0;
    const adjustment = summaryByType.adjustment?.total || 0;
    
    return {
      income,
      expense,
      transfer,
      adjustment,
      netFlow: income - expense + adjustment,
      totalTransactions: transactions.length,
    };
  }, [summaryByType, transactions.length]);

  const periodLabel = useMemo(() => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, "dd/MM/yyyy", { locale: ptBR })} - ${format(dateTo, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    if (dateFrom) {
      return `A partir de ${format(dateFrom, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    if (dateTo) {
      return `Até ${format(dateTo, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    return "Todo o período";
  }, [dateFrom, dateTo]);

  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Relatório Consolidado de Transações
        </CardTitle>
        <CardDescription>
          Período: {periodLabel} • {totals.totalTransactions} transações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          {Object.entries(typeConfig).map(([type, config]) => {
            const data = summaryByType[type];
            const Icon = config.icon;
            if (!data) return null;
            
            return (
              <Card key={type} className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">{config.label}</span>
                    <Icon className={`h-4 w-4 ${config.colorClass}`} />
                  </div>
                  <div className={`text-2xl font-bold ${config.colorClass}`}>
                    ${data.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {data.count} transações • Média: ${(data.total / data.count).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="rounded-lg border p-4 bg-muted/20 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Fluxo Líquido (Receitas - Despesas + Ajustes)</span>
              <div className={`text-3xl font-bold ${totals.netFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {totals.netFlow >= 0 ? "+" : ""}${totals.netFlow.toLocaleString()}
              </div>
            </div>
            <Badge variant={totals.netFlow >= 0 ? "default" : "destructive"} className="text-sm">
              {totals.netFlow >= 0 ? "Positivo" : "Negativo"}
            </Badge>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Qtd</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Média</TableHead>
              <TableHead className="text-right">Aprovado</TableHead>
              <TableHead className="text-right">Pendente</TableHead>
              <TableHead className="text-right">Rejeitado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(summaryByType).map(([type, data]) => {
              const config = typeConfig[type] || { label: type, colorClass: "text-foreground" };
              return (
                <TableRow key={type}>
                  <TableCell className={`font-medium ${config.colorClass}`}>{config.label}</TableCell>
                  <TableCell className="text-right">{data.count}</TableCell>
                  <TableCell className="text-right font-medium">${data.total.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ${(data.total / data.count).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400">
                    ${data.approved.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-amber-600 dark:text-amber-400">
                    ${data.pending.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">
                    ${data.rejected.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
