import { invokeLLM } from './_core/llm';

export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'area';

export interface ChartRecommendation {
  type: ChartType;
  title: string;
  description: string;
  confidence: number;
  config: {
    xAxis?: string;
    yAxis?: string[];
    dataKey?: string;
    valueKey?: string;
  };
}

export interface ChartData {
  headers: string[];
  rows: any[][];
}

/**
 * Analyze data and recommend appropriate chart types
 */
export async function recommendCharts(data: ChartData): Promise<ChartRecommendation[]> {
  try {
    // Analyze data structure
    const { headers, rows } = data;
    
    if (!headers || headers.length === 0 || !rows || rows.length === 0) {
      return [];
    }

    // Detect column types
    const columnTypes = headers.map((header, index) => {
      const sampleValues = rows.slice(0, 10).map(row => row[index]);
      const numericCount = sampleValues.filter(v => typeof v === 'number' || !isNaN(Number(v))).length;
      const isNumeric = numericCount > sampleValues.length * 0.7;
      
      return {
        name: header,
        type: isNumeric ? 'numeric' : 'categorical',
        sampleValues: sampleValues.slice(0, 3),
      };
    });

    const prompt = `You are a data visualization expert. Analyze this data and recommend the 3 best chart types:

Headers: ${headers.join(', ')}
Column Types: ${JSON.stringify(columnTypes)}
Row Count: ${rows.length}
Sample Data (first 3 rows): ${JSON.stringify(rows.slice(0, 3))}

Return a JSON array of chart recommendations with this structure:
[
  {
    "type": "bar" | "line" | "pie" | "scatter" | "area",
    "title": "Suggested chart title",
    "description": "Why this chart type is suitable",
    "confidence": 0.9,
    "config": {
      "xAxis": "column name for X axis",
      "yAxis": ["column names for Y axis"],
      "dataKey": "for pie charts",
      "valueKey": "for pie charts"
    }
  }
]

Consider:
- Bar charts for comparing categories
- Line charts for trends over time
- Pie charts for proportions (max 6-8 slices)
- Scatter plots for correlations
- Area charts for cumulative data`;

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: 'You are a data visualization expert. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'chart_recommendations',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              recommendations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['bar', 'line', 'pie', 'scatter', 'area'],
                    },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    confidence: { type: 'number' },
                    config: {
                      type: 'object',
                      properties: {
                        xAxis: { type: 'string' },
                        yAxis: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        dataKey: { type: 'string' },
                        valueKey: { type: 'string' },
                      },
                      additionalProperties: false,
                    },
                  },
                  required: ['type', 'title', 'description', 'confidence', 'config'],
                  additionalProperties: false,
                },
              },
            },
            required: ['recommendations'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return getDefaultRecommendations(data);
    }

    const result = JSON.parse(content);
    return result.recommendations || [];
  } catch (error) {
    console.error('Error getting chart recommendations:', error);
    return getDefaultRecommendations(data);
  }
}

/**
 * Fallback recommendations based on simple heuristics
 */
function getDefaultRecommendations(data: ChartData): ChartRecommendation[] {
  const { headers, rows } = data;
  
  if (headers.length < 2) {
    return [];
  }

  const recommendations: ChartRecommendation[] = [];

  // Bar chart recommendation
  recommendations.push({
    type: 'bar',
    title: `${headers[1]} by ${headers[0]}`,
    description: 'Compare values across categories',
    confidence: 0.8,
    config: {
      xAxis: headers[0],
      yAxis: [headers[1]],
    },
  });

  // Line chart recommendation
  if (rows.length > 3) {
    recommendations.push({
      type: 'line',
      title: `${headers[1]} Trend`,
      description: 'Show trends over time or sequence',
      confidence: 0.7,
      config: {
        xAxis: headers[0],
        yAxis: [headers[1]],
      },
    });
  }

  // Pie chart recommendation (if suitable)
  if (rows.length <= 8 && rows.length >= 2) {
    recommendations.push({
      type: 'pie',
      title: `${headers[1]} Distribution`,
      description: 'Show proportions of a whole',
      confidence: 0.6,
      config: {
        dataKey: headers[0],
        valueKey: headers[1],
      },
    });
  }

  return recommendations;
}

/**
 * Transform spreadsheet data for charting
 */
export function transformDataForChart(
  data: ChartData,
  config: ChartRecommendation['config']
): any[] {
  const { headers, rows } = data;
  
  return rows.map(row => {
    const item: any = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });
}
