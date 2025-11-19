import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Replace, ChevronRight, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  sheet: string;
  cell: string;
  value: string;
  formula?: string;
}

export function SearchReplacePanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [searchScope, setSearchScope] = useState('all');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searching, setSearching] = useState(false);

  const handleSearch = () => {
    if (!searchTerm) {
      toast.error('Please enter a search term');
      return;
    }

    setSearching(true);

    // Simulate search
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          sheet: 'Sheet1',
          cell: 'A5',
          value: 'Revenue',
          formula: undefined,
        },
        {
          sheet: 'Sheet1',
          cell: 'B12',
          value: '1500',
          formula: '=SUM(B2:B11)',
        },
        {
          sheet: 'Sheet2',
          cell: 'C3',
          value: 'Total Revenue',
          formula: undefined,
        },
        {
          sheet: 'Sheet2',
          cell: 'D8',
          value: 'Revenue Growth',
          formula: '=(D7-D6)/D6',
        },
      ];

      setResults(mockResults);
      setCurrentIndex(0);
      setSearching(false);
      toast.success(`Found ${mockResults.length} results`);
    }, 800);
  };

  const handleReplace = (index: number) => {
    const result = results[index];
    toast.success(`Replaced in ${result.sheet}!${result.cell}`);
    
    // Remove from results
    setResults(results.filter((_, i) => i !== index));
    if (currentIndex >= results.length - 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleReplaceAll = () => {
    if (results.length === 0) {
      toast.error('No results to replace');
      return;
    }

    toast.success(`Replaced ${results.length} occurrences`);
    setResults([]);
    setCurrentIndex(0);
  };

  const navigateResult = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % results.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Search & Replace</h2>
        <p className="text-sm text-gray-600">
          Find and replace text across all sheets
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Search Criteria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Find</Label>
            <Input
              placeholder="Enter search term..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div>
            <Label>Replace with</Label>
            <Input
              placeholder="Enter replacement..."
              value={replaceTerm}
              onChange={(e) => setReplaceTerm(e.target.value)}
            />
          </div>

          <div>
            <Label>Search in</Label>
            <Select value={searchScope} onValueChange={setSearchScope}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sheets</SelectItem>
                <SelectItem value="current">Current sheet</SelectItem>
                <SelectItem value="values">Values only</SelectItem>
                <SelectItem value="formulas">Formulas only</SelectItem>
                <SelectItem value="comments">Comments only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="case"
                checked={caseSensitive}
                onCheckedChange={(checked) => setCaseSensitive(checked as boolean)}
              />
              <Label htmlFor="case" className="text-sm font-normal cursor-pointer">
                Case sensitive
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="whole"
                checked={wholeWord}
                onCheckedChange={(checked) => setWholeWord(checked as boolean)}
              />
              <Label htmlFor="whole" className="text-sm font-normal cursor-pointer">
                Match whole word
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="regex"
                checked={useRegex}
                onCheckedChange={(checked) => setUseRegex(checked as boolean)}
              />
              <Label htmlFor="regex" className="text-sm font-normal cursor-pointer">
                Use regular expressions
              </Label>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={searching} className="w-full">
            <Search className="h-4 w-4 mr-2" />
            {searching ? 'Searching...' : 'Find All'}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Results ({results.length})</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateResult('prev')}
                    disabled={results.length === 0}
                  >
                    ←
                  </Button>
                  <span className="text-xs">
                    {currentIndex + 1} of {results.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateResult('next')}
                    disabled={results.length === 0}
                  >
                    →
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 border rounded transition-colors ${
                    index === currentIndex ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{result.sheet}</Badge>
                      <Badge variant="secondary">{result.cell}</Badge>
                    </div>
                    <p className="text-sm font-mono">{result.value}</p>
                    {result.formula && (
                      <p className="text-xs text-gray-500 mt-1">Formula: {result.formula}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReplace(index)}
                  >
                    <Replace className="h-4 w-4 mr-1" />
                    Replace
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleReplaceAll} className="w-full" variant="default">
                <Check className="h-4 w-4 mr-2" />
                Replace All ({results.length})
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {results.length === 0 && searchTerm && !searching && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <X className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No results found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
