import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Building2, FileText, Star, Trash2, Paperclip } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useSupplierContracts } from "@/hooks/useSupplierContracts";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { ContractForm } from "@/components/suppliers/ContractForm";
import { SupplierDashboard } from "@/components/suppliers/SupplierDashboard";
import { DocumentUpload } from "@/components/suppliers/DocumentUpload";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categoryLabels: Record<string, string> = {
  goods: "Bens",
  services: "Serviços",
  logistics: "Logística",
  consulting: "Consultoria",
  construction: "Construção",
  equipment: "Equipamentos",
  other: "Outros",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  inactive: { label: "Inativo", variant: "secondary" },
  blocked: { label: "Bloqueado", variant: "destructive" },
  pending_approval: { label: "Pendente", variant: "outline" },
};

const contractStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  active: { label: "Ativo", variant: "default" },
  completed: { label: "Concluído", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  expired: { label: "Expirado", variant: "secondary" },
};

export default function Suppliers() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(undefined);
  const [selectedContractId, setSelectedContractId] = useState<string | undefined>(undefined);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("id, name, code").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { suppliers, isLoading: suppliersLoading, createSupplier, deleteSupplier } = useSuppliers(selectedProjectId);
  const { contracts, isLoading: contractsLoading, createContract, deleteContract } = useSupplierContracts(selectedProjectId);

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
                  <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={!selectedProjectId}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Fornecedor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Cadastrar Fornecedor</DialogTitle>
                      </DialogHeader>
                      <SupplierForm
                        projectId={selectedProjectId || ""}
                        onSubmit={(data) => createSupplier.mutate(data)}
                        onSuccess={() => setSupplierDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedProjectId ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Selecione um projeto para visualizar os fornecedores
                  </p>
                ) : suppliersLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Carregando...</p>
                ) : !suppliers?.length ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhum fornecedor cadastrado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>CNPJ/CPF</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Avaliação</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((supplier) => {
                        const status = statusConfig[supplier.status] || { label: supplier.status, variant: "secondary" as const };
                        return (
                          <TableRow key={supplier.id}>
                            <TableCell className="font-medium">{supplier.name}</TableCell>
                            <TableCell>{supplier.tax_id || "-"}</TableCell>
                            <TableCell>{categoryLabels[supplier.category] || supplier.category}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {supplier.contact_name && <div>{supplier.contact_name}</div>}
                                {supplier.contact_email && (
                                  <div className="text-muted-foreground">{supplier.contact_email}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {supplier.rating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  <span>{supplier.rating}</span>
                                </div>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedSupplierId(supplier.id);
                                    setSelectedContractId(undefined);
                                  }}
                                  title="Ver documentos"
                                >
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteSupplier.mutate(supplier.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
                  <Dialog open={contractDialogOpen} onOpenChange={setContractDialogOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={!selectedProjectId || !suppliers?.length}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Contrato
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Criar Contrato</DialogTitle>
                      </DialogHeader>
                      <ContractForm
                        projectId={selectedProjectId || ""}
                        suppliers={suppliers || []}
                        onSubmit={(data) => createContract.mutate(data)}
                        onSuccess={() => setContractDialogOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedProjectId ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Selecione um projeto para visualizar os contratos
                  </p>
                ) : contractsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Carregando...</p>
                ) : !contracts?.length ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhum contrato cadastrado
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Contrato</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vigência</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract: any) => {
                        const status = contractStatusConfig[contract.status] || { label: contract.status, variant: "secondary" as const };
                        return (
                          <TableRow key={contract.id}>
                            <TableCell className="font-medium">{contract.contract_number}</TableCell>
                            <TableCell>{contract.supplier?.name || "-"}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {contract.description || "-"}
                            </TableCell>
                            <TableCell>
                              {contract.currency} {contract.total_value.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ptBR })}</div>
                                <div className="text-muted-foreground">
                                  até {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ptBR })}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedContractId(contract.id);
                                    setSelectedSupplierId(undefined);
                                  }}
                                  title="Ver documentos"
                                >
                                  <Paperclip className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteContract.mutate(contract.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
                        {contracts?.map((contract: any) => (
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
                      ? `Documentos do Contrato: ${contracts?.find((c: any) => c.id === selectedContractId)?.contract_number}`
                      : "Todos os Documentos"
                  }
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
