import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, X, Clock, AlertCircle } from "lucide-react";
import type { FinancialTransaction, TransactionApprovalStatus } from "@/hooks/useFinancialTransactions";

interface TransactionApprovalActionsProps {
  transaction: FinancialTransaction;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function TransactionApprovalActions({
  transaction,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: TransactionApprovalActionsProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(transaction.id, rejectionReason);
      setRejectDialogOpen(false);
      setRejectionReason("");
    }
  };

  if (transaction.approval_status !== "pending") {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={() => onApprove(transaction.id)}
                disabled={isApproving}
              >
                <Check className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aprovar</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => setRejectDialogOpen(true)}
                disabled={isRejecting}
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Rejeitar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Transação</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição desta transação.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Motivo da rejeição..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isRejecting}
            >
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ApprovalStatusBadgeProps {
  status: TransactionApprovalStatus;
  rejectionReason?: string | null;
}

export function ApprovalStatusBadge({ status, rejectionReason }: ApprovalStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Pendente",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    approved: {
      label: "Aprovada",
      variant: "default" as const,
      icon: Check,
      className: "bg-green-100 text-green-800 border-green-200",
    },
    rejected: {
      label: "Rejeitada",
      variant: "destructive" as const,
      icon: AlertCircle,
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  if (status === "rejected" && rejectionReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant={config.variant} className={config.className}>
              <Icon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <p className="font-medium">Motivo:</p>
            <p>{rejectionReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant={config.variant} className={config.className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
