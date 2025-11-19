import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FormulaSuggestion {
  formula: string;
  description: string;
  category: string;
  example: string;
  confidence: number;
}

interface FormulaAutocompleteProps {
  value: string;
  onSelect: (formula: string) => void;
  cellRef?: string;
}

export function FormulaAutocomplete({
  value,
  onSelect,
  cellRef,
}: FormulaAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Extract formula query from value (after = sign)
  useEffect(() => {
    if (value.startsWith('=')) {
      const formulaText = value.substring(1);
      setQuery(formulaText);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const { data: suggestions, isLoading } = trpc.formula.getSuggestions.useQuery(
    { query },
    { enabled: showSuggestions && query.length > 0 }
  );

  const handleSelect = (suggestion: FormulaSuggestion) => {
    onSelect(`=${suggestion.example}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || !suggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  if (!showSuggestions || !suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="absolute z-50 mt-1 w-96 shadow-lg">
      <CardContent className="p-2">
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
          <Lightbulb className="h-3 w-3" />
          <span>Formula Suggestions</span>
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <TooltipProvider key={suggestion.formula}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleSelect(suggestion)}
                    className={`w-full text-left p-2 rounded hover:bg-gray-100 transition-colors ${
                      index === selectedIndex ? 'bg-emerald-50 border border-emerald-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-sm text-emerald-600">
                            {suggestion.formula}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">Example:</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {suggestion.example}
                    </code>
                    <p className="text-xs mt-2">{suggestion.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t text-xs text-gray-500">
          <span>↑↓ Navigate • Enter Select • Esc Close</span>
        </div>
      </CardContent>
    </Card>
  );
}
