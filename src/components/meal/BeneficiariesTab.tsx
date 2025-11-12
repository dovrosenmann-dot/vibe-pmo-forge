import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBeneficiaries } from "@/hooks/useBeneficiaries";
import { BeneficiaryForm } from "./BeneficiaryForm";
import { BeneficiariesTable } from "./BeneficiariesTable";
import type { Beneficiary } from "@/hooks/useBeneficiaries";

interface BeneficiariesTabProps {
  projectId: string;
}

export function BeneficiariesTab({ projectId }: BeneficiariesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | undefined>();

  const {
    beneficiaries,
    isLoading,
    createBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
  } = useBeneficiaries(projectId);

  const handleSubmit = (data: any) => {
    if (editingBeneficiary) {
      updateBeneficiary.mutate(
        { id: editingBeneficiary.id, ...data },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditingBeneficiary(undefined);
          },
        }
      );
    } else {
      createBeneficiary.mutate(
        { ...data, project_id: projectId },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
          },
        }
      );
    }
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setEditingBeneficiary(beneficiary);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este beneficiário?")) {
      deleteBeneficiary.mutate(id);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingBeneficiary(undefined);
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>AVISO DE SEGURANÇA:</strong> Esta funcionalidade coleta dados pessoais sensíveis. 
          Não utilize em produção sem implementar autenticação e controles de acesso adequados.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Beneficiários</CardTitle>
              <CardDescription>
                Gerencie os beneficiários do projeto com dados pessoais, vulnerabilidades e consentimento
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Beneficiário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <BeneficiariesTable
              beneficiaries={beneficiaries || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBeneficiary ? "Editar Beneficiário" : "Novo Beneficiário"}
            </DialogTitle>
          </DialogHeader>
          <BeneficiaryForm
            projectId={projectId}
            beneficiary={editingBeneficiary}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
