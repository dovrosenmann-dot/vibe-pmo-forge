import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Grant } from "@/hooks/useGrants";
import type { BudgetAllocation } from "@/hooks/useBudgetAllocations";
import type { FinancialTransaction } from "@/hooks/useFinancialTransactions";

interface FinanceExportProps {
  grants: Grant[];
  allocations: BudgetAllocation[];
  transactions: FinancialTransaction[];
  dateFrom?: Date;
  dateTo?: Date;
}

export function FinanceExport({
  grants,
  allocations,
  transactions,
  dateFrom,
  dateTo,
}: FinanceExportProps) {
  const formatDate = (date: string) =>
    format(new Date(date), "dd/MM/yyyy", { locale: ptBR });

  const getFilterPeriodText = () => {
    if (dateFrom && dateTo) {
      return `${formatDate(dateFrom.toISOString())} - ${formatDate(dateTo.toISOString())}`;
    }
    if (dateFrom) return `A partir de ${formatDate(dateFrom.toISOString())}`;
    if (dateTo) return `Até ${formatDate(dateTo.toISOString())}`;
    return "Todos os períodos";
  };

  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Grants sheet
      const grantsData = grants.map((g) => ({
        Código: g.grant_code,
        Doador: g.donor_name,
        "Valor Total": g.total_amount,
        Moeda: g.currency,
        "Data Início": formatDate(g.start_date),
        "Data Fim": formatDate(g.end_date),
        Status: g.status,
        "Valor Desembolsado": g.disbursed_amount,
      }));
      const wsGrants = XLSX.utils.json_to_sheet(grantsData);
      XLSX.utils.book_append_sheet(wb, wsGrants, "Grants");

      // Allocations sheet
      const allocationsData = allocations.map((a) => ({
        Categoria: a.category,
        "Ano Fiscal": a.fiscal_year,
        Trimestre: a.quarter || "-",
        "Valor Alocado": a.allocated_amount,
        "Valor Gasto": a.spent_amount,
        "Valor Comprometido": a.committed_amount,
        Moeda: a.currency,
        Restante: a.allocated_amount - a.spent_amount,
      }));
      const wsAllocations = XLSX.utils.json_to_sheet(allocationsData);
      XLSX.utils.book_append_sheet(wb, wsAllocations, "Alocações");

      // Transactions sheet
      const transactionsData = transactions.map((t) => ({
        Data: formatDate(t.transaction_date),
        Tipo: t.transaction_type,
        Descrição: t.description,
        Valor: t.amount,
        Moeda: t.currency,
        Referência: t.reference_number || "-",
        Categoria: t.category || "-",
      }));
      const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(wb, wsTransactions, "Transações");

      const fileName = `relatorio_financeiro_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success("Relatório Excel exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar para Excel");
      console.error(error);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(18);
      doc.text("Relatório Financeiro", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(10);
      doc.text(`Período: ${getFilterPeriodText()}`, pageWidth / 2, 28, { align: "center" });
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, pageWidth / 2, 34, { align: "center" });

      let yPosition = 45;

      // Summary section
      const totalGrants = grants.reduce((sum, g) => sum + g.total_amount, 0);
      const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated_amount, 0);
      const totalSpent = allocations.reduce((sum, a) => sum + a.spent_amount, 0);

      doc.setFontSize(12);
      doc.text("Resumo Financeiro", 14, yPosition);
      yPosition += 8;

      autoTable(doc, {
        startY: yPosition,
        head: [["Métrica", "Valor"]],
        body: [
          ["Total em Grants", `$${totalGrants.toLocaleString()}`],
          ["Orçamento Alocado", `$${totalAllocated.toLocaleString()}`],
          ["Total Gasto", `$${totalSpent.toLocaleString()}`],
          ["Saldo Disponível", `$${(totalAllocated - totalSpent).toLocaleString()}`],
        ],
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;

      // Grants table
      if (grants.length > 0) {
        doc.setFontSize(12);
        doc.text("Grants", 14, yPosition);
        yPosition += 8;

        autoTable(doc, {
          startY: yPosition,
          head: [["Código", "Doador", "Valor", "Status"]],
          body: grants.map((g) => [
            g.grant_code,
            g.donor_name,
            `${g.currency} ${g.total_amount.toLocaleString()}`,
            g.status,
          ]),
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Allocations table
      if (allocations.length > 0) {
        doc.setFontSize(12);
        doc.text("Alocações de Orçamento", 14, yPosition);
        yPosition += 8;

        autoTable(doc, {
          startY: yPosition,
          head: [["Categoria", "Ano/Trim", "Alocado", "Gasto", "Restante"]],
          body: allocations.map((a) => [
            a.category,
            a.quarter ? `${a.fiscal_year} Q${a.quarter}` : a.fiscal_year.toString(),
            `${a.currency} ${a.allocated_amount.toLocaleString()}`,
            `${a.currency} ${a.spent_amount.toLocaleString()}`,
            `${a.currency} ${(a.allocated_amount - a.spent_amount).toLocaleString()}`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Transactions table
      if (transactions.length > 0) {
        doc.setFontSize(12);
        doc.text("Transações", 14, yPosition);
        yPosition += 8;

        autoTable(doc, {
          startY: yPosition,
          head: [["Data", "Tipo", "Descrição", "Valor"]],
          body: transactions.map((t) => [
            formatDate(t.transaction_date),
            t.transaction_type,
            t.description.substring(0, 30) + (t.description.length > 30 ? "..." : ""),
            `${t.currency} ${t.amount.toLocaleString()}`,
          ]),
          theme: "striped",
          headStyles: { fillColor: [59, 130, 246] },
        });
      }

      const fileName = `relatorio_financeiro_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(fileName);
      toast.success("Relatório PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar para PDF");
      console.error(error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Exportar Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
