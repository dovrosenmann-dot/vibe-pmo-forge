import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToPDF = (title: string, columns: string[], data: any[][], filename: string) => {
  const doc = new jsPDF();
  
  // Brand Header
  doc.setFontSize(22);
  doc.setTextColor(33, 37, 41);
  doc.text(title, 14, 22);
  
  // Subtitle / Timestamp
  doc.setFontSize(10);
  doc.setTextColor(108, 117, 125);
  doc.text(`Earthworm Foundation | PMO Forge | Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
  
  // Abstracted Table Generation
  autoTable(doc, {
    startY: 38,
    head: [columns],
    body: data,
    theme: 'grid',
    styles: { 
      font: 'helvetica',
      fontSize: 9, 
      cellPadding: 4,
      lineColor: [222, 226, 230],
      lineWidth: 0.1
    },
    headStyles: { 
      fillColor: [15, 23, 42], // Deep Slate styling to match UI
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] // Very light slate mapping
    }
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportToExcel = (data: Record<string, any>[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
