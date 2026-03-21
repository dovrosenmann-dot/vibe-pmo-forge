import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SupplierCategory, SupplierStatus } from "@/hooks/useSuppliers";
import { AIParserService } from "@/services/aiParserService";
import React, { useState, useRef } from "react";
import { Sparkles, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

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
  isEditing?: boolean;
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

export function SupplierForm({ projectId, onSubmit, onSuccess, defaultValues, isEditing = false }: SupplierFormProps) {
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAIParse = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const extractedData = await AIParserService.parseSupplierDocument(file);
      Object.keys(extractedData).forEach(key => {
        form.setValue(key as any, extractedData[key] as string, { shouldValidate: true, shouldDirty: true });
      });
      toast.success("Documento analisado. Formulário preenchido pela IA!");
    } catch (error) {
      toast.error("Falha ao analisar o documento via IA.");
      console.error("AI Parsing failed:", error);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {!isEditing && (
          <div className="mb-4 p-5 bg-primary/5 rounded-xl border border-primary/20 flex flex-col items-center justify-center text-center gap-3">
             <div className="w-12 h-12 rounded-full bg-primary/20 shadow-inner flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary animate-pulse" />
             </div>
             <div>
               <h4 className="text-sm font-bold text-foreground">Preenchimento Mágico por IA</h4>
               <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                 Faça o upload do Cartão CNPJ, Contrato ou Fatura. A Inteligência Artificial irá extrair todos os metadados do documento e digitar para você.
               </p>
             </div>
             <div>
               <Input 
                 type="file" 
                 className="hidden" 
                 ref={fileInputRef} 
                 accept=".pdf,image/*" 
                 onChange={handleAIParse} 
               />
               <Button 
                 type="button" 
                 variant="secondary" 
                 className="mt-3 text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all font-semibold"
                 disabled={isParsing}
                 onClick={() => fileInputRef.current?.click()}
               >
                 {isParsing ? (
                   <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando Documento...</>
                 ) : (
                   <><Upload className="w-4 h-4 mr-2" /> Extrair de PDF / Imagem</>
                 )}
               </Button>
             </div>
          </div>
        )}

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
          <Button type="submit">{isEditing ? "Atualizar Fornecedor" : "Salvar Fornecedor"}</Button>
        </div>
      </form>
    </Form>
  );
}
