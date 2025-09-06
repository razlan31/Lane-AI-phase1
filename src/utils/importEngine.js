import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export class ImportEngine {
  static async importData(file, options = {}) {
    const { mergeStrategy = 'skip', validateOnly = false } = options;
    
    try {
      const fileType = this.getFileType(file);
      
      switch (fileType) {
        case 'json':
          return await this.importJSON(file, options);
        case 'csv':
          return await this.importCSV(file, options);
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  static getFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return extension;
  }

  static async importJSON(file, options) {
    const { mergeStrategy, validateOnly } = options;
    
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate structure
    const validation = this.validateJSONStructure(data);
    if (!validation.valid) {
      throw new Error(`Invalid JSON structure: ${validation.errors.join(', ')}`);
    }
    
    if (validateOnly) {
      return { 
        valid: true, 
        preview: this.generateImportPreview(data),
        conflicts: await this.detectConflicts(data, mergeStrategy)
      };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const results = {
      ventures: { imported: 0, skipped: 0, errors: 0 },
      kpis: { imported: 0, skipped: 0, errors: 0 },
      worksheets: { imported: 0, skipped: 0, errors: 0 },
      personal: { imported: 0, skipped: 0, errors: 0 }
    };
    
    // Import ventures
    if (data.ventures) {
      for (const venture of data.ventures) {
        try {
          const exists = await this.checkVentureExists(user.id, venture.name);
          
          if (exists && mergeStrategy === 'skip') {
            results.ventures.skipped++;
            continue;
          }
          
          const ventureData = {
            id: uuidv4(),
            user_id: user.id,
            name: venture.name,
            description: venture.description,
            type: venture.type,
            stage: venture.stage
          };
          
          if (exists && mergeStrategy === 'overwrite') {
            await supabase
              .from('ventures')
              .update(ventureData)
              .eq('user_id', user.id)
              .eq('name', venture.name);
          } else {
            await supabase
              .from('ventures')
              .insert(ventureData);
          }
          
          results.ventures.imported++;
        } catch (error) {
          console.error('Venture import error:', error);
          results.ventures.errors++;
        }
      }
    }
    
    // Import KPIs
    if (data.kpis) {
      for (const kpi of data.kpis) {
        try {
          // Find venture ID by name
          const { data: venture } = await supabase
            .from('ventures')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', kpi.venture_name || data.ventures?.[0]?.name)
            .maybeSingle();
          
          if (!venture) {
            results.kpis.errors++;
            continue;
          }
          
          const exists = await this.checkKPIExists(venture.id, kpi.name);
          
          if (exists && mergeStrategy === 'skip') {
            results.kpis.skipped++;
            continue;
          }
          
          const kpiData = {
            id: uuidv4(),
            venture_id: venture.id,
            name: kpi.name,
            value: kpi.value,
            confidence: kpi.confidence,
            confidence_level: kpi.confidence_level || 'mock'
          };
          
          if (exists && mergeStrategy === 'overwrite') {
            await supabase
              .from('kpis')
              .update(kpiData)
              .eq('venture_id', venture.id)
              .eq('name', kpi.name);
          } else {
            await supabase
              .from('kpis')
              .insert(kpiData);
          }
          
          results.kpis.imported++;
        } catch (error) {
          console.error('KPI import error:', error);
          results.kpis.errors++;
        }
      }
    }
    
    // Import worksheets
    if (data.worksheets) {
      for (const worksheet of data.worksheets) {
        try {
          const exists = await this.checkWorksheetExists(user.id, worksheet.type);
          
          if (exists && mergeStrategy === 'skip') {
            results.worksheets.skipped++;
            continue;
          }
          
          const worksheetData = {
            id: uuidv4(),
            user_id: user.id,
            type: worksheet.type,
            inputs: worksheet.inputs,
            outputs: worksheet.outputs,
            confidence_level: worksheet.confidence_level || 'mock'
          };
          
          if (exists && mergeStrategy === 'overwrite') {
            await supabase
              .from('worksheets')
              .update(worksheetData)
              .eq('user_id', user.id)
              .eq('type', worksheet.type);
          } else {
            await supabase
              .from('worksheets')
              .insert(worksheetData);
          }
          
          results.worksheets.imported++;
        } catch (error) {
          console.error('Worksheet import error:', error);
          results.worksheets.errors++;
        }
      }
    }
    
    // Import personal data
    if (data.personal) {
      try {
        const exists = await this.checkPersonalExists(user.id);
        
        if (!exists || mergeStrategy === 'overwrite') {
          const personalData = {
            user_id: user.id,
            goals: data.personal.goals,
            work_hours: data.personal.work_hours,
            monthly_burn: data.personal.monthly_burn,
            savings: data.personal.savings,
            activities: data.personal.activities,
            commitments: data.personal.commitments
          };
          
          if (exists) {
            await supabase
              .from('personal')
              .update(personalData)
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('personal')
              .insert({ id: uuidv4(), ...personalData });
          }
          
          results.personal.imported++;
        } else {
          results.personal.skipped++;
        }
      } catch (error) {
        console.error('Personal data import error:', error);
        results.personal.errors++;
      }
    }
    
    return { success: true, results };
  }

  static async importCSV(file, options) {
    const { mergeStrategy, validateOnly } = options;
    
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    if (validateOnly) {
      return {
        valid: true,
        preview: { headers, rowCount: rows.length, sampleRows: rows.slice(0, 5) },
        conflicts: []
      };
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const results = {
      imported: 0,
      skipped: 0,
      errors: 0
    };
    
    // Process CSV rows based on Type column
    for (const row of rows) {
      try {
        const type = row.Type?.toLowerCase();
        
        switch (type) {
          case 'venture':
            await this.importCSVVenture(user.id, row, mergeStrategy);
            results.imported++;
            break;
          case 'kpi':
            await this.importCSVKPI(user.id, row, mergeStrategy);
            results.imported++;
            break;
          case 'worksheet':
            await this.importCSVWorksheet(user.id, row, mergeStrategy);
            results.imported++;
            break;
          default:
            results.skipped++;
        }
      } catch (error) {
        console.error('CSV row import error:', error);
        results.errors++;
      }
    }
    
    return { success: true, results };
  }

  static validateJSONStructure(data) {
    const errors = [];
    
    if (!data || typeof data !== 'object') {
      errors.push('Data must be a valid JSON object');
      return { valid: false, errors };
    }
    
    // Check for required metadata
    if (!data.metadata || !data.metadata.version) {
      errors.push('Missing metadata or version information');
    }
    
    // Validate ventures structure
    if (data.ventures && !Array.isArray(data.ventures)) {
      errors.push('Ventures must be an array');
    }
    
    // Validate KPIs structure
    if (data.kpis && !Array.isArray(data.kpis)) {
      errors.push('KPIs must be an array');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static generateImportPreview(data) {
    return {
      ventures: data.ventures?.length || 0,
      kpis: data.kpis?.length || 0,
      worksheets: data.worksheets?.length || 0,
      hasPersonalData: !!data.personal
    };
  }

  static async detectConflicts(data, mergeStrategy) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const conflicts = [];
    
    // Check venture name conflicts
    if (data.ventures) {
      for (const venture of data.ventures) {
        const exists = await this.checkVentureExists(user.id, venture.name);
        if (exists) {
          conflicts.push({
            type: 'venture',
            name: venture.name,
            action: mergeStrategy === 'skip' ? 'will be skipped' : 'will be overwritten'
          });
        }
      }
    }
    
    return conflicts;
  }

  // Helper methods
  static async checkVentureExists(userId, name) {
    const { data } = await supabase
      .from('ventures')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name)
      .maybeSingle();
    return !!data;
  }

  static async checkKPIExists(ventureId, name) {
    const { data } = await supabase
      .from('kpis')
      .select('id')
      .eq('venture_id', ventureId)
      .eq('name', name)
      .maybeSingle();
    return !!data;
  }

  static async checkWorksheetExists(userId, type) {
    const { data } = await supabase
      .from('worksheets')
      .select('id')
      .eq('user_id', userId)
      .eq('type', type)
      .maybeSingle();
    return !!data;
  }

  static async checkPersonalExists(userId) {
    const { data } = await supabase
      .from('personal')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    return !!data;
  }

  static async importCSVVenture(userId, row, mergeStrategy) {
    const exists = await this.checkVentureExists(userId, row.Name);
    
    if (exists && mergeStrategy === 'skip') return;
    
    const ventureData = {
      id: uuidv4(),
      user_id: userId,
      name: row.Name,
      description: row.Description || '',
      type: row.Value,
      stage: row.Status
    };
    
    if (exists && mergeStrategy === 'overwrite') {
      await supabase
        .from('ventures')
        .update(ventureData)
        .eq('user_id', userId)
        .eq('name', row.Name);
    } else {
      await supabase
        .from('ventures')
        .insert(ventureData);
    }
  }

  static async importCSVKPI(userId, row, mergeStrategy) {
    // Find venture by name (assuming first venture or specified)
    const { data: venture } = await supabase
      .from('ventures')
      .select('id')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();
    
    if (!venture) return;
    
    const exists = await this.checkKPIExists(venture.id, row.Name);
    
    if (exists && mergeStrategy === 'skip') return;
    
    const kpiData = {
      id: uuidv4(),
      venture_id: venture.id,
      name: row.Name,
      value: parseFloat(row.Value) || 0,
      confidence_level: row.Status || 'mock'
    };
    
    if (exists && mergeStrategy === 'overwrite') {
      await supabase
        .from('kpis')
        .update(kpiData)
        .eq('venture_id', venture.id)
        .eq('name', row.Name);
    } else {
      await supabase
        .from('kpis')
        .insert(kpiData);
    }
  }

  static async importCSVWorksheet(userId, row, mergeStrategy) {
    const exists = await this.checkWorksheetExists(userId, row.Name);
    
    if (exists && mergeStrategy === 'skip') return;
    
    let outputs = {};
    try {
      outputs = JSON.parse(row.Value);
    } catch {
      outputs = { result: row.Value };
    }
    
    const worksheetData = {
      id: uuidv4(),
      user_id: userId,
      type: row.Name,
      outputs,
      confidence_level: row.Status || 'mock'
    };
    
    if (exists && mergeStrategy === 'overwrite') {
      await supabase
        .from('worksheets')
        .update(worksheetData)
        .eq('user_id', userId)
        .eq('type', row.Name);
    } else {
      await supabase
        .from('worksheets')
        .insert(worksheetData);
    }
  }
}

export default ImportEngine;