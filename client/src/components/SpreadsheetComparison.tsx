import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitCompare, ArrowRight, Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Difference {
  cell: string;
  type: 'value' | 'formula' | 'format';
  oldValue: string;
  newValue: string;
  action?: 'keep-old' | 'keep-new' | 'merge';
}

export function SpreadsheetComparison() {
  const [comparing, setComparing] = useState(false);
  const [version1, setVersion1] = useState('current');
  const [version2, setVersion2] = useState('v1');
  const [differences, setDifferences] = useState<Difference[]>([]);

  const compareVersions = () => {
    setComparing(true);

    // Simulate comparison
    setTimeout(() => {
      const mockDifferences: Difference[] = [
        {
          cell: 'A5',
          type: 'value',
          oldValue: 'Revenue',
          newValue: 'Total Revenue',
        },
        {
          cell: 'B12',
          type: 'formula',
          oldValue: '=SUM(B2:B11)',
          newValue: '=SUM(B2:B11)*1.1',
        },
        {
          cell: 'C3',
          type: 'value',
          oldValue: '1500',
          newValue: '1650',
        },
        {
          cell: 'D8',
          type: 'format',
          oldValue: 'Bold',
          newValue: 'Bold + Red',
        },
        {
          cell: 'E15',
          type: 'value',
          oldValue: '',
          newValue: '250',
        },
      ];

      setDifferences(mockDifferences);
      setComparing(false);
      toast.success(`Found ${mockDifferences.length} differences`);
    }, 1200);
  };

  const handleAction = (cell: string, action: 'keep-old' | 'keep-new' | 'merge') => {
    setDifferences(differences.map(d =>
      d.cell === cell ? { ...d, action } : d
    ));
    toast.success(`Action set for ${cell}`);
  };

  const applyChanges = () => {
    const actionsCount = differences.filter(d => d.action).length;
    toast.success(`Applied ${actionsCount} changes`);
    setDifferences([]);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'value':
        return 'bg-blue-500';
      case 'formula':
        return 'bg-purple-500';
      case 'format':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Spreadsheet Comparison</h2>
        <p className="text-sm text-gray-600">
          Compare versions and merge changes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Select Versions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Version 1</label>
              <Select value={version1} onValueChange={setVersion1}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Version</SelectItem>
                  <SelectItem value="v1">Version 1 (Jan 15)</SelectItem>
                  <SelectItem value="v2">Version 2 (Jan 10)</SelectItem>
                  <SelectItem value="v3">Version 3 (Jan 5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Version 2</label>
              <Select value={version2} onValueChange={setVersion2}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Version</SelectItem>
                  <SelectItem value="v1">Version 1 (Jan 15)</SelectItem>
                  <SelectItem value="v2">Version 2 (Jan 10)</SelectItem>
                  <SelectItem value="v3">Version 3 (Jan 5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={compareVersions} disabled={comparing} className="w-full">
            <GitCompare className={`h-4 w-4 mr-2 ${comparing ? 'animate-pulse' : ''}`} />
            {comparing ? 'Comparing...' : 'Compare Versions'}
          </Button>
        </CardContent>
      </Card>

      {differences.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Differences Found ({differences.length})</span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-blue-50">
                    {differences.filter(d => d.type === 'value').length} Values
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50">
                    {differences.filter(d => d.type === 'formula').length} Formulas
                  </Badge>
                  <Badge variant="outline" className="bg-green-50">
                    {differences.filter(d => d.type === 'format').length} Formats
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {differences.map((diff) => (
                <Card key={diff.cell} className="border-l-4" style={{ borderLeftColor: diff.action ? '#22c55e' : '#e5e7eb' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge className={`${getTypeColor(diff.type)} text-white`}>
                        {diff.cell}
                      </Badge>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{diff.type}</Badge>
                          {diff.action && (
                            <Badge variant="default" className="bg-green-500">
                              {diff.action === 'keep-old' ? 'Keep Original' : diff.action === 'keep-new' ? 'Keep New' : 'Merge'}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 items-center mb-3">
                          <div className="bg-red-50 p-2 rounded">
                            <div className="text-xs text-gray-600 mb-1">Original</div>
                            <div className="text-sm font-mono">{diff.oldValue || '(empty)'}</div>
                          </div>
                          <div className="text-center">
                            <ArrowRight className="h-4 w-4 mx-auto text-gray-400" />
                          </div>
                          <div className="bg-green-50 p-2 rounded">
                            <div className="text-xs text-gray-600 mb-1">New</div>
                            <div className="text-sm font-mono">{diff.newValue}</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={diff.action === 'keep-old' ? 'default' : 'outline'}
                            onClick={() => handleAction(diff.cell, 'keep-old')}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Keep Original
                          </Button>
                          <Button
                            size="sm"
                            variant={diff.action === 'keep-new' ? 'default' : 'outline'}
                            onClick={() => handleAction(diff.cell, 'keep-new')}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Keep New
                          </Button>
                          {diff.type === 'value' && (
                            <Button
                              size="sm"
                              variant={diff.action === 'merge' ? 'default' : 'outline'}
                              onClick={() => handleAction(diff.cell, 'merge')}
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Merge
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={applyChanges}
                className="w-full"
                disabled={differences.filter(d => d.action).length === 0}
              >
                <Check className="h-4 w-4 mr-2" />
                Apply Changes ({differences.filter(d => d.action).length} selected)
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
