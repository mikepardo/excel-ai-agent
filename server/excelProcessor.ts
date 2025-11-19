import * as XLSX from 'xlsx';
import { storagePut, storageGet } from './storage';

export interface SheetData {
  name: string;
  data: any[][];
  range?: string;
}

export interface WorkbookData {
  sheets: SheetData[];
  sheetNames: string[];
}

/**
 * Parse Excel file from URL and return structured data
 */
export async function parseExcelFile(fileUrl: string): Promise<WorkbookData> {
  try {
    // Fetch the file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const sheets: SheetData[] = [];
    
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;
      
      // Convert to 2D array
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
      
      sheets.push({
        name: sheetName,
        data: data as any[][],
        range: worksheet['!ref'],
      });
    }
    
    return {
      sheets,
      sheetNames: workbook.SheetNames,
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create Excel file from structured data and upload to S3
 */
export async function createExcelFile(
  data: WorkbookData,
  fileName: string,
  userId: number
): Promise<{ fileKey: string; fileUrl: string }> {
  try {
    const workbook = XLSX.utils.book_new();
    
    for (const sheet of data.sheets) {
      const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    }
    
    // Generate Excel file buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Upload to S3
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileKey = `${userId}/spreadsheets/${fileName}-${timestamp}-${randomSuffix}.xlsx`;
    
    const result = await storagePut(fileKey, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
    return {
      fileKey,
      fileUrl: result.url,
    };
  } catch (error) {
    console.error('Error creating Excel file:', error);
    throw new Error(`Failed to create Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update specific cells in Excel file based on AI instructions
 */
export async function updateExcelCells(
  fileUrl: string,
  updates: Array<{ sheet: string; cell: string; value: any; formula?: string }>
): Promise<WorkbookData> {
  try {
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    for (const update of updates) {
      const worksheet = workbook.Sheets[update.sheet];
      if (!worksheet) continue;
      
      const cellRef = update.cell;
      
      if (update.formula) {
        worksheet[cellRef] = { t: 'n', f: update.formula };
      } else {
        worksheet[cellRef] = { v: update.value };
      }
    }
    
    // Convert back to structured data
    const sheets: SheetData[] = [];
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;
      
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
      sheets.push({
        name: sheetName,
        data: data as any[][],
        range: worksheet['!ref'],
      });
    }
    
    return {
      sheets,
      sheetNames: workbook.SheetNames,
    };
  } catch (error) {
    console.error('Error updating Excel cells:', error);
    throw new Error(`Failed to update Excel cells: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert CSV to Excel format
 */
export function csvToExcel(csvContent: string): WorkbookData {
  const workbook = XLSX.read(csvContent, { type: 'string' });
  
  const sheets: SheetData[] = [];
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;
    
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    sheets.push({
      name: sheetName,
      data: data as any[][],
      range: worksheet['!ref'],
    });
  }
  
  return {
    sheets,
    sheetNames: workbook.SheetNames,
  };
}
