import type { WorkbookData } from './excelProcessor';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  data: WorkbookData;
}

/**
 * Empty spreadsheet template
 */
export const emptyTemplate: Template = {
  id: 'empty',
  name: 'Blank Spreadsheet',
  description: 'Start with an empty spreadsheet',
  category: 'Basic',
  data: {
    sheets: [
      {
        name: 'Sheet1',
        data: [[]],
      },
    ],
    sheetNames: ['Sheet1'],
  },
};

/**
 * Budget tracker template
 */
export const budgetTemplate: Template = {
  id: 'budget',
  name: 'Monthly Budget Tracker',
  description: 'Track income and expenses by category',
  category: 'Finance',
  data: {
    sheets: [
      {
        name: 'Budget',
        data: [
          ['Monthly Budget Tracker', '', '', ''],
          ['', '', '', ''],
          ['Category', 'Budgeted', 'Actual', 'Difference'],
          ['Income', '', '', ''],
          ['Salary', 0, 0, '=C5-B5'],
          ['Freelance', 0, 0, '=C6-B6'],
          ['Other Income', 0, 0, '=C7-B7'],
          ['Total Income', '=SUM(B5:B7)', '=SUM(C5:C7)', '=C8-B8'],
          ['', '', '', ''],
          ['Expenses', '', '', ''],
          ['Housing', 0, 0, '=C11-B11'],
          ['Transportation', 0, 0, '=C12-B12'],
          ['Food', 0, 0, '=C13-B13'],
          ['Utilities', 0, 0, '=C14-B14'],
          ['Insurance', 0, 0, '=C15-B15'],
          ['Entertainment', 0, 0, '=C16-B16'],
          ['Savings', 0, 0, '=C17-B17'],
          ['Other Expenses', 0, 0, '=C18-B18'],
          ['Total Expenses', '=SUM(B11:B18)', '=SUM(C11:C18)', '=C19-B19'],
          ['', '', '', ''],
          ['Net Income', '=B8-B19', '=C8-C19', '=C21-B21'],
        ],
      },
    ],
    sheetNames: ['Budget'],
  },
};

/**
 * Financial statement template (simplified P&L)
 */
export const profitLossTemplate: Template = {
  id: 'profit-loss',
  name: 'Profit & Loss Statement',
  description: 'Income statement for financial reporting',
  category: 'Finance',
  data: {
    sheets: [
      {
        name: 'P&L',
        data: [
          ['Profit & Loss Statement', '', '', ''],
          ['Period:', 'Q1 2025', '', ''],
          ['', '', '', ''],
          ['Revenue', '', '', ''],
          ['Product Sales', 0, '', ''],
          ['Service Revenue', 0, '', ''],
          ['Other Revenue', 0, '', ''],
          ['Total Revenue', '=SUM(B5:B7)', '', ''],
          ['', '', '', ''],
          ['Cost of Goods Sold', '', '', ''],
          ['Direct Materials', 0, '', ''],
          ['Direct Labor', 0, '', ''],
          ['Manufacturing Overhead', 0, '', ''],
          ['Total COGS', '=SUM(B11:B13)', '', ''],
          ['', '', '', ''],
          ['Gross Profit', '=B8-B14', '', ''],
          ['Gross Margin %', '=B16/B8', '', ''],
          ['', '', '', ''],
          ['Operating Expenses', '', '', ''],
          ['Sales & Marketing', 0, '', ''],
          ['Research & Development', 0, '', ''],
          ['General & Administrative', 0, '', ''],
          ['Total Operating Expenses', '=SUM(B20:B22)', '', ''],
          ['', '', '', ''],
          ['Operating Income (EBIT)', '=B16-B23', '', ''],
          ['Operating Margin %', '=B25/B8', '', ''],
          ['', '', '', ''],
          ['Other Income/Expenses', '', '', ''],
          ['Interest Income', 0, '', ''],
          ['Interest Expense', 0, '', ''],
          ['Other', 0, '', ''],
          ['Total Other', '=SUM(B29:B31)', '', ''],
          ['', '', '', ''],
          ['Net Income Before Tax', '=B25+B32', '', ''],
          ['Income Tax', '=B34*0.21', '', ''],
          ['Net Income', '=B34-B35', '', ''],
          ['Net Margin %', '=B36/B8', '', ''],
        ],
      },
    ],
    sheetNames: ['P&L'],
  },
};

/**
 * DCF (Discounted Cash Flow) template
 */
