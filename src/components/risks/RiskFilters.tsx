import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { RiskFilters as RiskFiltersType } from "@/hooks/useProjectRisks";

interface RiskFiltersProps {
  filters: RiskFiltersType;
  onChange: (filters: RiskFiltersType) => void;
}

export const RiskFilters = ({ filters, onChange }: RiskFiltersProps) => {
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Select value={filters.category || "all"} onValueChange={(v) => onChange({ ...filters, category: v === "all" ? undefined : v as any })}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="meal">MEAL</SelectItem>
          <SelectItem value="suppliers">Fornecedores</SelectItem>
          <SelectItem value="financial">Financeiro</SelectItem>
          <SelectItem value="beneficiaries">Beneficiários</SelectItem>
          <SelectItem value="operational">Operacional</SelectItem>
          <SelectItem value="contextual">Contextual</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.status || "all"} onValueChange={(v) => onChange({ ...filters, status: v === "all" ? undefined : v as any })}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="identified">Identificado</SelectItem>
          <SelectItem value="mitigating">Em Mitigação</SelectItem>
          <SelectItem value="escalated">Escalado</SelectItem>
          <SelectItem value="accepted">Aceito</SelectItem>
          <SelectItem value="resolved">Resolvido</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.source || "all"} onValueChange={(v) => onChange({ ...filters, source: v === "all" ? undefined : v as any })}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Origem" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="auto_meal">Auto MEAL</SelectItem>
          <SelectItem value="auto_supplier">Auto Fornecedor</SelectItem>
          <SelectItem value="auto_financial">Auto Financeiro</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})}>
          <X className="w-4 h-4 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
};
