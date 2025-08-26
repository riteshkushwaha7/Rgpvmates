import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Payment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const paymentMutation = useMutation({
    mutationFn: async () => {
      // Create payment record
      const response = await apiRequest("POST", "/api/payments", {
        amount: 99,
        status: "pending"
      });
      return response.json();
    },
    onSuccess: async (payment) => {
      // Simulate Razorpay payment success
      await apiRequest("PUT", `/api/payments/${payment.id}`, {
        status: "completed",
        razorpayPaymentId: "pay_" + Math.random().toString(36).substr(2, 9)
      });
      
      toast({
        title: "Payment Successful",
        description: "Welcome to RGPV Mates! You can now start swiping.",
      });
      setLocation("/app");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePayment = () => {
    paymentMutation.mutate();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-rgpv-bg py-20">
      <div className="max-w-md mx-auto px-4">
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">💳</div>
            <CardTitle className="text-2xl font-bold text-gray-900">Premium Access</CardTitle>
            <p className="text-gray-600 mt-2">Unlock unlimited matching for ₹99</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <div className="bg-gradient-to-r from-rgpv-pink to-pink-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Premium Features</h3>
              <ul className="space-y-2">
                {[
                  "Unlimited swipes and matches",
                  "See who liked your profile", 
                  "Advanced filtering options",
                  "Priority customer support"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="mr-3" size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Premium Access</span>
                <span className="text-xl font-bold text-rgpv-pink">₹99</span>
              </div>
              <p className="text-sm text-gray-500">One-time payment • Non-refundable</p>
            </div>
            
            <Button 
              onClick={handlePayment}
              disabled={paymentMutation.isPending}
              className="w-full bg-rgpv-pink text-white py-3 rounded-lg font-semibold hover:bg-rgpv-dark transition-colors"
              data-testid="button-pay-razorpay"
            >
              <CreditCard className="mr-2" size={20} />
              {paymentMutation.isPending ? "Processing..." : "Pay with Razorpay"}
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Secure payment powered by Razorpay<br/>
                By proceeding, you agree to our terms and conditions
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
