import { invokeLLM } from './_core/llm';

export interface FormulaSuggestion {
  formula: string;
  description: string;
  category: string;
  example: string;
  confidence: number;
}

/**
 * Common Excel formulas library
 */
export const FORMULA_LIBRARY: FormulaSuggestion[] = [
  {
    formula: 'SUM',
    description: 'Adds all numbers in a range',
    category: 'Math',
    example: '=SUM(A1:A10)',
    confidence: 1.0,
  },
  {
    formula: 'AVERAGE',
    description: 'Calculates the average of numbers',
    category: 'Statistical',
    example: '=AVERAGE(B1:B20)',
    confidence: 1.0,
  },
  {
    formula: 'IF',
    description: 'Returns one value if condition is true, another if false',
    category: 'Logical',
    example: '=IF(A1>10,"High","Low")',
    confidence: 1.0,
  },
  {
    formula: 'VLOOKUP',
    description: 'Looks up a value in a table by matching on the first column',
    category: 'Lookup',
    example: '=VLOOKUP(A2,B:D,3,FALSE)',
    confidence: 1.0,
  },
  {
    formula: 'INDEX',
    description: 'Returns a value from a table based on row and column numbers',
    category: 'Lookup',
    example: '=INDEX(A1:C10,2,3)',
    confidence: 1.0,
  },
  {
    formula: 'MATCH',
    description: 'Returns the position of a value in a range',
    category: 'Lookup',
    example: '=MATCH("Apple",A1:A10,0)',
    confidence: 1.0,
  },
  {
    formula: 'COUNTIF',
    description: 'Counts cells that meet a criteria',
    category: 'Statistical',
    example: '=COUNTIF(A1:A10,">5")',
    confidence: 1.0,
  },
  {
    formula: 'SUMIF',
    description: 'Sums cells that meet a criteria',
    category: 'Math',
    example: '=SUMIF(A1:A10,">5",B1:B10)',
    confidence: 1.0,
  },
  {
    formula: 'CONCATENATE',
    description: 'Joins several text strings into one',
    category: 'Text',
    example: '=CONCATENATE(A1," ",B1)',
    confidence: 1.0,
  },
  {
    formula: 'LEFT',
    description: 'Returns the leftmost characters from a text value',
    category: 'Text',
    example: '=LEFT(A1,5)',
    confidence: 1.0,
  },
  {
    formula: 'RIGHT',
    description: 'Returns the rightmost characters from a text value',
    category: 'Text',
    example: '=RIGHT(A1,3)',
    confidence: 1.0,
  },
  {
    formula: 'MID',
    description: 'Returns characters from the middle of a text string',
    category: 'Text',
    example: '=MID(A1,2,5)',
    confidence: 1.0,
  },
  {
    formula: 'DATE',
    description: 'Creates a date from year, month, and day values',
    category: 'Date',
    example: '=DATE(2025,1,15)',
    confidence: 1.0,
  },
  {
    formula: 'TODAY',
    description: 'Returns the current date',
    category: 'Date',
    example: '=TODAY()',
    confidence: 1.0,
  },
  {
    formula: 'NOW',
    description: 'Returns the current date and time',
    category: 'Date',
    example: '=NOW()',
    confidence: 1.0,
  },
  {
    formula: 'MAX',
    description: 'Returns the largest value in a set',
    category: 'Statistical',
    example: '=MAX(A1:A10)',
    confidence: 1.0,
  },
  {
    formula: 'MIN',
    description: 'Returns the smallest value in a set',
    category: 'Statistical',
    example: '=MIN(A1:A10)',
    confidence: 1.0,
  },
  {
    formula: 'ROUND',
    description: 'Rounds a number to a specified number of digits',
    category: 'Math',
    example: '=ROUND(A1,2)',
    confidence: 1.0,
  },
  {
    formula: 'PMT',
    description: 'Calculates loan payment based on constant payments and interest rate',
    category: 'Financial',
    example: '=PMT(5%/12,60,10000)',
    confidence: 1.0,
  },
  {
    formula: 'NPV',
    description: 'Calculates net present value of an investment',
    category: 'Financial',
    example: '=NPV(10%,A1:A5)',
    confidence: 1.0,
  },
  {
    formula: 'IRR',
    description: 'Calculates internal rate of return',
    category: 'Financial',
    example: '=IRR(A1:A10)',
    confidence: 1.0,
  },
];

/**
 * Get formula suggestions based on user input
 */
export function getFormulaSuggestions(input: string): FormulaSuggestion[] {
  const query = input.toUpperCase().trim();
  
  if (!query) {
    // Return popular formulas
    return FORMULA_LIBRARY.slice(0, 5);
  }

  // Filter formulas that match the input
  const matches = FORMULA_LIBRARY.filter(
    (f) =>
      f.formula.startsWith(query) ||
      f.description.toUpperCase().includes(query) ||
      f.category.toUpperCase().includes(query)
  );

  return matches.slice(0, 10);
}

/**
 * Get AI-powered formula suggestions based on context
 */
export async function getAIFormulaSuggestions(
  context: {
    cellRef: string;
    nearbyData?: any[][];
    columnHeaders?: string[];
    userIntent?: string;
  }
): Promise<FormulaSuggestion[]> {
  try {
    const prompt = `You are an Excel formula expert. Based on the following context, suggest the 3 most relevant Excel formulas:

Cell: ${context.cellRef}
${context.columnHeaders ? `Column Headers: ${context.columnHeaders.join(', ')}` : ''}
${context.userIntent ? `User Intent: ${context.userIntent}` : ''}
${context.nearbyData ? `Nearby Data Sample: ${JSON.stringify(context.nearbyData.slice(0, 5))}` : ''}

Return a JSON array of formula suggestions with this structure:
[
  {
    "formula": "FORMULA_NAME",
    "description": "What this formula does",
    "category": "Category name",
    "example": "=FORMULA_NAME(A1:A10)",
    "confidence": 0.9
  }
]

Focus on practical, commonly-used formulas that fit the context.`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an Excel formula expert. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'formula_suggestions',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              suggestions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    formula: { type: 'string' },
                    description: { type: 'string' },
                    category: { type: 'string' },
                    example: { type: 'string' },
                    confidence: { type: 'number' },
                  },
                  required: ['formula', 'description', 'category', 'example', 'confidence'],
                  additionalProperties: false,
                },
              },
            },
            required: ['suggestions'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return [];
    }

    const result = JSON.parse(content);
    return result.suggestions || [];
  } catch (error) {
    console.error('Error getting AI formula suggestions:', error);
    return [];
  }
}

/**
 * Explain a formula in natural language
 */
export async function explainFormula(formula: string): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are an Excel expert. Explain formulas in simple, clear language.',
        },
        {
          role: 'user',
          content: `Explain this Excel formula in 1-2 sentences: ${formula}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    return typeof content === 'string' ? content : 'Unable to explain formula';
  } catch (error) {
    console.error('Error explaining formula:', error);
    return 'Unable to explain formula';
  }
}
