import React, { useState, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import * as XLSX from "xlsx";
import useUserAxios from "../hooks/useUserAxios";

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const axios = useUserAxios();

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
    // Reset states
    setValidationErrors([]);
    setPreviewData([]);
    setShowPreview(false);
    
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".csv")) {
      setValidationErrors(["Please upload a valid Excel (.xlsx) or CSV file"]);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setValidationErrors(["File size should not exceed 10MB"]);
      return;
    }

    setUploadedFile(file);
    processFile(file);
  };

  const processFile = async (file: File) => {
    setFileProcessing({
      status: 'processing',
      message: 'Reading file...',
      progress: 25
    });

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          setFileProcessing({
            status: 'processing',
            message: 'Processing data...',
            progress: 50
          });

          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          setFileProcessing({
            status: 'processing',
            message: 'Validating data...',
            progress: 75
          });

          // Simulate validation delay
          setTimeout(() => {
            if (jsonData.length < 2) {
              setValidationErrors(["File appears to be empty or has no data rows"]);
              setFileProcessing({
                status: 'error',
                message: 'File validation failed',
                progress: 0
              });
              return;
            }

            // Convert to preview format
            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1) as any[][];
            
            const preview = rows.slice(0, 10).map((row, index) => {
              const item: PreviewDataItem = { id: index, selected: true };
              headers.forEach((header, headerIndex) => {
                item[header] = row[headerIndex] || '';
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
          }, 1000);

        } catch (error) {
          setValidationErrors(["Error processing file. Please check file format."]);
          setFileProcessing({
            status: 'error',
            message: 'Failed to process file',
            progress: 0
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      setValidationErrors(["Error reading file"]);
      setFileProcessing({
        status: 'error',
        message: 'Failed to read file',
        progress: 0
      });
    }
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

      if (resp.data.success) {
        setFileProcessing({
          status: 'success',
          message: 'Upload completed successfully',
          progress: 100
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileProcessing({
        status: 'error',
        message: 'Upload failed. Please try again.',
        progress: 0
      });
      setValidationErrors(["Upload failed. Please check your connection and try again."]);
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

  const getStatusIcon = () => {
    switch (fileProcessing.status) {
      case 'processing':
      case 'uploading':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bulk Upload</h1>
          <p className="text-muted-foreground">
            Upload Excel or CSV files to import data in bulk. Maximum file size: 10MB
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
                dragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-6">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                  <Upload className="w-10 h-10 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    Upload Your File
                  </h3>
                  <p className="text-muted-foreground">
                    Drag and drop your Excel or CSV file here, or click to browse
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    variant="default"
                    size="lg"
                    disabled={fileProcessing.status === 'processing' || fileProcessing.status === 'uploading'}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                  >
                    <a href="/sample.xlsx" download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </a>
                  </Button>
                </div>

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                      {getStatusIcon()}
                    </div>
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
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
                    >
                      {fileProcessing.status}
                    </Badge>
                    
                    <Button
                      onClick={resetUpload}
                      variant="ghost"
                      size="sm"
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
                  <Progress value={fileProcessing.progress} className="w-full" />
                )}

                {fileProcessing.status === 'success' && !showPreview && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowPreview(true)}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Data
                    </Button>
                    <Button onClick={handleUpload}>
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
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <ul className="space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Data Preview */}
        {showPreview && previewData.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Data Preview</CardTitle>
                  <CardDescription>
                    Showing first 10 rows. Review data before uploading to server.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowPreview(false)}
                    variant="outline"
                    size="sm"
                  >
                    Hide Preview
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={fileProcessing.status === 'uploading'}
                  >
                    {fileProcessing.status === 'uploading' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Upload to Server'
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Select</th>
                      {previewData[0] && Object.keys(previewData[0])
                        .filter(key => key !== 'id' && key !== 'selected')
                        .map((header) => (
                        <th key={header} className="text-left p-3 font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-muted/25">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={row.selected || false}
                            onChange={() => toggleSelection(row.id)}
                            className="rounded"
                          />
                        </td>
                        {Object.keys(row)
                          .filter(key => key !== 'id' && key !== 'selected')
                          .map((key) => (
                          <td key={key} className="p-3 text-sm">
                            {row[key]?.toString() || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  {previewData.filter(item => item.selected).length} of {previewData.length} rows selected
                </p>
                <Button
                  onClick={() => {
                    const allSelected = previewData.every(item => item.selected);
                    setPreviewData(prev => 
                      prev.map(item => ({ ...item, selected: !allSelected }))
                    );
                  }}
                  variant="ghost"
                  size="sm"
                >
                  {previewData.every(item => item.selected) ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;