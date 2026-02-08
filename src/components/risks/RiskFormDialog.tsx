import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectRisk, RiskCategory, RiskProbability, RiskImpact, RiskStatus } from "@/hooks/useProjectRisks";

interface RiskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  risk?: ProjectRisk | null;
  projectId: string;
  onSubmit: (data: any) => void;
}

const categoryOptions: { value: RiskCategory; label: string }[] = [
  { value: "meal", label: "MEAL" },
  { value: "suppliers", label: "Fornecedores" },
  { value: "financial", label: "Financeiro" },
  { value: "beneficiaries", label: "Beneficiários" },
  { value: "operational", label: "Operacional" },
  { value: "contextual", label: "Contextual" },
];

const probabilityOptions: { value: RiskProbability; label: string }[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

const impactOptions: { value: RiskImpact; label: string }[] = [
  { value: "low", label: "Baixo" },
  { value: "medium", label: "Médio" },
  { value: "high", label: "Alto" },
];

const statusOptions: { value: RiskStatus; label: string }[] = [
  { value: "identified", label: "Identificado" },
  { value: "mitigating", label: "Em Mitigação" },
  { value: "resolved", label: "Resolvido" },
  { value: "accepted", label: "Aceito" },
  { value: "escalated", label: "Escalado" },
];

export const RiskFormDialog = ({ open, onOpenChange, risk, projectId, onSubmit }: RiskFormDialogProps) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "operational" as RiskCategory,
    probability: "medium" as RiskProbability,
    impact: "medium" as RiskImpact,
    status: "identified" as RiskStatus,
    owner: "",
    mitigation_plan: "",
    contingency_plan: "",
    due_date: "",
  });

  useEffect(() => {
    if (risk) {
      setForm({
        title: risk.title,
        description: risk.description || "",
        category: risk.category,
        probability: risk.probability,
        impact: risk.impact,
        status: risk.status,
        owner: risk.owner || "",
        mitigation_plan: risk.mitigation_plan || "",
        contingency_plan: risk.contingency_plan || "",
        due_date: risk.due_date || "",
      });
    } else {
      setForm({
        title: "", description: "", category: "operational",
        probability: "medium", impact: "medium", status: "identified",
        owner: "", mitigation_plan: "", contingency_plan: "", due_date: "",
      });
    }
  }, [risk, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      project_id: projectId,
      description: form.description || null,
      owner: form.owner || null,
      mitigation_plan: form.mitigation_plan || null,
      contingency_plan: form.contingency_plan || null,
      due_date: form.due_date || null,
      source: risk?.source || "manual",
    };
    if (risk) {
      onSubmit({ id: risk.id, ...payload });
    } else {
      onSubmit(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{risk ? "Editar Risco" : "Novo Risco"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as RiskCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as RiskStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Probabilidade *</Label>
              <Select value={form.probability} onValueChange={(v) => setForm({ ...form, probability: v as RiskProbability })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {probabilityOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Impacto *</Label>
              <Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v as RiskImpact })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {impactOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Responsável</Label>
              <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </div>
            <div>
              <Label>Data limite</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Plano de mitigação</Label>
            <Textarea value={form.mitigation_plan} onChange={(e) => setForm({ ...form, mitigation_plan: e.target.value })} rows={2} />
          </div>

          <div>
            <Label>Plano de contingência</Label>
            <Textarea value={form.contingency_plan} onChange={(e) => setForm({ ...form, contingency_plan: e.target.value })} rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{risk ? "Salvar" : "Criar Risco"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
