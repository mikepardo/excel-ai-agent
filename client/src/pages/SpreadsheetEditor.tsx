import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { FileSpreadsheet, Send, Loader2, ArrowLeft, History, Download, Search, Wand2, LayoutDashboard, GitCompare, FileText, MessageCircle, BookOpen } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { Streamdown } from "streamdown";
import { useCollaboration } from "@/hooks/useCollaboration";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Calculator, BarChart3, MessageSquare, Sparkles, Lightbulb, Bug, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VisualizationPanel } from "@/components/VisualizationPanel";
import { CommentPanel } from "@/components/CommentPanel";
import { MacroPanel } from "@/components/MacroPanel";
import { AdvancedFeaturesPanel } from "@/components/AdvancedFeaturesPanel";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { FormulaDebugger } from "@/components/FormulaDebugger";
import { DrawingTools } from "@/components/DrawingTools";
import { SheetManager } from "@/components/SheetManager";
import { SearchReplacePanel } from "@/components/SearchReplacePanel";
import { DataCleaningWizard } from "@/components/DataCleaningWizard";
import { DashboardBuilder } from "@/components/DashboardBuilder";
import { SpreadsheetComparison } from "@/components/SpreadsheetComparison";
import { ScheduledReports } from "@/components/ScheduledReports";
import { NaturalLanguageQuery } from "@/components/NaturalLanguageQuery";
import { FormulaLibrary } from "@/components/FormulaLibrary";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function SpreadsheetEditor() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/spreadsheet/:id");
  const spreadsheetId = params?.id ? parseInt(params.id) : null;

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 's',
        ctrl: true,
        description: 'Save checkpoint',
        action: () => {
          toast.info('Checkpoint saved!');
        },
      },
      {
        key: 'z',
        ctrl: true,
        description: 'Undo',
        action: () => {
          toast.info('Undo (coming soon)');
        },
      },
      {
        key: 'y',
        ctrl: true,
        description: 'Redo',
        action: () => {
          toast.info('Redo (coming soon)');
        },
      },
      {
        key: 'f',
        ctrl: true,
        description: 'Find',
        action: () => {
          toast.info('Find (coming soon)');
        },
      },
      {
        key: '?',
        ctrl: true,
        description: 'Show shortcuts',
        action: () => {
          setShowShortcutsDialog(true);
        },
      },
    ],
    enabled: isAuthenticated,
  });

  const { user } = useAuth();
  const collaboration = useCollaboration({
    spreadsheetId: spreadsheetId!,
    userId: user?.id || 0,
    userName: user?.name || user?.email || 'Anonymous',
    enabled: !!spreadsheetId && !!user,
  });

  const { data: spreadsheet, isLoading: loadingSpreadsheet } = trpc.spreadsheet.get.useQuery(
    { id: spreadsheetId! },
    { enabled: !!spreadsheetId && isAuthenticated }
  );

  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { spreadsheetId: spreadsheetId! },
    { enabled: !!spreadsheetId && isAuthenticated }
  );

  const { data: checkpoints } = trpc.checkpoint.list.useQuery(
    { spreadsheetId: spreadsheetId! },
    { enabled: !!spreadsheetId && isAuthenticated }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
      setMessage("");
      setIsSending(false);
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
      setIsSending(false);
    },
  });

  const restoreCheckpoint = trpc.checkpoint.restore.useMutation({
    onSuccess: () => {
      toast.success("Checkpoint restored");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Failed to restore: ${error.message}`);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !spreadsheetId || isSending) return;

    setIsSending(true);
    sendMessageMutation.mutate({
      spreadsheetId,
      message: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading || loadingSpreadsheet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (!spreadsheet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Spreadsheet not found</h2>
          <Button onClick={() => setLocation("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white flex-shrink-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">{spreadsheet.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Active Users */}
            {collaboration.connected && collaboration.activeUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <div className="flex -space-x-2">
                  {collaboration.activeUsers.slice(0, 3).map((user) => (
                    <Avatar key={user.userId} className="h-8 w-8 border-2 border-white">
                      <AvatarFallback style={{ backgroundColor: user.color }}>
                        {user.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {collaboration.activeUsers.length > 3 && (
                    <Avatar className="h-8 w-8 border-2 border-white bg-gray-200">
                      <AvatarFallback className="text-xs">
                        +{collaboration.activeUsers.length - 3}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (spreadsheet?.fileUrl) {
                  const link = document.createElement('a');
                  link.href = spreadsheet.fileUrl;
                  link.download = spreadsheet.originalFileName || `${spreadsheet.name}.xlsx`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  toast.success('Downloading spreadsheet...');
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Formula Helper Sidebar */}
        <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-emerald-600" />
                <h3 className="font-semibold text-sm">Quick Formulas</h3>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'SUM', desc: 'Add numbers', example: '=SUM(A1:A10)' },
                  { name: 'AVERAGE', desc: 'Calculate average', example: '=AVERAGE(B1:B10)' },
                  { name: 'IF', desc: 'Conditional logic', example: '=IF(A1>10,"Yes","No")' },
                  { name: 'VLOOKUP', desc: 'Lookup values', example: '=VLOOKUP(A2,B:D,3,FALSE)' },
                  { name: 'COUNT', desc: 'Count numbers', example: '=COUNT(A1:A10)' },
                ].map((formula) => (
                  <button
                    key={formula.name}
                    className="w-full text-left p-2 rounded hover:bg-white transition-colors border border-transparent hover:border-emerald-200"
                    onClick={() => {
                      // Copy to clipboard
                      navigator.clipboard.writeText(formula.example);
                      toast.success(`${formula.name} formula copied!`);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-emerald-600">
                        {formula.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Copy
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{formula.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Tips</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Start formulas with =</li>
                <li>• Use : for ranges (A1:A10)</li>
                <li>• Press Tab for suggestions</li>
                <li>• Ask AI for help in chat</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Spreadsheet View */}
        <div className="flex-1 p-4 overflow-auto">
          <Tabs defaultValue="spreadsheet" className="h-full">
            <TabsList>
              <TabsTrigger value="spreadsheet">Spreadsheet</TabsTrigger>
              <TabsTrigger value="charts">
                <BarChart3 className="h-4 w-4 mr-2" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="macros">
                <Calculator className="h-4 w-4 mr-2" />
                Macros
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Sparkles className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Lightbulb className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="debugger">
                <Bug className="h-4 w-4 mr-2" />
                Debugger
              </TabsTrigger>
              <TabsTrigger value="drawing">
                <Pencil className="h-4 w-4 mr-2" />
                Drawing
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger value="clean">
                <Wand2 className="h-4 w-4 mr-2" />
                Clean
              </TabsTrigger>
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="compare">
                <GitCompare className="h-4 w-4 mr-2" />
                Compare
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="query">
                <MessageCircle className="h-4 w-4 mr-2" />
                Query
              </TabsTrigger>
              <TabsTrigger value="formulas">
                <BookOpen className="h-4 w-4 mr-2" />
                Formulas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="spreadsheet" className="h-full">
              <Card className="h-full p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Spreadsheet Data</h3>
              {spreadsheet.data && spreadsheet.data.sheets.length > 0 ? (
                <div className="space-y-6">
                  {spreadsheet.data.sheets.map((sheet, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{sheet.name}</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border-collapse">
                          <tbody>
                            {sheet.data.slice(0, 20).map((row, rowIdx) => (
                              <tr key={rowIdx} className="border-b">
                                {row.map((cell, cellIdx) => (
                                  <td
                                    key={cellIdx}
                                    className="border px-3 py-2 text-gray-700"
                                  >
                                    {cell !== null && cell !== undefined ? String(cell) : ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {sheet.data.length > 20 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Showing first 20 rows of {sheet.data.length}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              )}
            </div>
              </Card>
            </TabsContent>
            <TabsContent value="charts" className="h-full">
              <div className="p-4">
                {spreadsheet && (
                  <VisualizationPanel
                    data={{
                      headers: ['Category', 'Value', 'Growth'],
                      rows: [
                        ['Q1', 1000, 0.15],
                        ['Q2', 1500, 0.25],
                        ['Q3', 1800, 0.20],
                        ['Q4', 2200, 0.22],
                      ],
                    }}
                  />
                )}
              </div>
            </TabsContent>
            <TabsContent value="comments" className="h-full">
              {spreadsheet && (
                <CommentPanel spreadsheetId={spreadsheetId!} />
              )}
            </TabsContent>
            <TabsContent value="macros" className="h-full">
              {spreadsheet && (
                <MacroPanel spreadsheetData={spreadsheet.data} />
              )}
            </TabsContent>
            <TabsContent value="advanced" className="h-full">
              {spreadsheet && (
                <AdvancedFeaturesPanel
                  spreadsheetId={spreadsheetId!}
                  spreadsheetData={spreadsheet.data}
                />
              )}
            </TabsContent>
            <TabsContent value="insights" className="h-full">
              {spreadsheet && (
                <AIInsightsPanel spreadsheetData={spreadsheet.data} />
              )}
            </TabsContent>
            <TabsContent value="debugger" className="h-full">
              <FormulaDebugger />
            </TabsContent>
            <TabsContent value="drawing" className="h-full">
              <DrawingTools
                onToolSelect={(tool) => console.log('Tool selected:', tool)}
                onColorChange={(color) => console.log('Color changed:', color)}
                onStrokeWidthChange={(width) => console.log('Stroke width:', width)}
                onExport={() => console.log('Export drawing')}
              />
            </TabsContent>
            <TabsContent value="search" className="h-full">
              <SearchReplacePanel />
            </TabsContent>
            <TabsContent value="clean" className="h-full">
              <DataCleaningWizard />
            </TabsContent>
            <TabsContent value="dashboard" className="h-full">
              <DashboardBuilder />
            </TabsContent>
            <TabsContent value="compare" className="h-full">
              <SpreadsheetComparison />
            </TabsContent>
            <TabsContent value="reports" className="h-full">
              <ScheduledReports />
            </TabsContent>
            <TabsContent value="query" className="h-full">
              <NaturalLanguageQuery />
            </TabsContent>
            <TabsContent value="formulas" className="h-full">
              <FormulaLibrary />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sheet Manager */}
        <SheetManager
          sheets={[{ id: 1, name: 'Sheet1', visible: true, protected: false }]}
          activeSheetId={1}
          onSheetChange={(id) => console.log('Sheet changed:', id)}
          onSheetAdd={(name) => console.log('Add sheet:', name)}
          onSheetRename={(id, name) => console.log('Rename sheet:', id, name)}
          onSheetDelete={(id) => console.log('Delete sheet:', id)}
          onSheetCopy={(id) => console.log('Copy sheet:', id)}
          onSheetToggleVisibility={(id) => console.log('Toggle visibility:', id)}
          onSheetToggleProtection={(id) => console.log('Toggle protection:', id)}
        />

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog
          open={showShortcutsDialog}
          onOpenChange={setShowShortcutsDialog}
        />

        {/* Chat Panel */}
        <div className="w-96 border-l bg-white flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b">
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-gray-600">Ask me to edit your spreadsheet</p>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages && messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-2">
                    Start by asking me to help with your spreadsheet
                  </p>
                </div>
              )}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Checkpoints */}
          {checkpoints && checkpoints.length > 0 && (
            <div className="border-t p-4">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Checkpoints</span>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {checkpoints.slice(0, 5).map((cp) => (
                  <button
                    key={cp.id}
                    onClick={() => {
                      if (confirm("Restore to this checkpoint?")) {
                        restoreCheckpoint.mutate({ checkpointId: cp.id });
                      }
                    }}
                    className="w-full text-left text-xs p-2 rounded hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium">{cp.description || "Checkpoint"}</p>
                    <p className="text-gray-500">
                      {new Date(cp.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask AI to edit your spreadsheet..."
                disabled={isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
