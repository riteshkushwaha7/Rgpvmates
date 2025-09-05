import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { config } from '../lib/config';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, MessageCircle, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNavigation from '../components/BottomNavigation';

interface Match {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  college: string;
  branch: string;
  graduationYear: string;
  age: number;
  createdAt: string;
}

export default function Matches() {
  const navigate = useNavigate();
  const { getAuthHeaders, hasValidCredentials } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      if (!hasValidCredentials()) {
        console.error('🔍 Matches - No valid credentials found');
        toast.error('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Matches - Fetching matches from:', `${config.API_URL}/api/matching/matches`);
      
      const headers = getAuthHeaders();
      console.log('🔍 Matches - Sending JWT headers:', headers);
      
      if (!headers['Authorization']) {
        console.error('🔍 Matches - No JWT token available');
        toast.error('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${config.API_URL}/api/matching/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      console.log('🔍 Matches - Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Matches - Matches data received:', data);
        setMatches(data);
      } else {
        const errorData = await response.text();
        console.error('🔍 Matches - Error response:', errorData);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please refresh the page or try logging in again.');
        } else {
          toast.error('Failed to load matches');
        }
      }
    } catch (error) {
      console.error('🔍 Matches - Fetch error:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Your Matches</h1>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse h-64"></div>
            ))}
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Your Matches</h1>
                <p className="text-sm text-gray-600">0 matches</p>
              </div>
            </div>
          </div>
        </header>

        {/* No Matches State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-16 h-16 text-pink-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-6">
              Start swiping to find your perfect match!
            </p>
            <Button
              onClick={() => navigate('/discover')}
              className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
            >
              Start Discovering
            </Button>
          </div>
        </div>
        
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Your Matches</h1>
              <p className="text-sm text-gray-600">
                {matches.length} match{matches.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Matches Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {matches.map((match) => (
            <Card 
              key={match.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
              onClick={() => navigate(`/chat/${match.id}`)}
            >
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Profile Picture */}
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-br from-pink-100 to-orange-100">
                    {match.profileImageUrl ? (
                      <img 
                        src={match.profileImageUrl}
                        alt={`${match.firstName} ${match.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Name + Age */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {match.firstName} {match.lastName}, {match.age}
                  </h3>

                  {/* College + Grad Year + Branch Label */}
                  <p className="text-sm text-gray-600 mb-4">
                    {match.college} • {match.graduationYear} • {match.branch}
                  </p>

                  {/* Chat Button */}
                  <Button 
                    className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white transition-all duration-200 group-hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat/${match.id}`);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>

                  {/* Match Date */}
                  <p className="text-xs text-gray-500 mt-3">
                    Matched {new Date(match.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}