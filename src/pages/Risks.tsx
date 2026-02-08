import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectRisks, RiskFilters as RiskFiltersType, ProjectRisk } from "@/hooks/useProjectRisks";
import { RiskMatrix } from "@/components/risks/RiskMatrix";
import { RiskFormDialog } from "@/components/risks/RiskFormDialog";
import { RiskFilters } from "@/components/risks/RiskFilters";
import { RiskTable } from "@/components/risks/RiskTable";
import { AlertTriangle, ShieldAlert, ShieldCheck, Plus, Zap, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Risks = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [filters, setFilters] = useState<RiskFiltersType>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<ProjectRisk | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, name, code").order("name");
      if (error) throw error;
      return data;
    },
  });

  const projectId = selectedProjectId || projects[0]?.id || "";
  const { risks, isLoading, createRisk, updateRisk, deleteRisk } = useProjectRisks(projectId || undefined, filters);

  // KPI calculations
  const activeRisks = risks.filter((r) => r.status !== "resolved");
  const criticalRisks = activeRisks.filter((r) => r.probability === "high" && r.impact === "high");
  const mitigatingRisks = activeRisks.filter((r) => r.status === "mitigating");
  const autoRisks = risks.filter((r) => r.source !== "manual");

  const handleSubmit = (data: any) => {
    if (data.id) {
      updateRisk.mutate(data);
    } else {
      createRisk.mutate(data);
    }
  };

  const handleEdit = (risk: ProjectRisk) => {
    setEditingRisk(risk);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja remover este risco?")) {
      deleteRisk.mutate(id);
    }
  };

  const runAutoScan = async () => {
    if (!projectId) return;
    setScanLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-project-risks", {
        body: { project_id: projectId },
      });
      if (error) throw error;
      toast({
        title: "Análise concluída",
        description: `${data?.created || 0} novo(s) risco(s) identificado(s) automaticamente.`,
      });
    } catch (err: any) {
      toast({ title: "Erro na análise", description: err.message, variant: "destructive" });
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <DashboardHeader title="Gestão de Riscos" subtitle="Identifique, monitore e mitigue riscos do portfólio" />

      <main className="flex-1 overflow-auto p-6 space-y-6">
        {/* Project selector + actions */}
        <div className="flex flex-wrap items-center gap-4">
          <Select value={projectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecionar projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.code} - {p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={runAutoScan} disabled={!projectId || scanLoading}>
              <Zap className="w-4 h-4 mr-2" />
              {scanLoading ? "Analisando..." : "Análise Automática"}
            </Button>
            <Button onClick={() => { setEditingRisk(null); setFormOpen(true); }} disabled={!projectId}>
              <Plus className="w-4 h-4 mr-2" /> Novo Risco
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Riscos Ativos" value={activeRisks.length} icon={AlertTriangle} variant="warning" />
          <StatCard title="Riscos Críticos" value={criticalRisks.length} icon={ShieldAlert} variant="destructive"
            trend={criticalRisks.length > 0 ? { value: "Requerem atenção imediata", positive: false } : undefined} />
          <StatCard title="Em Mitigação" value={mitigatingRisks.length} icon={TrendingUp} variant="default" />
          <StatCard title="Detecção Automática" value={autoRisks.length} icon={ShieldCheck} variant="success"
            trend={{ value: "Via MEAL, Fornecedores, Finanças", positive: true }} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">Lista de Riscos</TabsTrigger>
            <TabsTrigger value="matrix">Matriz de Risco</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-4">
            <RiskFilters filters={filters} onChange={setFilters} />
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : (
              <RiskTable risks={risks} onEdit={handleEdit} onDelete={handleDelete} />
            )}
          </TabsContent>

          <TabsContent value="matrix" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Matriz 3×3</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskMatrix risks={risks} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {projectId && (
        <RiskFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          risk={editingRisk}
          projectId={projectId}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Risks;
