import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Heart, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
  
  const handleChatOpen = (matchId: string) => {
    navigate(`/chat/${matchId}`);
  };
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/matching/matches`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      } else {
        toast.error('Failed to load matches');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Your Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="p-4 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Your Matches</h2>
        <div className="text-center py-12">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-16 h-16 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
          <p className="text-gray-600">
            Start swiping to find your perfect match!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Your Matches</h2>
      
      {/* Matches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {matches.map((match) => (
          <Card 
            key={match.id}
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
            onClick={() => handleChatOpen(match.id)}
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
                    handleChatOpen(match.id);
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
      
      <BottomNavigation />
    </div>
  );
}
