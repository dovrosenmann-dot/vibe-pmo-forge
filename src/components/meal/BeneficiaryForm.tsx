import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Beneficiary } from "@/hooks/useBeneficiaries";

const vulnerabilityOptions = [
  "Food Insecurity",
  "Rural",
  "Quilombola",
  "Indigenous",
  "Refugee",
  "Elderly",
  "Child-headed Household",
  "PWD (Person with Disability)",
  "Chronic Illness",
  "Single Parent",
  "Low Income"
];

const beneficiarySchema = z.object({
  beneficiary_code: z.string().trim().min(1, "Código é obrigatório").max(50, "Máximo 50 caracteres"),
  name_or_label: z.string().trim().min(1, "Nome/identificação é obrigatório").max(200, "Máximo 200 caracteres"),
  type: z.enum(["Pessoa", "Família", "Escola", "Comunidade", "Associação"], {
    required_error: "Tipo é obrigatório",
  }),
  sex: z.enum(["F", "M", "Outro", "ND"], {
    required_error: "Sexo é obrigatório",
  }).optional(),
  age_or_range: z.string().trim().max(50, "Máximo 50 caracteres").optional(),
  location: z.string().trim().max(200, "Máximo 200 caracteres").optional(),
  vulnerability_tags: z.array(z.string()).optional(),
  consent_status: z.enum(["Obtained", "Pending", "Not Required"], {
    required_error: "Status de consentimento é obrigatório",
  }),
  notes: z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
});

type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;

interface BeneficiaryFormProps {
  projectId: string;
  beneficiary?: Beneficiary;
  onSubmit: (data: BeneficiaryFormValues) => void;
  onCancel: () => void;
}

export function BeneficiaryForm({ projectId, beneficiary, onSubmit, onCancel }: BeneficiaryFormProps) {
  const form = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      beneficiary_code: beneficiary?.beneficiary_code || "",
      name_or_label: beneficiary?.name_or_label || "",
      type: beneficiary?.type as any || "Pessoa",
      sex: beneficiary?.sex as any || undefined,
      age_or_range: beneficiary?.age_or_range || "",
      location: beneficiary?.location || "",
      vulnerability_tags: beneficiary?.vulnerability_tags || [],
      consent_status: beneficiary?.consent_status as any || "Pending",
      notes: beneficiary?.notes || "",
    },
  });

  const handleSubmit = (data: BeneficiaryFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Básicos */}
          <FormField
            control={form.control}
            name="beneficiary_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código do Beneficiário *</FormLabel>
                <FormControl>
                  <Input placeholder="BEN-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name_or_label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome/Identificação *</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo ou código" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pessoa">Pessoa</SelectItem>
                    <SelectItem value="Família">Família</SelectItem>
                    <SelectItem value="Escola">Escola</SelectItem>
                    <SelectItem value="Comunidade">Comunidade</SelectItem>
                    <SelectItem value="Associação">Associação</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="F">Feminino</SelectItem>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                    <SelectItem value="ND">Não Declarado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age_or_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idade/Faixa Etária</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 25 ou 20-30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Localização</FormLabel>
                <FormControl>
                  <Input placeholder="Cidade, Estado ou Região" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Vulnerabilidades */}
        <FormField
          control={form.control}
          name="vulnerability_tags"
          render={() => (
            <FormItem>
              <FormLabel>Vulnerabilidades</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vulnerabilityOptions.map((vulnerability) => (
                  <FormField
                    key={vulnerability}
                    control={form.control}
                    name="vulnerability_tags"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={vulnerability}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(vulnerability)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), vulnerability])
                                  : field.onChange(
                                      field.value?.filter((value) => value !== vulnerability)
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm">
                            {vulnerability}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Consentimento */}
        <FormField
          control={form.control}
          name="consent_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status de Consentimento *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Obtained">Obtido</SelectItem>
                  <SelectItem value="Pending">Pendente</SelectItem>
                  <SelectItem value="Not Required">Não Requerido</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notas */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações adicionais sobre o beneficiário"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {beneficiary ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
