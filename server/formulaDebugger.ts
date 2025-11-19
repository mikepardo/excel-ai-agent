/**
 * AI Formula Debugger
 * Analyzes formulas for errors and provides intelligent fix suggestions
 */

import { invokeLLM } from './_core/llm';

export interface FormulaError {
  type: 'syntax' | 'reference' | 'circular' | 'type' | 'logic';
  message: string;
  position?: number;
  suggestion?: string;
}

export interface FormulaDependency {
  cell: string;
  formula: string;
  dependencies: string[];
  dependents: string[];
}

/**
 * Parse and analyze formula
 */
export function analyzeFormula(formula: string, cellRef: string): {
  isValid: boolean;
  errors: FormulaError[];
  dependencies: string[];
} {
  const errors: FormulaError[] = [];
  const dependencies: string[] = [];

  if (!formula || !formula.startsWith('=')) {
    return { isValid: true, errors: [], dependencies: [] };
  }

  // Remove leading =
  const formulaBody = formula.slice(1);

  // Check for basic syntax errors
  const parentheses = checkParentheses(formulaBody);
  if (!parentheses.balanced) {
    errors.push({
      type: 'syntax',
      message: `Unbalanced parentheses: ${parentheses.open} opening, ${parentheses.close} closing`,
      suggestion: 'Add or remove parentheses to balance the formula',
    });
  }

  // Extract cell references
  const cellPattern = /\b([A-Z]+[0-9]+)\b/g;
  let match;
  while ((match = cellPattern.exec(formulaBody)) !== null) {
    dependencies.push(match[1]);
  }

  // Check for common function errors
  const functionPattern = /\b([A-Z]+)\s*\(/g;
  const functions: string[] = [];
  while ((match = functionPattern.exec(formulaBody)) !== null) {
    functions.push(match[1]);
  }

  functions.forEach((func) => {
    if (!isValidFunction(func)) {
      errors.push({
        type: 'reference',
        message: `Unknown function: ${func}`,
        suggestion: `Did you mean ${suggestFunction(func)}?`,
      });
    }
  });

  // Check for circular references
  if (dependencies.includes(cellRef)) {
    errors.push({
      type: 'circular',
      message: `Circular reference detected: ${cellRef} references itself`,
      suggestion: 'Remove the self-reference or restructure the formula',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    dependencies,
  };
}

/**
 * Check parentheses balance
 */
function checkParentheses(formula: string): { balanced: boolean; open: number; close: number } {
  let open = 0;
  let close = 0;

  for (const char of formula) {
    if (char === '(') open++;
    if (char === ')') close++;
  }

  return { balanced: open === close, open, close };
}

/**
 * Check if function name is valid
 */
function isValidFunction(name: string): boolean {
  const validFunctions = [
    'SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'IF', 'VLOOKUP', 'HLOOKUP',
    'INDEX', 'MATCH', 'SUMIF', 'COUNTIF', 'AVERAGEIF', 'ROUND', 'ROUNDUP',
    'ROUNDDOWN', 'ABS', 'SQRT', 'POWER', 'MOD', 'CONCATENATE', 'LEFT',
    'RIGHT', 'MID', 'LEN', 'TRIM', 'UPPER', 'LOWER', 'PROPER', 'DATE',
    'TODAY', 'NOW', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND',
    'PMT', 'FV', 'PV', 'RATE', 'NPER', 'IRR', 'NPV', 'AND', 'OR', 'NOT',
    'IFERROR', 'ISBLANK', 'ISERROR', 'ISNUMBER', 'ISTEXT',
  ];

  return validFunctions.includes(name.toUpperCase());
}

/**
 * Suggest similar function name
 */
function suggestFunction(name: string): string {
  const suggestions: Record<string, string> = {
    'AVG': 'AVERAGE',
    'CNT': 'COUNT',
    'CONCAT': 'CONCATENATE',
    'VLOOK': 'VLOOKUP',
    'HLOOK': 'HLOOKUP',
  };

  return suggestions[name.toUpperCase()] || 'SUM';
}

/**
 * Build dependency graph
 */
export function buildDependencyGraph(
  cells: Record<string, string>
): Map<string, FormulaDependency> {
  const graph = new Map<string, FormulaDependency>();

  // First pass: extract all dependencies
  Object.entries(cells).forEach(([cell, formula]) => {
    const analysis = analyzeFormula(formula, cell);
    graph.set(cell, {
      cell,
      formula,
      dependencies: analysis.dependencies,
      dependents: [],
    });
  });

  // Second pass: build dependents
  graph.forEach((node) => {
    node.dependencies.forEach((dep) => {
      const depNode = graph.get(dep);
      if (depNode) {
        depNode.dependents.push(node.cell);
      }
    });
  });

  return graph;
}

/**
 * Detect circular references
 */
export function detectCircularReferences(
  graph: Map<string, FormulaDependency>
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(cell: string, path: string[]): void {
    visited.add(cell);
    recursionStack.add(cell);
    path.push(cell);

    const node = graph.get(cell);
    if (node) {
      for (const dep of node.dependencies) {
        if (!visited.has(dep)) {
          dfs(dep, [...path]);
        } else if (recursionStack.has(dep)) {
          // Found a cycle
          const cycleStart = path.indexOf(dep);
          cycles.push(path.slice(cycleStart));
        }
      }
    }

    recursionStack.delete(cell);
  }

  graph.forEach((_, cell) => {
    if (!visited.has(cell)) {
      dfs(cell, []);
    }
  });

  return cycles;
}

/**
 * Get AI-powered formula fix suggestions
 */
export async function getFormulaFixSuggestions(
  formula: string,
  error: string,
  context?: any
): Promise<string[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an Excel formula expert. Provide specific, actionable fixes for formula errors.',
        },
        {
          role: 'user',
          content: `This Excel formula has an error:\n\nFormula: ${formula}\nError: ${error}\n\nProvide 3 specific ways to fix this formula. Be concise and practical.`,
        },
      ],
    });

    const aiContent = response.choices[0]?.message?.content || '';
    const content = typeof aiContent === 'string' ? aiContent : '';
    const suggestions = content
      .split('\n')
      .filter((l: string) => l.trim().length > 10)
      .map((l: string) => l.replace(/^[-*•0-9.]\s*/, '').trim())
      .slice(0, 3);

    return suggestions.length > 0
      ? suggestions
      : ['Check parentheses balance', 'Verify cell references', 'Review function syntax'];
  } catch (error) {
    return ['Check parentheses balance', 'Verify cell references', 'Review function syntax'];
  }
}

