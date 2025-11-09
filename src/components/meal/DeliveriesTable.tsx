import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, FileText } from "lucide-react";
import { useMealDeliveries } from "@/hooks/useMealDeliveries";
import { format } from "date-fns";

interface DeliveriesTableProps {
  projectId?: string;
  filters: any;
}

const statusColors = {
  Planned: "bg-blue-500/10 text-blue-500",
  "In-Progress": "bg-yellow-500/10 text-yellow-500",
  Delivered: "bg-green-500/10 text-green-500",
  Blocked: "bg-red-500/10 text-red-500",
};

export function DeliveriesTable({ projectId, filters }: DeliveriesTableProps) {
  const { data: deliveries, isLoading } = useMealDeliveries(projectId, filters);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando entregas...</div>;
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma entrega encontrada. Clique em "Nova Entrega" para começar.
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Workstream</TableHead>
            <TableHead>Qtd. Planejada</TableHead>
            <TableHead>Qtd. Entregue</TableHead>
            <TableHead>% Cumprido</TableHead>
            <TableHead>Data Planejada</TableHead>
            <TableHead>Data Real</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((delivery) => {
            const fulfillment = delivery.planned_qty > 0 
              ? (Number(delivery.delivered_qty) / Number(delivery.planned_qty)) * 100 
              : 0;
            
            return (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium">{delivery.item_name}</TableCell>
                <TableCell>{delivery.workstream_id || "-"}</TableCell>
                <TableCell>{Number(delivery.planned_qty).toLocaleString()} {delivery.unit}</TableCell>
                <TableCell>{Number(delivery.delivered_qty).toLocaleString()} {delivery.unit}</TableCell>
                <TableCell>
                  <span className={`font-semibold ${
                    fulfillment >= 100 ? "text-success" : 
                    fulfillment >= 70 ? "text-warning" : 
                    "text-destructive"
                  }`}>
                    {fulfillment.toFixed(0)}%
                  </span>
                </TableCell>
                <TableCell>
                  {delivery.delivery_date_planned 
                    ? format(new Date(delivery.delivery_date_planned), "dd/MM/yyyy")
                    : "-"}
                </TableCell>
                <TableCell>
                  {delivery.delivery_date_actual 
                    ? format(new Date(delivery.delivery_date_actual), "dd/MM/yyyy")
                    : "-"}
                </TableCell>
                <TableCell>{delivery.location || "-"}</TableCell>
                <TableCell>
                  <Badge className={statusColors[delivery.status as keyof typeof statusColors]}>
                    {delivery.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
