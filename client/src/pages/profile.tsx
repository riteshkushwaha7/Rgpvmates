import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Headphones, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Mock stats - in real app, this would come from API
  const stats = {
    likes: 24,
    matches: 8,
    chats: 3,
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
        
        {/* Profile Preview */}
        <Card className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="h-64 bg-gradient-to-br from-purple-400 to-pink-500 relative overflow-hidden">
            {user?.profileImageUrl ? (
              <img 
                src={user.profileImageUrl}
                alt="Your profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                {(user?.firstName?.[0] || 'U').toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <h3 className="text-white text-xl font-bold mb-1">
                {user?.firstName} {user?.lastName}
              </h3>
              {user?.profile && (
                <>
                  <p className="text-white/90">
                    {user.profile.age}, {user.profile.branch?.replace(/-/g, ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </p>
                  <p className="text-white/80 text-sm">{user.profile.year} Year</p>
                </>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            {user?.profile?.bio && (
              <p className="text-gray-700 text-sm">{user.profile.bio}</p>
            )}
          </CardContent>
        </Card>
        
        {/* Profile Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-rgpv-pink">{stats.likes}</div>
              <div className="text-sm text-gray-600">Likes</div>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-rgpv-pink">{stats.matches}</div>
              <div className="text-sm text-gray-600">Matches</div>
            </CardContent>
          </Card>
          <Card className="text-center shadow-sm">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-rgpv-pink">{stats.chats}</div>
              <div className="text-sm text-gray-600">Chats</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Edit Profile Button */}
        <Button 
          className="w-full bg-rgpv-pink text-white py-3 rounded-lg font-semibold hover:bg-rgpv-dark transition-colors mb-4"
          data-testid="button-edit-profile"
        >
          Edit Profile
        </Button>
        
        {/* Quick Actions */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setLocation("/safety")}
            className="w-full justify-between text-left bg-white rounded-lg p-4 border border-gray-200 hover:border-rgpv-pink transition-colors h-auto"
            data-testid="button-safety-guidelines"
          >
            <div className="flex items-center space-x-3">
              <Shield className="text-rgpv-pink" size={20} />
              <span>Safety & Guidelines</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setLocation("/contact")}
            className="w-full justify-between text-left bg-white rounded-lg p-4 border border-gray-200 hover:border-rgpv-pink transition-colors h-auto"
            data-testid="button-contact-support"
          >
            <div className="flex items-center space-x-3">
              <Headphones className="text-rgpv-pink" size={20} />
              <span>Contact Support</span>
            </div>
            <ChevronRight className="text-gray-400" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
