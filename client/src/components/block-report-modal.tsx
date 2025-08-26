import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Ban, Flag } from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BlockReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export default function BlockReportModal({ 
  isOpen, 
  onClose, 
  userId, 
  userName 
}: BlockReportModalProps) {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const { toast } = useToast();

  const blockMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/blocks", { blockedId: userId });
    },
    onSuccess: () => {
      toast({
        title: "User Blocked",
        description: `${userName} has been blocked successfully.`,
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/reports", {
        reportedId: userId,
        reason: reportReason,
        description: reportDescription,
      });
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully. We'll review it promptly.",
      });
      onClose();
      setReportReason("");
      setReportDescription("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBlock = () => {
    blockMutation.mutate();
  };

  const handleReport = () => {
    if (!reportReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the report.",
        variant: "destructive",
      });
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            Block or Report User
          </DialogTitle>
          <p className="text-gray-600 text-center">Choose an action for {userName}</p>
        </DialogHeader>
        
        <div className="space-y-4 p-4">
          <Button
            onClick={handleBlock}
            disabled={blockMutation.isPending}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
            data-testid="button-block-user"
          >
            <Ban className="mr-2" size={20} />
            {blockMutation.isPending ? "Blocking..." : "Block User"}
          </Button>
          
          <div className="space-y-3">
            <Label htmlFor="report-reason">Report Reason</Label>
            <Textarea
              id="report-reason"
              placeholder="Reason for reporting this user..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[60px]"
              data-testid="textarea-report-reason"
            />
            <Label htmlFor="report-description">Additional Details (Optional)</Label>
            <Textarea
              id="report-description"
              placeholder="Provide more details about the issue..."
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              className="min-h-[80px]"
              data-testid="textarea-report-description"
            />
            <Button
              onClick={handleReport}
              disabled={reportMutation.isPending}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
              data-testid="button-report-user"
            >
              <Flag className="mr-2" size={20} />
              {reportMutation.isPending ? "Reporting..." : "Report User"}
            </Button>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            data-testid="button-cancel"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
