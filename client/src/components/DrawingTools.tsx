import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Square,
  Circle,
  ArrowRight,
  Minus,
  Type,
  Pencil,
  Eraser,
  Download,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

interface DrawingToolsProps {
  onToolSelect: (tool: string) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onExport: () => void;
}

export function DrawingTools({
  onToolSelect,
  onColorChange,
  onStrokeWidthChange,
  onExport,
}: DrawingToolsProps) {
  const [activeTool, setActiveTool] = useState<string>('select');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  const tools = [
    { id: 'select', name: 'Select', icon: Layers },
    { id: 'rectangle', name: 'Rectangle', icon: Square },
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'arrow', name: 'Arrow', icon: ArrowRight },
    { id: 'line', name: 'Line', icon: Minus },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'freehand', name: 'Draw', icon: Pencil },
    { id: 'eraser', name: 'Eraser', icon: Eraser },
  ];

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Gray', value: '#6b7280' },
  ];

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
    onToolSelect(toolId);
    toast.success(`${tools.find(t => t.id === toolId)?.name} tool selected`);
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onColorChange(newColor);
  };

  const handleStrokeWidthChange = (width: string) => {
    const numWidth = parseInt(width);
    setStrokeWidth(numWidth);
    onStrokeWidthChange(numWidth);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">Drawing Tools</h2>
        <p className="text-sm text-gray-600">
          Add annotations and drawings to your spreadsheet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={activeTool === tool.id ? 'default' : 'outline'}
                  size="sm"
                  className="flex flex-col h-auto py-2"
                  onClick={() => handleToolSelect(tool.id)}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{tool.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((c) => (
              <button
                key={c.value}
                className={`h-10 rounded border-2 transition-all ${
                  color === c.value ? 'border-black scale-110' : 'border-gray-300'
                }`}
                style={{ backgroundColor: c.value }}
                onClick={() => handleColorChange(c.value)}
                title={c.name}
              />
            ))}
          </div>
          <div className="mt-3">
            <Label className="text-xs">Custom Color</Label>
            <input
              type="color"
              value={color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-10 rounded border cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Stroke Width</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={String(strokeWidth)} onValueChange={handleStrokeWidthChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Thin (1px)</SelectItem>
              <SelectItem value="2">Normal (2px)</SelectItem>
              <SelectItem value="4">Medium (4px)</SelectItem>
              <SelectItem value="6">Thick (6px)</SelectItem>
              <SelectItem value="8">Extra Thick (8px)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Drawing
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => toast.success('Drawing cleared')}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Select</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">V</kbd>
          </div>
          <div className="flex justify-between">
            <span>Rectangle</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd>
          </div>
          <div className="flex justify-between">
            <span>Circle</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">C</kbd>
          </div>
          <div className="flex justify-between">
            <span>Text</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">T</kbd>
          </div>
          <div className="flex justify-between">
            <span>Freehand</span>
            <kbd className="px-2 py-1 bg-gray-100 rounded">P</kbd>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
