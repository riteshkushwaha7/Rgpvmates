import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Heart, 
  Users, 
  MessageCircle, 
  Settings, 
  LogOut, 
  User,
  Bell,
  Crown,
  Sparkles,
  Edit3,
  Camera,
  X,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import BottomNavigation from '../components/BottomNavigation';

interface Profile {
  id: string;
  userId: string;
  age: number;
  gender: string;
  branch: string;
  graduationYear: string;
  bio?: string;
  profilePicture?: string;
  photos?: string[];
  socialHandles?: Record<string, string>;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    matches: 0,
    messages: 0,
    likes: 0,
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Profile data now comes from user context, no need to fetch separately
      // If user has incomplete profile data, redirect to edit
      if (!user?.age || !user?.graduationYear) {
        navigate('/profile/edit');
        return;
      }
      
      // Use user data from context
      setProfile({
        id: user.id,
        age: user.age,
        college: user.college,
        branch: user.branch,
        graduationYear: user.graduationYear,
        bio: user.bio || '',
        profilePicture: user.profileImageUrl || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch matches count
      const matchesResponse = await fetch(`${API_URL}/api/matching/matches`, {
        credentials: 'include',
      });
      if (matchesResponse.ok) {
        const matches = await matchesResponse.json();
        setStats(prev => ({ ...prev, matches: matches.length }));
      }

      // Fetch unread messages count
      const messagesResponse = await fetch(`${API_URL}/api/messages/unread/count`, {
        credentials: 'include',
      });
      if (messagesResponse.ok) {
        const { unreadCount } = await messagesResponse.json();
        setStats(prev => ({ ...prev, messages: unreadCount }));
      }
    } catch (error) {
      // Stats fetch error handled silently
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Logout error handled silently
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/api/profiles/upload-picture`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, profilePicture: data.profilePicture } : null);
        toast.success('Profile picture updated!');
      } else {
        toast.error('Failed to upload profile picture');
      }
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotosUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch(`${API_URL}/api/profiles/upload-photos`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, photos: data.photos } : null);
        toast.success('Photos uploaded successfully!');
      } else {
        toast.error('Failed to upload photos');
      }
    } catch (error) {
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async (index: number) => {
    try {
      const response = await fetch(`${API_URL}/api/profiles/remove-photo/${index}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => prev ? { ...prev, photos: data.photos } : null);
        toast.success('Photo removed!');
      } else {
        toast.error('Failed to remove photo');
      }
    } catch (error) {
      toast.error('Failed to remove photo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
              <User className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold gradient-text">My Profile</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-pink-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="relative h-64 bg-gradient-to-br from-pink-400 to-orange-400">
                {profile?.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                    {(user.firstName?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                
                {/* Upload Profile Picture Button */}
                <div className="absolute bottom-4 right-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </label>
                </div>

                {/* Profile Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">
                        {user.firstName} {user.lastName}
                      </h2>
                      {profile && (
                        <>
                          <p className="text-lg mb-1">
                            {profile.age}, {profile.branch.replace(/-/g, ' ').split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </p>
                          <p className="text-sm opacity-90">
                            Class of {profile.graduationYear}
                          </p>
                        </>
                      )}
                    </div>
                    <Link 
                      to="/profile/edit"
                      className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors inline-block"
                    >
                      <Edit3 className="w-5 h-5 text-white" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-6">
                {profile?.bio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">About Me</h3>
                    <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Additional Photos */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Photos</h3>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotosUpload}
                        className="hidden"
                        disabled={uploading || (profile?.photos?.length || 0) >= 5}
                      />
                      <div className="flex items-center space-x-1 text-pink-500 hover:text-pink-600 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm">Add Photos</span>
                      </div>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {profile?.photos?.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {(!profile?.photos || profile.photos.length === 0) && (
                    <p className="text-gray-500 text-sm">No additional photos yet</p>
                  )}
                </div>

                {/* Social Handles */}
                {profile?.socialHandles && Object.keys(profile.socialHandles).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Social Media</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.socialHandles).map(([platform, handle]) => (
                        <span key={platform} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {platform}: {handle}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-600" />
                    </div>
                    <span className="text-gray-700">Matches</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.matches}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-gray-700">Messages</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.messages}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Likes</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.likes}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/discover"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="w-5 h-5 text-pink-500" />
                  <span className="text-gray-700">Discover People</span>
                </Link>
                
                <Link
                  to="/matches"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="text-gray-700">View Matches</span>
                </Link>
                
                <Link
                  to="/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-5 h-5 text-pink-500" />
                  <span className="text-gray-700">Settings</span>
                </Link>
              </div>
            </div>

            {/* Premium Status */}
            {!user.paymentDone && (
              <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-6 text-white">
                <Crown className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
                <p className="text-sm opacity-90 mb-4">
                  Get unlimited likes, see who liked you, and more!
                </p>
                <Link
                  to="/payment"
                  className="bg-white text-pink-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                >
                  Upgrade Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
