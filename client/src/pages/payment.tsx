import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, 
  ArrowLeft, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Copy,
  Loader2
} from "lucide-react";
import type { Document } from "@shared/schema";

const MPESA_NUMBER = "+254710558915";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: ["/api/documents", id],
    enabled: !!id,
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (phone: string) => {
      return await apiRequest("POST", `/api/payments/initiate`, {
        documentId: id,
        phoneNumber: phone,
      });
    },
    onSuccess: () => {
      setPaymentInitiated(true);
      setIsPolling(true);
      toast({
        title: "Payment request sent",
        description: "Please check your phone and enter your M-Pesa PIN to complete payment.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Payment failed",
        description: "Could not initiate payment. Please try again.",
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/payments/confirm`, {
        documentId: id,
      });
    },
    onSuccess: (data: any) => {
      if (data.status === "completed") {
        queryClient.invalidateQueries({ queryKey: ["/api/documents", id] });
        navigate(`/email/${id}`);
      }
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPolling && paymentInitiated) {
      interval = setInterval(() => {
        confirmPaymentMutation.mutate();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPolling, paymentInitiated]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(MPESA_NUMBER);
    toast({
      title: "Copied!",
      description: "M-Pesa number copied to clipboard.",
    });
  };

  const handleInitiatePayment = () => {
    const cleanPhone = phoneNumber.replace(/\s/g, "");
    if (!cleanPhone.match(/^(\+?254|0)[17]\d{8}$/)) {
      toast({
        variant: "destructive",
        title: "Invalid phone number",
        description: "Please enter a valid Kenyan phone number.",
      });
      return;
    }
    initiatePaymentMutation.mutate(cleanPhone);
  };

  const handleManualConfirm = () => {
    confirmPaymentMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center gap-4 px-4">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl space-y-6">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !document) {
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
        <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="p-8">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
              <h2 className="mb-2 text-xl font-semibold">Document Not Found</h2>
              <p className="mb-4 text-muted-foreground">
                The document you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/upload">
                <Button>Upload New Document</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (document.paymentStatus === "completed") {
    navigate(`/email/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <Link href="/upload">
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
            <h1 className="mb-2 text-3xl font-bold">Complete Payment</h1>
            <p className="text-muted-foreground">
              Pay KES 60 via M-Pesa to process your document
            </p>
          </div>

          {/* Order Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium" data-testid="text-document-name">
                      {document.originalName}
                    </p>
                    <p className="text-sm text-muted-foreground">Document Assessment</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {document.paymentStatus === "pending" ? (
                    <><Clock className="mr-1 h-3 w-3" /> Pending</>
                  ) : (
                    <><CheckCircle className="mr-1 h-3 w-3" /> Completed</>
                  )}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-lg font-medium">Total Amount</span>
                <span className="text-2xl font-bold text-primary" data-testid="text-amount">
                  KES {document.amount}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* M-Pesa Payment */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                M-Pesa Payment
              </CardTitle>
              <CardDescription>
                Enter your M-Pesa phone number to receive the payment prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!paymentInitiated ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">M-Pesa Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., 0712345678 or +254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      data-testid="input-phone"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the phone number registered with M-Pesa
                    </p>
                  </div>
                  <Button
                    onClick={handleInitiatePayment}
                    disabled={!phoneNumber || initiatePaymentMutation.isPending}
                    className="w-full"
                    data-testid="button-initiate-payment"
                  >
                    {initiatePaymentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      "Pay KES 60 via M-Pesa"
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                    <p className="font-medium">Waiting for payment confirmation...</p>
                    <p className="text-sm text-muted-foreground">
                      Please check your phone and enter your M-Pesa PIN
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleManualConfirm}
                    disabled={confirmPaymentMutation.isPending}
                    className="w-full"
                    data-testid="button-confirm-payment"
                  >
                    {confirmPaymentMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "I've completed the payment"
                    )}
                  </Button>
                </div>
              )}

              {/* Manual Payment Option */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or pay manually</span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  Send KES 60 to this M-Pesa number:
                </p>
                <div className="flex items-center justify-between gap-2 rounded-md bg-background p-3">
                  <span className="text-lg font-bold" data-testid="text-mpesa-number">
                    {MPESA_NUMBER}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyNumber}
                    data-testid="button-copy-number"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  After sending, click "I've completed the payment" above
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-500" />
                <div className="text-sm">
                  <p className="mb-1 font-medium text-foreground">Important</p>
                  <p className="text-muted-foreground">
                    Your document will not be processed until payment is confirmed. 
                    If you don't complete payment, you'll need to upload your document again.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
