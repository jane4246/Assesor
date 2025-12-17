import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Signup from "@/pages/signup";
import UploadPage from "@/pages/upload";
import PaymentPage from "@/pages/payment";
import EmailPage from "@/pages/email";
import AdminPage from "@/pages/admin";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Signup page */}
      <Route path="/signup" component={Signup} />

      {/* Existing flow */}
      <Route path="/upload" component={UploadPage} />
      <Route path="/payment/:id" component={PaymentPage} />
      <Route path="/email/:id" component={EmailPage} />
      <Route path="/admin" component={AdminPage} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
