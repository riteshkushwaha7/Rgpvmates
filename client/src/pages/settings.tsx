import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Settings() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Privacy settings state
  const [hidePhone, setHidePhone] = useState(true);
  const [hideEmail, setHideEmail] = useState(true);
  const [newMatches, setNewMatches] = useState(true);
  const [newMessages, setNewMessages] = useState(true);

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

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      await apiRequest("PUT", "/api/profiles", settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved.",
      });
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
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact support to delete your account.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        <div className="space-y-4">
          {/* Privacy Settings */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="hide-phone" className="text-gray-700">
                  Hide phone until match
                </Label>
                <Switch
                  id="hide-phone"
                  checked={hidePhone}
                  onCheckedChange={setHidePhone}
                  data-testid="switch-hide-phone"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hide-email" className="text-gray-700">
                  Hide email until match
                </Label>
                <Switch
                  id="hide-email"
                  checked={hideEmail}
                  onCheckedChange={setHideEmail}
                  data-testid="switch-hide-email"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Notification Settings */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-matches" className="text-gray-700">
                  New matches
                </Label>
                <Switch
                  id="new-matches"
                  checked={newMatches}
                  onCheckedChange={setNewMatches}
                  data-testid="switch-new-matches"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-messages" className="text-gray-700">
                  New messages
                </Label>
                <Switch
                  id="new-messages"
                  checked={newMessages}
                  onCheckedChange={setNewMessages}
                  data-testid="switch-new-messages"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Account Actions */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start text-gray-700 hover:text-rgpv-pink transition-colors"
                data-testid="button-change-password"
              >
                Change Password
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteAccount}
                className="w-full justify-start text-gray-700 hover:text-rgpv-pink transition-colors"
                data-testid="button-delete-account"
              >
                Delete Account
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 transition-colors"
                data-testid="button-logout"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
