import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface DataInsight {
  id: string;
  type: 'anomaly' | 'trend' | 'forecast' | 'recommendation';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedCells: string[];
  suggestedActions: string[];
  confidence: number;
}

interface AIInsightsPanelProps {
  spreadsheetData?: any;
}

export function AIInsightsPanel({ spreadsheetData }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<DataInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<DataInsight | null>(null);

  useEffect(() => {
    if (spreadsheetData) {
      analyzeData();
    }
  }, [spreadsheetData]);

  const analyzeData = async () => {
    setLoading(true);
    
    // Simulate analysis
    setTimeout(() => {
      const mockInsights: DataInsight[] = [
        {
          id: '1',
          type: 'anomaly',
          severity: 'high',
          title: 'Unusual spike in Q4 revenue',
          description: 'Cell D12 shows a 340% increase compared to the quarterly average. This could indicate exceptional performance or a data entry error.',
          affectedCells: ['D12'],
          suggestedActions: [
            'Verify the data entry is correct',
            'Check for duplicate entries',
            'Review underlying transactions',
          ],
          confidence: 0.92,
        },
        {
          id: '2',
          type: 'trend',
          severity: 'medium',
          title: 'Declining profit margins',
          description: 'Column F shows a consistent downward trend of 2.3% per month over the last 6 months. This pattern suggests increasing costs or pricing pressure.',
          affectedCells: ['F6:F11'],
          suggestedActions: [
            'Analyze cost structure changes',
            'Review pricing strategy',
            'Identify efficiency improvements',
          ],
          confidence: 0.85,
        },
        {
          id: '3',
          type: 'forecast',
          severity: 'low',
          title: 'Projected growth for next quarter',
          description: 'Based on current trends, next quarter revenue is forecasted at $125,000, representing a 15% increase from this quarter.',
          affectedCells: ['E13'],
          suggestedActions: [
            'Adjust resource planning accordingly',
            'Set realistic targets',
            'Monitor actual vs. forecast',
          ],
          confidence: 0.78,
        },
        {
          id: '4',
          type: 'recommendation',
          severity: 'medium',
          title: 'Consider adding variance analysis',
          description: 'Your spreadsheet would benefit from variance columns comparing actual vs. budget. This would make it easier to spot performance gaps.',
          affectedCells: [],
          suggestedActions: [
            'Add budget columns',
            'Calculate variance percentages',
            'Highlight significant variances',
          ],
          confidence: 0.80,
        },
      ];

      setInsights(mockInsights);
      setLoading(false);
      toast.success(`Found ${mockInsights.length} insights`);
    }, 1500);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5" />;
      case 'trend':
        return <TrendingDown className="h-5 w-5" />;
      case 'forecast':
        return <TrendingUp className="h-5 w-5" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">AI Data Insights</h2>
          <p className="text-sm text-gray-600">
            Automated analysis of your spreadsheet data
          </p>
        </div>
        <Button onClick={analyzeData} disabled={loading} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </Button>
      </div>

      {insights.length === 0 && !loading && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            No insights available yet. Click "Refresh" to analyze your data.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedInsight(insight)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`${getSeverityColor(insight.severity)} p-2 rounded-lg text-white`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{insight.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      {insight.type}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(insight.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  {insight.affectedCells.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Affected cells: {insight.affectedCells.join(', ')}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedInsight && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              {getInsightIcon(selectedInsight.type)}
              Suggested Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedInsight.suggestedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                <p className="text-sm">{action}</p>
              </div>
            ))}
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => setSelectedInsight(null)}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
