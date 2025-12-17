import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, CreditCard, Mail, FileText, Shield, Clock, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">DocAssess</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" data-testid="link-admin">
                Admin
              </Button>
            </Link>
            <Link href="/upload">
              <Button data-testid="button-upload-cta">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              Trusted by professionals
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Professional Document Assessment Services
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              Upload your documents for expert assessment. Pay securely via M-Pesa and receive 
              detailed evaluation reports directly to your email.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/upload">
                <Button size="lg" className="px-8" data-testid="button-hero-upload">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Document
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure Payment</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4" />
                <span>Fast Processing</span>
                <span className="mx-2">•</span>
                <span className="font-semibold text-foreground">KES 60 per Document</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-card/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How It Works</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Three simple steps to get your document professionally assessed
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <Card className="relative overflow-visible">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </div>
              <CardContent className="pt-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Upload Your Document</h3>
                <p className="text-sm text-muted-foreground">
                  Select your .doc, .docx, or .rtf file. Our secure system accepts documents up to 10MB.
                </p>
              </CardContent>
            </Card>
            <Card className="relative overflow-visible">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </div>
              <CardContent className="pt-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Pay via M-Pesa</h3>
                <p className="text-sm text-muted-foreground">
                  Complete your payment of KES 60 securely through M-Pesa STK Push on your phone.
                </p>
              </CardContent>
            </Card>
            <Card className="relative overflow-visible">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </div>
              <CardContent className="pt-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Receive Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Get your detailed assessment report delivered directly to your email address.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="mb-4 text-3xl font-bold">Simple Pricing</h2>
            <p className="mb-8 text-muted-foreground">
              One flat rate for all document assessments
            </p>
            <Card className="overflow-hidden">
              <div className="bg-primary p-6 text-primary-foreground">
                <div className="mb-2 text-5xl font-bold">KES 60</div>
                <p className="text-primary-foreground/80">per document</p>
              </div>
              <CardContent className="p-6">
                <ul className="mb-6 space-y-3 text-left">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Supports .doc, .docx, and .rtf formats</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Secure M-Pesa payment</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Assessment report via email</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Files up to 10MB accepted</span>
                  </li>
                </ul>
                <Link href="/upload">
                  <Button className="w-full" size="lg" data-testid="button-pricing-upload">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-semibold">DocAssess</span>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-1">M-Pesa Payment Number</p>
              <p className="font-semibold text-foreground" data-testid="text-mpesa-number">
                +254710558915
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional Document Assessment Services
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
