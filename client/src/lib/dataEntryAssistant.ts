export interface DataPattern {
  type: 'number' | 'text' | 'date' | 'email' | 'phone' | 'currency' | 'percentage';
  format?: string;
  examples: any[];
}

export interface Suggestion {
  value: any;
  confidence: number;
  reason: string;
}

export class DataEntryAssistant {
  private columnPatterns: Map<number, DataPattern> = new Map();
  private columnRelationships: Map<string, string[]> = new Map();
  private learningData: Map<string, any[]> = new Map();

  constructor() {}

  // Analyze existing data to learn patterns
  public analyzeData(data: any[][]): void {
    if (data.length === 0) return;

    const numColumns = Math.max(...data.map(row => row.length));

    // Analyze each column
    for (let col = 0; col < numColumns; col++) {
      const columnValues = data
        .map(row => row[col])
        .filter(val => val !== null && val !== undefined && val !== '');

      if (columnValues.length > 0) {
        const pattern = this.detectPattern(columnValues);
        this.columnPatterns.set(col, pattern);
        this.learningData.set(`col_${col}`, columnValues);
      }
    }

    // Detect relationships between columns
    this.detectRelationships(data);
  }

  private detectPattern(values: any[]): DataPattern {
    const examples = values.slice(0, 10);

    // Check for numbers
    if (values.every(v => !isNaN(parseFloat(v)) && isFinite(v))) {
      // Check if currency
      const hasCurrencySymbol = values.some(v =>
        String(v).includes('$') || String(v).includes('€') || String(v).includes('£')
      );
      if (hasCurrencySymbol) {
        return { type: 'currency', examples };
      }

      // Check if percentage
      const hasPercentage = values.some(v => String(v).includes('%'));
      if (hasPercentage) {
        return { type: 'percentage', examples };
      }

      return { type: 'number', examples };
    }

    // Check for dates
    const datePattern = /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/;
    if (values.some(v => datePattern.test(String(v)))) {
      return { type: 'date', format: 'YYYY-MM-DD', examples };
    }

    // Check for emails
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (values.every(v => emailPattern.test(String(v)))) {
      return { type: 'email', examples };
    }

    // Check for phone numbers
    const phonePattern = /^[\d\s\-\(\)\+]+$/;
    if (values.every(v => phonePattern.test(String(v)) && String(v).replace(/\D/g, '').length >= 10)) {
      return { type: 'phone', examples };
    }

    // Default to text
    return { type: 'text', examples };
  }

  private detectRelationships(data: any[][]): void {
    // Simple relationship detection: if column A changes, column B often changes
    // This is a simplified version - real implementation would use correlation analysis
    const numColumns = Math.max(...data.map(row => row.length));

    for (let col1 = 0; col1 < numColumns; col1++) {
      const relatedColumns: string[] = [];

      for (let col2 = 0; col2 < numColumns; col2++) {
        if (col1 === col2) continue;

        // Check if there's a pattern between columns
        const correlation = this.calculateSimpleCorrelation(data, col1, col2);
        if (correlation > 0.7) {
          relatedColumns.push(`col_${col2}`);
        }
      }

      if (relatedColumns.length > 0) {
        this.columnRelationships.set(`col_${col1}`, relatedColumns);
      }
    }
  }

  private calculateSimpleCorrelation(data: any[][], col1: number, col2: number): number {
    // Simplified correlation: check if both columns change together
    let matchCount = 0;
    let totalCount = 0;

    for (let i = 1; i < data.length; i++) {
      const prevRow = data[i - 1];
      const currRow = data[i];

      if (prevRow && currRow) {
        const col1Changed = prevRow[col1] !== currRow[col1];
        const col2Changed = prevRow[col2] !== currRow[col2];

        if (col1Changed && col2Changed) {
          matchCount++;
        }
        totalCount++;
      }
    }

    return totalCount > 0 ? matchCount / totalCount : 0;
  }

