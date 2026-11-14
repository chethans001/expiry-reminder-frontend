import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDisplayDate } from './dateUtils';

export function generateItemsPdfReport({ user, items, summary }) {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(99, 102, 241); // Indigo 500
  doc.rect(0, 0, 210, 35, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Expiry Reminder - Personal Report', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated for: ${user?.name || 'Household User'} (${user?.email || ''}) | Date: ${new Date().toLocaleDateString()}`, 14, 28);

  // Summary Metrics Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Personal Expiry Summary', 14, 45);

  const summaryData = [
    ['Total Tracked Items', summary?.total || items.length],
    ['Items Safe (>30 Days)', summary?.safeCount || items.filter(i => i.status === 'Safe').length],
    ['Expiring Soon (1-30 Days)', items.filter(i => i.status === 'Expiring Soon').length],
    ['Expiring This Week (0-7 Days)', summary?.expiringThisWeekCount || items.filter(i => i.daysRemaining >= 0 && i.daysRemaining <= 7).length],
    ['Already Expired Items', summary?.expiredCount || items.filter(i => i.status === 'Expired').length]
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Count']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [99, 102, 241] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 10 }
  });

  // Table of Items
  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Household Items List', 14, finalY);

  const tableRows = items.map(item => [
    item.name,
    item.category?.name || 'General',
    item.storageLocation || 'Kitchen',
    `${item.quantity} ${item.unit || 'pcs'}`,
    formatDisplayDate(item.expiryDate),
    item.label || `${item.daysRemaining} days`,
    item.status
  ]);

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Item Name', 'Category', 'Location', 'Qty', 'Expiry Date', 'Time Left', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 6) {
        const val = data.cell.raw;
        if (val === 'Expired') {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'Expiring Today' || val === 'Expiring Soon') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129];
        }
      }
    }
  });

  // Save the PDF
  doc.save(`expiry_report_${new Date().toISOString().split('T')[0]}.pdf`);
}
