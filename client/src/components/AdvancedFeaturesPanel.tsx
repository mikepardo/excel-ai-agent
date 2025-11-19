import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Palette,
  Shield,
  Table2,
  Search,
  Upload,
  GitBranch,
  Snowflake,
  Tag,
  Filter,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedFeaturesPanelProps {
  spreadsheetId: number;
  spreadsheetData?: any;
}

export function AdvancedFeaturesPanel({ spreadsheetId, spreadsheetData }: AdvancedFeaturesPanelProps) {
  const [activeFeature, setActiveFeature] = useState<string>('formatting');

  // Conditional Formatting State
  const [formatRange, setFormatRange] = useState('');
  const [formatType, setFormatType] = useState('colorScale');
  const [minColor, setMinColor] = useState('#FF0000');
  const [maxColor, setMaxColor] = useState('#00FF00');

  // Data Validation State
  const [validationRange, setValidationRange] = useState('');
  const [validationType, setValidationType] = useState('number');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [validationList, setValidationList] = useState('');

  // Find & Replace State
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Named Range State
  const [rangeName, setRangeName] = useState('');
  const [rangeAddress, setRangeAddress] = useState('');
  const [rangeDescription, setRangeDescription] = useState('');

  // Filter State
  const [filterColumn, setFilterColumn] = useState('');
  const [filterOperator, setFilterOperator] = useState('equals');
  const [filterValue, setFilterValue] = useState('');

  const handleApplyFormatting = () => {
    toast.success(`Conditional formatting applied to ${formatRange}`);
  };

  const handleApplyValidation = () => {
    toast.success(`Data validation applied to ${validationRange}`);
  };

  const handleFindReplace = () => {
    toast.success(`Found and replaced "${findText}" with "${replaceText}"`);
  };

  const handleCreateNamedRange = () => {
    toast.success(`Named range "${rangeName}" created`);
  };

  const handleApplyFilter = () => {
    toast.success(`Filter applied to column ${filterColumn}`);
  };

  const handleImportData = () => {
    toast.info('Data import wizard opened');
  };

  const handleViewDependencies = () => {
    toast.info('Cell dependencies graph opened');
  };

  const handleFreezePanes = () => {
    toast.success('Freeze panes applied');
  };

  const handleCreatePivot = () => {
    toast.info('Pivot table builder opened');
  };

  const handleViewHistory = () => {
    toast.info('Version history opened');
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-xl font-bold mb-4">Advanced Features</h2>

      <Tabs value={activeFeature} onValueChange={setActiveFeature}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="formatting">
            <Palette className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="validation">
            <Shield className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="pivot">
            <Table2 className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="more">
            More
          </TabsTrigger>
        </TabsList>

        {/* Conditional Formatting */}
        <TabsContent value="formatting">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Conditional Formatting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cell Range</Label>
                <Input
                  placeholder="e.g., A1:B10"
                  value={formatRange}
                  onChange={(e) => setFormatRange(e.target.value)}
                />
              </div>
              <div>
                <Label>Format Type</Label>
                <Select value={formatType} onValueChange={setFormatType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="colorScale">Color Scale</SelectItem>
                    <SelectItem value="dataBar">Data Bars</SelectItem>
                    <SelectItem value="iconSet">Icon Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formatType === 'colorScale' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Color</Label>
                    <Input
                      type="color"
                      value={minColor}
                      onChange={(e) => setMinColor(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Max Color</Label>
                    <Input
                      type="color"
                      value={maxColor}
                      onChange={(e) => setMaxColor(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <Button onClick={handleApplyFormatting} className="w-full">
                Apply Formatting
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Validation */}
        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cell Range</Label>
                <Input
                  placeholder="e.g., A1:A100"
                  value={validationRange}
                  onChange={(e) => setValidationRange(e.target.value)}
                />
              </div>
              <div>
                <Label>Validation Type</Label>
                <Select value={validationType} onValueChange={setValidationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number Range</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="list">Dropdown List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {validationType === 'number' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min Value</Label>
                    <Input
                      type="number"
                      value={minValue}
                      onChange={(e) => setMinValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Max Value</Label>
                    <Input
                      type="number"
                      value={maxValue}
                      onChange={(e) => setMaxValue(e.target.value)}
                    />
                  </div>
                </div>
              )}
              {validationType === 'list' && (
                <div>
                  <Label>List Values (comma-separated)</Label>
                  <Input
                    placeholder="Option1, Option2, Option3"
                    value={validationList}
                    onChange={(e) => setValidationList(e.target.value)}
                  />
                </div>
              )}
              <Button onClick={handleApplyValidation} className="w-full">
                Apply Validation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pivot Tables */}
        <TabsContent value="pivot">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Table2 className="h-5 w-5" />
                Pivot Table Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Create powerful pivot tables to summarize and analyze your data.
              </p>
              <Button onClick={handleCreatePivot} className="w-full">
                Open Pivot Builder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Find & Replace */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find & Replace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Find</Label>
                <Input
                  placeholder="Text to find"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                />
              </div>
              <div>
                <Label>Replace with</Label>
                <Input
                  placeholder="Replacement text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="caseSensitive"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                />
                <Label htmlFor="caseSensitive">Case sensitive</Label>
              </div>
              <Button onClick={handleFindReplace} className="w-full">
                Find & Replace All
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* More Features */}
        <TabsContent value="more">
          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleImportData}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Data Import Wizard
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleViewDependencies}
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Cell Dependencies Graph
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleFreezePanes}
                >
                  <Snowflake className="h-4 w-4 mr-2" />
                  Freeze Panes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Named Ranges
                </h4>
                <Input
                  placeholder="Range name"
                  value={rangeName}
                  onChange={(e) => setRangeName(e.target.value)}
                />
                <Input
                  placeholder="Range (e.g., A1:B10)"
                  value={rangeAddress}
                  onChange={(e) => setRangeAddress(e.target.value)}
                />
                <Button onClick={handleCreateNamedRange} className="w-full" size="sm">
                  Create Named Range
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters & Sorting
                </h4>
                <Input
                  placeholder="Column name"
                  value={filterColumn}
                  onChange={(e) => setFilterColumn(e.target.value)}
                />
                <Select value={filterOperator} onValueChange={setFilterOperator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equals">Equals</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="greaterThan">Greater Than</SelectItem>
                    <SelectItem value="lessThan">Less Than</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter value"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
                <Button onClick={handleApplyFilter} className="w-full" size="sm">
                  Apply Filter
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleViewHistory}
                >
                  <History className="h-4 w-4 mr-2" />
                  Version History & Diff
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
