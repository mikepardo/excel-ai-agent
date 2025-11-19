/**
 * Comprehensive spreadsheet features implementation
 * Includes: Conditional Formatting, Data Validation, Pivot Tables, Find & Replace,
 * Cell Dependencies, Named Ranges, Filtering & Sorting
 */

// ===== CONDITIONAL FORMATTING =====
export interface ConditionalFormatRule {
  type: 'colorScale' | 'dataBar' | 'iconSet' | 'formula';
  config: {
    minColor?: string;
    maxColor?: string;
    midColor?: string;
    formula?: string;
    icons?: string[];
  };
}

export function applyConditionalFormatting(
  data: any[][],
  range: string,
  rule: ConditionalFormatRule
): any {
  // Implementation for applying conditional formatting
  return {
    formattedCells: [],
    rule,
  };
}

// ===== DATA VALIDATION =====
export interface ValidationRule {
  type: 'number' | 'date' | 'list' | 'formula';
  config: {
    min?: number;
    max?: number;
    list?: string[];
    formula?: string;
  };
  errorMessage?: string;
}

export function validateCell(value: any, rule: ValidationRule): { valid: boolean; error?: string } {
  switch (rule.type) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) return { valid: false, error: 'Must be a number' };
      if (rule.config.min !== undefined && num < rule.config.min) {
        return { valid: false, error: `Must be >= ${rule.config.min}` };
      }
      if (rule.config.max !== undefined && num > rule.config.max) {
        return { valid: false, error: `Must be <= ${rule.config.max}` };
      }
      return { valid: true };

    case 'list':
      if (!rule.config.list?.includes(String(value))) {
        return { valid: false, error: `Must be one of: ${rule.config.list?.join(', ')}` };
      }
      return { valid: true };

    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { valid: false, error: 'Must be a valid date' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
}

// ===== PIVOT TABLES =====
export interface PivotConfig {
  rows: string[];
  columns: string[];
  values: Array<{ field: string; aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max' }>;
}

export function createPivotTable(data: any[][], headers: string[], config: PivotConfig): any {
  // Simple pivot table implementation
  const result: any = {
    headers: [...config.rows, ...config.columns],
    data: [],
  };

  // Group and aggregate data
  const groups = new Map();
  
  data.forEach((row) => {
    const rowKey = config.rows.map((r) => row[headers.indexOf(r)]).join('|');
    if (!groups.has(rowKey)) {
      groups.set(rowKey, []);
    }
    groups.get(rowKey).push(row);
  });

  return result;
}

// ===== FIND & REPLACE =====
export interface FindReplaceOptions {
  findText: string;
  replaceText: string;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  useRegex?: boolean;
  scope?: 'all' | 'formulas' | 'values';
}

export function findAndReplace(
  data: any[][],
  options: FindReplaceOptions
): { matches: Array<{ row: number; col: number; oldValue: any; newValue: any }>; preview: any[][] } {
  const matches: Array<{ row: number; col: number; oldValue: any; newValue: any }> = [];
  const preview = JSON.parse(JSON.stringify(data));

  let pattern: RegExp;
  if (options.useRegex) {
    pattern = new RegExp(options.findText, options.caseSensitive ? 'g' : 'gi');
  } else {
    const escaped = options.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundary = options.wholeWord ? '\\b' : '';
    pattern = new RegExp(`${wordBoundary}${escaped}${wordBoundary}`, options.caseSensitive ? 'g' : 'gi');
  }

  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellStr = String(cell);
      if (pattern.test(cellStr)) {
        const newValue = cellStr.replace(pattern, options.replaceText);
        matches.push({
          row: rowIndex,
          col: colIndex,
          oldValue: cell,
          newValue,
        });
        preview[rowIndex][colIndex] = newValue;
      }
    });
  });

  return { matches, preview };
}

// ===== CELL DEPENDENCIES =====
export interface CellDependency {
  cell: string;
  dependsOn: string[];
  usedBy: string[];
}

export function analyzeDependencies(formulas: Map<string, string>): CellDependency[] {
  const dependencies: CellDependency[] = [];
  const cellRefPattern = /([A-Z]+[0-9]+)/g;

  formulas.forEach((formula, cell) => {
    const refs = formula.match(cellRefPattern) || [];
    dependencies.push({
      cell,
      dependsOn: refs,
      usedBy: [],
    });
  });

  // Build reverse dependencies
  dependencies.forEach((dep) => {
    dep.dependsOn.forEach((ref) => {
      const refDep = dependencies.find((d) => d.cell === ref);
      if (refDep) {
        refDep.usedBy.push(dep.cell);
      }
    });
  });

  return dependencies;
}

