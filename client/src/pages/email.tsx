import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  Mail,
  AlertCircle,
  Loader2,
  PartyPopper
} from "lucide-react";
import type { Document } from "@shared/schema";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function EmailPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: ["/api/documents", id],
    enabled: !!id,
  });

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const submitEmailMutation = useMutation({
    mutationFn: async (data: EmailFormData) => {
      return await apiRequest("PATCH", `/api/documents/${id}/email`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", id] });
      setIsSubmitted(true);
      toast({
        title: "Email saved!",
        description: "You'll receive your assessment report at this email address.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to save email",
        description: "Please try again.",
      });
    },
  });

  const onSubmit = (data: EmailFormData) => {
    submitEmailMutation.mutate(data);
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
          <div className="mx-auto max-w-lg space-y-6">
            <Skeleton className="h-16 w-16 mx-auto rounded-full" />
            <Skeleton className="h-8 w-48 mx-auto" />
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

  if (document.paymentStatus !== "completed") {
    navigate(`/payment/${id}`);
    return null;
  }

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
        <div className="mx-auto max-w-lg">
          {/* Success Banner */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Thank you for your payment. Your document is ready for assessment.
            </p>
          </div>

          {/* Transaction Details */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Document</p>
                  <p className="font-medium" data-testid="text-document-name">
                    {document.originalName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Amount Paid</p>
                  <p className="font-medium text-primary">KES {document.amount}</p>
                </div>
                {document.mpesaReceiptNumber && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">M-Pesa Receipt</p>
                    <p className="font-medium" data-testid="text-receipt">
                      {document.mpesaReceiptNumber}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {!isSubmitted && !document.email ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Receive Your Assessment Report
                </CardTitle>
                <CardDescription>
                  Enter your email address to receive the assessment report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              data-testid="input-email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={submitEmailMutation.isPending}
                      data-testid="button-submit-email"
                    >
                      {submitEmailMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Receive Assessment Report"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-8 text-center">
                <PartyPopper className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h2 className="mb-2 text-xl font-semibold">All Done!</h2>
                <p className="mb-4 text-muted-foreground">
                  Your assessment report will be sent to{" "}
                  <span className="font-medium text-foreground" data-testid="text-email-confirmed">
                    {document.email || form.getValues("email")}
                  </span>
                </p>
                <Link href="/">
                  <Button data-testid="button-back-home">
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
