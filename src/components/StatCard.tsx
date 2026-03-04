import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "default" | "success" | "warning" | "destructive";
}

export const StatCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  const iconColorMap = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-[20px_22px] shadow-card transition-all duration-200 hover:border-input group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.12em]">{title}</p>
          <p className="font-display font-[800] text-[26px] text-foreground mt-2 leading-tight">{value}</p>
          {trend && (
            <p className={`text-[11px] font-mono mt-1.5 ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={`${iconColorMap[variant]} opacity-60 group-hover:opacity-100 transition-opacity`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
