import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

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
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252]
    }
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportToExcel = async (data: Record<string, any>[], filename: string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Registros");
  
  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key,
      width: 20
    }));
    data.forEach(row => worksheet.addRow(row));
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
};
