import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { config } from '../lib/config';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MessageCircle, User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNavigation from '../components/BottomNavigation';

interface Match {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  college: string;
  branch: string;
  graduationYear: string;
  age: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const { user, getAuthHeaders, hasValidCredentials } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      
      if (!hasValidCredentials()) {
        console.error('🔍 Messages - No valid credentials found');
        toast.error('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Messages - Fetching matches from:', `${config.API_URL}/api/matching/matches`);
      
      const headers = getAuthHeaders();
      console.log('🔍 Messages - Sending JWT headers:', headers);
      
      if (!headers['Authorization']) {
        console.error('🔍 Messages - No JWT token available');
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

      console.log('🔍 Messages - Response status:', response.status);

      if (response.ok) {
        const matchesData = await response.json();
        console.log('🔍 Messages - Matches data received:', matchesData);
        
        // Fetch additional data for each match
        const matchesWithDetails = await Promise.all(
          matchesData.map(async (match: Match) => {
            try {
              // Get last message and unread count
              const messagesResponse = await fetch(`${config.API_URL}/api/messages/match/${match.id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  ...headers
                }
              });
              
              if (messagesResponse.ok) {
                const messages = await messagesResponse.json();
                const lastMessage = messages[messages.length - 1];
                const unreadCount = messages.filter((msg: any) => 
                  !msg.isRead && msg.senderId !== user?.id
                ).length;
                
                return {
                  ...match,
                  lastMessage: lastMessage?.content || 'No messages yet',
                  lastMessageTime: lastMessage?.createdAt,
                  unreadCount,
                };
              }
              
              return {
                ...match,
                lastMessage: 'No messages yet',
                unreadCount: 0,
              };
            } catch (error) {
              console.error('Error fetching match details:', error);
              return {
                ...match,
                lastMessage: 'No messages yet',
                unreadCount: 0,
              };
            }
          })
        );
        
        setMatches(matchesWithDetails);
      } else {
        const errorData = await response.text();
        console.error('🔍 Messages - Error response:', errorData);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please refresh the page or try logging in again.');
        } else {
          toast.error('Failed to load matches');
        }
      }
    } catch (error) {
      console.error('🔍 Messages - Fetch error:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
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
                <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                <p className="text-sm text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="spinner w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading messages...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
              <p className="text-sm text-gray-600">
                {matches.length} conversation{matches.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages List */}
      <div className="p-4 space-y-4">
        {matches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">
                Start matching with people to begin conversations!
              </p>
              <Button 
                onClick={() => navigate('/discover')}
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
              >
                Start Discovering
              </Button>
            </CardContent>
          </Card>
        ) : (
          matches.map((match) => (
            <Card 
              key={match.id} 
              className="cursor-pointer hover:shadow-md transition-shadow duration-200"
              onClick={() => navigate(`/chat/${match.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* Profile Image */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-orange-100 flex-shrink-0">
                    {match.profileImageUrl ? (
                      <img
                        src={match.profileImageUrl}
                        alt={`${match.firstName} ${match.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {match.firstName} {match.lastName}
                      </h3>
                      {match.lastMessageTime && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(match.lastMessageTime)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {truncateMessage(match.lastMessage || 'No messages yet')}
                      </p>
                      
                      {match.unreadCount && match.unreadCount > 0 && (
                        <Badge className="ml-2 bg-pink-500 text-white text-xs">
                          {match.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {match.college} • {match.branch}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Messages;