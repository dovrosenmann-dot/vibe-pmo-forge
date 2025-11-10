import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Save, FileText } from "lucide-react";
import { useMealPlan } from "@/hooks/useMealPlan";
import { IndicatorFormDialog } from "./IndicatorFormDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

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

interface MealPlanTabProps {
  projectId?: string;
}

export function MealPlanTab({ projectId }: MealPlanTabProps) {
  const { mealPlan, isLoading, createOrUpdatePlan } = useMealPlan(projectId);
  
  const [indicators, setIndicators] = useState<Indicator[]>(
    Array.isArray(mealPlan?.indicators_json) 
      ? (mealPlan.indicators_json as unknown as Indicator[]) 
      : []
  );
  const [theoryOfChange, setTheoryOfChange] = useState(mealPlan?.theory_of_change_link || "");
  const [collectionCalendar, setCollectionCalendar] = useState(mealPlan?.collection_calendar || "");
  const [responsibilitiesRaci, setResponsibilitiesRaci] = useState(mealPlan?.responsibilities_raci || "");
  const [dataQualityProcedures, setDataQualityProcedures] = useState(mealPlan?.data_quality_procedures || "");
  const [approvalStatus, setApprovalStatus] = useState<"Draft" | "Under Review" | "Approved">(
    (mealPlan?.approval_status as "Draft" | "Under Review" | "Approved") || "Draft"
  );

  const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  const handleAddIndicator = (indicator: Indicator) => {
    setIndicators([...indicators, indicator]);
    toast.success("Indicador adicionado!");
  };

  const handleEditIndicator = (indicator: Indicator) => {
    setIndicators(indicators.map((ind) => (ind.id === indicator.id ? indicator : ind)));
    setEditingIndicator(null);
    toast.success("Indicador atualizado!");
  };

  const handleDeleteIndicator = (id: string) => {
    setIndicators(indicators.filter((ind) => ind.id !== id));
    toast.success("Indicador removido!");
  };

  const handleSavePlan = () => {
    if (!projectId) {
      toast.error("ID do projeto não encontrado");
      return;
    }

    if (indicators.length === 0) {
      toast.error("Adicione pelo menos um indicador ao plano");
      return;
    }

    createOrUpdatePlan.mutate({
      indicators_json: indicators,
      theory_of_change_link: theoryOfChange,
      collection_calendar: collectionCalendar,
      responsibilities_raci: responsibilitiesRaci,
      data_quality_procedures: dataQualityProcedures,
      approval_status: approvalStatus,
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12">Carregando plano...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Save Button */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Plano de Monitoramento & Avaliação</h2>
            <p className="text-muted-foreground">
              Configure indicadores, metas e meios de verificação do projeto
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={approvalStatus === "Approved" ? "default" : "secondary"}>
              {approvalStatus === "Draft" && "Rascunho"}
              {approvalStatus === "Under Review" && "Em Revisão"}
              {approvalStatus === "Approved" && "Aprovado"}
            </Badge>
            <Button onClick={handleSavePlan} disabled={createOrUpdatePlan.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {createOrUpdatePlan.isPending ? "Salvando..." : "Salvar Plano"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theoryOfChange">Link da Teoria de Mudança</Label>
              <Input
                id="theoryOfChange"
                value={theoryOfChange}
                onChange={(e) => setTheoryOfChange(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="approvalStatus">Status de Aprovação</Label>
              <Select 
                value={approvalStatus} 
                onValueChange={(value) => setApprovalStatus(value as "Draft" | "Under Review" | "Approved")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Rascunho</SelectItem>
                  <SelectItem value="Under Review">Em Revisão</SelectItem>
                  <SelectItem value="Approved">Aprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="dataQuality">Procedimentos de Qualidade de Dados</Label>
            <Textarea
              id="dataQuality"
              value={dataQualityProcedures}
              onChange={(e) => setDataQualityProcedures(e.target.value)}
              placeholder="Descreva os procedimentos de garantia de qualidade dos dados coletados"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="responsibilities">Matriz RACI de Responsabilidades</Label>
            <Textarea
              id="responsibilities"
              value={responsibilitiesRaci}
              onChange={(e) => setResponsibilitiesRaci(e.target.value)}
              placeholder="Defina quem é Responsável, Aprovador, Consultado e Informado para cada atividade de M&A"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="calendar">Cronograma de Coleta</Label>
            <Textarea
              id="calendar"
              value={collectionCalendar}
              onChange={(e) => setCollectionCalendar(e.target.value)}
              placeholder="Descreva o calendário de coleta de dados (pode incluir datas específicas, trimestres, etc.)"
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Indicators Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">Indicadores do Projeto</h3>
            <p className="text-sm text-muted-foreground">
              {indicators.length} indicador(es) configurado(s)
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingIndicator(null);
              setIndicatorDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Indicador
          </Button>
        </div>

        {indicators.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum indicador cadastrado ainda.</p>
            <p className="text-sm">Clique em "Novo Indicador" para começar.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicador</TableHead>
                  <TableHead>Baseline</TableHead>
                  <TableHead>Meta</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {indicators.map((indicator) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="font-medium max-w-[300px]">
                      <div>
                        <div>{indicator.name}</div>
                        {indicator.verificationMeans && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Verificação: {indicator.verificationMeans.substring(0, 80)}
                            {indicator.verificationMeans.length > 80 && "..."}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{indicator.baseline || "-"}</TableCell>
                    <TableCell className="font-semibold">{indicator.target}</TableCell>
                    <TableCell>{indicator.unit || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{indicator.collectionFrequency}</Badge>
                    </TableCell>
                    <TableCell>{indicator.responsible || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingIndicator(indicator);
                            setIndicatorDialogOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteIndicator(indicator.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <IndicatorFormDialog
        open={indicatorDialogOpen}
        onOpenChange={setIndicatorDialogOpen}
        onSave={editingIndicator ? handleEditIndicator : handleAddIndicator}
        indicator={editingIndicator}
      />
    </div>
  );
}
