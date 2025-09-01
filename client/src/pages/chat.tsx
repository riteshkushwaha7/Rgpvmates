import { useState, useEffect, useRef } from 'react';

import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Send, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  senderId: string;
  matchId: string;
  createdAt: string;
  senderFirstName?: string;
  senderLastName?: string;
}

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
}

interface ChatProps {
  matchId: string | null;
  onBack: () => void;
}

const Chat = ({ matchId, onBack }: ChatProps) => {

  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
      fetchChatHistory();
      setupWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatchDetails = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/matching/matches`, {
        credentials: 'include',
      });

      if (response.ok) {
        const matches = await response.json();
        const currentMatch = matches.find((m: Match) => m.id === matchId);
        if (currentMatch) {
          setMatch(currentMatch);
        } else {
          toast.error('Match not found');
          onBack();
        }
      }
    } catch (error) {
      console.error('Error fetching match details:', error);
      toast.error('Failed to load match details');
    }
  };

  const fetchChatHistory = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/messages/match/${matchId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        toast.error('Failed to load chat history');
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const wsUrl = API_URL.replace('http', 'ws');
    console.log('Frontend: Setting up WebSocket connection for user:', user?.id, user?.firstName, user?.lastName);
    const socket = new WebSocket(`${wsUrl}?userId=${user?.id}&isAdmin=${user?.isAdmin || false}`);

    socket.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'new_message':
            console.log('Frontend: Received new_message', data.message);
            if (data.message.matchId === matchId) {
              setMessages(prev => {
                // Check if this is our own message (replace optimistic message)
                const isOwnMessage = data.message.senderId === user?.id;
                console.log('Frontend: Is own message?', isOwnMessage, 'sender:', data.message.senderId, 'user:', user?.id);
                if (isOwnMessage) {
                  // Replace optimistic message with real one
                  return prev.map(msg => 
                    msg.id.startsWith('temp-') && msg.senderId === user?.id 
                      ? data.message 
                      : msg
                  );
                } else {
                  // Add new message from other user
                  return [...prev, data.message];
                }
              });
            }
            break;
          
          case 'message_sent':
            console.log('Frontend: Received message_sent confirmation', data);
            // Replace optimistic message with confirmed message if provided
            if (data.message) {
              setMessages(prev => prev.map(msg => 
                msg.id.startsWith('temp-') && msg.senderId === user?.id 
                  ? data.message 
                  : msg
              ));
            }
            break;
          
          case 'connection':
            console.log('WebSocket connection confirmed');
            break;
          
          default:
            console.log('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.onclose = (event) => {
      setIsConnected(false);
      console.log('WebSocket disconnected:', event.code, event.reason);
      
      // Auto-reconnect if not a normal closure
      if (event.code !== 1000) {
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          setupWebSocket();
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWs(socket);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !ws || !isConnected || sendingMessage) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Create optimistic message for immediate display
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      senderId: user?.id || '',
      matchId: matchId || '',
      createdAt: new Date().toISOString(),
      senderFirstName: user?.firstName,
      senderLastName: user?.lastName,
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      console.log('Frontend: Sending message via WebSocket', {
        type: 'send_message',
        matchId,
        content: messageContent,
        userId: user?.id
      });
      
      ws.send(JSON.stringify({
        type: 'send_message',
        matchId,
        content: messageContent,
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove optimistic message if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setNewMessage(messageContent); // Restore the message in input
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Match not found</p>
          <Button onClick={onBack} className="mt-4">
            Back to Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-orange-100">
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
              
              <div>
                <h2 className="font-semibold text-gray-900">
                  {match.firstName} {match.lastName}
                </h2>
                <p className="text-sm text-gray-600">
                  {match.college} • {match.branch}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white'
                      : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  } ${message.id.startsWith('temp-') ? 'opacity-70' : ''}`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={`text-xs ${
                      isOwnMessage ? 'text-pink-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                    {message.id.startsWith('temp-') && (
                      <div className="w-2 h-2 bg-pink-200 rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected || sendingMessage}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
          >
            {sendingMessage ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
