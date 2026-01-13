import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContractStatus } from "@/hooks/useSupplierContracts";
import { Supplier } from "@/hooks/useSuppliers";

const contractSchema = z.object({
  supplier_id: z.string().min(1, "Fornecedor é obrigatório"),
  contract_number: z.string().min(1, "Número do contrato é obrigatório"),
  description: z.string().optional().nullable(),
  total_value: z.number().min(0, "Valor deve ser positivo"),
  currency: z.string().default("USD"),
  start_date: z.string().min(1, "Data de início é obrigatória"),
  end_date: z.string().min(1, "Data de término é obrigatória"),
  status: z.enum(["draft", "active", "completed", "cancelled", "expired"]),
  payment_schedule: z.string().optional().nullable(),
  deliverables: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  projectId: string;
  suppliers: Supplier[];
  onSubmit: (data: { supplier_id: string; contract_number: string; start_date: string; end_date: string; project_id: string; total_value: number; currency: string; status: ContractStatus } & Partial<Omit<ContractFormData, 'supplier_id' | 'contract_number' | 'start_date' | 'end_date' | 'total_value' | 'currency' | 'status'>>) => void;
  onSuccess?: () => void;
  defaultValues?: Partial<ContractFormData>;
  isEditing?: boolean;
}

const statusLabels: Record<ContractStatus, string> = {
  draft: "Rascunho",
  active: "Ativo",
  completed: "Concluído",
  cancelled: "Cancelado",
  expired: "Expirado",
};

export function ContractForm({ projectId, suppliers, onSubmit, onSuccess, defaultValues, isEditing = false }: ContractFormProps) {
  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      supplier_id: "",
      contract_number: "",
      description: "",
      total_value: 0,
      currency: "USD",
      start_date: "",
      end_date: "",
      status: "draft",
      payment_schedule: "",
      deliverables: "",
      notes: "",
      ...defaultValues,
    },
  });

  const handleSubmit = (data: ContractFormData) => {
    // Form validation ensures required fields are present
    onSubmit({
      supplier_id: data.supplier_id!,
      contract_number: data.contract_number!,
      start_date: data.start_date!,
      end_date: data.end_date!,
      total_value: data.total_value!,
      currency: data.currency!,
      status: data.status!,
      project_id: projectId,
      description: data.description || null,
      payment_schedule: data.payment_schedule || null,
      deliverables: data.deliverables || null,
      notes: data.notes || null,
    });
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplier_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fornecedor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contract_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Contrato *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="CONT-2024-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Descrição do contrato" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="total_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Total *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    placeholder="0.00" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeda</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Término *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="payment_schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cronograma de Pagamentos</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Descreva o cronograma de pagamentos" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deliverables"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entregáveis</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Liste os entregáveis do contrato" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Observações adicionais" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit">{isEditing ? "Atualizar Contrato" : "Salvar Contrato"}</Button>
        </div>
      </form>
    </Form>
  );
}
