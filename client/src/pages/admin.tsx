import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  ArrowLeft, 
  Download,
  Clock,
  CheckCircle,
  FileIcon,
  Mail,
  DollarSign,
  Files
} from "lucide-react";
import type { Document } from "@shared/schema";
import { format } from "date-fns";

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const filteredDocuments = documents?.filter((doc) => {
    if (activeTab === "all") return true;
    if (activeTab === "paid") return doc.paymentStatus === "completed";
    if (activeTab === "pending") return doc.paymentStatus === "pending";
    return true;
  }) || [];

  const stats = {
    total: documents?.length || 0,
    paid: documents?.filter((d) => d.paymentStatus === "completed").length || 0,
    pending: documents?.filter((d) => d.paymentStatus === "pending").length || 0,
    revenue: (documents?.filter((d) => d.paymentStatus === "completed").length || 0) * 60,
  };

  const handleDownload = (doc: Document) => {
    window.open(`/api/documents/${doc.id}/download`, "_blank");
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
            <span className="text-xl font-semibold">DocAssess Admin</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Uploads</p>
                  <p className="text-3xl font-bold" data-testid="text-total-uploads">
                    {isLoading ? <Skeleton className="h-9 w-16" /> : stats.total}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Files className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Paid Documents</p>
                  <p className="text-3xl font-bold text-primary" data-testid="text-paid-count">
                    {isLoading ? <Skeleton className="h-9 w-16" /> : stats.paid}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Payment</p>
                  <p className="text-3xl font-bold text-amber-500" data-testid="text-pending-count">
                    {isLoading ? <Skeleton className="h-9 w-16" /> : stats.pending}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold" data-testid="text-revenue">
                    {isLoading ? <Skeleton className="h-9 w-24" /> : `KES ${stats.revenue}`}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" data-testid="tab-all">
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="paid" data-testid="tab-paid">
                  Paid ({stats.paid})
                </TabsTrigger>
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({stats.pending})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-sm text-muted-foreground">
                      {activeTab === "all"
                        ? "Documents will appear here when users upload them."
                        : activeTab === "paid"
                        ? "No paid documents yet."
                        : "No pending documents."}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Upload Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Receipt</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((doc) => (
                          <TableRow key={doc.id} data-testid={`row-document-${doc.id}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{doc.originalName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatFileSize(doc.fileSize)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {format(new Date(doc.uploadedAt), "MMM d, yyyy")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(doc.uploadedAt), "h:mm a")}
                              </p>
                            </TableCell>
                            <TableCell>
                              {doc.paymentStatus === "completed" ? (
                                <Badge variant="default" className="bg-primary">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Paid
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Pending
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {doc.email ? (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{doc.email}</span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {doc.mpesaReceiptNumber || "-"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {doc.paymentStatus === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownload(doc)}
                                  data-testid={`button-download-${doc.id}`}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
