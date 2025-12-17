import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  CreditCard,
  Mail,
  FileText,
  Shield,
  Clock,
  CheckCircle,
} from "lucide-react";

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
              <Button variant="ghost">Admin</Button>
            </Link>
            <Link href="/signup">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Get Started
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
              Create a free account, upload your documents, pay securely via
              M-Pesa, and receive your assessment report by email.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="px-8">
                  Get Started
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure Payment</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4" />
                <span>Fast Processing</span>
                <span className="mx-2">•</span>
                <span className="font-semibold text-foreground">
                  KES 60 per Document
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section className="border-t bg-background py-20">
        <div className="container mx-auto max-w-md px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold">Create a Free Account</h2>
          <p className="mb-6 text-muted-foreground">
            Sign up once to upload documents, make payments, and receive reports
            by email.
          </p>

          <Card>
            <CardContent className="space-y-4 p-6">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-md border px-4 py-2"
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-md border px-4 py-2"
              />
              <Button className="w-full" size="lg">
                Create Free Account
              </Button>
              <p className="text-xs text-muted-foreground">
                No payment required to sign up.
              </p>
            </CardContent>
          </Card>
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
            <Card>
              <CardContent className="pt-8">
                <Upload className="mb-4 h-6 w-6 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">
                  Upload Your Document
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload .doc, .docx, or .rtf files up to 10MB.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-8">
                <CreditCard className="mb-4 h-6 w-6 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">Pay via M-Pesa</h3>
                <p className="text-sm text-muted-foreground">
                  Pay KES 60 securely using M-Pesa STK Push.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-8">
                <Mail className="mb-4 h-6 w-6 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">
                  Receive Assessment
                </h3>
                <p className="text-sm text-muted-foreground">
                  Report delivered straight to your email.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto max-w-lg px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Simple Pricing</h2>
          <Card>
            <div className="bg-primary p-6 text-primary-foreground">
              <div className="text-5xl font-bold">KES 60</div>
              <p>per document</p>
            </div>
            <CardContent className="p-6">
              <Link href="/signup">
                <Button className="w-full" size="lg">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
          <span className="font-semibold">DocAssess</span>
          <div className="text-center text-sm">
            <p>M-Pesa Payment Number</p>
            <p className="font-semibold">+254710558915</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
