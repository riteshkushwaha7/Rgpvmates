
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeft
} from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';

const Settings = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Logout error handled silently
    }
  };

  // COMMENTED OUT - Delete account functionality for later use
  /*
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Account deleted successfully');
        await logout();
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };
  */

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold gradient-text">Settings</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Settings Menu */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Account Settings</h2>
              
              <div className="space-y-2">
                <div className="p-3 rounded bg-pink-50 border border-pink-200">
                  <span className="text-gray-700 font-medium">Profile</span>
                </div>
                
                <Link
                  to="/safety"
                  className="block p-3 rounded hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Safety & Privacy</span>
                </Link>
                
                <div className="p-3 rounded hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Notifications</span>
                </div>
                
                <div className="p-3 rounded hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Security</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Settings */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Edit Profile</h4>
                    <p className="text-sm text-gray-600">Update your profile information and photos</p>
                  </div>
                  <Link
                    to="/profile/edit"
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Account Status</h4>
                    <p className="text-sm text-gray-600">
                      {user.isApproved ? 'Approved' : 'Pending Approval'}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.isApproved ? 'Active' : 'Under Review'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">Premium Status</h4>
                    <p className="text-sm text-gray-600">
                      {user.paymentDone ? 'Premium features enabled' : 'Upgrade to unlock premium features'}
                    </p>
                  </div>
                  {user.paymentDone ? (
                    <div className="text-green-600">
                      <span className="text-sm font-medium">Premium</span>
                    </div>
                  ) : (
                    <Link
                      to="/payment"
                      className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
                    >
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Safety & Privacy */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Safety & Privacy</h3>
              
              <div className="space-y-4">
                <Link
                  to="/safety"
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">Safety Guidelines</h4>
                    <p className="text-sm text-gray-600">Learn about safe dating practices</p>
                  </div>
                </Link>
                
                <Link
                  to="/contact"
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">Report Issues</h4>
                    <p className="text-sm text-gray-600">Report inappropriate behavior or technical issues</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
              
              <div className="space-y-4">
                <button
                  onClick={handleLogout}
                  className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div>
                    <h4 className="font-medium text-gray-800">Logout</h4>
                    <p className="text-sm text-gray-600">Sign out of your account</p>
                  </div>
                </button>
                
                {/* COMMENTED OUT - Delete Account functionality for later use
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="font-medium text-red-700">Delete Account</h4>
                      <p className="text-sm text-red-600">Permanently delete your account and data</p>
                    </div>
                  </div>
                </button>
                */}
              </div>
            </div>

            {/* App Information */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">About RGPV Mates</h3>
              
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  RGPV Mates is a dating app designed specifically for students of Rajiv Gandhi Proudyogiki Vishwavidyalaya.
                </p>
                <p>
                  Version: 1.0.0<br />
                  Built for RGPV students
                </p>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    © 2025 RGPV Mates. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Settings;
