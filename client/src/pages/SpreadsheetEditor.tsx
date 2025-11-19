import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { FileSpreadsheet, Send, Loader2, ArrowLeft, History, Download } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { Streamdown } from "streamdown";

export default function SpreadsheetEditor() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/spreadsheet/:id");
  const spreadsheetId = params?.id ? parseInt(params.id) : null;

  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Spreadsheet View */}
        <div className="flex-1 p-4 overflow-auto">
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
        </div>

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
