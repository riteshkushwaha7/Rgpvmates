import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Lightbulb, AlertTriangle, CreditCard, Flag } from "lucide-react";
import { useLocation } from "wouter";

export default function SafetyGuidelines() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-rgpv-bg py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-pink-500" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety & Guidelines</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your safety is our priority. Please read and follow these guidelines.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Community Guidelines */}
          <Card className="bg-white rounded-lg shadow">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mb-3 text-pink-500" />
              <h2 className="text-xl font-bold text-gray-900 mb-4">Community Guidelines</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Respectful Communication</h3>
                    <p className="text-gray-600 text-sm">Always communicate with respect and kindness. Treat others as you would like to be treated.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Authentic Profiles</h3>
                    <p className="text-gray-600 text-sm">Use real photos and accurate information. Fake profiles will be permanently banned.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Privacy First</h3>
                    <p className="text-gray-600 text-sm">Don't share personal information until you're comfortable and trust the person.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Safety Tips */}
          <Card className="bg-white rounded-lg shadow">
            <CardContent className="p-6">
              <Lightbulb className="w-8 h-8 mb-3 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900 mb-4">Safety Tips</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Shield className="text-blue-500 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Meet in Public</h3>
                    <p className="text-gray-600 text-sm">Always meet in public places for your first few meetings.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="text-blue-500 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Trust Your Instincts</h3>
                    <p className="text-gray-600 text-sm">If something feels wrong, trust your gut and report it immediately.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="text-blue-500 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">Keep Friends Informed</h3>
                    <p className="text-gray-600 text-sm">Let friends know where you're going and who you're meeting.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Prohibited Behavior */}
        <Card className="bg-red-50 border border-red-200 rounded-lg mb-6">
          <CardContent className="p-6">
            <AlertTriangle className="w-8 h-8 mb-3 text-red-600" />
            <h2 className="text-xl font-bold text-red-900 mb-4">Prohibited Behavior</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-red-900 mb-3">Zero Tolerance for:</h3>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-2 h-1 bg-white"></div>
                    </div>
                    Harassment or bullying
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-2 h-1 bg-white"></div>
                    </div>
                    Offensive or inappropriate content
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-2 h-1 bg-white"></div>
                    </div>
                    Spam or promotional messages
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-2 h-1 bg-white"></div>
                    </div>
                    Sharing personal information without consent
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-3">Consequences:</h3>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-2 h-1 bg-white"></div>
                    </div>
                    Immediate account suspension
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-2 h-1 bg-white"></div>
                    </div>
                    Permanent ban for severe violations
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-2 h-1 bg-white"></div>
                    </div>
                    Report to college authorities if needed
                  </li>
                  <li className="flex items-center">
                    <div className="w-4 h-4 mr-2 rounded-full bg-red-600 flex items-center justify-center">
                      <div className="w-2 h-1 bg-white"></div>
                    </div>
                    Legal action for illegal activities
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Policy */}
        <Card className="bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
          <CardContent className="p-6">
            <CreditCard className="w-8 h-8 mb-3 text-yellow-600" />
            <h2 className="text-xl font-bold text-yellow-900 mb-3">Payment Policy</h2>
            <div className="text-yellow-800">
              <p className="mb-4">
                <strong>Non-Refundable:</strong> The ₹99 premium access fee is non-refundable under any circumstances. 
                This policy is clearly stated during the payment process.
              </p>
              <p className="mb-4">
                <strong>Account Termination:</strong> If your account is banned due to policy violations, 
                you will not receive a refund for the premium access fee.
              </p>
              <p>
                <strong>Service Availability:</strong> We strive to maintain 99.9% uptime, but temporary 
                service interruptions do not qualify for refunds.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Reporting */}
        <Card className="bg-white rounded-lg shadow text-center">
          <CardContent className="p-6">
            <Flag className="w-8 h-8 mx-auto mb-3 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900 mb-3">Report Inappropriate Behavior</h2>
            <p className="text-gray-600 mb-6">
              If you encounter any inappropriate behavior, please report it immediately. 
              We take all reports seriously and will investigate promptly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setLocation("/contact")}
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                data-testid="button-report-issue"
              >
                Report an Issue
              </Button>
              <Button 
                onClick={() => setLocation("/contact")}
                variant="outline"
                className="border-2 border-rgpv-pink text-rgpv-pink px-6 py-3 rounded-lg font-semibold hover:bg-rgpv-pink hover:text-white transition-colors"
                data-testid="button-contact-support"
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <Button 
            onClick={() => window.history.back()}
            variant="ghost"
            className="text-pink-500 hover:underline"
            data-testid="button-go-back"
          >
            ← Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
