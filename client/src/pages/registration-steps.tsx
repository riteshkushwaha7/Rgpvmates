import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, Clock, AlertCircle, Info } from 'lucide-react';

export default function RegistrationSteps() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Registration Submitted!
            </CardTitle>
            <p className="text-gray-600">
              Your account is being processed. Here's what happens next:
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Registration Steps */}
            <div className="space-y-4">
              {/* Step 1: Registration & ID Submission */}
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">1. Registration & ID Submission</h3>
                  <p className="text-green-700 text-sm">✅ Completed</p>
                  <p className="text-green-600 text-sm mt-1">
                    Your profile and ID cards have been successfully submitted.
                  </p>
                </div>
              </div>

              {/* Step 2: ID Approval */}
              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <Clock className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800">2. ID Approval</h3>
                  <p className="text-yellow-700 text-sm">⏳ Pending</p>
                  <p className="text-yellow-600 text-sm mt-1">
                    Our admin team is reviewing your ID cards for verification.
                  </p>
                </div>
              </div>

              {/* Step 3: Premium Payment */}
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <CheckCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800">3. Premium Payment (₹99)</h3>
                  <p className="text-blue-700 text-sm">✅ Currently Bypassed</p>
                  <p className="text-blue-600 text-sm mt-1">
                    Premium requirement is currently waived off for all users.
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">What to expect:</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Immediate: Registration submitted successfully</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>24-48 hours: ID verification by admin team</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>After approval: You can start using the app</span>
                </div>
              </div>
            </div>

            {/* Important Messages */}
            <div className="space-y-4">
              {/* Check back message */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 font-medium">
                    Check back in 24-48 hours by logging in, approval may take time.
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    You'll receive an email notification once your account is approved.
                  </p>
                </div>
              </div>

              {/* ID discrepancy warning */}
              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-orange-800 font-medium">
                    Important: In case of wrong ID/discrepancy, approval will be rejected.
                  </p>
                  <p className="text-orange-700 text-sm mt-1">
                    Please ensure your ID cards are clear, valid, and match your registration details.
                  </p>
                </div>
              </div>

              {/* What if rejected */}
              <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">
                    What if my registration is rejected?
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    If your registration is rejected, you can re-register with correct information. 
                    Common reasons for rejection include unclear ID photos, mismatched information, 
                    or invalid student credentials.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Link to="/login" className="block">
                <Button className="w-full" size="lg">
                  Go to Login
                </Button>
              </Link>
              
              <Link to="/" className="block">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Additional Info */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need help? <Link to="/contact" className="text-pink-600 hover:text-pink-700 underline">Contact us</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
