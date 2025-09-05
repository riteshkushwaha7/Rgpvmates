import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';

const Chat = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/matches')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
              <p className="text-sm text-gray-600">Match ID: {matchId}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">Chat functionality coming soon!</p>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Chat;