import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function useDownloadPDF() {
  const downloadRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!downloadRef.current) return;
    
    try {
      // Capture element as image
      const canvas = await html2canvas(downloadRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit in PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate scale to fit in page
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Center image in page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Generate filename with date and time
      const now = new Date();
      const fileName = `boleta_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  return { downloadRef, handleDownloadPDF };
} 