import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Authorize } from "@/components/Authorize";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

export default function AuditLogs() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transaction_audit_log")
        .select(`*, profiles:changed_by(full_name, email)`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'INSERT': return <Badge variant="default" className="bg-green-600">Criação</Badge>;
      case 'UPDATE': return <Badge variant="outline" className="text-blue-600 border-blue-600">Edição</Badge>;
      case 'DELETE': return <Badge variant="destructive">Exclusão</Badge>;
      default: return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <Authorize roles={["admin", "pmo"]} fallback={
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Acesso negado. Apenas Administradores e PMOs podem ver os logs de auditoria.</p>
      </div>
    }>
      <div className="p-6 max-w-[1400px] mx-auto space-y-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Logs de Auditoria do Sistema
            </CardTitle>
            <CardDescription>
              Histórico imutável de alterações críticas (Projetos, Contratos, Financeiro).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                <p className="font-semibold">Erro ao carregar logs.</p>
                <p className="text-sm">Você já executou o script SQL (supabase/migrations/20240320_audit_logs.sql) no seu banco de dados Supabase?</p>
              </div>
            ) : isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Carregando auditoria...</p>
            ) : !logs?.length ? (
              <p className="text-center py-8 text-muted-foreground">Nenhum log de auditoria encontrado na base de dados.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Tabela</TableHead>
                    <TableHead>ID do Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{log.profiles?.full_name || 'Usuário Desconhecido'}</div>
                          <div className="text-muted-foreground text-xs">{log.profiles?.email || log.changed_by}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.record_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Authorize>
  );
}
