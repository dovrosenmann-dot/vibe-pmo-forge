import { ProjectRisk } from "@/hooks/useProjectRisks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Bot } from "lucide-react";
import { format } from "date-fns";

interface RiskTableProps {
  risks: ProjectRisk[];
  onEdit: (risk: ProjectRisk) => void;
  onDelete: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  meal: "MEAL", suppliers: "Fornecedores", financial: "Financeiro",
  beneficiaries: "Beneficiários", operational: "Operacional", contextual: "Contextual",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  identified: { label: "Identificado", variant: "destructive" },
  mitigating: { label: "Em Mitigação", variant: "default" },
  resolved: { label: "Resolvido", variant: "secondary" },
  accepted: { label: "Aceito", variant: "outline" },
  escalated: { label: "Escalado", variant: "destructive" },
};

const levelLabels: Record<string, string> = {
  low: "Baixo", medium: "Médio", high: "Alto",
};

const levelColors: Record<string, string> = {
  low: "text-success", medium: "text-warning", high: "text-destructive",
};

const sourceLabels: Record<string, string> = {
  manual: "Manual", auto_meal: "MEAL", auto_supplier: "Fornecedor", auto_financial: "Financeiro",
};

export const RiskTable = ({ risks, onEdit, onDelete }: RiskTableProps) => {
  if (risks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum risco encontrado. Crie um novo risco ou execute a análise automática.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Prob.</TableHead>
            <TableHead>Impacto</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data Limite</TableHead>
            <TableHead className="w-[90px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((risk) => {
            const statusInfo = statusLabels[risk.status] || { label: risk.status, variant: "outline" as const };
            const isAuto = risk.source !== "manual";
            return (
              <TableRow key={risk.id}>
                <TableCell className="font-medium max-w-[220px] truncate">
                  <div className="flex items-center gap-1.5">
                    {isAuto && <Bot className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    <span className="truncate">{risk.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{categoryLabels[risk.category]}</Badge>
                </TableCell>
                <TableCell className={`font-medium ${levelColors[risk.probability]}`}>
                  {levelLabels[risk.probability]}
                </TableCell>
                <TableCell className={`font-medium ${levelColors[risk.impact]}`}>
                  {levelLabels[risk.impact]}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{sourceLabels[risk.source]}</TableCell>
                <TableCell className="text-sm">{risk.owner || "—"}</TableCell>
                <TableCell className="text-sm">
                  {risk.due_date ? format(new Date(risk.due_date), "dd/MM/yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(risk)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(risk.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
