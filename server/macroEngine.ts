export type MacroActionType =
  | 'cell_edit'
  | 'formula_insert'
  | 'format_apply'
  | 'row_insert'
  | 'column_insert'
  | 'row_delete'
  | 'column_delete';

export interface MacroAction {
  type: MacroActionType;
  timestamp: number;
  data: {
    cellRef?: string;
    value?: any;
    formula?: string;
    format?: Record<string, any>;
    index?: number;
    count?: number;
  };
}

export interface MacroDefinition {
  name: string;
  description?: string;
  actions: MacroAction[];
}

/**
 * Execute a macro on spreadsheet data
 */
export async function executeMacro(
  macro: MacroDefinition,
  spreadsheetData: any
): Promise<{ success: boolean; modifiedData: any; log: string[] }> {
  const log: string[] = [];
  let modifiedData = JSON.parse(JSON.stringify(spreadsheetData)); // Deep clone

  try {
    for (const action of macro.actions) {
      switch (action.type) {
        case 'cell_edit':
          if (action.data.cellRef && action.data.value !== undefined) {
            log.push(`Editing cell ${action.data.cellRef} to "${action.data.value}"`);
            // Apply cell edit logic here
            // This would modify modifiedData based on cellRef
          }
          break;

        case 'formula_insert':
          if (action.data.cellRef && action.data.formula) {
            log.push(`Inserting formula ${action.data.formula} into ${action.data.cellRef}`);
            // Apply formula logic here
          }
          break;

        case 'format_apply':
          if (action.data.cellRef && action.data.format) {
            log.push(`Applying format to ${action.data.cellRef}`);
            // Apply formatting logic here
          }
          break;

        case 'row_insert':
          if (action.data.index !== undefined) {
            log.push(`Inserting row at index ${action.data.index}`);
            // Insert row logic here
          }
          break;

        case 'column_insert':
          if (action.data.index !== undefined) {
            log.push(`Inserting column at index ${action.data.index}`);
            // Insert column logic here
          }
          break;

        case 'row_delete':
          if (action.data.index !== undefined) {
            log.push(`Deleting row at index ${action.data.index}`);
            // Delete row logic here
          }
          break;

        case 'column_delete':
          if (action.data.index !== undefined) {
            log.push(`Deleting column at index ${action.data.index}`);
            // Delete column logic here
          }
          break;

        default:
          log.push(`Unknown action type: ${action.type}`);
      }
    }

    return {
      success: true,
      modifiedData,
      log,
    };
  } catch (error) {
    log.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      modifiedData: spreadsheetData,
      log,
    };
  }
}

/**
 * Validate macro definition
 */
export function validateMacro(macro: MacroDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!macro.name || macro.name.trim().length === 0) {
    errors.push('Macro name is required');
  }

  if (!macro.actions || macro.actions.length === 0) {
    errors.push('Macro must have at least one action');
  }

  for (let i = 0; i < macro.actions.length; i++) {
    const action = macro.actions[i];
    if (!action.type) {
      errors.push(`Action ${i + 1} is missing type`);
    }
    if (!action.data) {
      errors.push(`Action ${i + 1} is missing data`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate macro from action history
 */
export function generateMacro(
  name: string,
  description: string,
  actions: MacroAction[]
): MacroDefinition {
  return {
    name,
    description,
    actions: actions.map((action) => ({
      ...action,
      timestamp: Date.now(),
    })),
  };
}
