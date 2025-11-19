import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bug,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Play,
  GitBranch,
} from 'lucide-react';
import { Streamdown } from 'streamdown';
import { toast } from 'sonner';

interface FormulaError {
  type: string;
  message: string;
  suggestion?: string;
}

interface ExecutionStep {
  step: number;
  expression: string;
  result: any;
  description: string;
}

export function FormulaDebugger() {
  const [formula, setFormula] = useState('=SUM(A1:A10)/COUNT(B1:B10)');
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState<FormulaError[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [explanation, setExplanation] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeFormula = () => {
    setAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      // Check for errors
      const mockErrors: FormulaError[] = [];
      if (formula.includes('((')) {
        mockErrors.push({
          type: 'syntax',
          message: 'Unbalanced parentheses detected',
          suggestion: 'Remove extra opening parenthesis',
        });
      }

      setIsValid(mockErrors.length === 0);
      setErrors(mockErrors);

      // Extract dependencies
      const cellPattern = /\b([A-Z]+[0-9]+)\b/g;
      const deps = formula.match(cellPattern) || [];
      setDependencies(Array.from(new Set(deps)));

      // Generate suggestions
      if (mockErrors.length > 0) {
        setSuggestions([
          'Check that all parentheses are properly balanced',
          'Verify all cell references exist in the spreadsheet',
          'Consider using IFERROR to handle potential errors',
        ]);
      } else {
        setSuggestions([
          'Formula looks good! Consider adding error handling with IFERROR',
          'You could add conditional logic with IF statements',
          'Consider naming frequently used ranges for better readability',
        ]);
      }

      // Trace execution
      const steps: ExecutionStep[] = [
        {
          step: 1,
          expression: 'A1:A10 = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]',
          result: 'Array of 10 values',
          description: 'Load range A1:A10',
        },
        {
          step: 2,
          expression: 'SUM(A1:A10) = 550',
          result: 550,
          description: 'Calculate sum of range',
        },
        {
          step: 3,
          expression: 'B1:B10 = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5]',
          result: 'Array of 10 values',
          description: 'Load range B1:B10',
        },
        {
          step: 4,
          expression: 'COUNT(B1:B10) = 10',
          result: 10,
          description: 'Count non-empty cells',
        },
        {
          step: 5,
          expression: '550 / 10 = 55',
          result: 55,
          description: 'Final division',
        },
      ];
      setExecutionSteps(steps);

      // Generate explanation
      setExplanation(
        'This formula calculates the average value by dividing the sum of range A1:A10 by the count of values in range B1:B10. It first adds all values in column A (resulting in 550), then counts how many values are in column B (10 values), and finally divides 550 by 10 to get 55.'
      );

      setAnalyzing(false);
      toast.success('Formula analysis complete');
    }, 1000);
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'syntax':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'reference':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bug className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Formula Debugger</h2>
        <p className="text-sm text-gray-600">
          Analyze formulas, detect errors, and get AI-powered fix suggestions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Formula Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Formula</Label>
            <Input
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="=SUM(A1:A10)"
              className="font-mono"
            />
          </div>
          <Button onClick={analyzeFormula} disabled={analyzing} className="w-full">
            {analyzing ? (
              <>Analyzing...</>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Analyze Formula
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {!analyzing && formula && (
        <>
          {/* Validation Status */}
          <Alert className={isValid ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
            {isValid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <AlertDescription className={isValid ? 'text-green-800' : 'text-red-800'}>
              {isValid ? 'Formula is valid' : `Found ${errors.length} error(s)`}
            </AlertDescription>
          </Alert>

          {/* Errors */}
          {errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Errors Detected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded">
                    {getErrorIcon(error.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{error.type}</Badge>
                      </div>
                      <p className="text-sm font-medium">{error.message}</p>
                      {error.suggestion && (
                        <p className="text-sm text-gray-600 mt-1">💡 {error.suggestion}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Dependencies */}
          {dependencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Cell Dependencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {dependencies.map((dep) => (
                    <Badge key={dep} variant="secondary">
                      {dep}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execution Trace */}
          {executionSteps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Step-by-Step Execution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {executionSteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-3 p-2 border-l-2 border-blue-500 pl-3">
                    <Badge variant="outline" className="mt-0.5">
                      {step.step}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-mono">{step.expression}</p>
                      <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Explanation */}
          {explanation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Formula Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Streamdown>{explanation}</Streamdown>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
