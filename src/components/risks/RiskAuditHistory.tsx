import { useRiskAuditLog, RiskAuditLog } from "@/hooks/useRiskAuditLog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, CheckCircle2, XCircle, FileText, ArrowRight, ShieldAlert, TrendingUp } from "lucide-react";

interface RiskAuditHistoryProps {
  riskId: string;
  riskTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusLabels: Record<string, string> = {
  identified: "Identificado",
  mitigating: "Em Mitigação",
  resolved: "Resolvido",
  accepted: "Aceito",
  escalated: "Escalado",
};

const statusColors: Record<string, string> = {
  identified: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  mitigating: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  accepted: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  escalated: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const levelLabels: Record<string, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "resolved":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "escalated":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "mitigating":
      return <TrendingUp className="h-4 w-4 text-blue-600" />;
    case "identified":
      return <ShieldAlert className="h-4 w-4 text-yellow-600" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

export function RiskAuditHistory({ riskId, riskTitle, open, onOpenChange }: RiskAuditHistoryProps) {
  const { auditLogs, isLoading } = useRiskAuditLog(open ? riskId : undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Histórico — {riskTitle}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum histórico disponível</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px] pr-4">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <AuditLogEntry key={log.id} log={log} isFirst={index === 0} />
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AuditLogEntry({ log, isFirst }: { log: RiskAuditLog; isFirst: boolean }) {
  const isCreation = log.metadata?.event === "created" || !log.previous_status;
  const changedByName = log.changed_by_profile?.full_name || "Sistema";

  const statusChanged = log.previous_status !== log.new_status;
  const probChanged = log.previous_probability && log.previous_probability !== log.new_probability;
  const impactChanged = log.previous_impact && log.previous_impact !== log.new_impact;

  return (
    <div className="relative pl-10">
      <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-background ${
        isFirst ? "bg-primary" : "bg-muted-foreground/30"
      }`} />

      <div className={`p-3 rounded-lg border ${isFirst ? "bg-muted/50" : "bg-background"}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusIcon status={log.new_status} />
            {isCreation ? (
              <span className="text-sm font-medium">Risco criado</span>
            ) : (
              <div className="flex flex-col gap-1">
                {statusChanged && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Badge variant="outline" className={statusColors[log.previous_status || "identified"]}>
                      {statusLabels[log.previous_status || "identified"]}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className={statusColors[log.new_status]}>
                      {statusLabels[log.new_status]}
                    </Badge>
                  </div>
                )}
                {probChanged && (
                  <p className="text-xs text-muted-foreground">
                    Probabilidade: {levelLabels[log.previous_probability!]} → {levelLabels[log.new_probability!]}
                  </p>
                )}
                {impactChanged && (
                  <p className="text-xs text-muted-foreground">
                    Impacto: {levelLabels[log.previous_impact!]} → {levelLabels[log.new_impact!]}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="font-medium">Por:</span> {changedByName}</p>
          <p>
            <span className="font-medium">Data:</span>{" "}
            {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
          {log.change_reason && (
            <p className="mt-2 p-2 bg-muted rounded text-foreground">
              <span className="font-medium">Motivo:</span> {log.change_reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
