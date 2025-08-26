import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, AlertTriangle, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BlockReportModal from "@/components/block-report-modal";
import type { Message, Match, User } from "@shared/schema";

type PopulatedMatch = Match & {
  otherUser?: User;
};

interface ChatProps {
  matchId: string | null;
  onBack: () => void;
}

export default function Chat({ matchId, onBack }: ChatProps) {
  const [message, setMessage] = useState("");
  const [showBlockReportModal, setShowBlockReportModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], error: messagesError } = useQuery<Message[]>({
    queryKey: ["/api/matches", matchId, "messages"],
    enabled: !!matchId,
    retry: false,
  });

  useEffect(() => {
    if (messagesError && isUnauthorizedError(messagesError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [messagesError, toast]);

  const { data: matches = [] } = useQuery<PopulatedMatch[]>({
    queryKey: ["/api/matches"],
    retry: false,
  });

  const currentMatch = matches.find((m) => m.id === matchId);
  const otherUser = currentMatch?.otherUser;

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/matches/${matchId}/messages`, { content });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/matches", matchId, "messages"] });
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (message.trim() && matchId) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!matchId || !otherUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-600">Select a match to start chatting</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
        <Button
          variant="ghost"
          onClick={onBack}
          size="sm"
          data-testid="button-back-to-matches"
        >
          <ArrowLeft size={20} />
        </Button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 overflow-hidden">
          {otherUser.profile?.profilePicture ? (
            <img 
              src={otherUser.profile.profilePicture}
              alt={otherUser.firstName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {(otherUser.firstName?.[0] || 'U').toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {otherUser.firstName} {otherUser.lastName}
          </h3>
          <p className="text-sm text-green-500">Online</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBlockReportModal(true)}
            className="text-gray-600 hover:text-red-500"
            data-testid="button-report-user"
          >
            <AlertTriangle size={20} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            data-testid="button-call-user"
          >
            <Phone size={20} />
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 ${
                msg.senderId === user?.id
                  ? "bg-rgpv-pink text-white"
                  : "bg-white text-gray-900 shadow-sm"
              }`}
              data-testid={`message-${msg.id}`}
            >
              <p>{msg.content}</p>
              <span className={`text-xs ${
                msg.senderId === user?.id ? "text-pink-200" : "text-gray-500"
              }`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
            data-testid="input-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-rgpv-pink text-white hover:bg-rgpv-dark"
            data-testid="button-send-message"
          >
            <Send size={20} />
          </Button>
        </div>
      </div>

      {/* Block/Report Modal */}
      <BlockReportModal
        isOpen={showBlockReportModal}
        onClose={() => setShowBlockReportModal(false)}
        userId={otherUser.id}
        userName={otherUser.firstName || "User"}
      />
    </div>
  );
}
