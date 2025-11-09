import { StatCard } from "@/components/StatCard";
import { Package, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { useMealDeliveries } from "@/hooks/useMealDeliveries";

interface DeliveryKPIsProps {
  projectId?: string;
  filters: any;
}

export function DeliveryKPIs({ projectId, filters }: DeliveryKPIsProps) {
  const { data: deliveries, isLoading } = useMealDeliveries(projectId, filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const totalPlanned = deliveries?.reduce((sum, d) => sum + Number(d.planned_qty), 0) || 0;
  const totalDelivered = deliveries?.reduce((sum, d) => sum + Number(d.delivered_qty), 0) || 0;
  const fulfillmentRate = totalPlanned > 0 ? (totalDelivered / totalPlanned) * 100 : 0;
  
  const today = new Date();
  const delayed = deliveries?.filter(d => {
    if (!d.delivery_date_planned || d.status === 'Delivered') return false;
    const planned = new Date(d.delivery_date_planned);
    return planned < today && d.delivered_qty < d.planned_qty;
  }).length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Entregas Planejadas"
        value={totalPlanned.toLocaleString()}
        icon={Package}
        variant="default"
      />
      <StatCard
        title="Entregas Realizadas"
        value={totalDelivered.toLocaleString()}
        icon={CheckCircle}
        variant="success"
      />
      <StatCard
        title="Taxa de Cumprimento"
        value={`${fulfillmentRate.toFixed(1)}%`}
        icon={TrendingUp}
        variant={fulfillmentRate >= 90 ? "success" : fulfillmentRate >= 70 ? "warning" : "destructive"}
      />
      <StatCard
        title="Entregas em Atraso"
        value={delayed}
        icon={AlertTriangle}
        variant={delayed > 0 ? "warning" : "success"}
      />
    </div>
  );
}
