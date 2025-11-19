import { invokeLLM } from "./_core/llm";
import type { WorkbookData } from "./excelProcessor";

export interface AIResponse {
  message: string;
  actions?: Array<{
    type: 'update_cell' | 'add_formula' | 'format' | 'create_sheet' | 'clarify';
    sheet?: string;
    cell?: string;
    value?: any;
    formula?: string;
    description?: string;
  }>;
  needsClarification?: boolean;
  clarifyingQuestion?: string;
}

/**
 * System prompt for the Excel AI Agent
 */
const SYSTEM_PROMPT = `You are an expert Excel AI agent designed to help users with spreadsheet automation, financial modeling, and data processing.

Your capabilities include:
1. Understanding natural language requests about Excel operations
2. Generating Excel formulas dynamically
3. Cleaning and processing data
4. Creating financial models (DCF, three-statement models, pro forma)
5. Applying professional formatting
6. Never overwriting existing data unless explicitly requested

When responding:
- Be accurate and precise with formulas
- Use formula-driven outputs instead of hard-coded values
- Apply professional formatting standards
- Ask clarifying questions when the request is ambiguous
- Explain what you're doing in clear, simple terms
- Never overwrite existing data without confirmation

You must respond in JSON format with this structure:
{
  "message": "Your explanation of what you're doing",
  "actions": [
    {
      "type": "update_cell" | "add_formula" | "format" | "create_sheet" | "clarify",
      "sheet": "Sheet name",
      "cell": "A1",
      "value": "value or formula",
      "description": "What this action does"
    }
  ],
  "needsClarification": false,
  "clarifyingQuestion": "Optional question if you need more info"
}`;

/**
 * Process user command with AI and return structured response
 */
export async function processUserCommand(
  userMessage: string,
  spreadsheetData: WorkbookData | null,
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): Promise<AIResponse> {
  try {
    // Build context about the spreadsheet
    let spreadsheetContext = '';
    if (spreadsheetData) {
      spreadsheetContext = `\n\nCurrent spreadsheet structure:\n`;
      spreadsheetContext += `Sheets: ${spreadsheetData.sheetNames.join(', ')}\n`;
      
      for (const sheet of spreadsheetData.sheets) {
        spreadsheetContext += `\nSheet "${sheet.name}":\n`;
        spreadsheetContext += `- Range: ${sheet.range || 'Empty'}\n`;
        spreadsheetContext += `- Rows: ${sheet.data.length}\n`;
        
        // Include first few rows as sample
        if (sheet.data.length > 0) {
          spreadsheetContext += `- Sample data (first 5 rows):\n`;
          const sampleRows = sheet.data.slice(0, 5);
          spreadsheetContext += JSON.stringify(sampleRows, null, 2);
        }
      }
    } else {
      spreadsheetContext = '\n\nNo spreadsheet loaded. User wants to create a new one.';
    }

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...conversationHistory,
      { 
        role: 'user' as const, 
        content: `${userMessage}\n${spreadsheetContext}` 
      },
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "excel_agent_response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              message: { 
                type: "string", 
                description: "Explanation of what the agent is doing" 
              },
              actions: {
                type: "array",
                description: "List of actions to perform on the spreadsheet",
                items: {
                  type: "object",
                  properties: {
                    type: { 
                      type: "string",
                      enum: ["update_cell", "add_formula", "format", "create_sheet", "clarify"]
                    },
                    sheet: { type: "string" },
                    cell: { type: "string" },
                    value: { type: "string" },
                    formula: { type: "string" },
                    description: { type: "string" }
                  },
                  required: ["type", "description"],
                  additionalProperties: false
                }
              },
              needsClarification: { 
                type: "boolean",
                description: "Whether the agent needs more information" 
              },
              clarifyingQuestion: { 
                type: "string",
                description: "Question to ask the user if clarification is needed"
              }
            },
            required: ["message", "needsClarification"],
            additionalProperties: false
          }
        }
      }
    });

    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent || typeof messageContent !== 'string') {
      throw new Error('No response from AI');
    }

    const aiResponse: AIResponse = JSON.parse(messageContent);
    return aiResponse;
    
  } catch (error) {
    console.error('Error processing user command:', error);
    return {
      message: `I encountered an error processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
      needsClarification: false,
    };
  }
}

/**
 * Generate a summary of changes for checkpoint description
 */
export function generateCheckpointDescription(actions: AIResponse['actions']): string {
  if (!actions || actions.length === 0) {
    return 'No changes made';
  }
  
  const actionTypes = actions.map(a => a.type);
  const uniqueTypes = Array.from(new Set(actionTypes));
  
  const descriptions: string[] = [];
  for (const type of uniqueTypes) {
    const count = actionTypes.filter(t => t === type).length;
    switch (type) {
      case 'update_cell':
        descriptions.push(`Updated ${count} cell${count > 1 ? 's' : ''}`);
        break;
      case 'add_formula':
        descriptions.push(`Added ${count} formula${count > 1 ? 's' : ''}`);
        break;
      case 'format':
        descriptions.push(`Applied ${count} formatting change${count > 1 ? 's' : ''}`);
        break;
      case 'create_sheet':
        descriptions.push(`Created ${count} new sheet${count > 1 ? 's' : ''}`);
        break;
    }
  }
  
  return descriptions.join(', ');
}
