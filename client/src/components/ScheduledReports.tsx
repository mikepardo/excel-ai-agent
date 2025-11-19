import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Calendar, Clock, Mail, FileText, Plus, Play, Pause, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledReport {
  id: string;
  name: string;
  schedule: string;
  format: 'pdf' | 'excel';
  recipients: string[];
  lastRun?: string;
  nextRun: string;
  status: 'active' | 'paused';
}

export function ScheduledReports() {
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Weekly Sales Report',
      schedule: 'Every Monday at 9:00 AM',
      format: 'pdf',
      recipients: ['team@company.com'],
      lastRun: '2024-01-15 09:00',
      nextRun: '2024-01-22 09:00',
      status: 'active',
    },
    {
      id: '2',
      name: 'Monthly Financial Summary',
      schedule: 'First day of month at 8:00 AM',
      format: 'excel',
      recipients: ['finance@company.com', 'ceo@company.com'],
      lastRun: '2024-01-01 08:00',
      nextRun: '2024-02-01 08:00',
      status: 'active',
    },
  ]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    schedule: 'daily',
    time: '09:00',
    format: 'pdf' as 'pdf' | 'excel',
    recipients: '',
  });

  const addReport = () => {
    if (!newReport.name || !newReport.recipients) {
      toast.error('Please fill in all required fields');
      return;
    }

    const scheduleText = {
      daily: `Every day at ${newReport.time}`,
      weekly: `Every Monday at ${newReport.time}`,
      monthly: `First day of month at ${newReport.time}`,
    }[newReport.schedule] || `Every day at ${newReport.time}`;

    const report: ScheduledReport = {
      id: Date.now().toString(),
      name: newReport.name,
      schedule: scheduleText,
      format: newReport.format,
      recipients: newReport.recipients.split(',').map(e => e.trim()),
      nextRun: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace('T', ' '),
      status: 'active',
    };

    setReports([...reports, report]);
    setNewReport({ name: '', schedule: 'daily', time: '09:00', format: 'pdf', recipients: '' });
    setShowAddDialog(false);
    toast.success('Report scheduled successfully');
  };

  const toggleStatus = (id: string) => {
    setReports(reports.map(r =>
      r.id === id ? { ...r, status: r.status === 'active' ? 'paused' as const : 'active' as const } : r
    ));
    toast.success('Report status updated');
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    toast.success('Report deleted');
  };

  const runNow = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      toast.success(`Generating ${report.name}...`);
      setTimeout(() => {
        toast.success(`${report.name} sent to ${report.recipients.join(', ')}`);
      }, 2000);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Scheduled Reports</h2>
          <p className="text-sm text-gray-600">
            Automate report generation and distribution
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {reports.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="mb-4">No scheduled reports yet</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Report
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{report.name}</h3>
                    <Badge variant={report.status === 'active' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                    <Badge variant="outline">{report.format.toUpperCase()}</Badge>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{report.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{report.recipients.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Next run: {report.nextRun}</span>
                    </div>
                    {report.lastRun && (
                      <div className="text-xs text-gray-500">
                        Last run: {report.lastRun}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => runNow(report.id)}>
                      <Play className="h-3 w-3 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(report.id)}
                    >
                      {report.status === 'active' ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Report Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Report</DialogTitle>
            <DialogDescription>
              Create an automated report with email distribution
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Name</Label>
              <Input
                placeholder="e.g., Weekly Sales Report"
                value={newReport.name}
                onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <Select
                  value={newReport.schedule}
                  onValueChange={(value) => setNewReport({ ...newReport, schedule: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly (Monday)</SelectItem>
                    <SelectItem value="monthly">Monthly (1st)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newReport.time}
                  onChange={(e) => setNewReport({ ...newReport, time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Format</Label>
              <Select
                value={newReport.format}
                onValueChange={(value: 'pdf' | 'excel') =>
                  setNewReport({ ...newReport, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Recipients (comma-separated emails)</Label>
              <Input
                placeholder="email1@company.com, email2@company.com"
                value={newReport.recipients}
                onChange={(e) => setNewReport({ ...newReport, recipients: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={addReport} className="flex-1">
                Schedule Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
