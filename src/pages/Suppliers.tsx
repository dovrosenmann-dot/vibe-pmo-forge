import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, FileText, Star, Trash2, Paperclip, Pencil, ClipboardList, BarChart3, Download, FileSpreadsheet } from "lucide-react";
import { useSuppliers, Supplier } from "@/hooks/useSuppliers";
import { useSupplierContracts, SupplierContractWithDetails, SupplierContractInsert } from "@/hooks/useSupplierContracts";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { ContractForm } from "@/components/suppliers/ContractForm";
import { useAppStore } from "@/store/useAppStore";
import { Authorize } from "@/components/Authorize";
import { SupplierDashboard } from "@/components/suppliers/SupplierDashboard";
import { SupplierList } from "@/components/suppliers/SupplierList";
import { SupplierContractsList } from "@/components/suppliers/SupplierContractsList";
import { DocumentUpload } from "@/components/suppliers/DocumentUpload";
import { SupplierTraceabilityReport } from "@/components/suppliers/SupplierTraceabilityReport";
import { SupplierPerformanceReport } from "@/components/suppliers/SupplierPerformanceReport";
import { exportToPDF, exportToExcel } from "@/utils/exportUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProjectService } from "@/services/projectService";

export default function Suppliers() {
  const { selectedProjectId, setSelectedProjectId } = useAppStore();
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);
  const [selectedContractId, setSelectedContractId] = useState<string | undefined>(undefined);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingContract, setEditingContract] = useState<SupplierContractWithDetails | null>(null);
  const [traceabilitySupplier, setTraceabilitySupplier] = useState<Supplier | null>(null);
  const [traceabilityOpen, setTraceabilityOpen] = useState(false);
  const [performanceSupplier, setPerformanceSupplier] = useState<Supplier | null>(null);
  const [performanceOpen, setPerformanceOpen] = useState(false);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectService.getProjectsBasics(),
  });

  const { suppliers, isLoading: suppliersLoading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers(selectedProjectId);
  const { contracts, isLoading: contractsLoading, createContract, updateContract, deleteContract } = useSupplierContracts(selectedProjectId);

  const handleSupplierDialogClose = (open: boolean) => {
    setSupplierDialogOpen(open);
    if (!open) setEditingSupplier(null);
  };

  const handleContractDialogClose = (open: boolean) => {
    setContractDialogOpen(open);
    if (!open) setEditingContract(null);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierDialogOpen(true);
  };

  const handleEditContract = (contract: SupplierContractWithDetails) => {
    setEditingContract(contract);
    setContractDialogOpen(true);
  };

  const handleSupplierSubmit = (data: any) => {
    if (editingSupplier) {
      updateSupplier.mutate({ id: editingSupplier.id, ...data });
    } else {
      createSupplier.mutate(data);
    }
  };

  const handleContractSubmit = (data: Omit<SupplierContractInsert, "id" | "created_at" | "updated_at">) => {
    if (editingContract) {
      updateContract.mutate({ id: editingContract.id, ...data });
    } else {
      createContract.mutate(data);
    }
  };

  const handleExportPDF = () => {
    if (!suppliers) return;
    const columns = ["Nome", "CNPJ", "Categoria", "Status", "Aval.", "Contato"];
    const data = suppliers.map(s => [
      s.name,
      s.tax_id || "-",
      s.category,
      s.status,
      s.rating?.toString() || "-",
      s.contact_email || "-"
    ]);
    exportToPDF("Relatório de Fornecedores", columns, data, "fornecedores_ef");
  };

  const handleExportExcel = () => {
    if (!suppliers) return;
    const data = suppliers.map(s => ({
      "Nome": s.name,
      "CNPJ": s.tax_id,
      "Categoria": s.category,
      "Status": s.status,
      "Avaliação": s.rating,
      "Email de Contato": s.contact_email,
      "Telefone": s.contact_phone
    }));
    exportToExcel(data, "fornecedores_ef");
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Gestão de Fornecedores" />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie fornecedores, contratos e acompanhe a execução</p>
        </div>

        <div className="mb-6 flex items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Projeto</span>
            <Select
              value={selectedProjectId || "all"}
              onValueChange={(value) => setSelectedProjectId(value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-[250px]">
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
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
            <TabsTrigger value="contracts">Contratos</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <SupplierDashboard projectId={selectedProjectId} />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Fornecedores
                    </CardTitle>
                    <CardDescription>Cadastro de fornecedores do projeto</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={!suppliers?.length}>
                      <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                      Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!suppliers?.length}>
                      <Download className="mr-2 h-4 w-4 text-red-600" />
                      PDF
                    </Button>
                    <Authorize roles={["admin", "pmo", "project_manager", "finance"]}>
                      <Dialog open={supplierDialogOpen} onOpenChange={handleSupplierDialogClose}>
                        <DialogTrigger asChild>
                          <Button disabled={!selectedProjectId}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Fornecedor
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingSupplier ? "Editar Fornecedor" : "Cadastrar Fornecedor"}</DialogTitle>
                      </DialogHeader>
                      <SupplierForm
                        projectId={selectedProjectId || ""}
                        onSubmit={handleSupplierSubmit}
                        onSuccess={() => handleSupplierDialogClose(false)}
                        isEditing={!!editingSupplier}
                        defaultValues={editingSupplier ? {
                          name: editingSupplier.name,
                          tax_id: editingSupplier.tax_id,
                          category: editingSupplier.category,
                          status: editingSupplier.status,
                          contact_name: editingSupplier.contact_name,
                          contact_email: editingSupplier.contact_email,
                          contact_phone: editingSupplier.contact_phone,
                          address: editingSupplier.address,
                          rating: editingSupplier.rating,
                          notes: editingSupplier.notes,
                          payment_terms: editingSupplier.payment_terms,
                        } : undefined}
                      />
                    </DialogContent>
                  </Dialog>
                  </Authorize>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedProjectId ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Selecione um projeto para visualizar os fornecedores
                  </p>
                ) : (
                  <SupplierList 
                    suppliers={suppliers} 
                    isLoading={suppliersLoading} 
                    onEdit={handleEditSupplier}
                    onDelete={(id) => deleteSupplier.mutate(id)}
                    onTraceability={(supplier) => { setTraceabilitySupplier(supplier); setTraceabilityOpen(true); }}
                    onPerformance={(supplier) => { setPerformanceSupplier(supplier); setPerformanceOpen(true); }}
                    onViewDocuments={(id) => { setSelectedSupplierId(id); setSelectedContractId(undefined); }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Contratos
                    </CardTitle>
                    <CardDescription>Gestão de contratos com fornecedores</CardDescription>
                  </div>
                  <Authorize roles={["admin", "pmo", "project_manager", "finance"]}>
                    <Dialog open={contractDialogOpen} onOpenChange={handleContractDialogClose}>
                      <DialogTrigger asChild>
                        <Button disabled={!selectedProjectId || !suppliers?.length}>
                          <Plus className="mr-2 h-4 w-4" />
                          Novo Contrato
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingContract ? "Editar Contrato" : "Criar Contrato"}</DialogTitle>
                      </DialogHeader>
                      <ContractForm
                        projectId={selectedProjectId || ""}
                        suppliers={suppliers || []}
                        onSubmit={handleContractSubmit}
                        onSuccess={() => handleContractDialogClose(false)}
                        isEditing={!!editingContract}
                        defaultValues={editingContract ? {
                          supplier_id: editingContract.supplier_id,
                          contract_number: editingContract.contract_number,
                          description: editingContract.description,
                          total_value: editingContract.total_value,
                          currency: editingContract.currency,
                          start_date: editingContract.start_date,
                          end_date: editingContract.end_date,
                          status: editingContract.status,
                          payment_schedule: editingContract.payment_schedule,
                          deliverables: editingContract.deliverables,
                          notes: editingContract.notes,
                        } : undefined}
                      />
                    </DialogContent>
                  </Dialog>
                  </Authorize>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedProjectId ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Selecione um projeto para visualizar os contratos
                  </p>
                ) : (
                  <SupplierContractsList 
                    contracts={contracts} 
                    isLoading={contractsLoading}
                    onEdit={handleEditContract}
                    onDelete={(id) => deleteContract.mutate(id)}
                    onViewDocuments={(id) => { setSelectedContractId(id); setSelectedSupplierId(undefined); }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {!selectedProjectId ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    Selecione um projeto para gerenciar documentos
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filtrar por Fornecedor</label>
                    <Select
                      value={selectedSupplierId || "all"}
                      onValueChange={(v) => {
                        setSelectedSupplierId(v === "all" ? undefined : v);
                        if (v !== "all") setSelectedContractId(undefined);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os fornecedores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os fornecedores</SelectItem>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Filtrar por Contrato</label>
                    <Select
                      value={selectedContractId || "all"}
                      onValueChange={(v) => {
                        setSelectedContractId(v === "all" ? undefined : v);
                        if (v !== "all") setSelectedSupplierId(undefined);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os contratos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os contratos</SelectItem>
                        {contracts?.map((contract: SupplierContractWithDetails) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.contract_number} - {contract.supplier?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DocumentUpload
                  projectId={selectedProjectId}
                  supplierId={selectedSupplierId}
                  contractId={selectedContractId}
                  title={
                    selectedSupplierId
                      ? `Documentos do Fornecedor: ${suppliers?.find((s) => s.id === selectedSupplierId)?.name}`
                      : selectedContractId
                      ? `Documentos do Contrato: ${contracts?.find((c: SupplierContractWithDetails) => c.id === selectedContractId)?.contract_number}`
                      : "Todos os Documentos"
                  }
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <SupplierTraceabilityReport
          open={traceabilityOpen}
          onOpenChange={setTraceabilityOpen}
          supplier={traceabilitySupplier}
        />

        <Dialog open={performanceOpen} onOpenChange={setPerformanceOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Avaliação de Desempenho</DialogTitle>
            </DialogHeader>
            {performanceSupplier && (
              <SupplierPerformanceReport supplier={performanceSupplier} />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
