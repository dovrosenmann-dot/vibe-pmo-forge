import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Truck, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Star,
  Package,
  DollarSign
} from "lucide-react";
import { useSupplierPerformance } from "@/hooks/useSupplierPerformance";
import { Supplier } from "@/hooks/useSuppliers";

interface SupplierPerformanceReportProps {
  supplier: Supplier;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

function getScoreBadge(score: number): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  if (score >= 80) return { label: "Excelente", variant: "default" };
  if (score >= 60) return { label: "Bom", variant: "secondary" };
  if (score >= 40) return { label: "Regular", variant: "outline" };
  return { label: "Crítico", variant: "destructive" };
}

function getProgressColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function ScoreCard({ 
  title, 
  score, 
  icon: Icon,
  description 
}: { 
  title: string; 
  score: number; 
  icon: React.ElementType;
  description: string;
}) {
  const scoreColor = getScoreColor(score);
  const badge = getScoreBadge(score);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
          <div className="flex-1">
            <Progress 
              value={score} 
              className="h-2" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({ 
  label, 
  value, 
  icon: Icon,
  suffix = "",
  highlight = false
}: { 
  label: string; 
  value: string | number;
  icon: React.ElementType;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className={`font-medium ${highlight ? 'text-primary' : ''}`}>
        {value}{suffix}
      </span>
    </div>
  );
}

export function SupplierPerformanceReport({ supplier }: SupplierPerformanceReportProps) {
  const { data: metrics, isLoading } = useSupplierPerformance(supplier.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando métricas de desempenho...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Não foi possível carregar as métricas.</p>
      </div>
    );
  }

  const hasData = metrics.totalDeliveries > 0 || metrics.totalTransactions > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Sem dados suficientes</h3>
        <p className="text-muted-foreground max-w-md">
          Este fornecedor ainda não possui entregas ou transações registradas para calcular a avaliação de desempenho.
        </p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header with supplier info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{supplier.name}</h2>
          <p className="text-sm text-muted-foreground">Avaliação de Desempenho</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= Math.round(metrics.overallScore / 20)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
          <span className={`text-2xl font-bold ${getScoreColor(metrics.overallScore)}`}>
            {metrics.overallScore}
          </span>
        </div>
      </div>

      <Separator />

      {/* Score Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard
          title="Score Geral"
          score={metrics.overallScore}
          icon={TrendingUp}
          description="Média ponderada de entregas e pagamentos"
        />
        <ScoreCard
          title="Entregas"
          score={metrics.deliveryScore}
          icon={Truck}
          description="Pontualidade e taxa de entrega"
        />
        <ScoreCard
          title="Pagamentos"
          score={metrics.paymentScore}
          icon={CreditCard}
          description="Taxa de aprovação de transações"
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Delivery Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Métricas de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow 
              icon={Truck} 
              label="Total de entregas" 
              value={metrics.totalDeliveries} 
            />
            <MetricRow 
              icon={CheckCircle2} 
              label="Entregas no prazo" 
              value={metrics.onTimeDeliveries}
              highlight 
            />
            <MetricRow 
              icon={Clock} 
              label="Entregas atrasadas" 
              value={metrics.lateDeliveries} 
            />
            <Separator className="my-2" />
            <MetricRow 
              icon={TrendingUp} 
              label="Taxa de conclusão" 
              value={metrics.deliveryRate.toFixed(1)}
              suffix="%"
              highlight 
            />
          </CardContent>
        </Card>

        {/* Payment/Transaction Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4" />
              Métricas de Transações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <MetricRow 
              icon={CreditCard} 
              label="Total de transações" 
              value={metrics.totalTransactions} 
            />
            <MetricRow 
              icon={CheckCircle2} 
              label="Aprovadas" 
              value={metrics.approvedTransactions}
              highlight 
            />
            <MetricRow 
              icon={AlertCircle} 
              label="Pendentes" 
              value={metrics.pendingTransactions} 
            />
            <MetricRow 
              icon={XCircle} 
              label="Rejeitadas" 
              value={metrics.rejectedTransactions} 
            />
            <Separator className="my-2" />
            <MetricRow 
              icon={TrendingUp} 
              label="Taxa de aprovação" 
              value={metrics.approvalRate.toFixed(1)}
              suffix="%"
              highlight 
            />
            <MetricRow 
              icon={Clock} 
              label="Tempo médio de aprovação" 
              value={metrics.averageApprovalDays}
              suffix=" dias" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Contract Execution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4" />
            Execução de Contratos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(metrics.totalContractValue)}</p>
              <p className="text-sm text-muted-foreground">Valor Total Contratado</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalSpent)}</p>
              <p className="text-sm text-muted-foreground">Total Executado</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${getScoreColor(metrics.executionRate)}`}>
                {metrics.executionRate.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa de Execução</p>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={Math.min(metrics.executionRate, 100)} className="h-3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
