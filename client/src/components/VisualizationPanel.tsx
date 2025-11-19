import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BarChart3, LineChart, PieChart, ScatterChart, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  ScatterChart as RechartsScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface VisualizationPanelProps {
  data: {
    headers: string[];
    rows: any[][];
  };
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const chartIcons = {
  bar: BarChart3,
  line: LineChart,
  pie: PieChart,
  scatter: ScatterChart,
  area: TrendingUp,
};

export function VisualizationPanel({ data }: VisualizationPanelProps) {
  const [selectedChart, setSelectedChart] = useState<number | null>(null);

  const { data: recommendations, isLoading } = trpc.chart.recommend.useQuery(
    data,
    { enabled: data.headers.length > 0 && data.rows.length > 0 }
  );

  const transformedData = data.rows.map(row => {
    const item: any = {};
    data.headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-gray-600">Analyzing data...</span>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-600">
          <p>No chart recommendations available.</p>
          <p className="text-sm mt-2">Add more data to see visualizations.</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = (recommendation: typeof recommendations[0], index: number) => {
    const { type, config } = recommendation;

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis || data.headers[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.yAxis?.map((yKey, i) => (
                <Bar key={yKey} dataKey={yKey} fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis || data.headers[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.yAxis?.map((yKey, i) => (
                <Line
                  key={yKey}
                  type="monotone"
                  dataKey={yKey}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={transformedData}
                dataKey={config.valueKey || data.headers[1]}
                nameKey={config.dataKey || data.headers[0]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {transformedData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis || data.headers[0]} />
              <YAxis dataKey={config.yAxis?.[0] || data.headers[1]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter
                name={config.yAxis?.[0] || 'Data'}
                data={transformedData}
                fill={COLORS[0]}
              />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.xAxis || data.headers[0]} />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.yAxis?.map((yKey, i) => (
                <Area
                  key={yKey}
                  type="monotone"
                  dataKey={yKey}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Chart Recommendations */}
      <div className="grid grid-cols-3 gap-3">
        {recommendations.map((rec, index) => {
          const Icon = chartIcons[rec.type];
          return (
            <button
              key={index}
              onClick={() => setSelectedChart(index)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                selectedChart === index
                  ? 'border-emerald-600 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-emerald-600" />
                <Badge variant="outline" className="text-xs">
                  {Math.round(rec.confidence * 100)}%
                </Badge>
              </div>
              <h4 className="font-semibold text-sm">{rec.title}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{rec.description}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Chart Display */}
      {selectedChart !== null && recommendations[selectedChart] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{recommendations[selectedChart].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderChart(recommendations[selectedChart], selectedChart)}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm">
                Export PNG
              </Button>
              <Button variant="outline" size="sm">
                Export SVG
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
