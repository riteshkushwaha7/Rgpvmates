import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Shield, Users, GraduationCap } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rgpv-bg to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-rgpv-pink">💕 RGPV Mates</div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-rgpv-pink px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="#safety" onClick={() => setLocation('/safety')} className="text-gray-700 hover:text-rgpv-pink px-3 py-2 rounded-md text-sm font-medium">Safety</a>
                <a href="#contact" onClick={() => setLocation('/contact')} className="text-gray-700 hover:text-rgpv-pink px-3 py-2 rounded-md text-sm font-medium">Contact</a>
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-rgpv-pink text-white px-4 py-2 rounded-lg hover:bg-rgpv-dark transition-colors"
                  data-testid="button-login"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-float mb-8">
              <span className="text-6xl md:text-8xl">💕</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Your <span className="text-rgpv-pink">RGPV</span> Match
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with verified RGPV students in a safe, secure environment. 
              Swipe, match, and find meaningful connections with your college mates.
            </p>
            <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
              <Button
                onClick={() => window.location.href = "/api/login"}
                className="w-full md:w-auto bg-rgpv-pink text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-rgpv-dark transition-all transform hover:scale-105 animate-pulseGlow"
                data-testid="button-get-started"
              >
                Get Started - ₹99
              </Button>
              <Button
                variant="outline"
                className="w-full md:w-auto border-2 border-rgpv-pink text-rgpv-pink px-8 py-4 rounded-xl text-lg font-semibold hover:bg-rgpv-pink hover:text-white transition-all"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Feature Preview Cards */}
          <div id="features" className="mt-20 grid md:grid-cols-3 gap-8">
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <GraduationCap className="text-4xl mb-4 text-rgpv-pink" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Students</h3>
                <p className="text-gray-600">Only verified RGPV students with ID verification</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Shield className="text-4xl mb-4 text-rgpv-pink" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe & Secure</h3>
                <p className="text-gray-600">Report & block features for your safety</p>
              </CardContent>
            </Card>
            <Card className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <Users className="text-4xl mb-4 text-rgpv-pink" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Matching</h3>
                <p className="text-gray-600">Connect based on branch, year, and interests</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
