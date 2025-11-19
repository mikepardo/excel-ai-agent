import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Copy, Star, TrendingUp, Calendar, Type, Database } from 'lucide-react';
import { toast } from 'sonner';

interface FormulaSnippet {
  id: string;
  name: string;
  category: 'financial' | 'date' | 'text' | 'lookup' | 'statistical';
  formula: string;
  description: string;
  example: string;
  popular: boolean;
}

export function FormulaLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [snippets] = useState<FormulaSnippet[]>([
    {
      id: '1',
      name: 'NPV (Net Present Value)',
      category: 'financial',
      formula: '=NPV(rate, value1, [value2], ...)',
      description: 'Calculate the net present value of an investment based on a discount rate and series of future cash flows.',
      example: '=NPV(0.1, B2:B10)',
      popular: true,
    },
    {
      id: '2',
      name: 'IRR (Internal Rate of Return)',
      category: 'financial',
      formula: '=IRR(values, [guess])',
      description: 'Calculate the internal rate of return for a series of cash flows.',
      example: '=IRR(B2:B10, 0.1)',
      popular: true,
    },
    {
      id: '3',
      name: 'VLOOKUP',
      category: 'lookup',
      formula: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])',
      description: 'Search for a value in the first column of a table and return a value in the same row from another column.',
      example: '=VLOOKUP(A2, D2:F10, 3, FALSE)',
      popular: true,
    },
    {
      id: '4',
      name: 'SUMIF',
      category: 'statistical',
      formula: '=SUMIF(range, criteria, [sum_range])',
      description: 'Sum cells that meet a specific condition.',
      example: '=SUMIF(A2:A10, ">100", B2:B10)',
      popular: true,
    },
    {
      id: '5',
      name: 'DATE',
      category: 'date',
      formula: '=DATE(year, month, day)',
      description: 'Create a date from year, month, and day values.',
      example: '=DATE(2024, 1, 15)',
      popular: false,
    },
    {
      id: '6',
      name: 'DATEDIF',
      category: 'date',
      formula: '=DATEDIF(start_date, end_date, unit)',
      description: 'Calculate the difference between two dates in days, months, or years.',
      example: '=DATEDIF(A2, B2, "D")',
      popular: false,
    },
    {
      id: '7',
      name: 'CONCATENATE',
      category: 'text',
      formula: '=CONCATENATE(text1, [text2], ...)',
      description: 'Join multiple text strings into one.',
      example: '=CONCATENATE(A2, " ", B2)',
      popular: false,
    },
    {
      id: '8',
      name: 'LEFT/RIGHT/MID',
      category: 'text',
      formula: '=LEFT(text, num_chars) / =RIGHT(text, num_chars) / =MID(text, start, num_chars)',
      description: 'Extract characters from text strings.',
      example: '=LEFT(A2, 5)',
      popular: false,
    },
    {
      id: '9',
      name: 'INDEX MATCH',
      category: 'lookup',
      formula: '=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))',
      description: 'More flexible alternative to VLOOKUP that can look left or right.',
      example: '=INDEX(C2:C10, MATCH(A2, B2:B10, 0))',
      popular: true,
    },
    {
      id: '10',
      name: 'AVERAGEIF',
      category: 'statistical',
      formula: '=AVERAGEIF(range, criteria, [average_range])',
      description: 'Calculate the average of cells that meet a condition.',
      example: '=AVERAGEIF(A2:A10, ">100", B2:B10)',
      popular: false,
    },
  ]);

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || snippet.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyFormula = (formula: string, name: string) => {
    navigator.clipboard.writeText(formula);
    toast.success(`Copied: ${name}`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <TrendingUp className="h-4 w-4" />;
      case 'date':
        return <Calendar className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'lookup':
        return <Database className="h-4 w-4" />;
      case 'statistical':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-green-100 text-green-800';
      case 'date':
        return 'bg-blue-100 text-blue-800';
      case 'text':
        return 'bg-purple-100 text-purple-800';
      case 'lookup':
        return 'bg-yellow-100 text-yellow-800';
      case 'statistical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Formula Library</h2>
        <p className="text-sm text-gray-600">
          Browse and insert pre-built formula snippets
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search formulas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="date">Date & Time</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="lookup">Lookup & Reference</SelectItem>
                <SelectItem value="statistical">Statistical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredSnippets.filter(s => s.popular).length > 0 && selectedCategory === 'all' && !searchTerm && (
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Popular Formulas
          </h3>
          <div className="space-y-2">
            {filteredSnippets.filter(s => s.popular).map((snippet) => (
              <Card key={snippet.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(snippet.category)}`}>
                      {getCategoryIcon(snippet.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{snippet.name}</h3>
                        <Badge variant="outline" className={getCategoryColor(snippet.category)}>
                          {snippet.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{snippet.description}</p>
                      <div className="bg-gray-50 p-2 rounded font-mono text-sm mb-2">
                        {snippet.formula}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        Example: <code className="bg-gray-100 px-1 py-0.5 rounded">{snippet.example}</code>
                      </div>
                      <Button size="sm" onClick={() => copyFormula(snippet.formula, snippet.name)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Formula
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">
          {selectedCategory === 'all' ? 'All Formulas' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Formulas`}
          {' '}({filteredSnippets.length})
        </h3>
        <div className="space-y-2">
          {filteredSnippets.filter(s => selectedCategory !== 'all' || !s.popular).map((snippet) => (
            <Card key={snippet.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(snippet.category)}`}>
                    {getCategoryIcon(snippet.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{snippet.name}</h3>
                      <Badge variant="outline" className={getCategoryColor(snippet.category)}>
                        {snippet.category}
                      </Badge>
                      {snippet.popular && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{snippet.description}</p>
                    <div className="bg-gray-50 p-2 rounded font-mono text-sm mb-2">
                      {snippet.formula}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Example: <code className="bg-gray-100 px-1 py-0.5 rounded">{snippet.example}</code>
                    </div>
                    <Button size="sm" onClick={() => copyFormula(snippet.formula, snippet.name)}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Formula
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredSnippets.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No formulas found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
