import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Shield, Users, UserCheck, UserX, DollarSign, Clock, Search, LogOut, Check, X, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface AdminStats {
  totalRegistrations: number;
  pendingVerification: number;
  activeUsers: number;
  suspendedUsers: number;
  premiumUsers: number;
  totalEarnings: number;
}

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  college: string;
  branch: string;
  graduationYear: string;
  phone?: string;
  profileImageUrl?: string;
  idCardFront?: string;
  idCardBack?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  college: string;
  branch: string;
  graduationYear: string;
  profileImageUrl?: string;
  isApproved: boolean;
  isSuspended: boolean;
  paymentDone: boolean;
  createdAt: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  description: string;
  issueType: string;
  priority: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Admin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUsersLoading, setPendingUsersLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const { logout } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchStats();
    fetchPendingUsers();
    fetchAllUsers();
    fetchContactSubmissions();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error('Failed to fetch admin statistics');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch admin statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      setPendingUsersLoading(true);
      const response = await fetch(`${API_URL}/api/admin/pending-approvals`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setPendingUsers(data);
      } else {
        toast.error('Failed to fetch pending users');
      }
    } catch (error) {
      console.error('Error fetching pending users:', error);
      toast.error('Failed to fetch pending users');
    } finally {
      setPendingUsersLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await fetch(`${API_URL}/api/admin/users`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchContactSubmissions = async () => {
    try {
      setContactsLoading(true);
      const response = await fetch(`${API_URL}/api/contact`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setContactSubmissions(data);
      } else {
        toast.error('Failed to fetch contact submissions');
      }
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
      toast.error('Failed to fetch contact submissions');
    } finally {
      setContactsLoading(false);
    }
  };

  const handleResolveContact = async (contactId: string, isResolved: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/contact/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isResolved }),
      });

      if (response.ok) {
        toast.success(`Contact submission ${isResolved ? 'resolved' : 'reopened'} successfully`);
        fetchContactSubmissions(); // Refresh the list
        setSelectedContact(null); // Close modal
      } else {
        toast.error('Failed to update contact submission');
      }
    } catch (error) {
      console.error('Error updating contact submission:', error);
      toast.error('Failed to update contact submission');
    }
  };

  const extractPhoneFromEmail = (email: string): { email: string; phone: string } => {
    const phoneMatch = email.match(/(.+?)\s*\|\s*Phone:\s*(.+)/);
    if (phoneMatch) {
      return {
        email: phoneMatch[1].trim(),
        phone: phoneMatch[2].trim()
      };
    }
    return { email, phone: 'Not provided' };
  };

  const extractImageFromMessage = (message: string): { message: string; imageUrl: string } => {
    if (!message) return { message: '', imageUrl: '' };
    
    const imageMatch = message.match(/(.*?)\n\n\[Attached Image: (.+?)\]/s);
    if (imageMatch) {
      return {
        message: imageMatch[1].trim(),
        imageUrl: imageMatch[2].trim()
      };
    }
    return { message, imageUrl: '' };
  };

  const handleApproveUser = async (userId: string, approved: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/approve/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        toast.success(`User ${approved ? 'approved' : 'rejected'} successfully`);
        fetchPendingUsers(); // Refresh the list
        fetchStats(); // Refresh stats
        setSelectedUser(null); // Close modal
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleSuspendUser = async (userId: string, suspended: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/suspend/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ suspended }),
      });

      if (response.ok) {
        toast.success(`User ${suspended ? 'suspended' : 'unsuspended'} successfully`);
        fetchAllUsers(); // Refresh the list
        fetchStats(); // Refresh stats
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/delete/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('User deleted successfully');
        fetchAllUsers(); // Refresh the list
        fetchStats(); // Refresh stats
        setDeleteConfirmUser(null); // Close modal
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">RGPV Mates Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, Admin</span>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {/* Pending Approvals */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.pendingVerification || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalRegistrations || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Users */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats?.totalEarnings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suspended Users */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.suspendedUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Users */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Premium Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.premiumUsers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="user-management" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="user-approvals">User Approvals</TabsTrigger>
            <TabsTrigger value="user-management">User Management</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="contact-requests">Contact Requests</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="user-management" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            {usersLoading ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="spinner w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mr-3"></div>
                    <span className="text-gray-600">Loading users...</span>
                  </div>
                </div>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Academic Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers
                        .filter(user => 
                          searchTerm === '' || 
                          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.branch.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                {user.profileImageUrl ? (
                                  <img 
                                    className="h-12 w-12 rounded-full object-cover" 
                                    src={user.profileImageUrl} 
                                    alt={`${user.firstName} ${user.lastName}`}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-900">
                                      {user.firstName[0]}{user.lastName[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.college}</div>
                            <div className="text-sm text-gray-500">{user.branch}</div>
                            <div className="text-sm text-gray-500">Graduation: {user.graduationYear}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.isApproved 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isApproved ? 'Approved' : 'Pending'}
                              </span>
                              {user.isSuspended && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                  Suspended
                                </span>
                              )}
                              {user.paymentDone && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Premium
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant={user.isSuspended ? "default" : "outline"}
                                onClick={() => handleSuspendUser(user.id, !user.isSuspended)}
                                className={user.isSuspended ? "bg-green-600 hover:bg-green-700" : ""}
                              >
                                {user.isSuspended ? 'Reopen' : 'Suspend'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteConfirmUser(user)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* User Approvals Tab */}
          <TabsContent value="user-approvals" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Pending User Approvals</h2>
              <div className="text-sm text-gray-600">
                {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} pending approval
              </div>
            </div>
            
            {pendingUsersLoading ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="spinner w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mr-3"></div>
                    <span className="text-gray-600">Loading pending users...</span>
                  </div>
                </div>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 text-center">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No pending approvals at the moment.</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Academic Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Registration Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                {user.profileImageUrl ? (
                                  <img 
                                    className="h-12 w-12 rounded-full object-cover" 
                                    src={user.profileImageUrl} 
                                    alt={`${user.firstName} ${user.lastName}`}
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-900">
                                      {user.firstName[0]}{user.lastName[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-sm text-gray-500">Age: {user.age}</div>
                                {user.phone && (
                                  <div className="text-sm text-gray-500">Phone: {user.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.college}</div>
                            <div className="text-sm text-gray-500">{user.branch}</div>
                            <div className="text-sm text-gray-500">Graduation: {user.graduationYear}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Payment Management</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <p className="text-gray-600">Payment management will be implemented here.</p>
              </div>
            </div>
          </TabsContent>

          {/* Contact Requests Tab */}
          <TabsContent value="contact-requests" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Contact Submissions</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search contacts..."
                  value={contactSearchTerm}
                  onChange={(e) => setContactSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            {contactsLoading ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Issue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contactSubmissions
                        .filter(contact => {
                          const searchLower = contactSearchTerm.toLowerCase();
                          return (
                            contact.name.toLowerCase().includes(searchLower) ||
                            contact.email.toLowerCase().includes(searchLower) ||
                            contact.subject.toLowerCase().includes(searchLower) ||
                            contact.issueType.toLowerCase().includes(searchLower)
                          );
                        })
                        .map((contact) => {
                          const { email, phone } = extractPhoneFromEmail(contact.email);
                          const { imageUrl } = extractImageFromMessage(contact.description || '');
                          
                          return (
                            <tr key={contact.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                                  <div className="text-sm text-gray-500">{email}</div>
                                  <div className="text-sm text-gray-500">📞 {phone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{contact.subject}</div>
                                  <div className="text-sm text-gray-500 capitalize">
                                    {contact.issueType.replace('-', ' ')}
                                  </div>
                                  {imageUrl && (
                                    <div className="text-xs text-blue-600 mt-1">📎 Image attached</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  contact.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                  contact.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                  contact.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {contact.priority}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  contact.isResolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {contact.isResolved ? 'Resolved' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(contact.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedContact(contact)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant={contact.isResolved ? "outline" : "default"}
                                  onClick={() => handleResolveContact(contact.id, !contact.isResolved)}
                                  className={contact.isResolved ? "text-yellow-600 hover:text-yellow-900" : "bg-green-600 hover:bg-green-700 text-white"}
                                >
                                  {contact.isResolved ? (
                                    <>
                                      <Clock className="w-4 h-4 mr-1" />
                                      Reopen
                                    </>
                                  ) : (
                                    <>
                                      <Check className="w-4 h-4 mr-1" />
                                      Resolve
                                    </>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  
                  {contactSubmissions.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No contact submissions found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  User Details - {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Personal Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <p className="text-sm text-gray-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Age:</span>
                      <p className="text-sm text-gray-900">{selectedUser.age}</p>
                    </div>
                    {selectedUser.phone && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Phone:</span>
                        <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-500">Registration Date:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Academic Information</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">College:</span>
                      <p className="text-sm text-gray-900">{selectedUser.college}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Branch:</span>
                      <p className="text-sm text-gray-900">{selectedUser.branch}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Graduation Year:</span>
                      <p className="text-sm text-gray-900">{selectedUser.graduationYear}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Uploaded Images</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Profile Picture */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">Profile Picture</label>
                    {selectedUser.profileImageUrl ? (
                      <img 
                        src={selectedUser.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>

                  {/* ID Card Front */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">ID Card Front</label>
                    {selectedUser.idCardFront ? (
                      <img 
                        src={selectedUser.idCardFront} 
                        alt="ID Front" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>

                  {/* ID Card Back */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">ID Card Back</label>
                    {selectedUser.idCardBack ? (
                      <img 
                        src={selectedUser.idCardBack} 
                        alt="ID Back" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproveUser(selectedUser.id, false)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApproveUser(selectedUser.id, true)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-12 w-12">
                  {deleteConfirmUser.profileImageUrl ? (
                    <img 
                      className="h-12 w-12 rounded-full object-cover" 
                      src={deleteConfirmUser.profileImageUrl} 
                      alt={`${deleteConfirmUser.firstName} ${deleteConfirmUser.lastName}`}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-900">
                        {deleteConfirmUser.firstName[0]}{deleteConfirmUser.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete User
                  </h3>
                  <p className="text-sm text-gray-600">
                    {deleteConfirmUser.firstName} {deleteConfirmUser.lastName}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Are you sure you want to permanently delete this user? This action cannot be undone and will remove:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>User account and profile</li>
                  <li>All associated data (matches, messages, etc.)</li>
                  <li>Uploaded images and files</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(deleteConfirmUser.id)}
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Contact Submission Details
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Name:</span>
                        <p className="text-gray-900">{selectedContact.name}</p>
                      </div>
                      
                      {(() => {
                        const { email, phone } = extractPhoneFromEmail(selectedContact.email);
                        return (
                          <>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Email:</span>
                              <p className="text-gray-900">{email}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Phone:</span>
                              <p className="text-gray-900">{phone}</p>
                            </div>
                          </>
                        );
                      })()}
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">Issue Type:</span>
                        <p className="text-gray-900 capitalize">{selectedContact.issueType.replace('-', ' ')}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">Priority:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                          selectedContact.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          selectedContact.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          selectedContact.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedContact.priority}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 ${
                          selectedContact.isResolved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedContact.isResolved ? 'Resolved' : 'Pending'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">Submitted:</span>
                        <p className="text-gray-900">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message and Attachments */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Subject</h4>
                    <p className="text-gray-900">{selectedContact.subject}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Message</h4>
                    {(() => {
                                              const { imageUrl } = extractImageFromMessage(selectedContact.description || '');
                      return (
                        <>
                          <div className="text-gray-900 whitespace-pre-wrap">{selectedContact.description}</div>
                          
                          {imageUrl && (
                            <div className="mt-4">
                              <h5 className="font-medium text-gray-700 mb-2">Attached Image:</h5>
                              <div className="border rounded-lg overflow-hidden">
                                <img 
                                  src={imageUrl} 
                                  alt="Contact attachment" 
                                  className="w-full max-w-md object-contain"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                  style={{ cursor: 'pointer' }}
                                />
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Click image to view full size
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setSelectedContact(null)}
                >
                  Close
                </Button>
                <Button
                  variant={selectedContact.isResolved ? "outline" : "default"}
                  onClick={() => handleResolveContact(selectedContact.id, !selectedContact.isResolved)}
                  className={selectedContact.isResolved ? "text-yellow-600 hover:text-yellow-900" : "bg-green-600 hover:bg-green-700 text-white"}
                >
                  {selectedContact.isResolved ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Reopen
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