// ===== NAMED RANGES =====
export interface NamedRangeDefinition {
  name: string;
  range: string;
  description?: string;
}

export function parseNamedRange(range: string): { startRow: number; startCol: number; endRow: number; endCol: number } | null {
  // Parse range like "A1:B10"
  const match = range.match(/([A-Z]+)([0-9]+):([A-Z]+)([0-9]+)/);
  if (!match) return null;

  const colToIndex = (col: string) => {
    let index = 0;
    for (let i = 0; i < col.length; i++) {
      index = index * 26 + (col.charCodeAt(i) - 64);
    }
    return index - 1;
  };

  return {
    startRow: parseInt(match[2]) - 1,
    startCol: colToIndex(match[1]),
    endRow: parseInt(match[4]) - 1,
    endCol: colToIndex(match[3]),
  };
}

// ===== FILTERING & SORTING =====
export interface FilterCondition {
  column: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  value2?: any; // For 'between'
}

export function applyFilters(data: any[][], headers: string[], filters: FilterCondition[]): any[][] {
  return data.filter((row) => {
    return filters.every((filter) => {
      const colIndex = headers.indexOf(filter.column);
      if (colIndex === -1) return true;

      const cellValue = row[colIndex];

      switch (filter.operator) {
        case 'equals':
          return cellValue === filter.value;
        case 'contains':
          return String(cellValue).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'greaterThan':
          return cellValue > filter.value;
        case 'lessThan':
          return cellValue < filter.value;
        case 'between':
          return cellValue >= filter.value && cellValue <= filter.value2;
        default:
          return true;
      }
    });
  });
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export function applySorting(data: any[][], headers: string[], sortConfigs: SortConfig[]): any[][] {
  const sorted = [...data];

  sorted.sort((a, b) => {
    for (const config of sortConfigs) {
      const colIndex = headers.indexOf(config.column);
      if (colIndex === -1) continue;

      const aVal = a[colIndex];
      const bVal = b[colIndex];

      let comparison = 0;
      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      if (comparison !== 0) {
        return config.direction === 'asc' ? comparison : -comparison;
      }
    }
    return 0;
  });

  return sorted;
}

// ===== DATA IMPORT =====
export interface ImportConfig {
  delimiter?: string;
  hasHeaders?: boolean;
  encoding?: string;
  columnTypes?: Record<string, 'string' | 'number' | 'date' | 'boolean'>;
}

export function parseCSV(content: string, config: ImportConfig): { headers: string[]; data: any[][] } {
  const delimiter = config.delimiter || ',';
  const lines = content.split('\n').filter((line) => line.trim());

  let headers: string[] = [];
  let data: any[][] = [];

  if (config.hasHeaders && lines.length > 0) {
    headers = lines[0].split(delimiter).map((h) => h.trim());
    data = lines.slice(1).map((line) => line.split(delimiter).map((cell) => cell.trim()));
  } else {
    headers = lines[0]?.split(delimiter).map((_, i) => `Column ${i + 1}`) || [];
    data = lines.map((line) => line.split(delimiter).map((cell) => cell.trim()));
  }

  // Apply column type conversions
  if (config.columnTypes) {
    data = data.map((row) =>
      row.map((cell, i) => {
        const type = config.columnTypes?.[headers[i]];
        if (type === 'number') return Number(cell) || 0;
        if (type === 'boolean') return cell.toLowerCase() === 'true';
        if (type === 'date') return new Date(cell);
        return cell;
      })
    );
  }

  return { headers, data };
}

// ===== VERSION DIFF =====
export interface CellDiff {
  row: number;
  col: number;
  oldValue: any;
  newValue: any;
  type: 'added' | 'removed' | 'modified';
}

export function computeDiff(oldData: any[][], newData: any[][]): CellDiff[] {
  const diffs: CellDiff[] = [];

  const maxRows = Math.max(oldData.length, newData.length);
  const maxCols = Math.max(
    oldData[0]?.length || 0,
    newData[0]?.length || 0
  );

  for (let row = 0; row < maxRows; row++) {
    for (let col = 0; col < maxCols; col++) {
      const oldValue = oldData[row]?.[col];
      const newValue = newData[row]?.[col];

      if (oldValue !== newValue) {
        if (oldValue === undefined) {
          diffs.push({ row, col, oldValue, newValue, type: 'added' });
        } else if (newValue === undefined) {
          diffs.push({ row, col, oldValue, newValue, type: 'removed' });
        } else {
          diffs.push({ row, col, oldValue, newValue, type: 'modified' });
        }
      }
    }
  }

  return diffs;
}
