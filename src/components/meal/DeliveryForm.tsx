import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useSupplierContracts } from "@/hooks/useSupplierContracts";

interface DeliveryFormProps {
  projectId?: string;
  onSuccess?: () => void;
}

export function DeliveryForm({ projectId, onSuccess }: DeliveryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { suppliers } = useSuppliers(projectId);
  const { contracts } = useSupplierContracts(projectId);
  
  const [formData, setFormData] = useState({
    item_name: "",
    workstream_id: "",
    supplier_id: "",
    contract_id: "",
    planned_qty: "",
    delivered_qty: "0",
    unit: "un",
    delivery_date_planned: "",
    delivery_date_actual: "",
    location: "",
    beneficiary_group: "",
    status: "Planned",
    notes: "",
  });

  const filteredContracts = contracts?.filter(c => 
    !formData.supplier_id || c.supplier_id === formData.supplier_id
  );

  const { data: workstreams } = useQuery({
    queryKey: ["workstreams", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workstreams")
        .select("id, name")
        .eq("project_id", projectId || "");
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const createDelivery = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("meal_deliveries").insert([{
        ...data,
        project_id: projectId,
        planned_qty: parseFloat(data.planned_qty),
        delivered_qty: parseFloat(data.delivered_qty),
        supplier_id: data.supplier_id || null,
        contract_id: data.contract_id || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-deliveries"] });
      toast({
        title: "Entrega criada com sucesso!",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar entrega",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.item_name || !formData.planned_qty) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome do item e quantidade planejada",
        variant: "destructive",
      });
      return;
    }

    createDelivery.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="item_name">Nome do Item *</Label>
        <Input
          id="item_name"
          value={formData.item_name}
          onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
          placeholder="Ex: Salgado assado - kit"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="workstream_id">Workstream</Label>
          <Select
            value={formData.workstream_id}
            onValueChange={(value) => setFormData({ ...formData, workstream_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {workstreams?.map((ws) => (
                <SelectItem key={ws.id} value={ws.id}>
                  {ws.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Planned">Planned</SelectItem>
              <SelectItem value="In-Progress">In-Progress</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="supplier_id">Fornecedor</Label>
          <Select
            value={formData.supplier_id}
            onValueChange={(value) => setFormData({ ...formData, supplier_id: value, contract_id: "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {suppliers?.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="contract_id">Contrato</Label>
          <Select
            value={formData.contract_id}
            onValueChange={(value) => setFormData({ ...formData, contract_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {filteredContracts?.map((contract) => (
                <SelectItem key={contract.id} value={contract.id}>
                  {contract.contract_number} - {contract.supplier?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="planned_qty">Qtd. Planejada *</Label>
          <Input
            id="planned_qty"
            type="number"
            min="0"
            step="0.01"
            value={formData.planned_qty}
            onChange={(e) => setFormData({ ...formData, planned_qty: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="delivered_qty">Qtd. Entregue</Label>
          <Input
            id="delivered_qty"
            type="number"
            min="0"
            step="0.01"
            value={formData.delivered_qty}
            onChange={(e) => setFormData({ ...formData, delivered_qty: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="unit">Unidade</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="un">un</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="kit">kit</SelectItem>
              <SelectItem value="caixa">caixa</SelectItem>
              <SelectItem value="outro">outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delivery_date_planned">Data Planejada</Label>
          <Input
            id="delivery_date_planned"
            type="date"
            value={formData.delivery_date_planned}
            onChange={(e) => setFormData({ ...formData, delivery_date_planned: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="delivery_date_actual">Data Real</Label>
          <Input
            id="delivery_date_actual"
            type="date"
            value={formData.delivery_date_actual}
            onChange={(e) => setFormData({ ...formData, delivery_date_actual: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Localização</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ex: Escola Municipal X"
          />
        </div>

        <div>
          <Label htmlFor="beneficiary_group">Grupo Beneficiário</Label>
          <Input
            id="beneficiary_group"
            value={formData.beneficiary_group}
            onChange={(e) => setFormData({ ...formData, beneficiary_group: e.target.value })}
            placeholder="Ex: 6º ano - turma A"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas e observações sobre a entrega"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={createDelivery.isPending}>
          {createDelivery.isPending ? "Salvando..." : "Criar Entrega"}
        </Button>
      </div>
    </form>
  );
}
