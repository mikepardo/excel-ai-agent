import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Sparkles, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface QueryResult {
  id: string;
  query: string;
  answer: string;
  cellReferences: string[];
  timestamp: string;
}

export function NaturalLanguageQuery() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QueryResult[]>([
    {
      id: '1',
      query: "What's the total revenue for Q4?",
      answer: 'The total revenue for Q4 is $125,450. This represents a 12.5% increase from Q3.',
      cellReferences: ['B45', 'B46', 'B47', 'B48'],
      timestamp: '2024-01-15 10:30',
    },
    {
      id: '2',
      query: 'Show me the average customer acquisition cost',
      answer: 'The average customer acquisition cost is $42.50, calculated from 234 customers over the past quarter.',
      cellReferences: ['D12', 'D13'],
      timestamp: '2024-01-15 10:25',
    },
  ]);

  const handleQuery = () => {
    if (!query.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      const result: QueryResult = {
        id: Date.now().toString(),
        query: query,
        answer: `Based on your spreadsheet data, here's what I found: The value you're looking for is in cell B25 with a result of $15,234. This is calculated using the formula =SUM(B2:B24) and represents the total across all entries.`,
        cellReferences: ['B25', 'B2:B24'],
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      setHistory([result, ...history]);
      setQuery('');
      setLoading(false);
      toast.success('Query processed');
    }, 1500);
  };

  const navigateToCell = (cell: string) => {
    toast.success(`Navigating to cell ${cell}`);
  };

  const suggestedQueries = [
    "What's the highest value in column C?",
    'Calculate the year-over-year growth rate',
    'Find all cells with values over 1000',
    'What is the average of the last 10 rows?',
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Natural Language Query</h2>
        <p className="text-sm text-gray-600">
          Ask questions about your spreadsheet in plain English
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              className="flex-1"
            />
            <Button onClick={handleQuery} disabled={loading}>
              {loading ? (
                <Sparkles className="h-4 w-4 animate-pulse" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {history.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedQueries.map((suggested, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => setQuery(suggested)}
              >
                <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{suggested}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {history.map((result) => (
          <Card key={result.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{result.query}</p>
                      <p className="text-xs text-gray-500">{result.timestamp}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{result.answer}</p>
                  </div>
                </div>

                {result.cellReferences.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Referenced cells:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.cellReferences.map((cell, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          onClick={() => navigateToCell(cell)}
                        >
                          <Badge variant="secondary" className="mr-1">
                            {cell}
                          </Badge>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
