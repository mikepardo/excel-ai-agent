/**
 * AI-Powered Data Insights Engine
 * Analyzes spreadsheet data for anomalies, trends, and actionable insights
 */

import { invokeLLM } from './_core/llm';

export interface DataInsight {
  id: string;
  type: 'anomaly' | 'trend' | 'forecast' | 'recommendation';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedCells: string[];
  suggestedActions: string[];
  confidence: number;
}

/**
 * Analyze spreadsheet data for insights
 */
export async function analyzeSpreadsheetData(data: any): Promise<DataInsight[]> {
  const insights: DataInsight[] = [];

  // Extract numeric data for analysis
  const numericData = extractNumericData(data);

  // Run various analysis algorithms
  insights.push(...detectAnomalies(numericData));
  insights.push(...analyzeTrends(numericData));
  insights.push(...generateForecasts(numericData));

  // Use AI to generate additional insights
  const aiInsights = await generateAIInsights(data);
  insights.push(...aiInsights);

  return insights.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

/**
 * Extract numeric data from spreadsheet
 */
function extractNumericData(data: any): Array<{ row: number; col: number; value: number }> {
  const numeric: Array<{ row: number; col: number; value: number }> = [];

  if (!data || !Array.isArray(data)) return numeric;

  data.forEach((row: any[], rowIndex: number) => {
    if (!Array.isArray(row)) return;
    row.forEach((cell: any, colIndex: number) => {
      const value = typeof cell === 'object' ? cell?.value : cell;
      if (typeof value === 'number' && !isNaN(value)) {
        numeric.push({ row: rowIndex, col: colIndex, value });
      }
    });
  });

  return numeric;
}

/**
 * Detect anomalies using statistical methods
 */
function detectAnomalies(data: Array<{ row: number; col: number; value: number }>): DataInsight[] {
  if (data.length < 5) return [];

  const insights: DataInsight[] = [];
  const values = data.map(d => d.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

  data.forEach((point) => {
    const zScore = Math.abs((point.value - mean) / stdDev);
    if (zScore > 2.5) {
      const cellRef = `${String.fromCharCode(65 + point.col)}${point.row + 1}`;
      insights.push({
        id: `anomaly-${point.row}-${point.col}`,
        type: 'anomaly',
        severity: zScore > 3.5 ? 'high' : 'medium',
        title: `Unusual value detected in ${cellRef}`,
        description: `The value ${point.value.toFixed(2)} is ${zScore.toFixed(1)} standard deviations from the mean (${mean.toFixed(2)}). This could indicate an error or exceptional case.`,
        affectedCells: [cellRef],
        suggestedActions: [
          'Verify the data entry is correct',
          'Check if this represents a legitimate outlier',
          'Consider excluding from average calculations',
        ],
        confidence: Math.min(0.95, zScore / 4),
      });
    }
  });

  return insights;
}

/**
 * Analyze trends in data
 */
function analyzeTrends(data: Array<{ row: number; col: number; value: number }>): DataInsight[] {
  if (data.length < 3) return [];

  const insights: DataInsight[] = [];

  // Group by column to analyze vertical trends
  const columnData = new Map<number, number[]>();
  data.forEach((point) => {
    if (!columnData.has(point.col)) {
      columnData.set(point.col, []);
    }
    columnData.get(point.col)!.push(point.value);
  });

  columnData.forEach((values, col) => {
    if (values.length < 3) return;

    // Calculate trend direction
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }

    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const isIncreasing = avgChange > 0;
    const isDecreasing = avgChange < 0;
    const changePercent = (avgChange / values[0]) * 100;

    if (Math.abs(changePercent) > 10) {
      const colLetter = String.fromCharCode(65 + col);
      insights.push({
        id: `trend-col-${col}`,
        type: 'trend',
        severity: Math.abs(changePercent) > 30 ? 'high' : 'medium',
        title: `${isIncreasing ? 'Upward' : 'Downward'} trend in column ${colLetter}`,
        description: `Values are ${isIncreasing ? 'increasing' : 'decreasing'} by an average of ${Math.abs(changePercent).toFixed(1)}% per row. ${isIncreasing ? 'Growth is accelerating.' : 'Decline detected.'}`,
        affectedCells: [`${colLetter}1:${colLetter}${values.length}`],
        suggestedActions: [
          isIncreasing ? 'Monitor for continued growth' : 'Investigate causes of decline',
          'Consider adding a trendline chart',
          'Set up alerts for significant changes',
        ],
        confidence: Math.min(0.9, Math.abs(changePercent) / 50),
      });
    }
  });

  return insights;
}

/**
 * Generate forecasts
 */
function generateForecasts(data: Array<{ row: number; col: number; value: number }>): DataInsight[] {
  if (data.length < 5) return [];

  const insights: DataInsight[] = [];

  // Group by column
  const columnData = new Map<number, number[]>();
  data.forEach((point) => {
    if (!columnData.has(point.col)) {
      columnData.set(point.col, []);
    }
    columnData.get(point.col)!.push(point.value);
  });

  columnData.forEach((values, col) => {
    if (values.length < 5) return;

    // Simple linear regression for forecast
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const nextValue = slope * n + intercept;
    const currentValue = values[values.length - 1];
    const change = ((nextValue - currentValue) / currentValue) * 100;

    if (Math.abs(change) > 5) {
      const colLetter = String.fromCharCode(65 + col);
      insights.push({
        id: `forecast-col-${col}`,
        type: 'forecast',
        severity: 'low',
        title: `Forecast for column ${colLetter}`,
        description: `Based on current trends, the next value is projected to be ${nextValue.toFixed(2)}, representing a ${change > 0 ? 'increase' : 'decrease'} of ${Math.abs(change).toFixed(1)}%.`,
        affectedCells: [`${colLetter}${n + 1}`],
        suggestedActions: [
          'Use this forecast for planning',
          'Monitor actual vs. predicted values',
          'Adjust strategies if needed',
        ],
        confidence: 0.7,
      });
    }
  });

  return insights;
}

/**
 * Generate AI-powered insights
 */
async function generateAIInsights(data: any): Promise<DataInsight[]> {
  try {
    const dataPreview = JSON.stringify(data).slice(0, 2000);

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst expert. Analyze spreadsheet data and provide actionable insights.',
        },
        {
          role: 'user',
          content: `Analyze this spreadsheet data and provide 2-3 key insights or recommendations:\n\n${dataPreview}\n\nFocus on patterns, potential issues, or opportunities for improvement.`,
        },
      ],
    });

    const aiContent = response.choices[0]?.message?.content || '';
    const aiText = typeof aiContent === 'string' ? aiContent : '';

    // Parse AI response into insights
    const insights: DataInsight[] = [];
    const lines = aiText.split('\n').filter((l: string) => l.trim());

    lines.slice(0, 3).forEach((line: string, index: number) => {
      if (line.length > 20) {
        insights.push({
          id: `ai-insight-${index}`,
          type: 'recommendation',
          severity: 'medium',
          title: `AI Recommendation ${index + 1}`,
          description: line.replace(/^[-*•]\s*/, ''),
          affectedCells: [],
          suggestedActions: ['Review and consider implementing this recommendation'],
          confidence: 0.75,
        });
      }
    });

    return insights;
  } catch (error) {
    console.error('AI insights generation failed:', error);
    return [];
  }
}

/**
 * Get insight explanation
 */
export async function explainInsight(insight: DataInsight, context: any): Promise<string> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a data analyst explaining insights to business users.',
        },
        {
          role: 'user',
          content: `Explain this data insight in simple terms and provide actionable next steps:\n\nTitle: ${insight.title}\nDescription: ${insight.description}\n\nProvide a clear explanation and 3 specific actions the user should take.`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    return typeof content === 'string' ? content : insight.description;
  } catch (error) {
    return insight.description;
  }
}
