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
    const isValidType =
      ACCEPTED_TYPES.includes(file.type) ||
      ACCEPTED_EXTENSIONS.includes(extension);
    const isValidSize = file.size <= 10 * 1024 * 1024;

    if (!isValidType) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a .doc, .docx, or .rtf file."
      });
      return false;
    }

    if (!isValidSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB."
      });
      return false;
    }

    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const email = localStorage.getItem("user_email");
    if (!email) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please create an account first."
      });
      navigate("/signup");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("email", email); // 🔥 THIS FIXES YOUR BUG

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? p : p + 10));
      }, 200);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      toast({
        title: "Upload successful",
        description: "Redirecting to payment..."
      });

      setTimeout(() => {
        navigate(`/payment/${data.id}`);
      }, 500);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Please try again."
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
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
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
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Document</CardTitle>
              <CardDescription>
                Accepted formats: DOC, DOCX, RTF (Max 10MB)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedFile ? (
                <div
                  className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById("file-input")?.click()
                  }
                >
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".doc,.docx,.rtf"
                    onChange={handleFileSelect}
                  />
                  <Upload className="h-10 w-10 text-primary" />
                </div>
              ) : (
                <div className="border rounded p-4">
                  <p>{selectedFile.name}</p>
                  {isUploading && (
                    <Progress value={uploadProgress} className="mt-2" />
                  )}
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
            >
              Proceed to Payment
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