export const dcfTemplate: Template = {
  id: 'dcf',
  name: 'DCF Valuation Model',
  description: 'Discounted cash flow analysis for company valuation',
  category: 'Finance',
  data: {
    sheets: [
      {
        name: 'DCF Model',
        data: [
          ['DCF Valuation Model', '', '', '', '', ''],
          ['', '', '', '', '', ''],
          ['Assumptions', '', '', '', '', ''],
          ['Discount Rate (WACC)', 0.10, '', '', '', ''],
          ['Terminal Growth Rate', 0.03, '', '', '', ''],
          ['', '', '', '', '', ''],
          ['Projections', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
          ['Revenue', 1000000, 1100000, 1210000, 1331000, 1464100],
          ['Revenue Growth %', 0.10, 0.10, 0.10, 0.10, 0.10],
          ['', '', '', '', '', ''],
          ['EBITDA', 200000, 220000, 242000, 266200, 292820],
          ['EBITDA Margin %', '=B11/B8', '=C11/C8', '=D11/D8', '=E11/E8', '=F11/F8'],
          ['', '', '', '', '', ''],
          ['Less: D&A', 50000, 55000, 60500, 66550, 73205],
          ['EBIT', '=B11-B14', '=C11-C14', '=D11-D14', '=E11-E14', '=F11-F14'],
          ['Less: Taxes (21%)', '=B15*0.21', '=C15*0.21', '=D15*0.21', '=E15*0.21', '=F15*0.21'],
          ['NOPAT', '=B15-B16', '=C15-C16', '=D15-D16', '=E15-E16', '=F15-F16'],
          ['Add: D&A', '=B14', '=C14', '=D14', '=E14', '=F14'],
          ['Less: CapEx', 60000, 66000, 72600, 79860, 87846],
          ['Less: Change in NWC', 10000, 11000, 12100, 13310, 14641],
          ['Free Cash Flow', '=B17+B18-B19-B20', '=C17+C18-C19-C20', '=D17+D18-D19-D20', '=E17+E18-E19-E20', '=F17+F18-F19-F20'],
          ['', '', '', '', '', ''],
          ['Discount Period', 1, 2, 3, 4, 5],
          ['Discount Factor', '=1/(1+$B$4)^B23', '=1/(1+$B$4)^C23', '=1/(1+$B$4)^D23', '=1/(1+$B$4)^E23', '=1/(1+$B$4)^F23'],
          ['PV of FCF', '=B21*B24', '=C21*C24', '=D21*D24', '=E21*E24', '=F21*F24'],
          ['', '', '', '', '', ''],
          ['Sum of PV of FCF', '=SUM(B25:F25)', '', '', '', ''],
          ['', '', '', '', '', ''],
          ['Terminal Value', '=F21*(1+$B$5)/($B$4-$B$5)', '', '', '', ''],
          ['PV of Terminal Value', '=B29*F24', '', '', '', ''],
          ['', '', '', '', '', ''],
          ['Enterprise Value', '=B27+B30', '', '', '', ''],
          ['Less: Net Debt', 0, '', '', '', ''],
          ['Equity Value', '=B32-B33', '', '', '', ''],
        ],
      },
    ],
    sheetNames: ['DCF Model'],
  },
};

/**
 * Data analysis template
 */
export const dataAnalysisTemplate: Template = {
  id: 'data-analysis',
  name: 'Data Analysis Template',
  description: 'Template for data cleaning and analysis',
  category: 'Analytics',
  data: {
    sheets: [
      {
        name: 'Raw Data',
        data: [
          ['ID', 'Name', 'Category', 'Value', 'Date'],
          [1, 'Item A', 'Category 1', 100, '2025-01-01'],
          [2, 'Item B', 'Category 2', 150, '2025-01-02'],
          [3, 'Item C', 'Category 1', 200, '2025-01-03'],
          [4, 'Item D', 'Category 3', 120, '2025-01-04'],
          [5, 'Item E', 'Category 2', 180, '2025-01-05'],
        ],
      },
      {
        name: 'Summary',
        data: [
          ['Data Summary', '', ''],
          ['', '', ''],
          ['Total Records', '=COUNTA(\'Raw Data\'!A:A)-1', ''],
          ['Total Value', '=SUM(\'Raw Data\'!D:D)', ''],
          ['Average Value', '=AVERAGE(\'Raw Data\'!D:D)', ''],
          ['Min Value', '=MIN(\'Raw Data\'!D:D)', ''],
          ['Max Value', '=MAX(\'Raw Data\'!D:D)', ''],
        ],
      },
    ],
    sheetNames: ['Raw Data', 'Summary'],
  },
};

/**
 * Get all available templates
 */
export function getAllTemplates(): Template[] {
  return [
    emptyTemplate,
    budgetTemplate,
    profitLossTemplate,
    dcfTemplate,
    dataAnalysisTemplate,
  ];
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return getAllTemplates().find(t => t.id === id);
}
