import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertTriangle, IndianRupee, Users, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Profile, Report, ContactSubmission } from "@shared/schema";

type AdminStats = {
  pending: number;
  verified: number;
  reports: number;
  revenue: number;
};

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: stats, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  useEffect(() => {
    if (statsError && isUnauthorizedError(statsError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [statsError, toast]);

  const { data: verifications = [] } = useQuery<Profile[]>({
    queryKey: ["/api/admin/verifications"],
    retry: false,
  });

  const { data: reports = [] } = useQuery<Report[]>({
    queryKey: ["/api/admin/reports"],
    retry: false,
  });

  const { data: contacts = [] } = useQuery<ContactSubmission[]>({
    queryKey: ["/api/admin/contacts"],
    retry: false,
  });

  const verificationMutation = useMutation({
    mutationFn: async ({ profileId, status }: { profileId: string; status: string }) => {
      await apiRequest("PUT", `/api/admin/verifications/${profileId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/verifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Verification Updated",
        description: "The verification status has been updated successfully.",
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
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    },
  });

  const contactMutation = useMutation({
    mutationFn: async ({ contactId, isResolved }: { contactId: string; isResolved: boolean }) => {
      await apiRequest("PUT", `/api/admin/contacts/${contactId}`, { isResolved });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contacts"] });
      toast({
        title: "Contact Updated",
        description: "The contact submission has been updated successfully.",
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
        description: "Failed to update contact submission.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-rgpv-pink">🛡️ RGPV Mates Admin</div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, Admin</span>
              <Button
                onClick={() => window.location.href = "/api/logout"}
                variant="destructive"
                data-testid="button-admin-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pending || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.verified || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.reports || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <IndianRupee className="text-blue-600" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats?.revenue || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="bg-white shadow-sm">
          <Tabs defaultValue="verifications" className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="verifications" 
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-rgpv-pink data-[state=active]:text-rgpv-pink rounded-none"
                  data-testid="tab-verifications"
                >
                  ID Verifications
                </TabsTrigger>
                <TabsTrigger 
                  value="reports" 
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-rgpv-pink data-[state=active]:text-rgpv-pink rounded-none"
                  data-testid="tab-reports"
                >
                  User Reports
                </TabsTrigger>
                <TabsTrigger 
                  value="contacts" 
                  className="px-6 py-4 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-rgpv-pink data-[state=active]:text-rgpv-pink rounded-none"
                  data-testid="tab-contacts"
                >
                  Contact Submissions
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ID Verifications Tab */}
            <TabsContent value="verifications" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending ID Verifications</h3>
              <div className="space-y-4">
                {verifications.map((verification: any) => (
                  <Card key={verification.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                            {(verification.user.firstName?.[0] || 'U').toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {verification.user.firstName} {verification.user.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{verification.user.email}</p>
                            <p className="text-xs text-gray-500">
                              Submitted {new Date(verification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-id-${verification.id}`}
                          >
                            View ID
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => verificationMutation.mutate({ 
                              profileId: verification.id, 
                              status: "rejected" 
                            })}
                            disabled={verificationMutation.isPending}
                            data-testid={`button-reject-${verification.id}`}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => verificationMutation.mutate({ 
                              profileId: verification.id, 
                              status: "approved" 
                            })}
                            disabled={verificationMutation.isPending}
                            data-testid={`button-approve-${verification.id}`}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {verifications.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending verifications
                  </div>
                )}
              </div>
            </TabsContent>

            {/* User Reports Tab */}
            <TabsContent value="reports" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Reports</h3>
              <div className="space-y-4">
                {reports.map((report: any) => (
                  <Card key={report.id} className="border border-red-200 bg-red-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-red-900">Report: {report.reason}</h4>
                          <p className="text-sm text-red-700">
                            Reported by: {report.reporter.firstName} {report.reporter.lastName}
                          </p>
                          <p className="text-sm text-red-700">
                            Against: {report.reported.firstName} {report.reported.lastName}
                          </p>
                          {report.description && (
                            <p className="text-xs text-red-600 mt-1">{report.description}</p>
                          )}
                          <p className="text-xs text-red-600 mt-1">
                            Submitted {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-report-${report.id}`}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            data-testid={`button-take-action-${report.id}`}
                          >
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {reports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending reports
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Contact Submissions Tab */}
            <TabsContent value="contacts" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Form Submissions</h3>
              <div className="space-y-4">
                {contacts.map((contact: any) => (
                  <Card key={contact.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{contact.subject}</h4>
                            <Badge variant={contact.isResolved ? "default" : "secondary"}>
                              {contact.isResolved ? "Resolved" : "Open"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">From: {contact.email}</p>
                          <p className="text-sm text-gray-600">Type: {contact.issueType}</p>
                          <p className="text-sm text-gray-600">Priority: {contact.priority}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted {new Date(contact.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-respond-${contact.id}`}
                          >
                            Respond
                          </Button>
                          <Button
                            size="sm"
                            className="bg-gray-500 hover:bg-gray-600"
                            onClick={() => contactMutation.mutate({ 
                              contactId: contact.id, 
                              isResolved: !contact.isResolved 
                            })}
                            disabled={contactMutation.isPending}
                            data-testid={`button-mark-resolved-${contact.id}`}
                          >
                            {contact.isResolved ? "Reopen" : "Mark Resolved"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {contacts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No contact submissions
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
