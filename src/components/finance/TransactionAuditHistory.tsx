import { useTransactionAuditLog, TransactionAuditLog } from "@/hooks/useTransactionAuditLog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, CheckCircle2, XCircle, FileText, ArrowRight } from "lucide-react";

interface TransactionAuditHistoryProps {
  transactionId: string;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />;
  }
};

export function TransactionAuditHistory({ transactionId }: TransactionAuditHistoryProps) {
  const { auditLogs, isLoading } = useTransactionAuditLog(transactionId);

  if (isLoading) {
    return (
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
    );
  }

  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum histórico disponível</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {auditLogs.map((log, index) => (
            <AuditLogEntry key={log.id} log={log} isFirst={index === 0} />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function AuditLogEntry({ log, isFirst }: { log: TransactionAuditLog; isFirst: boolean }) {
  const isCreation = log.metadata?.event === "created" || !log.previous_status;
  const changedByName = log.changed_by_profile?.full_name || "Sistema";

  return (
    <div className="relative pl-10">
      {/* Timeline dot */}
      <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-background ${
        isFirst ? "bg-primary" : "bg-muted-foreground/30"
      }`} />
      
      <div className={`p-3 rounded-lg border ${isFirst ? "bg-muted/50" : "bg-background"}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <StatusIcon status={log.new_status} />
            {isCreation ? (
              <span className="text-sm font-medium">Transação criada</span>
            ) : (
              <div className="flex items-center gap-1.5 text-sm">
                <Badge variant="outline" className={statusColors[log.previous_status || "pending"]}>
                  {statusLabels[log.previous_status || "pending"]}
                </Badge>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className={statusColors[log.new_status]}>
                  {statusLabels[log.new_status]}
                </Badge>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-medium">Por:</span> {changedByName}
          </p>
          <p>
            <span className="font-medium">Data:</span>{" "}
            {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
          {log.change_reason && (
            <p className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300">
              <span className="font-medium">Motivo:</span> {log.change_reason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
