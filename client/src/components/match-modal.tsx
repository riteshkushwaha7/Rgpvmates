import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    firstName?: string;
    profile?: {
      profilePicture?: string;
    };
  };
  currentUser: {
    firstName?: string;
    profile?: {
      profilePicture?: string;
    };
  };
  onSendMessage: () => void;
}

export default function MatchModal({ 
  isOpen, 
  onClose, 
  matchedUser, 
  currentUser, 
  onSendMessage 
}: MatchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-pink-400 to-red-500 border-none text-white">
        <div className="text-center p-4">
          {/* Profile Photos */}
          <div className="flex justify-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
              {currentUser.profile?.profilePicture ? (
                <img 
                  src={currentUser.profile.profilePicture} 
                  alt="Your profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {(currentUser.firstName?.[0] || 'Y').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
              {matchedUser.profile?.profilePicture ? (
                <img 
                  src={matchedUser.profile.profilePicture} 
                  alt={`${matchedUser.firstName}'s profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {(matchedUser.firstName?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Animated Heart */}
          <div className="text-6xl mb-4">
            <Heart className="inline-block animate-heartbeat text-white fill-white" size={64} />
          </div>
          
          {/* Match Text */}
          <h2 className="text-2xl font-bold mb-2">It's a Match!</h2>
          <p className="text-pink-100 mb-8">
            You and {matchedUser.firstName} liked each other
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={onSendMessage}
              className="w-full bg-white text-rgpv-pink py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              data-testid="button-send-message"
            >
              Send Message
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="w-full border-2 border-white text-white py-3 rounded-xl font-semibold hover:bg-white hover:text-rgpv-pink bg-transparent transition-colors"
              data-testid="button-keep-swiping"
            >
              Keep Swiping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
