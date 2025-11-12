import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Beneficiary } from "@/hooks/useBeneficiaries";

interface BeneficiariesTableProps {
  beneficiaries: Beneficiary[];
  onEdit: (beneficiary: Beneficiary) => void;
  onDelete: (id: string) => void;
}

const getConsentBadgeVariant = (status: string) => {
  switch (status) {
    case "Obtained":
      return "default";
    case "Pending":
      return "secondary";
    case "Not Required":
      return "outline";
    default:
      return "secondary";
  }
};

const getConsentLabel = (status: string) => {
  switch (status) {
    case "Obtained":
      return "Obtido";
    case "Pending":
      return "Pendente";
    case "Not Required":
      return "Não Requerido";
    default:
      return status;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "Pessoa":
      return "Pessoa";
    case "Família":
      return "Família";
    case "Escola":
      return "Escola";
    case "Comunidade":
      return "Comunidade";
    case "Associação":
      return "Associação";
    default:
      return type;
  }
};

export function BeneficiariesTable({ beneficiaries, onEdit, onDelete }: BeneficiariesTableProps) {
  if (!beneficiaries || beneficiaries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum beneficiário cadastrado
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nome/Identificação</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Vulnerabilidades</TableHead>
            <TableHead>Consentimento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {beneficiaries.map((beneficiary) => (
            <TableRow key={beneficiary.id}>
              <TableCell className="font-medium">{beneficiary.beneficiary_code}</TableCell>
              <TableCell>{beneficiary.name_or_label}</TableCell>
              <TableCell>{getTypeLabel(beneficiary.type)}</TableCell>
              <TableCell>{beneficiary.location || "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {beneficiary.vulnerability_tags && beneficiary.vulnerability_tags.length > 0 ? (
                    beneficiary.vulnerability_tags.slice(0, 2).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                  {beneficiary.vulnerability_tags && beneficiary.vulnerability_tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{beneficiary.vulnerability_tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getConsentBadgeVariant(beneficiary.consent_status)}>
                  {getConsentLabel(beneficiary.consent_status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(beneficiary)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(beneficiary.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
