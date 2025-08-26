import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Registration from "@/pages/registration";
import ProfileSetup from "@/pages/profile-setup";
import Verification from "@/pages/verification";
import Payment from "@/pages/payment";
import AppDashboard from "@/pages/app-dashboard";
import SafetyGuidelines from "@/pages/safety-guidelines";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/safety" component={SafetyGuidelines} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      
      {isLoading ? (
        <Route path="*">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">💕</div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </Route>
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/registration" component={Registration} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          {/* Authenticated routes - check profile completion status */}
          {!user?.profile ? (
            <>
              <Route path="/profile-setup" component={ProfileSetup} />
              <Route path="*">
                <ProfileSetup />
              </Route>
            </>
          ) : user.profile.verificationStatus === 'pending' ? (
            <>
              <Route path="/verification" component={Verification} />
              <Route path="*">
                <Verification />
              </Route>
            </>
          ) : user.profile.verificationStatus === 'rejected' ? (
            <Route path="*">
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-4">
                  <div className="text-4xl mb-4">❌</div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Verification Rejected</h1>
                  <p className="text-gray-600 mb-6">
                    Your student ID verification was rejected. Please contact support for assistance.
                  </p>
                  <button 
                    onClick={() => window.location.href = "/contact"}
                    className="bg-rgpv-pink text-white px-6 py-3 rounded-lg font-semibold hover:bg-rgpv-dark transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </Route>
          ) : !user.profile.isPaid ? (
            <>
              <Route path="/payment" component={Payment} />
              <Route path="*">
                <Payment />
              </Route>
            </>
          ) : (
            <>
              <Route path="/" component={AppDashboard} />
              <Route path="/app" component={AppDashboard} />
              <Route path="/profile-setup" component={ProfileSetup} />
              <Route path="/verification" component={Verification} />
              <Route path="/payment" component={Payment} />
              <Route component={NotFound} />
            </>
          )}
        </>
      )}
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
