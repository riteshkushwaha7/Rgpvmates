import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, IdCard } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Verification() {
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

  const handleSubmitVerification = () => {
    toast({
      title: "Verification Submitted",
      description: "Your ID has been submitted for verification. You'll be notified once approved.",
    });
    setLocation("/payment");
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white py-20">
      <div className="max-w-md mx-auto px-4">
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">🆔</div>
            <CardTitle className="text-2xl font-bold text-gray-900">Student ID Verification</CardTitle>
            <p className="text-gray-600 mt-2">Upload your RGPV student ID for verification</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            <Alert className="bg-blue-50 border border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-900">
                <h4 className="font-medium mb-2">Verification Requirements</h4>
                <ul className="text-sm space-y-1">
                  <li>• Clear photo of your RGPV student ID</li>
                  <li>• ID should be readable and not expired</li>
                  <li>• Verification typically takes 24-48 hours</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student ID Card</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-rgpv-pink transition-colors cursor-pointer">
                <IdCard className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600 font-medium">Upload Student ID Card</p>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  data-testid="input-id-upload"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleSubmitVerification}
              className="w-full bg-rgpv-pink text-white py-3 rounded-lg font-semibold hover:bg-rgpv-dark transition-colors"
              data-testid="button-submit-verification"
            >
              Submit for Verification
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                After verification approval, you'll proceed to payment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
