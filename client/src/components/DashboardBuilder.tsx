import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, TrendingUp, DollarSign, Users, Activity, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table';
  title: string;
  range: string;
  value?: string;
  change?: string;
  icon?: string;
}

export function DashboardBuilder() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: '1',
      type: 'kpi',
      title: 'Total Revenue',
      range: 'B2:B50',
      value: '$125,450',
      change: '+12.5%',
      icon: 'dollar',
    },
    {
      id: '2',
      type: 'kpi',
      title: 'Active Users',
      range: 'C2:C50',
      value: '1,234',
      change: '+8.2%',
      icon: 'users',
    },
    {
      id: '3',
      type: 'kpi',
      title: 'Conversion Rate',
      range: 'D2:D50',
      value: '3.45%',
      change: '-0.3%',
      icon: 'trending',
    },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWidget, setNewWidget] = useState<{
    title: string;
    range: string;
    type: 'kpi' | 'chart' | 'table';
    icon: string;
  }>({
    title: '',
    range: '',
    type: 'kpi',
    icon: 'activity',
  });

  const addWidget = () => {
    if (!newWidget.title || !newWidget.range) {
      toast.error('Please fill in all fields');
      return;
    }

    const widget: DashboardWidget = {
      id: Date.now().toString(),
      ...newWidget,
      value: '$0',
      change: '0%',
    };

    setWidgets([...widgets, widget]);
    setNewWidget({ title: '', range: '', type: 'kpi', icon: 'activity' });
    setShowAddDialog(false);
    toast.success('Widget added to dashboard');
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    toast.success('Widget removed');
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'dollar':
        return <DollarSign className="h-6 w-6" />;
      case 'users':
        return <Users className="h-6 w-6" />;
      case 'trending':
        return <TrendingUp className="h-6 w-6" />;
      case 'activity':
        return <Activity className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Dashboard Builder</h2>
          <p className="text-sm text-gray-600">
            Create custom dashboards from your spreadsheet data
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Widget
        </Button>
      </div>

      {widgets.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="mb-4">No widgets yet. Add your first widget to get started.</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Widget
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <Card key={widget.id} className="relative group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {widget.title}
                </CardTitle>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-600"
                    onClick={() => removeWidget(widget.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{widget.value}</div>
                  <div className={`text-sm ${widget.change?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {widget.change} from last period
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Range: {widget.range}
                  </div>
                </div>
                <div className="text-gray-400">
                  {getIcon(widget.icon)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dashboard Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full">
            Export Dashboard
          </Button>
          <Button variant="outline" className="w-full">
            Share Dashboard
          </Button>
          <Button variant="outline" className="w-full">
            Set as Default View
          </Button>
        </CardContent>
      </Card>

      {/* Add Widget Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Dashboard Widget</DialogTitle>
            <DialogDescription>
              Create a new widget from your spreadsheet data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Widget Title</Label>
              <Input
                placeholder="e.g., Total Revenue"
                value={newWidget.title}
                onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Data Range</Label>
              <Input
                placeholder="e.g., B2:B50"
                value={newWidget.range}
                onChange={(e) => setNewWidget({ ...newWidget, range: e.target.value })}
              />
            </div>

            <div>
              <Label>Widget Type</Label>
              <Select
                value={newWidget.type}
                onValueChange={(value: 'kpi' | 'chart' | 'table') =>
                  setNewWidget({ ...newWidget, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kpi">KPI Card</SelectItem>
                  <SelectItem value="chart">Chart</SelectItem>
                  <SelectItem value="table">Table</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Icon</Label>
              <Select
                value={newWidget.icon}
                onValueChange={(value) => setNewWidget({ ...newWidget, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dollar">Dollar Sign</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="trending">Trending Up</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={addWidget} className="flex-1">
                Add Widget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
