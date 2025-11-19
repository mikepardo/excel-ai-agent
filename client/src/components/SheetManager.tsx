import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, MoreVertical, Copy, Trash2, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Sheet {
  id: number;
  name: string;
  visible: boolean;
  protected: boolean;
}

interface SheetManagerProps {
  sheets: Sheet[];
  activeSheetId: number;
  onSheetChange: (sheetId: number) => void;
  onSheetAdd: (name: string) => void;
  onSheetRename: (sheetId: number, name: string) => void;
  onSheetDelete: (sheetId: number) => void;
  onSheetCopy: (sheetId: number) => void;
  onSheetToggleVisibility: (sheetId: number) => void;
  onSheetToggleProtection: (sheetId: number) => void;
}

export function SheetManager({
  sheets,
  activeSheetId,
  onSheetChange,
  onSheetAdd,
  onSheetRename,
  onSheetDelete,
  onSheetCopy,
  onSheetToggleVisibility,
  onSheetToggleProtection,
}: SheetManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newSheetName, setNewSheetName] = useState('');
  const [renameSheetId, setRenameSheetId] = useState<number | null>(null);

  const handleAddSheet = () => {
    if (!newSheetName.trim()) {
      toast.error('Sheet name cannot be empty');
      return;
    }
    onSheetAdd(newSheetName);
    setNewSheetName('');
    setShowAddDialog(false);
    toast.success(`Sheet "${newSheetName}" created`);
  };

  const handleRenameSheet = () => {
    if (!newSheetName.trim() || renameSheetId === null) {
      toast.error('Sheet name cannot be empty');
      return;
    }
    onSheetRename(renameSheetId, newSheetName);
    setNewSheetName('');
    setRenameSheetId(null);
    setShowRenameDialog(false);
    toast.success('Sheet renamed');
  };

  const handleDeleteSheet = (sheetId: number) => {
    if (sheets.length === 1) {
      toast.error('Cannot delete the last sheet');
      return;
    }
    onSheetDelete(sheetId);
    toast.success('Sheet deleted');
  };

  const handleCopySheet = (sheetId: number) => {
    onSheetCopy(sheetId);
    toast.success('Sheet copied');
  };

  const openRenameDialog = (sheet: Sheet) => {
    setRenameSheetId(sheet.id);
    setNewSheetName(sheet.name);
    setShowRenameDialog(true);
  };

  return (
    <>
      <div className="flex items-center gap-1 border-t bg-gray-50 p-2 overflow-x-auto">
        {sheets.filter(s => s.visible).map((sheet) => (
          <div
            key={sheet.id}
            className={`flex items-center gap-1 px-3 py-1.5 rounded cursor-pointer transition-colors ${
              sheet.id === activeSheetId
                ? 'bg-white border shadow-sm'
                : 'hover:bg-gray-100'
            }`}
          >
            <span
              className="text-sm font-medium"
              onClick={() => onSheetChange(sheet.id)}
            >
              {sheet.name}
            </span>
            {sheet.protected && <Lock className="h-3 w-3 text-gray-500" />}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => openRenameDialog(sheet)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCopySheet(sheet.id)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSheetToggleVisibility(sheet.id)}>
                  {sheet.visible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSheetToggleProtection(sheet.id)}>
                  <Lock className="h-4 w-4 mr-2" />
                  {sheet.protected ? 'Unprotect' : 'Protect'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteSheet(sheet.id)}
                  className="text-red-600"
                  disabled={sheets.length === 1}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Sheet
        </Button>
      </div>

      {/* Add Sheet Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Sheet</DialogTitle>
            <DialogDescription>
              Create a new sheet in this workbook
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sheet Name</Label>
              <Input
                placeholder="e.g., Sales Data"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSheet()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddSheet} className="flex-1">
                Create Sheet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Sheet Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Sheet</DialogTitle>
            <DialogDescription>
              Enter a new name for this sheet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Sheet Name</Label>
              <Input
                placeholder="Enter new name"
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameSheet()}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowRenameDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleRenameSheet} className="flex-1">
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
