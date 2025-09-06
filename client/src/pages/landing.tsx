import { Link } from 'react-router-dom';
import { Heart, Shield, Users, MessageCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-pink-100">

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <span className="text-2xl font-bold gradient-text">RGPV Mates</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/safety" className="text-gray-600 hover:text-pink-500 transition-colors">
              Safety
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-pink-500 transition-colors">
              Terms
            </Link>
                         <Link to="/contact" className="text-gray-600 hover:text-pink-500 transition-colors">
               Contact
             </Link>
             <Link to="/login" className="gradient-button text-white px-6 py-2 rounded-full font-semibold">
               Login
             </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Icons */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                <Heart className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-pink-300 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gray-800">Find Your </span>
            <span className="gradient-text">RGPV</span>
            <span className="text-gray-800"> Match</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with verified RGPV students in a safe, secure environment. 
            Swipe, match, and find meaningful connections with your college mates.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              to="/register"
              className="gradient-button text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Link>
            <Link 
              to="/login"
              className="border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-50 transition-all duration-300"
            >
              Login
            </Link>
            <Link 
              to="/safety"
              className="border-2 border-pink-500 text-pink-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-pink-50 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="card-hover bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Verified Students</h3>
              <p className="text-gray-600">
                All profiles are verified with student IDs to ensure authenticity and safety.
              </p>
            </div>

            <div className="card-hover bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Smart Matching</h3>
              <p className="text-gray-600">
                Advanced algorithms help you find compatible matches based on your preferences.
              </p>
            </div>

            <div className="card-hover bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                <MessageCircle className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Safe Messaging</h3>
              <p className="text-gray-600">
                Built-in chat system with safety features to help you connect securely.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 mt-20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">
            © 2025 RGPV Mates. All rights reserved. | 
            <Link to="/safety" className="text-pink-500 hover:text-pink-600 ml-2">
              Safety Guidelines
            </Link> | 
            <Link to="/contact" className="text-pink-500 hover:text-pink-600 ml-2">
              Contact Us
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
