import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { config } from '../lib/config';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut, 
  User,
  Crown
} from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';

const Dashboard = () => {
  const { user, logout, getUserHeaders } = useAuth();
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
      // Fetch matches count
      const matchesResponse = await fetch(`${config.API_URL}/api/matching/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getUserHeaders()
        }
      });
      if (matchesResponse.ok) {
        const matches = await matchesResponse.json();
        setStats(prev => ({ ...prev, matches: matches.length }));
      }

      // Fetch unread messages count
      const messagesResponse = await fetch(`${config.API_URL}/api/messages/unread/count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getUserHeaders()
        }
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
    <div className="min-h-screen bg-gray-50">
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.firstName}
          </h1>
          <p className="text-gray-600">
            Ready to discover new connections
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Matches</p>
                <p className="text-2xl font-bold text-gray-800">{stats.matches}</p>
              </div>
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-800">{stats.messages}</p>
              </div>
              <MessageCircle className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Profile Status</p>
                <p className="text-lg font-semibold text-green-600">
                  {user.paymentDone ? 'Premium' : 'Basic'}
                </p>
              </div>
              {user.paymentDone ? (
                <Crown className="w-6 h-6 text-green-600" />
              ) : (
                <User className="w-6 h-6 text-gray-600" />
              )}
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link 
            to="/discover"
            className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow"
          >
            <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Discover</h3>
            <p className="text-gray-600 text-sm">
              Find new people
            </p>
          </Link>

          <Link 
            to="/matches"
            className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow"
          >
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Matches</h3>
            <p className="text-gray-600 text-sm">
              View connections
            </p>
          </Link>

          <Link 
            to="/messages"
            className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow relative"
          >
            <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Messages</h3>
            <p className="text-gray-600 text-sm">
              Chat with matches
            </p>
            {stats.messages > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {stats.messages}
              </div>
            )}
          </Link>

          <Link 
            to="/settings"
            className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow"
          >
            <Settings className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Settings</h3>
            <p className="text-gray-600 text-sm">
              Manage account
            </p>
          </Link>

          <Link 
            to="/profile"
            className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow"
          >
            <User className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800 mb-1">Profile</h3>
            <p className="text-gray-600 text-sm">
              Manage profile
            </p>
          </Link>
        </div>

        {/* Premium Upgrade Section */}
        {!user.paymentDone && (
          <div className="mt-8 bg-pink-500 rounded-lg p-6 text-white text-center">
            <Crown className="w-8 h-8 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
            <p className="mb-4 opacity-90">
              Get unlimited likes and premium features
            </p>
            <Link
              to="/payment"
              className="bg-white text-pink-500 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition-colors inline-block"
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
