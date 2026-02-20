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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Alert, AlertDescription } from "../components/ui/alert";
import * as XLSX from "xlsx";
import useUserAxios from "../hooks/useUserAxios";
import useToast from "../hooks/useToast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FileProcessingState {
  status: "idle" | "uploading" | "streaming" | "success" | "error";
  message: string;
  progress: number;
}

interface ImportStats {
  [key: string]: number;
}

interface PreviewDataItem {
  id: number;
  [key: string]: any;
  selected?: boolean;
}

// ── SSE event types sent by the Django backend ────────────────────────────────
interface SSEProgressEvent {
  type: "progress";
  step: number;
  total_steps: number;
  percent: number;
  message: string;
  stats?: ImportStats;
}

interface SSEDoneEvent {
  type: "done";
  message: string;
  stats: ImportStats;
  warnings: string[];
}

interface SSEErrorEvent {
  type: "error";
  message: string;
}

type SSEEvent = SSEProgressEvent | SSEDoneEvent | SSEErrorEvent;

// ── Component ─────────────────────────────────────────────────────────────────

const BulkUpload = () => {
  const [dragActive, setDragActive]       = useState(false);
  const [uploadedFile, setUploadedFile]   = useState<File | null>(null);
  const [previewData, setPreviewData]     = useState<PreviewDataItem[]>([]);
  const [fileProcessing, setFileProcessing] = useState<FileProcessingState>({
    status: "idle",
    message: "",
    progress: 0,
  });
  const { setToastMessage } = useToast();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview]     = useState(false);
  const [terms, setTerms]                 = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm]   = useState<string>("");
  const axios = useUserAxios()

  // Live import state (populated during SSE stream)
  const [importStats,    setImportStats]    = useState<ImportStats | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);



  // ── File reading ────────────────────────────────────────────────────────────

  const processFileDebounced = useCallback((file: File) => {
    setFileProcessing({ status: "uploading", message: "Reading file...", progress: 25 });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setFileProcessing((prev) => ({ ...prev, message: "Processing data...", progress: 50 }));

        const data     = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet    = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        setFileProcessing((prev) => ({ ...prev, message: "Validating data...", progress: 75 }));

        setTimeout(() => {
          if (jsonData.length < 2) {
            setValidationErrors(["File appears to be empty or has no data rows."]);
            setFileProcessing({ status: "error", message: "Validation failed: No data found", progress: 0 });
            return;
          }

          const headers = jsonData[0] as string[];
          const rows    = jsonData.slice(1) as any[][];

          const preview = rows.slice(0, 10).map((row, index) => {
            const item: PreviewDataItem = { id: index, selected: true };
            headers.forEach((header, i) => { item[header] = row[i] !== undefined ? row[i] : ""; });
            return item;
          });

          setPreviewData(preview);

          // Extract unique TERM values
          const uniqueTerms = new Set<string>();
          preview.forEach((item) => {
            const val = item["TERM"];
            if (val !== undefined && val !== null) {
              const s = String(val).trim();
              if (s.length) uniqueTerms.add(s);
            }
          });
          setTerms(Array.from(uniqueTerms));

          setFileProcessing({
            status: "success",
            message: `Successfully processed ${rows.length} rows`,
            progress: 100,
          });
          setShowPreview(true);
        }, 600);
      } catch (err) {
        console.error("File parsing error:", err);
        setValidationErrors(["Error processing file. Ensure it's a valid .xlsx file."]);
        setFileProcessing({ status: "error", message: "Failed to parse file format", progress: 0 });
      }
    };

    reader.onerror = () => {
      setValidationErrors(["Error reading file. Try uploading again."]);
      setFileProcessing({ status: "error", message: "Failed to read file", progress: 0 });
    };

    reader.readAsArrayBuffer(file);
  }, []);

  // ── Drag & drop ─────────────────────────────────────────────────────────────

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleFile = (file: File) => {
    setValidationErrors([]);
    setPreviewData([]);
    setShowPreview(false);
    setImportStats(null);
    setImportWarnings([]);
    setFileProcessing({ status: "idle", message: "", progress: 0 });

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setValidationErrors(["Please upload a valid Excel (.xlsx) file."]);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors(["File size must not exceed 10MB."]);
      return;
    }

    setUploadedFile(file);
    processFileDebounced(file);
  };

  // ── SSE Upload (via axios) ───────────────────────────────────────────────────
  // axios supports responseType:'stream' in Node but NOT in the browser.
  // In the browser we use responseType:'text' with onDownloadProgress — axios
  // fires onDownloadProgress each time a new chunk arrives, giving us the
  // accumulated response text so far. We track what we've already parsed with
  // an offset and only process the new bytes each time.

  const handleUpload = async () => {
    if (!uploadedFile) {
      setToastMessage({ message: "Please select a file to upload", variant: "danger" });
      return;
    }
    if (!selectedTerm) {
      setToastMessage({ message: "Please select the semester", variant: "danger" });
      return;
    }

    setImportStats(null);
    setImportWarnings([]);
    setFileProcessing({ status: "streaming", message: "Connecting to server...", progress: 0 });

    const formData = new FormData();
    formData.append("myFile", uploadedFile);
    formData.append("selectedSemester", selectedTerm);

    // Tracks how many characters of the response we have already parsed
    let parsedOffset = 0;

    const processChunk = (chunk: string) => {
      // SSE events are separated by double newlines
      const parts = chunk.split("\n\n");
      // Last element may be an incomplete event — leave it for next chunk
      const complete = chunk.endsWith("\n\n") ? parts : parts.slice(0, -1);

      for (const part of complete) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;

        let event: SSEEvent;
        try {
          event = JSON.parse(line.replace(/^data:\s*/, "")) as SSEEvent;
        } catch {
          continue; // malformed chunk — skip
        }

        if (event.type === "progress") {
          setFileProcessing({
            status:   "streaming",
            message:  event.message,
            progress: event.percent,
          });
          if (event.stats) setImportStats(event.stats);
        }

        if (event.type === "done") {
          setFileProcessing({ status: "success", message: event.message, progress: 100 });
          setImportStats(event.stats);
          setImportWarnings(event.warnings ?? []);
          setToastMessage({ message: "Import completed successfully!", variant: "success" });
          setTimeout(() => setShowPreview(false), 1500);
        }

        if (event.type === "error") {
          setFileProcessing({
            status:   "error",
            message:  event.message,
            progress: 0,
          });
          setValidationErrors([event.message, "If the issue persists, contact support."]);
          setToastMessage({ message: "Upload failed. Please try again.", variant: "danger" });
        }
      }
    };

    try {
      await axios.post("/api/uploads/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        // responseType 'text' keeps the response as a growing string in the browser
        responseType: "text",
        // onDownloadProgress fires every time a new chunk arrives
        onDownloadProgress: (progressEvent) => {
          const fullText: string = (progressEvent.event?.target as XMLHttpRequest)?.responseText ?? "";
          // Only process the newly arrived bytes
          const newChunk = fullText.slice(parsedOffset);
          if (newChunk) {
            parsedOffset = fullText.length;
            processChunk(newChunk);
          }
        },
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setFileProcessing({
        status:   "error",
        message:  "Upload failed. Please check your connection and try again.",
        progress: 0,
      });
      setValidationErrors([
        err.message || "Upload failed. Please try again.",
        "If the issue persists, contact support.",
      ]);
      setToastMessage({ message: "Upload failed. Please try again.", variant: "danger" });
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────────

  const resetUpload = () => {
    setUploadedFile(null);
    setPreviewData([]);
    setValidationErrors([]);
    setShowPreview(false);
    setImportStats(null);
    setImportWarnings([]);
    setFileProcessing({ status: "idle", message: "", progress: 0 });
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const getStatusIcon = () => {
    switch (fileProcessing.status) {
      case "uploading":
      case "streaming":
        return <Loader2 className="w-5 h-5 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const isRunning = fileProcessing.status === "uploading" || fileProcessing.status === "streaming";

  const headers = useMemo(
    () => previewData.length > 0
      ? Object.keys(previewData[0]).filter((k) => k !== "id" && k !== "selected")
      : [],
    [previewData],
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-10 space-y-2 flex justify-between items-center flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bulk Upload</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Upload Excel (.xlsx) file to import large datasets quickly. Maximum
              file size: <strong>10MB</strong>. Use our template for best results.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h1>Select Semester</h1>
            <Select
              value={selectedTerm}
              disabled={terms.length === 0}
              onValueChange={setSelectedTerm}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent side="top">
                {terms.map((term) => (
                  <SelectItem key={term} value={`${term}`}>{term}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Button variant="ghost" size="icon" className="h-6 w-6 p-0" aria-label="Help">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Drop Zone */}
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
                    Drag and drop your Excel (.xlsx) file here, or click below to browse.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Button
                    onClick={() => document.getElementById("file-input")?.click()}
                    variant="default"
                    size="lg"
                    disabled={isRunning}
                    className="flex-1 sm:flex-none"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <Button asChild variant="outline" size="lg" className="flex-1 sm:flex-none">
                    <a href="/sample.xlsx" download>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported format: <strong>.xlsx</strong> • Max size: <strong>10MB</strong>
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={(e) => { if (e.target?.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Status Card */}
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
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                        {uploadedFile.lastModified
                          ? new Date(uploadedFile.lastModified).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        fileProcessing.status === "success" ? "default"
                        : fileProcessing.status === "error"  ? "destructive"
                        : "secondary"
                      }
                      className="px-3 py-1 text-xs font-medium"
                    >
                      {fileProcessing.status === "streaming" ? "Importing..."
                       : fileProcessing.status === "uploading" ? "Uploading..."
                       : fileProcessing.status}
                    </Badge>
                    <Button
                      onClick={resetUpload}
                      variant="ghost"
                      size="sm"
                      disabled={isRunning}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      aria-label="Reset upload"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {fileProcessing.message && (
                  <p className="text-sm text-muted-foreground">{fileProcessing.message}</p>
                )}

                {/* Progress bar — shown while streaming OR uploading */}
                {isRunning && (
                  <div className="space-y-2">
                    <Progress
                      value={fileProcessing.progress}
                      className="w-full h-2 bg-muted/30 rounded-full"
                      aria-label={`Progress: ${fileProcessing.progress}%`}
                    />
                    <p className="text-xs text-muted-foreground">
                      {fileProcessing.status === "streaming"
                        ? "Importing data — please keep this window open..."
                        : "Uploading to server..."}{" "}
                      ({fileProcessing.progress}%)
                    </p>
                  </div>
                )}

                {/* Live stats chips during streaming */}
                {fileProcessing.status === "streaming" && importStats && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(importStats).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex flex-col items-center bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 min-w-[80px]"
                      >
                        <span className="text-base font-bold text-blue-700">
                          {val.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-blue-500 text-center mt-0.5">
                          {key.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons when file is read but not yet uploading */}
                {fileProcessing.status === "success" && !showPreview && (
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => setShowPreview(true)} variant="outline" className="flex-1 sm:flex-none">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Data
                    </Button>
                    <Button onClick={handleUpload} className="flex-1 sm:flex-none">
                      Upload
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final stats after successful import */}
        {fileProcessing.status === "success" && importStats && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Import Complete
              </CardTitle>
              <CardDescription className="text-green-700">
                All records have been saved to the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(importStats).map(([key, val]) => (
                  <div
                    key={key}
                    className="bg-white rounded-xl border border-green-200 p-3 text-center"
                  >
                    <div className="text-2xl font-bold text-green-700">
                      {val.toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {key.replace(/_/g, " ")}
                    </div>
                  </div>
                ))}
              </div>

              {importWarnings.length > 0 && (
                <Alert className="mt-4" variant="default">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription>
                    <p className="font-medium text-yellow-800 mb-1">
                      {importWarnings.length} warning{importWarnings.length > 1 ? "s" : ""}
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {importWarnings.map((w, i) => (
                        <li key={i} className="text-sm text-yellow-700">{w}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
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

        {/* Data Preview Table */}
        {showPreview && previewData.length > 0 && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Showing first {previewData.length} rows.
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
                  disabled={isRunning}
                  className="flex-1 sm:flex-none"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-muted">
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
                        {headers.map((key) => (
                          <td
                            key={key}
                            className="p-3 text-sm break-words max-w-xs"
                            title={row[key]?.toString() || ""}
                          >
                            {row[key]?.toString() || (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!uploadedFile && !validationErrors.length && (
          <div className="bg-muted/50 rounded-xl p-8 text-center my-8">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No file uploaded yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Begin by dragging your file into the upload area or clicking "Choose File" above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUpload;