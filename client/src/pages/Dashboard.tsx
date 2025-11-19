import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { FileSpreadsheet, Plus, Trash2, Clock, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { storagePut } from "../../../server/storage";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [newSpreadsheetName, setNewSpreadsheetName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: templates } = trpc.template.list.useQuery();

  const createFromTemplate = trpc.template.createFromTemplate.useMutation({
    onSuccess: (data) => {
      toast.success("Spreadsheet created successfully");
      refetch();
      setShowTemplateDialog(false);
      setNewSpreadsheetName('');
      setSelectedTemplate('');
      setLocation(`/spreadsheet/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create spreadsheet: ${error.message}`);
    },
  });

  const { data: spreadsheets, isLoading, refetch } = trpc.spreadsheet.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createSpreadsheet = trpc.spreadsheet.create.useMutation({
    onSuccess: (data) => {
      toast.success("Spreadsheet created successfully");
      refetch();
      setLocation(`/spreadsheet/${data.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create spreadsheet: ${error.message}`);
    },
  });

  const deleteSpreadsheet = trpc.spreadsheet.delete.useMutation({
    onSuccess: () => {
      toast.success("Spreadsheet deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid Excel file (.xlsx, .xls, .csv)");
      return;
    }

    setUploading(true);
    try {
      // Read file as buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to S3
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `${user.id}/spreadsheets/${file.name}-${timestamp}-${randomSuffix}`;
      
      // Note: In a real implementation, you'd call a backend endpoint to upload
      // For now, we'll simulate the upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileKey', fileKey);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { fileUrl } = await response.json();

      // Create spreadsheet record
      await createSpreadsheet.mutateAsync({
        name: file.name.replace(/\.[^/.]+$/, ""),
        fileKey,
        fileUrl,
        fileType: file.type.includes('csv') ? 'csv' : 'xlsx',
        originalFileName: file.name,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateNew = () => {
    setShowTemplateDialog(true);
  };

  const handleTemplateSubmit = () => {
    if (!selectedTemplate || !newSpreadsheetName.trim()) {
      toast.error('Please select a template and enter a name');
      return;
    }

    createFromTemplate.mutate({
      templateId: selectedTemplate,
      name: newSpreadsheetName.trim(),
    });
  };

  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
            <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Spreadsheets</h1>
            <p className="text-gray-600 mt-1">Manage your AI-powered Excel files</p>
          </div>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              New Spreadsheet
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : spreadsheets && spreadsheets.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spreadsheets.map((sheet) => (
              <Card
                key={sheet.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setLocation(`/spreadsheet/${sheet.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                      <CardTitle className="text-lg">{sheet.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this spreadsheet?')) {
                          deleteSpreadsheet.mutate({ id: sheet.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-600" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {new Date(sheet.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {sheet.originalFileName || `${sheet.fileType.toUpperCase()} file`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No spreadsheets yet</h3>
              <p className="text-gray-600 mb-6">
                Upload an Excel file or create a new spreadsheet to get started
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Spreadsheet
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Spreadsheet</DialogTitle>
            <DialogDescription>
              Choose a template to get started quickly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Spreadsheet Name</Label>
              <Input
                id="name"
                value={newSpreadsheetName}
                onChange={(e) => setNewSpreadsheetName(e.target.value)}
                placeholder="My Spreadsheet"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Select Template</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {templates?.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`text-left p-4 border rounded-lg hover:border-emerald-600 transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <h4 className="font-semibold text-sm">{template.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {template.description}
                    </p>
                    <span className="text-xs text-emerald-600 mt-2 inline-block">
                      {template.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTemplateDialog(false);
                  setNewSpreadsheetName('');
                  setSelectedTemplate('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTemplateSubmit}
                disabled={!selectedTemplate || !newSpreadsheetName.trim() || createFromTemplate.isPending}
              >
                {createFromTemplate.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Spreadsheet'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
