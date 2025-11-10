import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Indicator {
  id: string;
  name: string;
  baseline: string;
  target: string;
  unit: string;
  verificationMeans: string;
  collectionFrequency: string;
  responsible: string;
  notes?: string;
}

interface IndicatorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (indicator: Indicator) => void;
  indicator?: Indicator | null;
}

export function IndicatorFormDialog({ open, onOpenChange, onSave, indicator }: IndicatorFormDialogProps) {
  const [formData, setFormData] = useState<Indicator>(
    indicator || {
      id: crypto.randomUUID(),
      name: "",
      baseline: "",
      target: "",
      unit: "",
      verificationMeans: "",
      collectionFrequency: "",
      responsible: "",
      notes: "",
    }
  );

  const handleSave = () => {
    if (!formData.name || !formData.target || !formData.verificationMeans || !formData.collectionFrequency) {
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{indicator ? "Editar Indicador" : "Novo Indicador"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Indicador *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Número de beneficiários atendidos"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="baseline">Baseline</Label>
              <Input
                id="baseline"
                value={formData.baseline}
                onChange={(e) => setFormData({ ...formData, baseline: e.target.value })}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="target">Meta *</Label>
              <Input
                id="target"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="1000"
              />
            </div>

            <div>
              <Label htmlFor="unit">Unidade</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="pessoas"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="verificationMeans">Meios de Verificação *</Label>
            <Textarea
              id="verificationMeans"
              value={formData.verificationMeans}
              onChange={(e) => setFormData({ ...formData, verificationMeans: e.target.value })}
              placeholder="Ex: Relatórios de entrega assinados, fotos, listas de presença"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="collectionFrequency">Frequência de Coleta *</Label>
              <Select
                value={formData.collectionFrequency}
                onValueChange={(value) => setFormData({ ...formData, collectionFrequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diária">Diária</SelectItem>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                  <SelectItem value="Bimestral">Bimestral</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Semestral">Semestral</SelectItem>
                  <SelectItem value="Anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas adicionais sobre o indicador"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {indicator ? "Atualizar" : "Adicionar"} Indicador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
