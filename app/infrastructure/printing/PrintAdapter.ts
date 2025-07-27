import jsPDF from 'jspdf';
import type { Sale } from '../../domain/entities/Sale';
import type { StoreConfig } from '../../domain/entities/StoreConfig';

// Función para formatear fecha de manera consistente y simple
const formatSaleDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Fecha inválida';
    }
    return date.toLocaleString();
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Error en fecha';
  }
};

export const generateReceiptPDF = (sale: Sale, config: StoreConfig | null): boolean => {
  try {
    // Create PDF with thermal printer dimensions (80mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 297]
    });

    pdf.setFont('helvetica');
    let yPosition = 8;
    const leftMargin = 4;
    const rightMargin = 76;
    const centerX = 40;

    // Store header
    if (config) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      
      const storeNameWidth = pdf.getTextWidth(config.name);
      pdf.text(config.name, centerX - (storeNameWidth / 2), yPosition);
      yPosition += 6;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      const addressWidth = pdf.getTextWidth(config.address);
      pdf.text(config.address, centerX - (addressWidth / 2), yPosition);
      yPosition += 4;
      
      const phoneText = `Tel: ${config.phone}`;
      const phoneWidth = pdf.getTextWidth(phoneText);
      pdf.text(phoneText, centerX - (phoneWidth / 2), yPosition);
      yPosition += 4;
      
      const emailText = `Email: ${config.email}`;
      const emailWidth = pdf.getTextWidth(emailText);
      pdf.text(emailText, centerX - (emailWidth / 2), yPosition);
      yPosition += 6;
    }

    // Separator line
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.2);
    pdf.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 5;

    // Client info
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Cliente: ${sale.clientName}`, leftMargin, yPosition);
    yPosition += 4;
    pdf.text(`DNI: ${sale.clientDni}`, leftMargin, yPosition);
    yPosition += 4;
    pdf.text(`Fecha: ${formatSaleDate(sale.date)}`, leftMargin, yPosition);
    yPosition += 6;

    // Separator line
    pdf.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 5;

    // Items header
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Producto', leftMargin, yPosition);
    pdf.text('Cant', leftMargin + 30, yPosition);
    pdf.text('Precio', leftMargin + 40, yPosition);
    pdf.text('Total', leftMargin + 55, yPosition);
    yPosition += 4;

    pdf.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 4;

    // Items
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);

    sale.items.forEach(item => {
      const productName = item.name.length > 18 ? 
        item.name.substring(0, 18) + '...' : item.name;
      
      pdf.text(productName, leftMargin, yPosition);
      pdf.text(item.quantity.toString(), leftMargin + 32, yPosition);
      pdf.text(`${item.price.toFixed(2)}`, leftMargin + 42, yPosition);
      pdf.text(`${item.subtotal.toFixed(2)}`, leftMargin + 57, yPosition);
      yPosition += 4;
    });

    yPosition += 2;

    // Total line
    pdf.line(leftMargin, yPosition, rightMargin, yPosition);
    yPosition += 5;

    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    const totalText = `TOTAL: S/ ${sale.total.toFixed(2)}`;
    const totalWidth = pdf.getTextWidth(totalText);
    pdf.text(totalText, centerX - (totalWidth / 2), yPosition);
    yPosition += 8;

    // Thank you message
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    const thanksText = '¡Gracias por su compra!';
    const thanksWidth = pdf.getTextWidth(thanksText);
    pdf.text(thanksText, centerX - (thanksWidth / 2), yPosition);

    // Generate filename and save
    const now = new Date();
    const fileName = `boleta_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;
    
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Error al generar el PDF');
    return false;
  }
};
