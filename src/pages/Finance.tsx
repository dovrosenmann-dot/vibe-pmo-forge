import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { useGrants } from "@/hooks/useGrants";
import { useBudgetAllocations } from "@/hooks/useBudgetAllocations";
import { useFinancialTransactions } from "@/hooks/useFinancialTransactions";
import { GrantForm } from "@/components/finance/GrantForm";
import { BudgetAllocationForm } from "@/components/finance/BudgetAllocationForm";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Finance() {
  const [selectedProject] = useState("mock-project-id");
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);

  const { grants, isLoading: grantsLoading, createGrant } = useGrants(selectedProject);
  const { allocations, isLoading: allocationsLoading, createAllocation } = useBudgetAllocations(selectedProject);
  const { transactions, isLoading: transactionsLoading, createTransaction } = useFinancialTransactions(selectedProject);

  const totalGrantAmount = grants?.reduce((sum, g) => sum + g.total_amount, 0) || 0;
  const totalAllocated = allocations?.reduce((sum, a) => sum + a.allocated_amount, 0) || 0;
  const totalSpent = allocations?.reduce((sum, a) => sum + a.spent_amount, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader title="Gestão Financeira" />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Gestão Financeira</h1>
          <p className="text-muted-foreground">Gerencie orçamentos, grants e transações</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total em Grants</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalGrantAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{grants?.length || 0} grants ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Alocado</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAllocated.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{allocations?.length || 0} alocações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {totalAllocated > 0 ? `${((totalSpent / totalAllocated) * 100).toFixed(1)}%` : '0%'} do orçamento
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="grants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grants">Grants</TabsTrigger>
            <TabsTrigger value="allocations">Alocações de Orçamento</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
          </TabsList>

          <TabsContent value="grants" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Grants</CardTitle>
                    <CardDescription>Gerencie os grants do projeto</CardDescription>
                  </div>
                  <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Grant
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Grant</DialogTitle>
                      </DialogHeader>
                      <GrantForm
                        projectId={selectedProject}
                        onSuccess={() => setGrantDialogOpen(false)}
                        onSubmit={(data) => createGrant.mutate(data)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {grantsLoading ? (
                  <p>Carregando...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Doador</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grants?.map((grant) => (
                        <TableRow key={grant.id}>
                          <TableCell className="font-medium">{grant.grant_code}</TableCell>
                          <TableCell>{grant.donor_name}</TableCell>
                          <TableCell>{grant.currency} {grant.total_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {format(new Date(grant.start_date), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(grant.end_date), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={grant.status === "approved" ? "default" : "secondary"}>
                              {grant.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Alocações de Orçamento</CardTitle>
                    <CardDescription>Gerencie as alocações por categoria</CardDescription>
                  </div>
                  <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Alocação
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Alocação</DialogTitle>
                      </DialogHeader>
                      <BudgetAllocationForm
                        projectId={selectedProject}
                        onSuccess={() => setAllocationDialogOpen(false)}
                        onSubmit={(data) => createAllocation.mutate(data)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {allocationsLoading ? (
                  <p>Carregando...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Ano/Trimestre</TableHead>
                        <TableHead>Alocado</TableHead>
                        <TableHead>Gasto</TableHead>
                        <TableHead>Restante</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocations?.map((allocation) => (
                        <TableRow key={allocation.id}>
                          <TableCell className="font-medium capitalize">{allocation.category}</TableCell>
                          <TableCell>
                            {allocation.fiscal_year}
                            {allocation.quarter && ` Q${allocation.quarter}`}
                          </TableCell>
                          <TableCell>{allocation.currency} {allocation.allocated_amount.toLocaleString()}</TableCell>
                          <TableCell>{allocation.currency} {allocation.spent_amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {allocation.currency} {(allocation.allocated_amount - allocation.spent_amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transações Financeiras</CardTitle>
                    <CardDescription>Registre e acompanhe todas as transações</CardDescription>
                  </div>
                  <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Transação
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Criar Nova Transação</DialogTitle>
                      </DialogHeader>
                      <TransactionForm
                        projectId={selectedProject}
                        onSuccess={() => setTransactionDialogOpen(false)}
                        onSubmit={(data) => createTransaction.mutate(data)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <p>Carregando...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Referência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions?.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.transaction_date), "dd/MM/yyyy", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.transaction_type === "income" ? "default" : "secondary"}>
                              {transaction.transaction_type}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className={transaction.transaction_type === "expense" ? "text-destructive" : "text-primary"}>
                            {transaction.currency} {transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{transaction.reference_number || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
