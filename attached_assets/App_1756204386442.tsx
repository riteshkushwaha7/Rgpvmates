import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Registration from "@/pages/registration";
import ProfileSetup from "@/pages/profile-setup";
import Verification from "@/pages/verification";
import Payment from "@/pages/payment";
import Swipe from "@/pages/swipe";
import Matches from "@/pages/matches";
import Chat from "@/pages/chat";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/register" component={Registration} />
          <Route path="/profile-setup" component={ProfileSetup} />
          <Route path="/verification" component={Verification} />
          <Route path="/payment" component={Payment} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/swipe" component={Swipe} />
          <Route path="/matches" component={Matches} />
          <Route path="/chat/:matchId" component={Chat} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
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
