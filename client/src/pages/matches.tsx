import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";
import type { Match, User, Profile } from "@shared/schema";

type PopulatedMatch = Match & {
  otherUser?: User & {
    profile?: Profile;
  };
};

interface MatchesProps {
  onChatOpen: (matchId: string) => void;
}

export default function Matches({ onChatOpen }: MatchesProps) {
  const { toast } = useToast();

  const { data: matches = [], isLoading, error } = useQuery<PopulatedMatch[]>({
    queryKey: ["/api/matches"],
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <h2 className="text-2xl font-bold mb-6">Your Matches</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl p-4 animate-pulse h-20"></div>
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
          <Heart className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
          <p className="text-gray-600">
            Start swiping to find your perfect match!
          </p>
        </div>
      </div>
    );
  }

  const newMatches = matches.slice(0, 3); // Show first 3 as "new"
  const allMatches = matches;

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-6">Your Matches</h2>
      
      {/* New Matches */}
      {newMatches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Matches</h3>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {newMatches.map((match) => (
              <div 
                key={match.id} 
                className="flex-shrink-0 text-center cursor-pointer"
                onClick={() => onChatOpen(match.id)}
                data-testid={`new-match-${match.id}`}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-red-500 mb-2 relative overflow-hidden">
                  {match.otherUser.profile?.profilePicture ? (
                    <img 
                      src={match.otherUser.profile.profilePicture}
                      alt={match.otherUser.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {(match.otherUser.firstName?.[0] || 'U').toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-heartbeat"></div>
                </div>
                <p className="text-sm font-medium">{match.otherUser.firstName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* All Conversations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
        <div className="space-y-3">
          {allMatches.map((match) => (
            <Card 
              key={match.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onChatOpen(match.id)}
              data-testid={`match-${match.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 overflow-hidden">
                    {match.otherUser.profile?.profilePicture ? (
                      <img 
                        src={match.otherUser.profile.profilePicture}
                        alt={match.otherUser.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {(match.otherUser.firstName?.[0] || 'U').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-gray-900">
                        {match.otherUser.firstName} {match.otherUser.lastName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {match.otherUser.profile?.branch?.replace(/-/g, ' ').split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')} • {match.otherUser.profile?.year} Year
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
