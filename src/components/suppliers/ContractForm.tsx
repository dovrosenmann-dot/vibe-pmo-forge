import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, ChevronLeft, Save } from "lucide-react";

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
  const [step, setStep] = useState(1);
  const totalSteps = 3;

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
    mode: "onChange",
  });

  const formValues = form.watch();

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!isEditing) {
      const draft = localStorage.getItem(`contractDraft_${projectId}`);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (parsed.values && Object.keys(parsed.values).length > 0) {
            form.reset(parsed.values);
            if (parsed.step) setStep(parsed.step);
            toast.info("Rascunho não salvo restaurado com sucesso!");
          }
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [projectId, isEditing, form]);

  // Save draft to localStorage on every change
  useEffect(() => {
    if (!isEditing) {
      const dataToSave = { step, values: formValues };
      localStorage.setItem(`contractDraft_${projectId}`, JSON.stringify(dataToSave));
    }
  }, [formValues, step, projectId, isEditing]);

  const clearDraft = () => {
    if (!isEditing) {
      localStorage.removeItem(`contractDraft_${projectId}`);
    }
  };

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ["supplier_id", "contract_number"];
    if (step === 2) fieldsToValidate = ["total_value", "start_date", "end_date", "status"];
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => Math.min(s + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = (data: ContractFormData) => {
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
    clearDraft();
    onSuccess?.();
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg text-foreground">
          {step === 1 && "1. Identificação do Contrato"}
          {step === 2 && "2. Finanças e Prazos"}
          {step === 3 && "3. Escopo e Entregáveis"}
        </h3>
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Passo {step} de {totalSteps}
        </span>
      </div>

      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-300 ease-in-out" 
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          
          {/* STEP 1: IDENTIFICATION */}
          <div className={step === 1 ? "space-y-4 animate-fade-in" : "hidden"}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormLabel>Descrição Simples</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Objeto do contrato" className="h-24 resize-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* STEP 2: FINANCIAL & TIMELINES */}
          <div className={step === 2 ? "space-y-4 animate-fade-in" : "hidden"}>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
          </div>

          {/* STEP 3: SCOPE & DELIVERABLES */}
          <div className={step === 3 ? "space-y-4 animate-fade-in" : "hidden"}>
            <FormField
              control={form.control}
              name="payment_schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cronograma de Pagamentos</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Descreva os marcos de liberação financeira" />
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
                  <FormLabel>Entregáveis do Contrato</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Liste as obrigações concretas do fornecedor" />
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
                  <FormLabel>Observações Adicionais</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Notas de conformidade ou riscos associados" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-border mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack} 
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            {step < totalSteps ? (
              <Button type="button" onClick={handleNext}>
                Próximo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Atualizar Contrato" : "Concluir Transação"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
