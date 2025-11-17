import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BudgetAllocation, ExpenseCategory } from "@/hooks/useBudgetAllocations";
import { useWorkstreams } from "@/hooks/useWorkstreams";

const formSchema = z.object({
  workstream_id: z.string().optional(),
  category: z.enum(["personnel", "travel", "equipment", "supplies", "services", "infrastructure", "overhead", "other"]),
  allocated_amount: z.string().min(1, "Valor é obrigatório"),
  currency: z.string().default("USD"),
  fiscal_year: z.string().min(4, "Ano fiscal é obrigatório"),
  quarter: z.string().optional(),
  notes: z.string().optional(),
});

interface BudgetAllocationFormProps {
  projectId: string;
  allocation?: BudgetAllocation;
  onSuccess: () => void;
  onSubmit: (data: any) => void;
}

export function BudgetAllocationForm({ projectId, allocation, onSuccess, onSubmit }: BudgetAllocationFormProps) {
  const { data: workstreams } = useWorkstreams(projectId);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: allocation ? {
      workstream_id: allocation.workstream_id || "",
      category: allocation.category,
      allocated_amount: allocation.allocated_amount.toString(),
      currency: allocation.currency,
      fiscal_year: allocation.fiscal_year.toString(),
      quarter: allocation.quarter?.toString() || "",
      notes: allocation.notes || "",
    } : {
      currency: "USD",
      fiscal_year: new Date().getFullYear().toString(),
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      project_id: projectId,
      workstream_id: values.workstream_id || null,
      allocated_amount: parseFloat(values.allocated_amount),
      fiscal_year: parseInt(values.fiscal_year),
      quarter: values.quarter ? parseInt(values.quarter) : null,
    });
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="personnel">Pessoal</SelectItem>
                  <SelectItem value="travel">Viagens</SelectItem>
                  <SelectItem value="equipment">Equipamentos</SelectItem>
                  <SelectItem value="supplies">Suprimentos</SelectItem>
                  <SelectItem value="services">Serviços</SelectItem>
                  <SelectItem value="infrastructure">Infraestrutura</SelectItem>
                  <SelectItem value="overhead">Overhead</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workstream_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workstream (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um workstream" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Nenhum</SelectItem>
                  {workstreams?.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="allocated_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Alocado</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
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
            name="fiscal_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano Fiscal</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quarter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trimestre (Opcional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    <SelectItem value="1">Q1</SelectItem>
                    <SelectItem value="2">Q2</SelectItem>
                    <SelectItem value="3">Q3</SelectItem>
                    <SelectItem value="4">Q4</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {allocation ? "Atualizar Alocação" : "Criar Alocação"}
        </Button>
      </form>
    </Form>
  );
}
