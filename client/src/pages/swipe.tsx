import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SwipeCard from "@/components/ui/swipe-card";
import MatchModal from "@/components/match-modal";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Profile, User } from "@shared/schema";

type SwipeProfile = Profile & {
  user?: User;
};

export default function Swipe() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<SwipeProfile | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery<SwipeProfile[]>({
    queryKey: ["/api/discover"],
    retry: false,
  });

  const swipeMutation = useMutation({
    mutationFn: async ({ swipedId, isLike }: { swipedId: string; isLike: boolean }) => {
      const response = await apiRequest("POST", "/api/swipes", {
        swipedId,
        isLike,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (data.isMatch && variables.isLike) {
        const matched = profiles[currentIndex];
        setMatchedUser(matched);
        setShowMatchModal(true);
        // Invalidate matches to show the new match
        queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      }
      setCurrentIndex(prev => prev + 1);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to record swipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSwipe = (isLike: boolean) => {
    const currentProfile = profiles[currentIndex];
    if (currentProfile) {
      swipeMutation.mutate({
        swipedId: currentProfile.id,
        isLike,
      });
    }
  };

  const handleSendMessage = () => {
    setShowMatchModal(false);
    // Navigate to matches section would be handled by parent component
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Discover People</h2>
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!profiles.length || currentIndex >= profiles.length) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Discover People</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">You're all caught up!</h3>
            <p className="text-gray-600">
              No more profiles to show right now. Check back later for new people to meet!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const visibleProfiles = profiles.slice(currentIndex, currentIndex + 3);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Discover People</h2>
        
        {/* Swipe Card Stack */}
        <div className="relative h-96 mb-8">
          {visibleProfiles.map((profile, index) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              zIndex={3 - index}
              scale={1 - index * 0.05}
              onSwipe={index === 0 ? handleSwipe : undefined}
              data-testid={`swipe-card-${index}`}
            />
          ))}
        </div>
        
        {/* Swipe Instructions */}
        <div className="text-center text-gray-600">
          <p className="text-sm">Swipe right to like • Swipe left to pass</p>
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && matchedUser && user && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          matchedUser={matchedUser}
          currentUser={user}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
