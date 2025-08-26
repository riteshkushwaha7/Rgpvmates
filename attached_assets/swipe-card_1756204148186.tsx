import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { useSwipe } from "@/hooks/useSwipe";

interface SwipeCardProps {
  profile: {
    id: string;
    firstName?: string;
    lastName?: string;
    profile?: {
      age?: number;
      branch?: string;
      year?: string;
      bio?: string;
      profilePicture?: string;
    };
  };
  zIndex: number;
  scale?: number;
  onSwipe?: (isLike: boolean) => void;
  'data-testid'?: string;
}

export default function SwipeCard({ 
  profile, 
  zIndex, 
  scale = 1, 
  onSwipe,
  'data-testid': testId 
}: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { bind, transform, opacity } = useSwipe({
    onSwipeComplete: (direction) => {
      if (onSwipe) {
        onSwipe(direction === 'right');
      }
    },
    onSwipeStart: () => setIsDragging(true),
    onSwipeEnd: () => setIsDragging(false),
  });

  const handleButtonSwipe = (isLike: boolean) => {
    if (onSwipe) {
      onSwipe(isLike);
    }
  };

  const getBranchDisplayName = (branch?: string) => {
    if (!branch) return '';
    return branch.replace('-', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getYearDisplayName = (year?: string) => {
    if (!year) return '';
    return `${year} Year`;
  };

  return (
    <div
      ref={cardRef}
      {...bind()}
      className={`absolute inset-0 touch-card ${isDragging ? 'swipe-card swiping' : 'swipe-card'}`}
      style={{
        zIndex,
        transform: `scale(${scale}) ${transform}`,
        opacity,
        transformOrigin: 'center center',
      }}
      data-testid={testId}
    >
      <Card className="h-full shadow-lg overflow-hidden">
        <div className="h-96 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
          {profile.profile?.profilePicture ? (
            <img 
              src={profile.profile.profilePicture} 
              alt={`${profile.firstName || 'User'}'s profile`}
              className="w-full h-full object-cover"
              data-testid="profile-image"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <div className="text-white text-6xl font-bold">
                {(profile.firstName?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-white text-2xl font-bold mb-1" data-testid="profile-name">
              {profile.firstName} {profile.lastName}
            </h3>
            {profile.profile && (
              <>
                <p className="text-white/90 text-lg" data-testid="profile-age-branch">
                  {profile.profile.age}, {getBranchDisplayName(profile.profile.branch)}
                </p>
                <p className="text-white/80 text-sm" data-testid="profile-year">
                  {getYearDisplayName(profile.profile.year)}
                </p>
              </>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          {profile.profile?.bio && (
            <p className="text-gray-700 text-sm mb-6" data-testid="profile-bio">
              {profile.profile.bio}
            </p>
          )}
          
          {/* Action Buttons - Only show on the top card */}
          {zIndex === 3 && (
            <div className="flex items-center justify-center space-x-8">
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-14 rounded-full border-2 border-gray-300 hover:border-gray-400 p-0"
                onClick={() => handleButtonSwipe(false)}
                data-testid="button-pass-card"
              >
                <X className="text-gray-500 text-xl" />
              </Button>
              <Button
                size="lg"
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 p-0"
                onClick={() => handleButtonSwipe(true)}
                data-testid="button-like-card"
              >
                <Heart className="text-white text-xl" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
