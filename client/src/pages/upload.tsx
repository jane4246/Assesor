import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  ArrowLeft,
  File,
  CheckCircle
} from "lucide-react";
import { Link } from "wouter";

const ACCEPTED_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/rtf"
];

const ACCEPTED_EXTENSIONS = [".doc", ".docx", ".rtf"];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function UploadPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(extension);
    const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB

    if (!isValidType) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a .doc, .docx, or .rtf file.",
      });
      return false;
    }

    if (!isValidSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
      });
      return false;
    }

    return true;
  };

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
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      toast({
        title: "Upload successful",
        description: "Proceeding to payment...",
      });

      setTimeout(() => {
        navigate(`/payment/${data.id}`);
      }, 500);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Please try again.",
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">DocAssess</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold">Upload Your Document</h1>
            <p className="text-muted-foreground">
              Select a document to get it professionally assessed
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Document Upload
              </CardTitle>
              <CardDescription>
                Drag and drop your file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedFile ? (
                <div
                  className={`relative flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById("file-input")?.click()}
                  data-testid="dropzone-upload"
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".doc,.docx,.rtf"
                    onChange={handleFileSelect}
                    data-testid="input-file"
                  />
                  <div className="flex flex-col items-center gap-4 p-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="mb-1 text-lg font-medium">
                        {dragActive ? "Drop your file here" : "Drag and drop your file"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        or click to browse from your device
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {ACCEPTED_EXTENSIONS.map((ext) => (
                        <Badge key={ext} variant="secondary">
                          {ext}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <File className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium" data-testid="text-filename">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        data-testid="button-remove-file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {isUploading && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                  {uploadProgress === 100 && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-primary">
                      <CheckCircle className="h-4 w-4" />
                      <span>Upload complete!</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-1 font-medium text-foreground">File Requirements</p>
                  <ul className="list-inside list-disc space-y-1">
                    <li>Accepted formats: .doc, .docx, .rtf</li>
                    <li>Maximum file size: 10MB</li>
                    <li>Assessment fee: KES 60 per document</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Link href="/">
              <Button variant="outline" data-testid="button-cancel">
                Cancel
              </Button>
            </Link>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              data-testid="button-proceed-payment"
            >
              {isUploading ? "Uploading..." : "Proceed to Payment"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
