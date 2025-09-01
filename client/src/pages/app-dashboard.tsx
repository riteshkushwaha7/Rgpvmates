import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, User, Settings as SettingsIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Swipe from "./swipe";
import Matches from "./matches";
import Chat from "./chat";
import Profile from "./profile";
import Settings from "./settings";

type AppSection = "swipe" | "matches" | "chat" | "profile" | "settings";

export default function AppDashboard() {
  const [currentSection, setCurrentSection] = useState<AppSection>("swipe");
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();

  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const handleChatOpen = (matchId: string) => {
    setSelectedMatchId(matchId);
    setCurrentSection("chat");
  };

  const handleBackToMatches = () => {
    setCurrentSection("matches");
    setSelectedMatchId(null);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case "swipe":
        return <Swipe />;
      case "matches":
        return <Matches onChatOpen={handleChatOpen} />;
      case "chat":
        return <Chat matchId={selectedMatchId} onBack={handleBackToMatches} />;
      case "profile":
        return <Profile />;
      case "settings":
        return <Settings />;
      default:
        return <Swipe />;
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-4 py-2">
          {[
            { id: "swipe", icon: Heart, label: "Discover" },
            { id: "matches", icon: MessageCircle, label: "Matches" },
            { id: "profile", icon: User, label: "Profile" },
            { id: "settings", icon: SettingsIcon, label: "Settings" },
          ].map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setCurrentSection(item.id as AppSection)}
              className={`flex flex-col items-center py-2 h-auto ${
                currentSection === item.id ? "text-rgpv-pink" : "text-gray-400"
              }`}
              data-testid={`button-tab-${item.id}`}
            >
              <item.icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="p-6">
          <div className="text-2xl font-bold text-rgpv-pink mb-8">💕 RGPV Mates</div>
          <nav className="space-y-2">
            {[
              { id: "swipe", icon: Heart, label: "Discover" },
              { id: "matches", icon: MessageCircle, label: "Matches" },
              { id: "profile", icon: User, label: "Profile" },
              { id: "settings", icon: SettingsIcon, label: "Settings" },
            ].map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setCurrentSection(item.id as AppSection)}
                className={`w-full justify-start px-4 py-3 rounded-lg ${
                  currentSection === item.id
                    ? "bg-rgpv-pink text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                data-testid={`button-nav-${item.id}`}
              >
                <item.icon className="mr-3" size={20} />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="md:ml-64 pb-20 md:pb-0">
        {renderCurrentSection()}
      </div>
    </div>
  );
}
