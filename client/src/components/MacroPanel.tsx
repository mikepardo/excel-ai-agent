import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Play, Plus, Trash2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface MacroPanelProps {
  spreadsheetData?: any;
  onMacroExecuted?: (modifiedData: any) => void;
}

export function MacroPanel({ spreadsheetData, onMacroExecuted }: MacroPanelProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [macroName, setMacroName] = useState('');
  const [macroDescription, setMacroDescription] = useState('');

  const { data: macros, refetch } = trpc.macro.list.useQuery();

  const createMutation = trpc.macro.create.useMutation({
    onSuccess: () => {
      toast.success('Macro saved');
      setShowCreateDialog(false);
      setMacroName('');
      setMacroDescription('');
      setRecordedActions([]);
      setIsRecording(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to save macro: ${error.message}`);
    },
  });

  const executeMutation = trpc.macro.execute.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Macro executed successfully');
        if (onMacroExecuted) {
          onMacroExecuted(result.modifiedData);
        }
      } else {
        toast.error('Macro execution failed');
      }
    },
  });

  const deleteMutation = trpc.macro.delete.useMutation({
    onSuccess: () => {
      toast.success('Macro deleted');
      refetch();
    },
  });

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedActions([]);
    toast.info('Recording started. Perform actions on the spreadsheet.');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordedActions.length > 0) {
      setShowCreateDialog(true);
    } else {
      toast.info('No actions recorded');
    }
  };

  const handleSaveMacro = () => {
    if (!macroName.trim()) {
      toast.error('Macro name is required');
      return;
    }

    createMutation.mutate({
      name: macroName,
      description: macroDescription,
      actions: JSON.stringify(recordedActions),
    });
  };

  const handleExecuteMacro = (macroId: number) => {
    if (!spreadsheetData) {
      toast.error('No spreadsheet data available');
      return;
    }

    executeMutation.mutate({
      macroId,
      spreadsheetData,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Macros</h3>
          <Badge variant={isRecording ? 'default' : 'outline'} className={isRecording ? 'bg-red-500' : ''}>
            {isRecording ? (
              <>
                <Circle className="h-3 w-3 mr-1 animate-pulse fill-current" />
                Recording
              </>
            ) : (
              'Ready'
            )}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!isRecording ? (
            <Button onClick={handleStartRecording} className="flex-1">
              <Circle className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={handleStopRecording} variant="destructive" className="flex-1">
              Stop Recording
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {macros && macros.length > 0 ? (
          macros.map((macro) => {
            const actions = JSON.parse(macro.actions);
            return (
              <Card key={macro.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{macro.name}</h4>
                      {macro.description && (
                        <p className="text-xs text-gray-600 mt-1">{macro.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {actions.length} action{actions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleExecuteMacro(macro.id)}
                      disabled={executeMutation.isPending}
                      className="flex-1"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate({ id: macro.id })}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            <p>No macros yet.</p>
            <p className="mt-2">Record your first macro to automate repetitive tasks!</p>
          </div>
        )}
      </div>

      {/* Create Macro Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Macro</DialogTitle>
            <DialogDescription>
              Give your macro a name and description to save it for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Macro Name</label>
              <Input
                value={macroName}
                onChange={(e) => setMacroName(e.target.value)}
                placeholder="e.g., Format Headers"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description (optional)</label>
              <Textarea
                value={macroDescription}
                onChange={(e) => setMacroDescription(e.target.value)}
                placeholder="Describe what this macro does..."
                rows={3}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs text-gray-600 mb-1">Recorded Actions:</p>
              <p className="text-sm font-semibold">
                {recordedActions.length} action{recordedActions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveMacro}
                disabled={createMutation.isPending}
                className="flex-1"
              >
                Save Macro
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
