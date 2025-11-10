import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DeliveriesTab } from "@/components/meal/DeliveriesTab";
import { Package, ClipboardList, Users, FileText, Lightbulb } from "lucide-react";

export default function Meal() {
  const { projectId } = useParams();

  return (
    <div className="flex-1 space-y-6 p-8">
      <DashboardHeader
        title="MEAL - Monitoramento, Avaliação, Accountability & Learning"
        subtitle="Gestão de entregas, indicadores e aprendizados do projeto"
      />

      <Tabs defaultValue="deliveries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="deliveries" className="gap-2">
            <Package className="w-4 h-4" />
            Entregas
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            Plano de M&A
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="gap-2">
            <Users className="w-4 h-4" />
            Beneficiários
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="w-4 h-4" />
            Relatórios Trimestrais
          </TabsTrigger>
          <TabsTrigger value="lessons" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Lições Aprendidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries">
          <DeliveriesTab projectId={projectId} />
        </TabsContent>

        <TabsContent value="plan">
          <div className="text-center py-12 text-muted-foreground">
            Plano de M&A em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="beneficiaries">
          <div className="text-center py-12 text-muted-foreground">
            Cadastro de Beneficiários em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-12 text-muted-foreground">
            Relatórios Trimestrais em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="lessons">
          <div className="text-center py-12 text-muted-foreground">
            Lições Aprendidas em desenvolvimento...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
