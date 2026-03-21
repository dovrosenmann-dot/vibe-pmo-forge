import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Paperclip, Pencil } from "lucide-react";
import { SupplierContractWithDetails } from "@/hooks/useSupplierContracts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Authorize } from "@/components/Authorize";

const contractStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Rascunho", variant: "secondary" },
  active: { label: "Ativo", variant: "default" },
  completed: { label: "Concluído", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  expired: { label: "Expirado", variant: "secondary" },
};

interface SupplierContractsListProps {
  contracts: SupplierContractWithDetails[] | undefined;
  isLoading: boolean;
  onEdit: (contract: SupplierContractWithDetails) => void;
  onDelete: (id: string) => void;
  onViewDocuments: (contractId: string) => void;
}

export function SupplierContractsList({ 
  contracts, isLoading, onEdit, onDelete, onViewDocuments 
}: SupplierContractsListProps) {
  if (isLoading) return <p className="text-center py-8 text-muted-foreground">Carregando...</p>;
  if (!contracts?.length) return <p className="text-center py-8 text-muted-foreground">Nenhum contrato cadastrado</p>;

  return (
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
        {contracts.map((contract) => {
          const status = contractStatusConfig[contract.status] || { label: contract.status, variant: "secondary" as const };
          return (
            <TableRow key={contract.id}>
              <TableCell className="font-medium">{contract.contract_number}</TableCell>
              <TableCell>{contract.supplier?.name || "-"}</TableCell>
              <TableCell className="max-w-[200px] truncate">{contract.description || "-"}</TableCell>
              <TableCell>{contract.currency} {contract.total_value.toLocaleString()}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ptBR })}</div>
                  <div className="text-muted-foreground">
                    até {format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
              </TableCell>
              <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Authorize roles={["admin", "pmo", "project_manager", "finance"]}>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(contract)} title="Editar contrato">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Authorize>
                  <Button variant="ghost" size="icon" onClick={() => onViewDocuments(contract.id)} title="Ver documentos">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Authorize roles={["admin", "pmo", "project_manager", "finance"]}>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(contract.id)} title="Excluir contrato">
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
  );
}
