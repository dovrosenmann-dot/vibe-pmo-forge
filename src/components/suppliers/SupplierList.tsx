import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Paperclip, Pencil, ClipboardList, BarChart3 } from "lucide-react";
import { Supplier } from "@/hooks/useSuppliers";
import { Authorize } from "@/components/Authorize";

const categoryLabels: Record<string, string> = {
  goods: "Bens", services: "Serviços", logistics: "Logística",
  consulting: "Consultoria", construction: "Construção",
  equipment: "Equipamentos", other: "Outros",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Ativo", variant: "default" },
  inactive: { label: "Inativo", variant: "secondary" },
  blocked: { label: "Bloqueado", variant: "destructive" },
  pending_approval: { label: "Pendente", variant: "outline" },
};

interface SupplierListProps {
  suppliers: Supplier[] | undefined;
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  onTraceability: (supplier: Supplier) => void;
  onPerformance: (supplier: Supplier) => void;
  onViewDocuments: (supplierId: string) => void;
}

export function SupplierList({ 
  suppliers, isLoading, onEdit, onDelete, onTraceability, onPerformance, onViewDocuments 
}: SupplierListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  if (isLoading) return <p className="text-center py-8 text-muted-foreground">Carregando...</p>;
  if (!suppliers?.length) return <p className="text-center py-8 text-muted-foreground">Nenhum fornecedor cadastrado</p>;

  const totalPages = Math.ceil(suppliers.length / itemsPerPage);
  const paginatedSuppliers = suppliers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
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
        {paginatedSuppliers.map((supplier) => {
          const status = statusConfig[supplier.status] || { label: supplier.status, variant: "secondary" as const };
          return (
            <TableRow key={supplier.id}>
              <TableCell className="font-medium">{supplier.name}</TableCell>
              <TableCell>{supplier.tax_id || "-"}</TableCell>
              <TableCell>{categoryLabels[supplier.category] || supplier.category}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {supplier.contact_name && <div>{supplier.contact_name}</div>}
                  {supplier.contact_email && <div className="text-muted-foreground">{supplier.contact_email}</div>}
                </div>
              </TableCell>
              <TableCell>
                {supplier.rating ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{supplier.rating}</span>
                  </div>
                ) : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={status.variant}>{status.label}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onPerformance(supplier)} title="Avaliação">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onTraceability(supplier)} title="Rastreabilidade">
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                  <Authorize roles={["admin", "pmo", "project_manager", "finance"]}>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(supplier)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Authorize>
                  <Button variant="ghost" size="icon" onClick={() => onViewDocuments(supplier.id)} title="Documentos">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Authorize roles={["admin", "pmo", "project_manager", "finance"]}>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(supplier.id)} title="Excluir">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </Authorize>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    {totalPages > 1 && (
      <div className="flex items-center justify-end space-x-4 py-2">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Anterior
        </Button>
        <span className="text-sm font-medium">Página {currentPage} de {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          Próximo
        </Button>
      </div>
    )}
    </div>
  );
}
