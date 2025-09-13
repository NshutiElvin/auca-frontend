import React, { useState, useCallback, useMemo } from "react";
import {
  Upload,
  File,
  Users,
  Database,
  Wifi,
  Briefcase,
  FileText,
  X,
  Check,
  Star,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Download,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import * as XLSX from "xlsx";
import useUserAxios from "../hooks/useUserAxios";
import useToast from "../hooks/useToast";

interface FileProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message: string;
  progress: number;
}

interface PreviewDataItem {
  id: number;
  [key: string]: any;
  selected?: boolean;
}

const BulkUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewDataItem[]>([]);
  const [fileProcessing, setFileProcessing] = useState<FileProcessingState>({
    status: 'idle',
    message: '',
    progress: 0
  });
  const { setToastMessage } = useToast();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const axios = useUserAxios();

  // Debounce file processing to avoid multiple triggers on rapid drag/drop
  const processFileDebounced = useCallback((file: File) => {
    setFileProcessing(prev => ({ ...prev, status: 'processing', message: 'Reading file...', progress: 25 }));
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setFileProcessing(prev => ({ ...prev, message: 'Processing data...', progress: 50 }));

        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        setFileProcessing(prev => ({ ...prev, message: 'Validating data...', progress: 75 }));

        setTimeout(() => {
          if (jsonData.length < 2) {
            setValidationErrors(["File appears to be empty or has no data rows. Please check your file."]);
            setFileProcessing({
              status: 'error',
              message: 'Validation failed: No data found',
              progress: 0
            });
            return;
          }

          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          // Only preview first 10 rows for performance
          const preview = rows.slice(0, 10).map((row, index) => {
            const item: PreviewDataItem = { id: index, selected: true };
            headers.forEach((header, headerIndex) => {
              item[header] = row[headerIndex] !== undefined ? row[headerIndex] : '';
            });
            return item;
          });

          setPreviewData(preview);
          setFileProcessing({
            status: 'success',
            message: `Successfully processed ${rows.length} rows`,
            progress: 100
          });
          setShowPreview(true);
        }, 600); // Smooth UX delay

      } catch (err) {
        console.error("File parsing error:", err);
        setValidationErrors(["Error processing file. Ensure it’s a valid .xlsx or .csv file."]);
        setFileProcessing({
          status: 'error',
          message: 'Failed to parse file format',
          progress: 0
        });
      }
    };

    reader.onerror = () => {
      setValidationErrors(["Error reading file. Try uploading again."]);
      setFileProcessing({
        status: 'error',
        message: 'Failed to read file',
        progress: 0
      });
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    // Reset previous state
    setValidationErrors([]);
    setPreviewData([]);
    setShowPreview(false);
    setFileProcessing({ status: 'idle', message: '', progress: 0 });

    // Validate file type
    const ext = file.name.toLowerCase().endsWith('.xlsx') ? 'xlsx' : file.name.toLowerCase().endsWith('.csv') ? 'csv' : null;
    if (!ext) {
      setValidationErrors(["Please upload a valid Excel (.xlsx) or CSV (.csv) file."]);
      return;
    }

    // Validate size
    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors(["File size must not exceed 10MB. Compress or split your file."]);
      return;
    }

    setUploadedFile(file);
    processFileDebounced(file);
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setFileProcessing({
      status: 'uploading',
      message: 'Uploading to server...',
      progress: 0
    });

    const formData = new FormData();
    formData.append("myFile", uploadedFile);

    try {
      const resp = await axios.post("/api/uploads/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setFileProcessing(prev => ({
            ...prev,
            progress: percentCompleted
          }));
        },
      });

      if (resp.status === 200) {
        setFileProcessing({
          status: 'success',
          message: 'Upload completed successfully!',
          progress: 100
        });
        setToastMessage({
          message: "File uploaded successfully!",
          variant: "success"
        });
        // Auto-hide preview after successful upload
        setTimeout(() => setShowPreview(false), 1500);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileProcessing({
        status: 'error',
        message: 'Upload failed. Please check your connection and try again.',
        progress: 0
      });
      setValidationErrors([
        "Upload failed. Please ensure you're connected to the internet and try again.",
        "If the issue persists, contact support."
      ]);
      setToastMessage({
        message: "Upload failed. Please try again.",
        variant: "danger"
      });
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setShowPreview(false);
    setFileProcessing({
      status: 'idle',
      message: '',
      progress: 0
    });
  };

  const toggleSelection = (id: number) => {
    setPreviewData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const toggleAllSelection = () => {
    const allSelected = previewData.every(item => item.selected);
    setPreviewData(prev =>
      prev.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  const getStatusIcon = () => {
    switch (fileProcessing.status) {
      case 'processing':
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  // Memoize headers for performance
  const headers = useMemo(() => {
    return previewData.length > 0
      ? Object.keys(previewData[0]).filter(key => key !== 'id' && key !== 'selected')
      : [];
  }, [previewData]);

  // Count selected rows
  const selectedCount = useMemo(() => 
    previewData.filter(item => item.selected).length, 
  [previewData]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Bulk Upload</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Upload Excel (.xlsx) or CSV (.csv) files to import large datasets quickly. 
            Maximum file size: <strong>10MB</strong>. Use our template for best results.
          </p>
          
          {/* Template Link with Tooltip */}
          <div className="flex items-center gap-2 mt-4">
            <a 
              href="/sample.xlsx" 
              download 
              className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              aria-label="Download sample template"
            >
              <Download className="w-4 h-4" />
              Download Sample Template
            </a>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 p-0"
              aria-label="Learn how to format your file"
            >
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.02] shadow-lg shadow-primary/10"
                  : "border-border hover:border-muted-foreground/50 hover:bg-muted/5"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              tabIndex={0}
              role="button"
              aria-label="Drop file here to upload"
            >
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Upload Your File</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Drag and drop your Excel (.xlsx) or CSV (.csv) file here, or click below to browse.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    variant="default"
                    size="lg"
                    disabled={fileProcessing.status === 'processing' || fileProcessing.status === 'uploading'}
                    className="flex-1 sm:flex-none"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="flex-1 sm:flex-none"
                  >
                    <a href="/sample.xlsx" download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: <strong>.xlsx, .csv</strong> • Max size: <strong>10MB</strong>
                </p>

                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target?.files?.[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Processing Status */}
        {uploadedFile && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-1">
                      {getStatusIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" title={uploadedFile.name}>
                        {uploadedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.lastModified ? new Date(uploadedFile.lastModified).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        fileProcessing.status === 'success' ? 'default' :
                        fileProcessing.status === 'error' ? 'destructive' :
                        'secondary'
                      }
                      className="px-3 py-1 text-xs font-medium"
                    >
                      {fileProcessing.status === 'uploading' ? 'Uploading...' : fileProcessing.status}
                    </Badge>
                    
                    <Button
                      onClick={resetUpload}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      aria-label="Reset upload"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {fileProcessing.message && (
                  <p className="text-sm text-muted-foreground">
                    {fileProcessing.message}
                  </p>
                )}

                {(fileProcessing.status === 'processing' || fileProcessing.status === 'uploading') && (
                  <div className="space-y-2">
                    <Progress 
                      value={fileProcessing.progress} 
                      className="w-full h-2 bg-muted/30 rounded-full"
                      aria-label={`Progress: ${fileProcessing.progress}%`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {fileProcessing.status === 'processing' 
                        ? 'Analyzing and validating your data…' 
                        : 'Uploading to server…'} ({fileProcessing.progress}%)
                    </p>
                  </div>
                )}

                {fileProcessing.status === 'success' && !showPreview && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setShowPreview(true)}
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Data
                    </Button>
                    <Button
                      onClick={handleUpload}
 
                      className="flex-1 sm:flex-none"
                    >
                      Upload to Server
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert className="mb-8" variant="destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <AlertDescription className="mt-1">
              <ul className="list-disc pl-5 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Data Preview */}
        {showPreview && previewData.length > 0 && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Showing first {previewData.length} of {previewData.length} total rows. Review and select rows before uploading.
                </CardDescription>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  Hide Preview
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={fileProcessing.status === 'uploading'}
                  className="flex-1 sm:flex-none"
                >
                  {fileProcessing.status === 'uploading' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Selected Rows'
                  )}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="text-left p-3 font-medium text-sm uppercase tracking-wide">Select</th>
                      {headers.map((header) => (
                        <th 
                          key={header} 
                          scope="col" 
                          className="text-left p-3 font-medium text-sm uppercase tracking-wide"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row) => (
                      <tr 
                        key={row.id} 
                        className="border-b border-muted/20 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={row.selected || false}
                            onChange={() => toggleSelection(row.id)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                            aria-label={`Select row ${row.id + 1}`}
                          />
                        </td>
                        {headers.map((key) => (
                          <td 
                            key={key} 
                            className="p-3 text-sm break-words max-w-xs"
                            title={row[key]?.toString() || ''}
                          >
                            {row[key]?.toString() || <span className="text-muted-foreground">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>
                  <strong>{selectedCount}</strong> of <strong>{previewData.length}</strong> rows selected
                </p>
                <Button
                  onClick={toggleAllSelection}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80"
                >
                  {previewData.every(item => item.selected) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> You can uncheck rows you want to skip during upload. Only selected rows will be imported.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Confirmation (when upload completes) */}
        {fileProcessing.status === 'success' && showPreview && (
          <Alert className="mb-8" variant="default">
            <Check className="w-4 h-4" />
            <AlertDescription>
              Your data is ready to upload. Click “Upload Selected Rows” to confirm.
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State After Reset */}
        {!uploadedFile && !validationErrors.length && (
          <div className="bg-muted/50 rounded-xl p-8 text-center my-8">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No file uploaded yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Begin by dragging your file into the upload area or clicking “Choose File” above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;