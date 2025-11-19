// @ts-ignore - no types available for hot-formula-parser
import * as HotFormulaParser from 'hot-formula-parser';

const FormulaParser = (HotFormulaParser as any).Parser;

export interface CellData {
  value: string | number | boolean | null;
  formula?: string;
}

export interface SheetData {
  [cellAddress: string]: CellData;
}

export class FormulaEngine {
  private parser: any;
  private sheetData: SheetData;
  private calculationOrder: string[] = [];
  private dependencies: Map<string, Set<string>> = new Map();

  constructor(initialData: SheetData = {}) {
    this.parser = new FormulaParser();
    this.sheetData = initialData;
    this.setupCustomFunctions();
    this.buildDependencyGraph();
  }

  private setupCustomFunctions() {
    // Add custom functions if needed
    // this.parser.setFunction('CUSTOM', (params) => { ... });
  }

  private buildDependencyGraph() {
    this.dependencies.clear();
    this.calculationOrder = [];

    // Build dependency map
    for (const [cellAddress, cellData] of Object.entries(this.sheetData)) {
      if (cellData.formula) {
        const refs = this.extractCellReferences(cellData.formula);
        refs.forEach(ref => {
          if (!this.dependencies.has(ref)) {
            this.dependencies.set(ref, new Set());
          }
          this.dependencies.get(ref)!.add(cellAddress);
        });
      }
    }

    // Topological sort for calculation order
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (cell: string): boolean => {
      if (temp.has(cell)) {
        // Circular reference detected
        return false;
      }
      if (visited.has(cell)) {
        return true;
      }

      temp.add(cell);

      const cellData = this.sheetData[cell];
      if (cellData?.formula) {
        const refs = this.extractCellReferences(cellData.formula);
        for (const ref of refs) {
          if (!visit(ref)) {
            return false;
          }
        }
      }

      temp.delete(cell);
      visited.add(cell);
      this.calculationOrder.push(cell);
      return true;
    };

    for (const cell of Object.keys(this.sheetData)) {
      if (!visited.has(cell)) {
        if (!visit(cell)) {
          console.warn(`Circular reference detected involving cell ${cell}`);
        }
      }
    }
  }

  private extractCellReferences(formula: string): string[] {
    const refs: string[] = [];
    // Match cell references like A1, $A$1, Sheet1!A1
    const pattern = /(?:([A-Z]+[0-9]+)|(\$?[A-Z]+\$?[0-9]+)|([A-Z_][A-Z0-9_]*![A-Z]+[0-9]+))/gi;
    let match;
    while ((match = pattern.exec(formula)) !== null) {
      refs.push(match[0].toUpperCase());
    }
    return refs;
  }

  public setCellValue(cellAddress: string, value: string | number | boolean | null, formula?: string) {
    this.sheetData[cellAddress] = { value, formula };
    if (formula) {
      this.buildDependencyGraph();
      this.recalculate();
    }
  }

  public setCellFormula(cellAddress: string, formula: string) {
    // Ensure formula starts with =
    const cleanFormula = formula.startsWith('=') ? formula.substring(1) : formula;
    this.sheetData[cellAddress] = { value: null, formula: cleanFormula };
    this.buildDependencyGraph();
    this.recalculate();
  }

  public getCellValue(cellAddress: string): string | number | boolean | null {
    const cell = this.sheetData[cellAddress];
    return cell ? cell.value : null;
  }

  public getCellFormula(cellAddress: string): string | undefined {
    return this.sheetData[cellAddress]?.formula;
  }

  public recalculate() {
    // Calculate in dependency order
    for (const cellAddress of this.calculationOrder) {
      const cellData = this.sheetData[cellAddress];
      if (cellData?.formula) {
        try {
          const result = this.evaluateFormula(cellData.formula, cellAddress);
          cellData.value = result;
        } catch (error) {
          console.error(`Error calculating ${cellAddress}:`, error);
          cellData.value = '#ERROR!';
        }
      }
    }
  }

  private evaluateFormula(formula: string, currentCell: string): string | number | boolean {
    // Set up cell reference resolver
    this.parser.on('callCellValue', (cellCoord: any, done: any) => {
      const cellAddress = this.coordToAddress(cellCoord.row.index, cellCoord.column.index);
      const value = this.getCellValue(cellAddress);
      done(value);
    });

    this.parser.on('callRangeValue', (startCellCoord: any, endCellCoord: any, done: any) => {
      const values: any[][] = [];
      for (let row = startCellCoord.row.index; row <= endCellCoord.row.index; row++) {
        const rowValues: any[] = [];
        for (let col = startCellCoord.column.index; col <= endCellCoord.column.index; col++) {
          const cellAddress = this.coordToAddress(row, col);
          rowValues.push(this.getCellValue(cellAddress));
        }
        values.push(rowValues);
      }
      done(values);
    });

    const result = this.parser.parse(formula);

    if (result.error) {
      return this.formatError(result.error);
    }

    return result.result;
  }

  private coordToAddress(row: number, col: number): string {
    const colName = this.numberToColumn(col);
    return `${colName}${row + 1}`;
  }

  private numberToColumn(num: number): string {
    let column = '';
    while (num >= 0) {
      column = String.fromCharCode((num % 26) + 65) + column;
      num = Math.floor(num / 26) - 1;
    }
    return column;
  }

  private formatError(error: string): string {
    const errorMap: { [key: string]: string } = {
      '#DIV/0!': '#DIV/0!',
      '#N/A': '#N/A',
      '#NAME?': '#NAME?',
      '#NULL!': '#NULL!',
      '#NUM!': '#NUM!',
      '#REF!': '#REF!',
      '#VALUE!': '#VALUE!',
    };
    return errorMap[error] || '#ERROR!';
  }

  public getAllCells(): SheetData {
    return { ...this.sheetData };
  }

  public clearCell(cellAddress: string) {
    delete this.sheetData[cellAddress];
    this.buildDependencyGraph();
    this.recalculate();
  }

  public clearAll() {
    this.sheetData = {};
    this.dependencies.clear();
    this.calculationOrder = [];
  }

  // Utility function to parse cell address
  public static parseCellAddress(address: string): { col: number; row: number } | null {
    const match = address.match(/^([A-Z]+)([0-9]+)$/);
    if (!match) return null;

    const colStr = match[1];
    const rowStr = match[2];

    let col = 0;
    for (let i = 0; i < colStr.length; i++) {
      col = col * 26 + (colStr.charCodeAt(i) - 64);
    }

    return {
      col: col - 1,
      row: parseInt(rowStr) - 1,
    };
  }
}