/**
 * Explain formula step-by-step
 */
export async function explainFormula(formula: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an Excel expert explaining formulas to beginners.',
        },
        {
          role: 'user',
          content: `Explain this Excel formula step-by-step in simple terms:\n\n${formula}\n\nBreak down what each part does and how they work together.`,
        },
      ],
    });

    const aiContent = response.choices[0]?.message?.content || '';
    return typeof aiContent === 'string' ? aiContent : 'Formula explanation unavailable';
  } catch (error) {
    return 'Formula explanation unavailable';
  }
}

/**
 * Trace formula execution
 */
export interface ExecutionStep {
  step: number;
  expression: string;
  result: any;
  description: string;
}

export function traceFormulaExecution(
  formula: string,
  cellValues: Record<string, any>
): ExecutionStep[] {
  const steps: ExecutionStep[] = [];

  if (!formula || !formula.startsWith('=')) {
    return steps;
  }

  let currentFormula = formula.slice(1);
  let stepNum = 1;

  // Replace cell references with values
  const cellPattern = /\b([A-Z]+[0-9]+)\b/g;
  const matches = currentFormula.match(cellPattern) || [];

  matches.forEach((cellRef) => {
    const value = cellValues[cellRef] ?? 0;
    steps.push({
      step: stepNum++,
      expression: `${cellRef} = ${value}`,
      result: value,
      description: `Replace ${cellRef} with its value`,
    });
    currentFormula = currentFormula.replace(cellRef, String(value));
  });

  // Add final evaluation step
  try {
    steps.push({
      step: stepNum,
      expression: currentFormula,
      result: 'Calculated result',
      description: 'Evaluate the final expression',
    });
  } catch (error) {
    steps.push({
      step: stepNum,
      expression: currentFormula,
      result: 'Error',
      description: 'Formula evaluation failed',
    });
  }

  return steps;
}