  // Get suggestions for a cell based on context
  public getSuggestions(
    rowIndex: number,
    colIndex: number,
    currentValue: string,
    rowData: any[],
    allData: any[][]
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // Get pattern for this column
    const pattern = this.columnPatterns.get(colIndex);
    if (!pattern) return suggestions;

    // Type-based suggestions
    if (currentValue.length > 0) {
      const typeSuggestions = this.getTypeSuggestions(pattern, currentValue);
      suggestions.push(...typeSuggestions);
    }

    // Pattern-based suggestions from existing data
    const patternSuggestions = this.getPatternSuggestions(colIndex, currentValue);
    suggestions.push(...patternSuggestions);

    // Relationship-based suggestions
    const relationshipSuggestions = this.getRelationshipSuggestions(colIndex, rowData, allData);
    suggestions.push(...relationshipSuggestions);

    // Frequency-based suggestions (most common values)
    const frequencySuggestions = this.getFrequencySuggestions(colIndex, currentValue);
    suggestions.push(...frequencySuggestions);

    // Sort by confidence and return top 5
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private getTypeSuggestions(pattern: DataPattern, currentValue: string): Suggestion[] {
    const suggestions: Suggestion[] = [];

    switch (pattern.type) {
      case 'date':
        if (currentValue.match(/^\d{1,2}$/)) {
          const today = new Date();
          suggestions.push({
            value: `${currentValue}/${today.getMonth() + 1}/${today.getFullYear()}`,
            confidence: 0.7,
            reason: 'Date format completion',
          });
        }
        break;

      case 'email':
        if (currentValue.includes('@') && !currentValue.includes('.')) {
          const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
          commonDomains.forEach(domain => {
            suggestions.push({
              value: `${currentValue}.${domain}`,
              confidence: 0.6,
              reason: 'Email domain suggestion',
            });
          });
        }
        break;

      case 'currency':
        if (!isNaN(parseFloat(currentValue))) {
          suggestions.push({
            value: `$${parseFloat(currentValue).toFixed(2)}`,
            confidence: 0.8,
            reason: 'Currency formatting',
          });
        }
        break;

      case 'percentage':
        if (!isNaN(parseFloat(currentValue)) && !currentValue.includes('%')) {
          suggestions.push({
            value: `${currentValue}%`,
            confidence: 0.8,
            reason: 'Percentage formatting',
          });
        }
        break;
    }

    return suggestions;
  }

  private getPatternSuggestions(colIndex: number, currentValue: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const columnData = this.learningData.get(`col_${colIndex}`);

    if (!columnData || currentValue.length === 0) return suggestions;

    // Find values that start with current input
    const matches = columnData.filter(val =>
      String(val).toLowerCase().startsWith(currentValue.toLowerCase())
    );

    matches.slice(0, 3).forEach(match => {
      suggestions.push({
        value: match,
        confidence: 0.85,
        reason: 'Pattern match from existing data',
      });
    });

    return suggestions;
  }

  private getRelationshipSuggestions(
    colIndex: number,
    rowData: any[],
    allData: any[][]
  ): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const relatedColumns = this.columnRelationships.get(`col_${colIndex}`);

    if (!relatedColumns || relatedColumns.length === 0) return suggestions;

    // Look for similar rows based on related columns
    for (const row of allData) {
      let matchScore = 0;
      let totalChecks = 0;

      relatedColumns.forEach(relCol => {
        const relColIndex = parseInt(relCol.split('_')[1]);
        if (row[relColIndex] === rowData[relColIndex]) {
          matchScore++;
        }
        totalChecks++;
      });

      if (matchScore / totalChecks > 0.7 && row[colIndex]) {
        suggestions.push({
          value: row[colIndex],
          confidence: 0.75,
          reason: 'Based on related column values',
        });
      }
    }

    return suggestions;
  }

  private getFrequencySuggestions(colIndex: number, currentValue: string): Suggestion[] {
    const suggestions: Suggestion[] = [];
    const columnData = this.learningData.get(`col_${colIndex}`);

    if (!columnData) return suggestions;

    // Count frequency of each value
    const frequency = new Map<any, number>();
    columnData.forEach(val => {
      frequency.set(val, (frequency.get(val) || 0) + 1);
    });

    // Get most common values
    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    sorted.forEach(([value, count]) => {
      const confidence = Math.min(0.9, count / columnData.length);
      if (
        currentValue.length === 0 ||
        String(value).toLowerCase().includes(currentValue.toLowerCase())
      ) {
        suggestions.push({
          value,
          confidence,
          reason: `Common value (used ${count} times)`,
        });
      }
    });

    return suggestions;
  }

  // Learn from user corrections
  public learnFromCorrection(colIndex: number, suggestedValue: any, actualValue: any): void {
    const columnData = this.learningData.get(`col_${colIndex}`) || [];
    columnData.push(actualValue);
    this.learningData.set(`col_${colIndex}`, columnData);

    // Re-analyze pattern if we have enough data
    if (columnData.length % 10 === 0) {
      const pattern = this.detectPattern(columnData);
      this.columnPatterns.set(colIndex, pattern);
    }
  }

  public getColumnPattern(colIndex: number): DataPattern | undefined {
    return this.columnPatterns.get(colIndex);
  }

  public clearLearning(): void {
    this.columnPatterns.clear();
    this.columnRelationships.clear();
    this.learningData.clear();
  }
}
