import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut, 
  User,
  Crown,
  Sparkles
} from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    matches: 0,
    messages: 0,
    likes: 0,
  });

  useEffect(() => {
    // Fetch user stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Fetch matches count
      const matchesResponse = await fetch(`${API_URL}/api/matching/matches`, {
        credentials: 'include',
      });
      if (matchesResponse.ok) {
        const matches = await matchesResponse.json();
        setStats(prev => ({ ...prev, matches: matches.length }));
      }

      // Fetch unread messages count
      const messagesResponse = await fetch(`${API_URL}/api/messages/unread/count`, {
        credentials: 'include',
      });
      if (messagesResponse.ok) {
        const { unreadCount } = await messagesResponse.json();
        setStats(prev => ({ ...prev, messages: unreadCount }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Heart className="w-5 h-5 text-pink-400 -ml-2" />
              </div>
              <span className="text-xl font-bold gradient-text">RGPV Mates</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/messages"
                className="flex items-center space-x-2 text-gray-600 hover:text-pink-500 transition-colors relative"
              >
                <MessageCircle className="w-5 h-5" />
                {stats.messages > 0 && (
                  <span className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.messages}
                  </span>
                )}
              </Link>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-pink-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome back, <span className="gradient-text">{user.firstName}!</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Ready to discover new connections? Let's find your perfect match!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card-hover bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Matches</p>
                <p className="text-3xl font-bold text-gray-800">{stats.matches}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="card-hover bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Unread Messages</p>
                <p className="text-3xl font-bold text-gray-800">{stats.messages}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card-hover bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Profile Status</p>
                <p className="text-lg font-semibold text-green-600">
                  {user.paymentDone ? 'Premium' : 'Basic'}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                {user.paymentDone ? (
                  <Crown className="w-6 h-6 text-green-600" />
                ) : (
                  <Sparkles className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Link 
            to="/discover"
            className="card-hover bg-white p-6 rounded-2xl shadow-lg text-center group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Discover</h3>
            <p className="text-gray-600 text-sm">
              Find new people to connect with
            </p>
          </Link>

          <Link 
            to="/matches"
            className="card-hover bg-white p-6 rounded-2xl shadow-lg text-center group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Heart className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Matches</h3>
            <p className="text-gray-600 text-sm">
              View your mutual connections
            </p>
          </Link>

          <Link 
            to="/messages"
            className="card-hover bg-white p-6 rounded-2xl shadow-lg text-center group relative"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <MessageCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Messages</h3>
            <p className="text-gray-600 text-sm">
              Chat with your matches
            </p>
            {stats.messages > 0 && (
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {stats.messages}
              </div>
            )}
          </Link>

          <Link 
            to="/settings"
            className="card-hover bg-white p-6 rounded-2xl shadow-lg text-center group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Settings</h3>
            <p className="text-gray-600 text-sm">
              Manage your account
            </p>
          </Link>

          <Link 
            to="/profile"
            className="card-hover bg-white p-6 rounded-2xl shadow-lg text-center group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Profile</h3>
            <p className="text-gray-600 text-sm">
              Manage your profile
            </p>
          </Link>
        </div>

        {/* Premium Upgrade Section */}
        {!user.paymentDone && (
          <div className="mt-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-8 text-white text-center">
            <Crown className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Upgrade to Premium</h2>
            <p className="text-lg mb-6 opacity-90">
              Get unlimited likes, see who liked you, and more premium features!
            </p>
            <Link
              to="/payment"
              className="bg-white text-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Upgrade Now - ₹99
            </Link>
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
