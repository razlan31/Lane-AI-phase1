import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';

// Export utilities for Lane AI data (CSV, PDF, JSON)

export class ExportEngine {
  static async exportData(format, options = {}) {
    const { data, ventures, kpis, worksheets, includeCharts = true, filterBy = null } = options;
    
    try {
      switch (format) {
        case 'csv':
          return await this.exportCSV(data, options);
        case 'pdf':
          return await this.exportPDF(data, options);
        case 'json':
          return await this.exportJSON(data, options);
        case 'image':
          return await this.exportImage(options);
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  static async exportCSV(data, options) {
    const { includeTimestamps = true, includeCalculations = true, ventures, kpis } = options;
    
    // Fetch real data from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const realData = await this.fetchExportData(user.id, options);
    
    const headers = ['Type', 'Name', 'Value', 'Unit', 'Status'];
    if (includeTimestamps) headers.push('Last Updated');
    if (includeCalculations) headers.push('Trend %', 'Confidence');

    const rows = [];
    
    // Add KPIs
    realData.kpis.forEach(kpi => {
      const row = [
        'KPI',
        kpi.name,
        kpi.value || 'N/A',
        'currency', // TODO: Add unit field to KPIs table
        kpi.confidence_level || 'mock'
      ];
      if (includeTimestamps) row.push(new Date(kpi.updated_at).toLocaleString());
      if (includeCalculations) {
        row.push('N/A'); // TODO: Add trend calculation
        row.push(kpi.confidence || 'N/A');
      }
      rows.push(row);
    });

    // Add Ventures
    realData.ventures.forEach(venture => {
      const row = [
        'Venture',
        venture.name,
        venture.type || 'N/A',
        'text',
        venture.stage || 'N/A'
      ];
      if (includeTimestamps) row.push(new Date(venture.updated_at).toLocaleString());
      if (includeCalculations) {
        row.push('N/A');
        row.push('N/A');
      }
      rows.push(row);
    });

    // Add Worksheets
    realData.worksheets.forEach(worksheet => {
      const row = [
        'Worksheet',
        worksheet.type,
        JSON.stringify(worksheet.outputs || {}),
        'json',
        worksheet.confidence_level || 'mock'
      ];
      if (includeTimestamps) row.push(new Date(worksheet.created_at).toLocaleString());
      if (includeCalculations) {
        row.push('N/A');
        row.push(worksheet.confidence_level || 'N/A');
      }
      rows.push(row);
    });

    const csv = [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = `laneai-export-${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(blob, filename);
    
    return { success: true, filename };
  }

  static async exportPDF(data, options) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const realData = await this.fetchExportData(user.id, options);
    
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Lane AI Business Report', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    pdf.text(`User: ${user.email}`, 20, 55);
    
    let yPosition = 75;
    
    // Ventures Section
    if (realData.ventures.length > 0) {
      pdf.setFontSize(16);
      pdf.text('Ventures', 20, yPosition);
      yPosition += 10;
      
      realData.ventures.forEach(venture => {
        pdf.setFontSize(10);
        pdf.text(`• ${venture.name} (${venture.type || 'Unknown type'})`, 25, yPosition);
        yPosition += 8;
        if (venture.description) {
          const wrapped = pdf.splitTextToSize(venture.description, 160);
          pdf.text(wrapped, 30, yPosition);
          yPosition += wrapped.length * 5;
        }
        yPosition += 5;
      });
    }
    
    // KPIs Section
    if (realData.kpis.length > 0) {
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.text('Key Performance Indicators', 20, yPosition);
      yPosition += 10;
      
      realData.kpis.forEach(kpi => {
        pdf.setFontSize(10);
        pdf.text(`• ${kpi.name}: ${kpi.value || 'N/A'} (${kpi.confidence_level})`, 25, yPosition);
        yPosition += 8;
        
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }
    
    // Worksheets Summary
    if (realData.worksheets.length > 0) {
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.text('Analysis Worksheets', 20, yPosition);
      yPosition += 10;
      
      realData.worksheets.forEach(worksheet => {
        pdf.setFontSize(10);
        pdf.text(`• ${worksheet.type} (${worksheet.confidence_level})`, 25, yPosition);
        yPosition += 8;
        
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    }
    
    const filename = `laneai-report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);
    
    return { success: true, filename };
  }

  static async exportJSON(data, options) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const realData = await this.fetchExportData(user.id, options);
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        version: '1.0'
      },
      ventures: realData.ventures,
      kpis: realData.kpis,
      worksheets: realData.worksheets,
      personal: realData.personal
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const filename = `laneai-data-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(blob, filename);
    
    return { success: true, filename };
  }

  static async exportImage(options) {
    throw new Error('Image export is currently unavailable. Please use PDF export as an alternative.');
  }

  static async fetchExportData(userId, options = {}) {
    const { includePersonal = true, ventureIds = null } = options;
    
    // Fetch ventures
    let venturesQuery = supabase
      .from('ventures')
      .select('*')
      .eq('user_id', userId);
    
    if (ventureIds && ventureIds.length > 0) {
      venturesQuery = venturesQuery.in('id', ventureIds);
    }
    
    const { data: ventures = [] } = await venturesQuery;
    
    // Fetch KPIs for user's ventures
    const { data: kpis = [] } = await supabase
      .from('kpis')
      .select('*')
      .in('venture_id', ventures.map(v => v.id));
    
    // Fetch worksheets
    const { data: worksheets = [] } = await supabase
      .from('worksheets')
      .select('*')
      .eq('user_id', userId);
    
    // Fetch personal data if requested
    let personal = null;
    if (includePersonal) {
      const { data: personalData } = await supabase
        .from('personal')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      personal = personalData;
    }
    
    return { ventures, kpis, worksheets, personal };
  }

  static downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default ExportEngine;