import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    id: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      profilePicture?: string;
    };
  } | null;
  currentUser: {
    id: string;
    firstName?: string;
    profileImageUrl?: string;
  } | null;
  onStartChat: () => void;
}

export default function MatchModal({ 
  isOpen, 
  onClose, 
  matchedUser, 
  currentUser, 
  onStartChat 
}: MatchModalProps) {
  if (!matchedUser || !currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-pink-400 to-red-500 border-none text-white p-8">
        <div className="text-center">
          {/* Profile Photos */}
          <div className="flex justify-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500">
              {currentUser.profileImageUrl ? (
                <img 
                  src={currentUser.profileImageUrl} 
                  alt="Your profile"
                  className="w-full h-full object-cover"
                  data-testid="current-user-avatar"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {(currentUser.firstName?.[0] || 'U').toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-purple-400 to-pink-500">
              {matchedUser.profile?.profilePicture ? (
                <img 
                  src={matchedUser.profile.profilePicture} 
                  alt={`${matchedUser.firstName || 'User'}'s profile`}
                  className="w-full h-full object-cover"
                  data-testid="matched-user-avatar"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {(matchedUser.firstName?.[0] || 'U').toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          {/* Animated Heart */}
          <div className="text-6xl mb-4">
            <span className="inline-block match-animation" data-testid="match-heart">💕</span>
          </div>
          
          {/* Match Text */}
          <h2 className="text-2xl font-bold mb-2" data-testid="match-title">
            It's a Match!
          </h2>
          <p className="text-pink-100 mb-8" data-testid="match-description">
            You and{" "}
            <span className="font-semibold">{matchedUser.firstName}</span>{" "}
            liked each other
          </p>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onStartChat}
              className="w-full bg-white text-rgpv-blue py-3 rounded-xl font-semibold hover:bg-gray-100"
              data-testid="button-send-message"
            >
              Send Message
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-2 border-white text-white py-3 rounded-xl font-semibold hover:bg-white hover:text-rgpv-blue bg-transparent"
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
