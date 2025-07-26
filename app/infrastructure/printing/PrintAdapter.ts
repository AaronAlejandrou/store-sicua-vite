import { useRef } from 'react';
import jsPDF from 'jspdf';
import type { Sale } from '../../domain/entities/Sale';
import type { StoreConfig } from '../../domain/entities/StoreConfig';

export function useDownloadPDF() {
  const downloadRef = useRef<HTMLDivElement>(null);

  const generatePDFFromData = (sale: Sale, config: StoreConfig | null) => {
    try {
      // Create PDF with custom dimensions for thermal printer (80mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 297] // 80mm width, 297mm max height (adjustable)
      });

      // Set font
      pdf.setFont('helvetica');
      
      let yPosition = 5;
      const leftMargin = 4;
      const rightMargin = 76;
      const centerX = 40; // Center of 80mm paper
      
      // Store header (centered)
      if (config) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const storeNameWidth = pdf.getTextWidth(config.name);
        pdf.text(config.name, centerX - (storeNameWidth / 2), yPosition);
        yPosition += 6;
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        
        // Address (centered)
        const addressText = `${config.address}`;
        const addressWidth = pdf.getTextWidth(addressText);
        pdf.text(addressText, centerX - (addressWidth / 2), yPosition);
        yPosition += 4;
        
        // Email (centered)
        const emailWidth = pdf.getTextWidth(config.email);
        pdf.text(config.email, centerX - (emailWidth / 2), yPosition);
        yPosition += 4;
        
        // Phone (centered)
        const phoneWidth = pdf.getTextWidth(config.phone);
        pdf.text(config.phone, centerX - (phoneWidth / 2), yPosition);
        yPosition += 6;
      }
      
      // Separator line
      pdf.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 4;
      
      // Title (centered)
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const titleText = 'BOLETA DE VENTA';
      const titleWidth = pdf.getTextWidth(titleText);
      pdf.text(titleText, centerX - (titleWidth / 2), yPosition);
      yPosition += 6;
      
      // Sale info
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Fecha: ${new Date(sale.date).toLocaleDateString('es-ES')}`, leftMargin, yPosition);
      yPosition += 3;
      pdf.text(`Boleta: ${sale.id.substring(0, 8)}...`, leftMargin, yPosition);
      yPosition += 5;
      
      // Client info
      pdf.text(`Cliente: ${sale.clientName}`, leftMargin, yPosition);
      yPosition += 3;
      pdf.text(`DNI: ${sale.clientDni}`, leftMargin, yPosition);
      yPosition += 5;
      
      // Separator line
      pdf.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 4;
      
      // Items header
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRODUCTO', leftMargin, yPosition);
      pdf.text('CANT', leftMargin + 32, yPosition);
      pdf.text('PRECIO', leftMargin + 45, yPosition);
      pdf.text('TOTAL', leftMargin + 58, yPosition);
      yPosition += 4;
      
      // Line under headers
      pdf.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 3;
      
      // Items
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      
      sale.items.forEach(item => {
        // Product name (truncate if too long)
        const productName = item.name.length > 18 ? item.name.substring(0, 18) + '...' : item.name;
        
        pdf.text(productName, leftMargin, yPosition);
        pdf.text(item.quantity.toString(), leftMargin + 34, yPosition);
        pdf.text(`S/${item.price.toFixed(2)}`, leftMargin + 45, yPosition);
        pdf.text(`S/${item.subtotal.toFixed(2)}`, leftMargin + 58, yPosition);
        yPosition += 4;
      });
      
      yPosition += 2;
      
      // Line before total
      pdf.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 4;
      
      // Total (centered and prominent)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      const totalText = `TOTAL: S/${sale.total.toFixed(2)}`;
      const totalWidth = pdf.getTextWidth(totalText);
      pdf.text(totalText, centerX - (totalWidth / 2), yPosition);
      yPosition += 6;
      
      // Bottom separator
      pdf.line(leftMargin, yPosition, rightMargin, yPosition);
      yPosition += 4;
      
      // Thank you message (centered)
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      const thanksText = '¡Gracias por su compra!';
      const thanksWidth = pdf.getTextWidth(thanksText);
      pdf.text(thanksText, centerX - (thanksWidth / 2), yPosition);
      yPosition += 8;
      
      // Adjust PDF height to actual content
      const finalHeight = Math.max(yPosition + 5, 50); // Minimum 50mm height
      
      // Generate filename with date and time
      const now = new Date();
      const fileName = `boleta_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;
      
      pdf.save(fileName);
      
      return true;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
      return false;
    }
  };

  const handleDownloadPDF = async () => {
    // This function will be overridden when called with actual data
    console.warn('handleDownloadPDF called without data');
  };

  return { downloadRef, handleDownloadPDF, generatePDFFromData };
} 