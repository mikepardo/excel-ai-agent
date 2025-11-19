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
import { Badge } from '@/components/ui/badge';
import { Database, Cloud, TrendingUp, DollarSign, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface APIMarketplacePanelProps {
  spreadsheetId: number;
}

const CONNECTORS = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: Cloud,
    description: 'Connect to Salesforce CRM to import leads, opportunities, and accounts',
    category: 'CRM',
    color: 'bg-blue-500',
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    icon: DollarSign,
    description: 'Import invoices, expenses, and financial data from QuickBooks',
    category: 'Finance',
    color: 'bg-green-500',
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    icon: TrendingUp,
    description: 'Pull website traffic, user behavior, and conversion data',
    category: 'Analytics',
    color: 'bg-orange-500',
  },
  {
    id: 'sql',
    name: 'SQL Database',
    icon: Database,
    description: 'Connect to MySQL, PostgreSQL, or SQL Server databases',
    category: 'Database',
    color: 'bg-purple-500',
  },
  {
    id: 'custom',
    name: 'Custom API',
    icon: Cloud,
    description: 'Connect to any REST API with custom configuration',
    category: 'Custom',
    color: 'bg-gray-500',
  },
];

export function APIMarketplacePanel({ spreadsheetId }: APIMarketplacePanelProps) {
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [connections, setConnections] = useState<string[]>([]);

  // Form state
  const [connectionName, setConnectionName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [instanceUrl, setInstanceUrl] = useState('');
  const [syncFrequency, setSyncFrequency] = useState('daily');

  const handleConnectClick = (connector: any) => {
    setSelectedConnector(connector);
    setShowConnectDialog(true);
  };

  const handleTestConnection = () => {
    toast.success('Connection test successful!');
  };

  const handleSaveConnection = () => {
    if (!connectionName) {
      toast.error('Connection name is required');
      return;
    }

    setConnections([...connections, selectedConnector.id]);
    toast.success(`${selectedConnector.name} connected successfully!`);
    setShowConnectDialog(false);
    
    // Reset form
    setConnectionName('');
    setClientId('');
    setClientSecret('');
    setInstanceUrl('');
  };

  const handleImportData = (connectorId: string) => {
    toast.success(`Importing data from ${CONNECTORS.find(c => c.id === connectorId)?.name}...`);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold mb-2">API Integration Marketplace</h2>
        <p className="text-sm text-gray-600">
          Connect external data sources to automatically sync data into your spreadsheets
        </p>
      </div>

      {/* Connected APIs */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Connections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {connections.map((connId) => {
              const connector = CONNECTORS.find(c => c.id === connId);
              if (!connector) return null;
              const Icon = connector.icon;
              return (
                <div key={connId} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className={`${connector.color} p-2 rounded`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{connector.name}</p>
                      <p className="text-xs text-gray-500">Last synced: 2 hours ago</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleImportData(connId)}>
                    Import Data
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Available Connectors */}
      <div>
        <h3 className="font-semibold mb-3">Available Connectors</h3>
        <div className="grid gap-3">
          {CONNECTORS.map((connector) => {
            const Icon = connector.icon;
            const isConnected = connections.includes(connector.id);

            return (
              <Card key={connector.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`${connector.color} p-3 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{connector.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {connector.category}
                          </Badge>
                          {isConnected && (
                            <Badge className="text-xs bg-green-500">
                              <Check className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{connector.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isConnected ? 'outline' : 'default'}
                      onClick={() => handleConnectClick(connector)}
                    >
                      {isConnected ? 'Configure' : <><Plus className="h-4 w-4 mr-1" /> Connect</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Connection Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Connect to {selectedConnector?.name}</DialogTitle>
            <DialogDescription>
              {selectedConnector?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Connection Name</Label>
              <Input
                placeholder="e.g., My Salesforce Account"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
              />
            </div>

            {selectedConnector?.id === 'salesforce' && (
              <>
                <div>
                  <Label>Client ID</Label>
                  <Input
                    placeholder="Enter Salesforce Client ID"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    placeholder="Enter Salesforce Client Secret"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Instance URL</Label>
                  <Input
                    placeholder="https://your-instance.salesforce.com"
                    value={instanceUrl}
                    onChange={(e) => setInstanceUrl(e.target.value)}
                  />
                </div>
              </>
            )}

            {selectedConnector?.id === 'sql' && (
              <>
                <div>
                  <Label>Database Type</Label>
                  <Select defaultValue="mysql">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="sqlserver">SQL Server</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Host</Label>
                  <Input placeholder="localhost or IP address" />
                </div>
                <div>
                  <Label>Database Name</Label>
                  <Input placeholder="database_name" />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input placeholder="db_user" />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </>
            )}

            <div>
              <Label>Sync Frequency</Label>
              <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Only</SelectItem>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleTestConnection} className="flex-1">
                Test Connection
              </Button>
              <Button onClick={handleSaveConnection} className="flex-1">
                Save & Connect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
