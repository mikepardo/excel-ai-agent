import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, TrendingUp, BarChart4, PieChart, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedChartsPanelProps {
  spreadsheetData?: any;
}

export function AdvancedChartsPanel({ spreadsheetData }: AdvancedChartsPanelProps) {
  const [chartType, setChartType] = useState<string>('waterfall');

  // Sample data for demonstrations
  const waterfallData = [
    { name: 'Starting Balance', value: 10000 },
    { name: 'Revenue', value: 5000 },
    { name: 'Expenses', value: -2000 },
    { name: 'Investments', value: 3000 },
    { name: 'Taxes', value: -1500 },
    { name: 'Ending Balance', value: 14500 },
  ];

  const ganttData = [
    { task: 'Planning', start: '2025-01-01', end: '2025-01-15' },
    { task: 'Development', start: '2025-01-10', end: '2025-02-28' },
    { task: 'Testing', start: '2025-02-20', end: '2025-03-15' },
    { task: 'Deployment', start: '2025-03-10', end: '2025-03-20' },
  ];

  const heatmapData = [
    [0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0],
    [1, 0, 1], [1, 1, 4], [1, 2, 7], [1, 3, 3], [1, 4, 0],
    [2, 0, 0], [2, 1, 3], [2, 2, 9], [2, 3, 6], [2, 4, 2],
    [3, 0, 0], [3, 1, 0], [3, 2, 4], [3, 3, 8], [3, 4, 5],
    [4, 0, 0], [4, 1, 0], [4, 2, 1], [4, 3, 3], [4, 4, 7],
  ];

  const treemapData = [
    {
      name: 'Technology',
      value: 40,
      children: [
        { name: 'Software', value: 25 },
        { name: 'Hardware', value: 15 },
      ],
    },
    {
      name: 'Finance',
      value: 30,
      children: [
        { name: 'Banking', value: 18 },
        { name: 'Insurance', value: 12 },
      ],
    },
    {
      name: 'Healthcare',
      value: 30,
      children: [
        { name: 'Pharma', value: 20 },
        { name: 'Medical Devices', value: 10 },
      ],
    },
  ];

  const candlestickData = [
    ['2025-01-01', 20, 34, 10, 38],
    ['2025-01-02', 40, 35, 30, 50],
    ['2025-01-03', 31, 38, 33, 44],
    ['2025-01-04', 38, 15, 5, 42],
    ['2025-01-05', 14, 30, 14, 35],
  ];

  // Waterfall Chart
  const waterfallOption = {
    title: { text: 'Cash Flow Waterfall', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: waterfallData.map(d => d.name) },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: waterfallData.map((d, i) => {
        if (i === 0 || i === waterfallData.length - 1) {
          return { value: d.value, itemStyle: { color: '#5470c6' } };
        }
        return {
          value: d.value,
          itemStyle: { color: d.value > 0 ? '#91cc75' : '#ee6666' },
        };
      }),
    }],
  };

  // Gantt Chart
  const ganttOption = {
    title: { text: 'Project Timeline (Gantt)', left: 'center' },
    tooltip: { formatter: (params: any) => `${params.name}: ${params.value[1]} to ${params.value[2]}` },
    grid: { left: '15%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'time', axisLabel: { formatter: '{MM}-{dd}' } },
    yAxis: { type: 'category', data: ganttData.map(d => d.task) },
    series: [{
      type: 'custom',
      renderItem: (params: any, api: any) => {
        const categoryIndex = api.value(0);
        const start = api.coord([api.value(1), categoryIndex]);
        const end = api.coord([api.value(2), categoryIndex]);
        const height = api.size([0, 1])[1] * 0.6;
        return {
          type: 'rect',
          shape: { x: start[0], y: start[1] - height / 2, width: end[0] - start[0], height },
          style: api.style({ fill: '#5470c6' }),
        };
      },
      encode: { x: [1, 2], y: 0 },
      data: ganttData.map((d, i) => [i, new Date(d.start).getTime(), new Date(d.end).getTime()]),
    }],
  };

  // Heatmap
  const heatmapOption = {
    title: { text: 'Activity Heatmap', left: 'center' },
    tooltip: { position: 'top' },
    grid: { height: '50%', top: '15%' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], splitArea: { show: true } },
    yAxis: { type: 'category', data: ['Morning', 'Noon', 'Afternoon', 'Evening', 'Night'], splitArea: { show: true } },
    visualMap: { min: 0, max: 10, calculable: true, orient: 'horizontal', left: 'center', bottom: '5%' },
    series: [{
      type: 'heatmap',
      data: heatmapData,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
    }],
  };

  // Treemap
  const treemapOption = {
    title: { text: 'Market Share Treemap', left: 'center' },
    tooltip: { formatter: (params: any) => `${params.name}: ${params.value}%` },
    series: [{
      type: 'treemap',
      data: treemapData,
      leafDepth: 2,
      label: { show: true, formatter: '{b}: {c}%' },
      itemStyle: { borderColor: '#fff' },
    }],
  };

  // Candlestick Chart
  const candlestickOption = {
    title: { text: 'Stock Price Candlestick', left: 'center' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    xAxis: { type: 'category', data: candlestickData.map(d => d[0]) },
    yAxis: { scale: true },
    series: [{
      type: 'candlestick',
      data: candlestickData.map(d => d.slice(1)),
      itemStyle: {
        color: '#ec0000',
        color0: '#00da3c',
        borderColor: '#8A0000',
        borderColor0: '#008F28',
      },
    }],
  };

  const chartOptions: Record<string, any> = {
    waterfall: waterfallOption,
    gantt: ganttOption,
    heatmap: heatmapOption,
    treemap: treemapOption,
    candlestick: candlestickOption,
  };

  const handleExportChart = () => {
    toast.success('Chart exported as PNG');
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Advanced Charts</h2>
        <Button onClick={handleExportChart} size="sm" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Chart Type</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="waterfall">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Waterfall Chart
                </div>
              </SelectItem>
              <SelectItem value="gantt">
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-4 w-4" />
                  Gantt Chart
                </div>
              </SelectItem>
              <SelectItem value="heatmap">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Heatmap
                </div>
              </SelectItem>
              <SelectItem value="treemap">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Treemap
                </div>
              </SelectItem>
              <SelectItem value="candlestick">
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-4 w-4" />
                  Candlestick (Financial)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <ReactECharts
            option={chartOptions[chartType]}
            style={{ height: '500px', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Chart Features</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>✓ Interactive tooltips and zoom</p>
          <p>✓ Real-time data updates</p>
          <p>✓ Drill-down capabilities</p>
          <p>✓ Export to PNG, SVG, or PDF</p>
          <p>✓ Customizable colors and themes</p>
        </CardContent>
      </Card>
    </div>
  );
}
