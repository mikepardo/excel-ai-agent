import * as XLSX from 'xlsx';
import type { AIResponse } from './aiAgent';
import type { WorkbookData } from './excelProcessor';

/**
 * Apply AI-generated actions to an Excel workbook
 */
export async function applyAIActions(
  fileUrl: string,
  actions: AIResponse['actions']
): Promise<{ workbook: XLSX.WorkBook; data: WorkbookData }> {
  if (!actions || actions.length === 0) {
    throw new Error('No actions to apply');
  }

  // Fetch the current file
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Apply each action
  for (const action of actions) {
    if (action.type === 'clarify') continue;

    const sheetName = action.sheet || workbook.SheetNames[0];
    if (!sheetName) continue;

    let worksheet = workbook.Sheets[sheetName];

    // Create sheet if it doesn't exist
    if (!worksheet && action.type === 'create_sheet') {
      worksheet = XLSX.utils.aoa_to_sheet([[]]);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      continue;
    }

    if (!worksheet) continue;

    switch (action.type) {
      case 'update_cell':
        if (action.cell && action.value !== undefined) {
          worksheet[action.cell] = { v: action.value, t: inferCellType(action.value) };
        }
        break;

      case 'add_formula':
        if (action.cell && action.formula) {
          worksheet[action.cell] = { 
            f: action.formula,
            t: 'n'
          };
        }
        break;

      case 'format':
        // Apply formatting (simplified - XLSX has limited formatting support)
        if (action.cell) {
          const cell = worksheet[action.cell];
          if (cell) {
            cell.s = cell.s || {};
            // Add basic formatting properties
          }
        }
        break;
    }
  }

  // Convert workbook back to structured data
  const sheets: WorkbookData['sheets'] = [];
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
    workbook,
    data: {
      sheets,
      sheetNames: workbook.SheetNames,
    },
  };
}

/**
 * Infer cell type from value
 */
function inferCellType(value: any): XLSX.ExcelDataType {
  if (typeof value === 'number') return 'n';
  if (typeof value === 'boolean') return 'b';
  if (value instanceof Date) return 'd';
  if (value === null || value === undefined) return 'z';
  return 's'; // string
}

/**
 * Parse cell reference (e.g., "A1" -> { col: 0, row: 0 })
 */
export function parseCellRef(cellRef: string): { col: number; row: number } {
  const match = cellRef.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell reference: ${cellRef}`);

  const colStr = match[1];
  const rowStr = match[2];

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  col -= 1; // Convert to 0-indexed

  const row = parseInt(rowStr) - 1; // Convert to 0-indexed

  return { col, row };
}

/**
 * Convert column index to letter (0 -> A, 25 -> Z, 26 -> AA)
 */
export function colIndexToLetter(col: number): string {
  let letter = '';
  let temp = col;

  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }

  return letter;
}

/**
 * Convert row/col indices to cell reference (0, 0 -> "A1")
 */
export function indicesToCellRef(row: number, col: number): string {
  return `${colIndexToLetter(col)}${row + 1}`;
}

/**
 * Add a new row to a worksheet
 */
export function addRowToSheet(
  worksheet: XLSX.WorkSheet,
  rowData: any[],
  rowIndex?: number
): void {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  const targetRow = rowIndex !== undefined ? rowIndex : range.e.r + 1;

  rowData.forEach((value, colIndex) => {
    const cellRef = indicesToCellRef(targetRow, colIndex);
    worksheet[cellRef] = { v: value, t: inferCellType(value) };
  });

  // Update range
  if (targetRow > range.e.r) {
    range.e.r = targetRow;
  }
  if (rowData.length - 1 > range.e.c) {
    range.e.c = rowData.length - 1;
  }
  worksheet['!ref'] = XLSX.utils.encode_range(range);
}

/**
 * Get cell value from worksheet
 */
export function getCellValue(worksheet: XLSX.WorkSheet, cellRef: string): any {
  const cell = worksheet[cellRef];
  if (!cell) return null;
  return cell.v;
}

/**
 * Set cell value in worksheet
 */
export function setCellValue(
  worksheet: XLSX.WorkSheet,
  cellRef: string,
  value: any,
  formula?: string
): void {
  if (formula) {
    worksheet[cellRef] = { f: formula, t: 'n' };
  } else {
    worksheet[cellRef] = { v: value, t: inferCellType(value) };
  }

  // Update range if necessary
  const cellCoords = XLSX.utils.decode_cell(cellRef);
  const range = worksheet['!ref'] 
    ? XLSX.utils.decode_range(worksheet['!ref'])
    : { s: cellCoords, e: cellCoords };

  if (cellCoords.r > range.e.r) range.e.r = cellCoords.r;
  if (cellCoords.c > range.e.c) range.e.c = cellCoords.c;
  if (cellCoords.r < range.s.r) range.s.r = cellCoords.r;
  if (cellCoords.c < range.s.c) range.s.c = cellCoords.c;

  worksheet['!ref'] = XLSX.utils.encode_range(range);
}
