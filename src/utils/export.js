import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';

export class WorksheetExporter {
  constructor() {
    this.doc = null;
  }

  // PDF Export
  async exportToPDF(worksheet, outputs, customFields = []) {
    try {
      this.doc = new jsPDF();
      
      // Header
      this.doc.setFontSize(20);
      this.doc.text(`${this.getWorksheetTitle(worksheet.type)} Report`, 20, 30);
      
      this.doc.setFontSize(12);
      this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
      
      if (worksheet.venture_id) {
        this.doc.text(`Venture: ${worksheet.venture_name || 'N/A'}`, 20, 55);
      }

      let yPosition = 70;

      // Inputs Section
      yPosition = this.addSection('Inputs', worksheet.inputs, yPosition);
      
      // Custom Fields Section
      if (customFields.length > 0) {
        yPosition = this.addCustomFieldsSection(customFields, yPosition);
      }

      // Outputs Section
      if (outputs) {
        yPosition = this.addSection('Results', outputs, yPosition);
      }

      // Download PDF
      const filename = `${worksheet.type}_worksheet_${Date.now()}.pdf`;
      this.doc.save(filename);

      return { success: true, filename };
    } catch (error) {
      console.error('PDF export error:', error);
      return { success: false, error: error.message };
    }
  }

  addSection(title, data, yPosition) {
    if (yPosition > 250) {
      this.doc.addPage();
      yPosition = 30;
    }

    this.doc.setFontSize(16);
    this.doc.text(title, 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    Object.entries(data).forEach(([key, value]) => {
      if (yPosition > 270) {
        this.doc.addPage();
        yPosition = 30;
      }
      
      const label = this.formatLabel(key);
      const formattedValue = this.formatValue(value);
      this.doc.text(`${label}: ${formattedValue}`, 25, yPosition);
      yPosition += 8;
    });

    return yPosition + 10;
  }

  addCustomFieldsSection(customFields, yPosition) {
    if (yPosition > 250) {
      this.doc.addPage();
      yPosition = 30;
    }

    this.doc.setFontSize(16);
    this.doc.text('Custom Fields', 20, yPosition);
    yPosition += 15;

    this.doc.setFontSize(10);
    customFields.forEach(field => {
      if (yPosition > 270) {
        this.doc.addPage();
        yPosition = 30;
      }
      
      this.doc.text(`${field.label}: ${this.formatValue(field.value)}`, 25, yPosition);
      yPosition += 8;
    });

    return yPosition + 10;
  }

  // CSV Export
  exportToCSV(worksheet, outputs, customFields = []) {
    try {
      const rows = [];
      const filename = `${worksheet.type}_worksheet_${Date.now()}.csv`;

      // Header
      rows.push(['Worksheet Type', worksheet.type]);
      rows.push(['Generated', new Date().toISOString()]);
      rows.push(['']); // Empty row

      // Inputs
      rows.push(['INPUTS']);
      Object.entries(worksheet.inputs).forEach(([key, value]) => {
        rows.push([this.formatLabel(key), this.formatValue(value)]);
      });
      rows.push(['']); // Empty row

      // Custom Fields
      if (customFields.length > 0) {
        rows.push(['CUSTOM FIELDS']);
        customFields.forEach(field => {
          rows.push([field.label, this.formatValue(field.value)]);
        });
        rows.push(['']); // Empty row
      }

      // Outputs
      if (outputs) {
        rows.push(['RESULTS']);
        Object.entries(outputs).forEach(([key, value]) => {
          rows.push([this.formatLabel(key), this.formatValue(value)]);
        });
      }

      // Convert to CSV string
      const csvContent = rows.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, filename };
    } catch (error) {
      console.error('CSV export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Email Export
  async emailWorksheet(worksheet, outputs, customFields = []) {
    try {
      // Generate PDF first
      const pdfResult = await this.exportToPDF(worksheet, outputs, customFields);
      if (!pdfResult.success) {
        throw new Error(pdfResult.error);
      }

      // Get PDF as base64
      const pdfBlob = this.doc.output('blob');
      const base64PDF = await this.blobToBase64(pdfBlob);

      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('User email not found');
      }

      // Send email via edge function
      const { data, error } = await supabase.functions.invoke('send-worksheet-email', {
        body: {
          to: user.email,
          worksheetType: worksheet.type,
          pdfBase64: base64PDF,
          filename: pdfResult.filename
        }
      });

      if (error) throw error;

      return { success: true, emailSent: true };
    } catch (error) {
      console.error('Email export error:', error);
      return { success: false, error: error.message };
    }
  }

  // Utility functions
  getWorksheetTitle(type) {
    const titles = {
      roi: 'ROI Calculator',
      cashflow: 'Cashflow Projection',
      breakeven: 'Breakeven Analysis',
      unitEconomics: 'Unit Economics',
      personal: 'Personal Finance',
      loanPayment: 'Loan Payment Calculator',
      npv: 'Net Present Value'
    };
    return titles[type] || 'Financial Worksheet';
  }

  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  formatValue(value) {
    if (typeof value === 'number') {
      if (value > 1000 || value < -1000) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      }
      return value.toFixed(2);
    }
    return String(value);
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Export singleton instance
export const worksheetExporter = new WorksheetExporter();