import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['↑', '↓', '←', '→'], description: 'Move between cells' },
      { keys: ['Tab'], description: 'Move to next cell' },
      { keys: ['Shift', 'Tab'], description: 'Move to previous cell' },
      { keys: ['Enter'], description: 'Confirm and move down' },
      { keys: ['Esc'], description: 'Cancel editing' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: ['F2'], description: 'Edit selected cell' },
      { keys: ['Ctrl', 'C'], description: 'Copy' },
      { keys: ['Ctrl', 'V'], description: 'Paste' },
      { keys: ['Ctrl', 'X'], description: 'Cut' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Y'], description: 'Redo' },
      { keys: ['Delete'], description: 'Clear cell content' },
    ],
  },
  {
    title: 'File Operations',
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save checkpoint' },
      { keys: ['Ctrl', 'O'], description: 'Open file' },
      { keys: ['Ctrl', 'N'], description: 'New spreadsheet' },
    ],
  },
  {
    title: 'Search & Tools',
    shortcuts: [
      { keys: ['Ctrl', 'F'], description: 'Find in spreadsheet' },
      { keys: ['Ctrl', '?'], description: 'Show this help' },
    ],
  },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-sm mb-3">{group.title}</h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs px-2 py-1 bg-white"
                          >
                            {key}
                          </Badge>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-gray-400 text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
