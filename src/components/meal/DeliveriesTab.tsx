import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { DeliveryKPIs } from "./DeliveryKPIs";
import { DeliveryFilters } from "./DeliveryFilters";
import { DeliveriesTable } from "./DeliveriesTable";
import { DeliveryForm } from "./DeliveryForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DeliveriesTabProps {
  projectId?: string;
}

export function DeliveriesTab({ projectId }: DeliveriesTabProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filters, setFilters] = useState({
    workstreamId: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    location: "",
    beneficiaryGroup: "",
  });

  return (
    <div className="space-y-6">
      <DeliveryKPIs projectId={projectId} filters={filters} />

      <div className="flex items-center justify-between gap-4">
        <DeliveryFilters filters={filters} onFiltersChange={setFilters} projectId={projectId} />
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar do Salesforce
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Entrega
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nova Entrega de Salgados</DialogTitle>
              </DialogHeader>
              <DeliveryForm projectId={projectId} onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <DeliveriesTable projectId={projectId} filters={filters} />
    </div>
  );
}
