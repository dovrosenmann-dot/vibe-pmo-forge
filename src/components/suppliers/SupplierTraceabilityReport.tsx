import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, Package, FileText, TrendingUp } from "lucide-react";

interface SupplierTraceabilityReportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: {
    id: string;
    name: string;
    category: string;
    status: string;
  } | null;
}

const transactionStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  approved: { label: "Aprovada", variant: "default" },
  rejected: { label: "Rejeitada", variant: "destructive" },
};

const deliveryStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Planned: { label: "Planejada", variant: "outline" },
  "In Transit": { label: "Em Trânsito", variant: "secondary" },
  Delivered: { label: "Entregue", variant: "default" },
  Cancelled: { label: "Cancelada", variant: "destructive" },
};

export function SupplierTraceabilityReport({
  open,
  onOpenChange,
  supplier,
}: SupplierTraceabilityReportProps) {
  const { data: transactions = [] } = useQuery({
    queryKey: ["supplier-transactions", supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(`
          *,
          contract:supplier_contracts(id, contract_number)
        `)
        .eq("supplier_id", supplier.id)
        .order("transaction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!supplier?.id && open,
  });

  const { data: deliveries = [] } = useQuery({
    queryKey: ["supplier-deliveries", supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      const { data, error } = await supabase
        .from("meal_deliveries")
        .select(`
          *,
          contract:supplier_contracts(id, contract_number)
        `)
        .eq("supplier_id", supplier.id)
        .order("delivery_date_planned", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!supplier?.id && open,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["supplier-contracts-report", supplier?.id],
    queryFn: async () => {
      if (!supplier?.id) return [];
      const { data, error } = await supabase
        .from("supplier_contracts")
        .select("*")
        .eq("supplier_id", supplier.id)
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!supplier?.id && open,
  });

  const totalTransactionValue = transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const totalDeliveredQty = deliveries.reduce(
    (sum, d) => sum + Number(d.delivered_qty),
    0
  );
  const totalContractValue = contracts.reduce(
    (sum, c) => sum + Number(c.total_value),
    0
  );

  const formatCurrency = (value: number, currency: string = "USD") => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Rastreabilidade: {supplier.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contratos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalContractValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Transações
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalTransactionValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Entregas
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveries.length}</div>
              <p className="text-xs text-muted-foreground">
                {totalDeliveredQty} unidades entregues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa Execução
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalContractValue > 0
                  ? ((totalTransactionValue / totalContractValue) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Pago vs Contratado
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">
              Transações ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="deliveries">
              Entregas ({deliveries.length})
            </TabsTrigger>
            <TabsTrigger value="contracts">
              Contratos ({contracts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação registrada para este fornecedor.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatDate(transaction.transaction_date)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell>
                        {transaction.contract?.contract_number || "-"}
                      </TableCell>
                      <TableCell className="capitalize">
                        {transaction.transaction_type}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          Number(transaction.amount),
                          transaction.currency
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            transactionStatusConfig[transaction.approval_status]
                              ?.variant || "secondary"
                          }
                        >
                          {transactionStatusConfig[transaction.approval_status]
                            ?.label || transaction.approval_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="deliveries" className="mt-4">
            {deliveries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma entrega registrada para este fornecedor.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data Planejada</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-right">Qtd. Plan.</TableHead>
                    <TableHead className="text-right">Qtd. Entregue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        {formatDate(delivery.delivery_date_planned)}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {delivery.item_name}
                      </TableCell>
                      <TableCell>
                        {delivery.contract?.contract_number || "-"}
                      </TableCell>
                      <TableCell className="max-w-[100px] truncate">
                        {delivery.location || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {delivery.planned_qty} {delivery.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {delivery.delivered_qty} {delivery.unit}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            deliveryStatusConfig[delivery.status]?.variant ||
                            "secondary"
                          }
                        >
                          {deliveryStatusConfig[delivery.status]?.label ||
                            delivery.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="contracts" className="mt-4">
            {contracts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum contrato registrado para este fornecedor.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Término</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>{contract.contract_number}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {contract.description || "-"}
                      </TableCell>
                      <TableCell>{formatDate(contract.start_date)}</TableCell>
                      <TableCell>{formatDate(contract.end_date)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          Number(contract.total_value),
                          contract.currency
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {contract.status}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
