import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SupplierCategory, SupplierStatus } from "@/hooks/useSuppliers";

const supplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  tax_id: z.string().optional().nullable(),
  category: z.enum(["goods", "services", "logistics", "consulting", "construction", "equipment", "other"]),
  status: z.enum(["active", "inactive", "blocked", "pending_approval"]),
  contact_name: z.string().optional().nullable(),
  contact_email: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
  contact_phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  rating: z.number().min(1).max(5).optional().nullable(),
  notes: z.string().optional().nullable(),
  payment_terms: z.string().optional().nullable(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  projectId: string;
  onSubmit: (data: { name: string; project_id: string; category: SupplierCategory; status: SupplierStatus } & Partial<Omit<SupplierFormData, 'name' | 'category' | 'status'>>) => void;
  onSuccess?: () => void;
  defaultValues?: Partial<SupplierFormData>;
}

const categoryLabels: Record<SupplierCategory, string> = {
  goods: "Bens/Mercadorias",
  services: "Serviços",
  logistics: "Logística",
  consulting: "Consultoria",
  construction: "Construção",
  equipment: "Equipamentos",
  other: "Outros",
};

const statusLabels: Record<SupplierStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  blocked: "Bloqueado",
  pending_approval: "Aguardando Aprovação",
};

export function SupplierForm({ projectId, onSubmit, onSuccess, defaultValues }: SupplierFormProps) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      tax_id: "",
      category: "other",
      status: "active",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      notes: "",
      payment_terms: "",
      ...defaultValues,
    },
  });

  const handleSubmit = (data: SupplierFormData) => {
    // Form validation ensures name, category, and status are present
    onSubmit({
      name: data.name!,
      category: data.category!,
      status: data.status!,
      project_id: projectId,
      tax_id: data.tax_id || null,
      contact_name: data.contact_name || null,
      contact_email: data.contact_email || null,
      contact_phone: data.contact_phone || null,
      address: data.address || null,
      rating: data.rating || null,
      notes: data.notes || null,
      payment_terms: data.payment_terms || null,
    });
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome do fornecedor" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ/CPF</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="00.000.000/0000-00" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
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
                      <SelectValue placeholder="Selecione" />
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

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contato</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome do contato" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="email@exemplo.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="(00) 00000-0000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Endereço completo" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condições de Pagamento</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: 30 dias após emissão da NF" />
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
          <Button type="submit">Salvar Fornecedor</Button>
        </div>
      </form>
    </Form>
  );
}
