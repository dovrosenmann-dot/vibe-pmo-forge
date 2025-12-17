import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type ApprovalStatus = "pending" | "approved" | "rejected";
type TransactionType = "income" | "expense" | "transfer" | "adjustment";

interface FinanceFiltersProps {
  selectedProjectId: string | undefined;
  onProjectChange: (projectId: string | undefined) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  approvalStatus: ApprovalStatus | undefined;
  onApprovalStatusChange: (status: ApprovalStatus | undefined) => void;
  transactionType: TransactionType | undefined;
  onTransactionTypeChange: (type: TransactionType | undefined) => void;
}

export function FinanceFilters({
  selectedProjectId,
  onProjectChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  approvalStatus,
  onApprovalStatusChange,
  transactionType,
  onTransactionTypeChange,
}: FinanceFiltersProps) {
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, code")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const clearFilters = () => {
    onProjectChange(undefined);
    onDateFromChange(undefined);
    onDateToChange(undefined);
    onApprovalStatusChange(undefined);
    onTransactionTypeChange(undefined);
  };

  const hasFilters = selectedProjectId || dateFrom || dateTo || approvalStatus || transactionType;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg border">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Projeto</span>
        <Select
          value={selectedProjectId || "all"}
          onValueChange={(value) => onProjectChange(value === "all" ? undefined : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os projetos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {projects?.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.code} - {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Data Inicial</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={onDateFromChange}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Data Final</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={onDateToChange}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Tipo Transação</span>
        <Select
          value={transactionType || "all"}
          onValueChange={(value) => onTransactionTypeChange(value === "all" ? undefined : value as TransactionType)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
            <SelectItem value="transfer">Transferência</SelectItem>
            <SelectItem value="adjustment">Ajuste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">Status Aprovação</span>
        <Select
          value={approvalStatus || "all"}
          onValueChange={(value) => onApprovalStatusChange(value === "all" ? undefined : value as ApprovalStatus)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="rejected">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-transparent">Limpar</span>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Limpar
          </Button>
        </div>
      )}
    </div>
  );
}
