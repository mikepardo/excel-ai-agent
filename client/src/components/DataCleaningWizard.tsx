import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Trash2,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';

interface DataIssue {
  id: string;
  type: 'duplicate' | 'formatting' | 'missing' | 'outlier';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  affectedCells: string[];
  suggestedFix: string;
  autoFixable: boolean;
}

export function DataCleaningWizard() {
  const [analyzing, setAnalyzing] = useState(false);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [issues, setIssues] = useState<DataIssue[]>([]);
  const [fixedIssues, setFixedIssues] = useState<string[]>([]);

  const analyzeData = () => {
    setAnalyzing(true);

    // Simulate analysis
    setTimeout(() => {
      const mockIssues: DataIssue[] = [
        {
          id: '1',
          type: 'duplicate',
          severity: 'high',
          title: 'Duplicate rows detected',
          description: '5 duplicate rows found in Sheet1 (rows 12, 15, 23, 28, 34). These entries have identical values across all columns.',
          affectedCells: ['A12:F12', 'A15:F15', 'A23:F23', 'A28:F28', 'A34:F34'],
          suggestedFix: 'Remove duplicate rows, keeping only the first occurrence',
          autoFixable: true,
        },
        {
          id: '2',
          type: 'formatting',
          severity: 'medium',
          title: 'Inconsistent date formatting',
          description: 'Date column contains mixed formats: "01/15/2024", "2024-01-15", and "Jan 15, 2024". Standardizing will improve data consistency.',
          affectedCells: ['C2:C50'],
          suggestedFix: 'Convert all dates to YYYY-MM-DD format',
          autoFixable: true,
        },
        {
          id: '3',
          type: 'missing',
          severity: 'high',
          title: 'Missing required values',
          description: '12 cells in the "Amount" column are empty. These missing values may affect calculations and analysis.',
          affectedCells: ['D5', 'D8', 'D12', 'D15', 'D19', 'D23', 'D27', 'D31', 'D35', 'D39', 'D43', 'D47'],
          suggestedFix: 'Fill with 0 or interpolate from surrounding values',
          autoFixable: true,
        },
        {
          id: '4',
          type: 'outlier',
          severity: 'medium',
          title: 'Statistical outliers detected',
          description: '3 values in column E are more than 3 standard deviations from the mean. These may be data entry errors or legitimate exceptional cases.',
          affectedCells: ['E7', 'E22', 'E41'],
          suggestedFix: 'Review manually or cap at 95th percentile',
          autoFixable: false,
        },
        {
          id: '5',
          type: 'formatting',
          severity: 'low',
          title: 'Trailing whitespace',
          description: '18 cells contain leading or trailing spaces that may cause matching issues.',
          affectedCells: ['B3', 'B7', 'B11', 'B15', 'B19', 'B23', 'B27', 'B31', 'B35', 'B39'],
          suggestedFix: 'Trim whitespace from all text cells',
          autoFixable: true,
        },
      ];

      setIssues(mockIssues);
      setQualityScore(72);
      setAnalyzing(false);
      toast.success(`Found ${mockIssues.length} data quality issues`);
    }, 1500);
  };

  const fixIssue = (issueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    setFixedIssues([...fixedIssues, issueId]);
    toast.success(`Fixed: ${issue.title}`);

    // Update quality score
    if (qualityScore !== null) {
      setQualityScore(Math.min(100, qualityScore + 5));
    }
  };

  const fixAllAutoFixable = () => {
    const autoFixableIssues = issues.filter(i => i.autoFixable && !fixedIssues.includes(i.id));
    setFixedIssues([...fixedIssues, ...autoFixableIssues.map(i => i.id)]);
    toast.success(`Fixed ${autoFixableIssues.length} issues automatically`);

    if (qualityScore !== null) {
      setQualityScore(Math.min(100, qualityScore + autoFixableIssues.length * 5));
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'duplicate':
        return <Copy className="h-5 w-5" />;
      case 'formatting':
        return <Wand2 className="h-5 w-5" />;
      case 'missing':
        return <AlertTriangle className="h-5 w-5" />;
      case 'outlier':
        return <Sparkles className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Data Cleaning Wizard</h2>
        <p className="text-sm text-gray-600">
          AI-powered data quality analysis and automated cleanup
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Button onClick={analyzeData} disabled={analyzing} className="w-full">
            <Sparkles className={`h-4 w-4 mr-2 ${analyzing ? 'animate-pulse' : ''}`} />
            {analyzing ? 'Analyzing Data Quality...' : 'Analyze Data Quality'}
          </Button>
        </CardContent>
      </Card>

      {qualityScore !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-3xl font-bold ${getScoreColor(qualityScore)}`}>
                  {qualityScore}%
                </span>
                <Badge variant={qualityScore >= 90 ? 'default' : qualityScore >= 70 ? 'secondary' : 'destructive'}>
                  {qualityScore >= 90 ? 'Excellent' : qualityScore >= 70 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              <Progress value={qualityScore} className="h-2" />
              <p className="text-xs text-gray-600">
                {issues.filter(i => !fixedIssues.includes(i.id)).length} issues remaining
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {issues.length > 0 && (
        <>
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={fixAllAutoFixable}
                className="w-full"
                variant="default"
                disabled={issues.filter(i => i.autoFixable && !fixedIssues.includes(i.id)).length === 0}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Fix All Auto-Fixable Issues ({issues.filter(i => i.autoFixable && !fixedIssues.includes(i.id)).length})
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {issues.map((issue) => {
              const isFixed = fixedIssues.includes(issue.id);
              return (
                <Card
                  key={issue.id}
                  className={isFixed ? 'opacity-50 border-green-500' : ''}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`${getSeverityColor(issue.severity)} p-2 rounded-lg text-white`}>
                        {isFixed ? <CheckCircle2 className="h-5 w-5" /> : getIssueIcon(issue.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{issue.title}</h3>
                          {isFixed && <Badge variant="outline" className="text-green-600">Fixed</Badge>}
                          {!isFixed && (
                            <>
                              <Badge variant="outline">{issue.type}</Badge>
                              <Badge variant="secondary">{issue.severity}</Badge>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                        <div className="text-xs text-gray-500 mb-2">
                          Affected: {issue.affectedCells.slice(0, 3).join(', ')}
                          {issue.affectedCells.length > 3 && ` +${issue.affectedCells.length - 3} more`}
                        </div>
                        <Alert className="mb-3">
                          <Sparkles className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            <strong>Suggested fix:</strong> {issue.suggestedFix}
                          </AlertDescription>
                        </Alert>
                        {!isFixed && (
                          <Button
                            size="sm"
                            onClick={() => fixIssue(issue.id)}
                            disabled={!issue.autoFixable}
                          >
                            {issue.autoFixable ? 'Fix Automatically' : 'Review Manually'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
