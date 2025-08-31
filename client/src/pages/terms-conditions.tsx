import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Terms and Conditions
            </CardTitle>
            <p className="text-center text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using RGPV Mates, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Eligibility</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must be at least 18 years old to use this service</li>
                  <li>You must be a current student or alumni of RGPV-affiliated institutions</li>
                  <li>You must provide accurate and truthful information during registration</li>
                  <li>You must upload valid student ID cards for verification</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Conduct</h2>
                <p className="mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Upload inappropriate, offensive, or explicit content</li>
                  <li>Impersonate another person or entity</li>
                  <li>Attempt to gain unauthorized access to the service</li>
                  <li>Use automated systems to access the service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Privacy and Data Protection</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We collect and process your personal data in accordance with our Privacy Policy</li>
                  <li>Your profile information and photos will be visible to other users</li>
                  <li>We implement security measures to protect your data</li>
                  <li>You can request deletion of your account and data at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Content and Intellectual Property</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You retain ownership of content you upload</li>
                  <li>You grant us license to use your content for service provision</li>
                  <li>You are responsible for ensuring you have rights to upload content</li>
                  <li>We reserve the right to remove inappropriate content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Premium Features</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Premium features may require payment</li>
                  <li>Payment terms are subject to change with notice</li>
                  <li>Refunds are handled according to our refund policy</li>
                  <li>Premium features are provided "as is" without warranty</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Account Termination</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We may terminate accounts for violations of these terms</li>
                  <li>You may delete your account at any time</li>
                  <li>Account deletion is permanent and irreversible</li>
                  <li>Some data may be retained for legal compliance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The service is provided "as is" without warranties</li>
                  <li>We are not responsible for user interactions or relationships</li>
                  <li>We do not guarantee successful matches or connections</li>
                  <li>Service availability may vary and is not guaranteed</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p>
                  RGPV Mates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
                <p>
                  For questions about these terms, please contact us through the contact form on our website.
                </p>
              </section>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  By using RGPV Mates, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
