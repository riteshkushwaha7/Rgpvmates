import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { config } from '../lib/config';

import { Heart, X, ArrowLeft, User, Bell, RefreshCw } from 'lucide-react';
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
  profileImageUrl?: string;
  photos?: string[];
  userFirstName: string;
  userLastName: string;
  userCollege: string;
}

const Discover = () => {
  const { getUserHeaders, hasValidCredentials, refreshAuth, debugAuthState, loading: authLoading, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [showExtendedInfo, setShowExtendedInfo] = useState(false);

  useEffect(() => {
    // Only fetch profiles when authentication is complete and user is authenticated
    if (!authLoading && isAuthenticated) {
      console.log('🔍 Discover - Auth complete, fetching profiles');
      fetchProfiles();
    } else if (!authLoading && !isAuthenticated) {
      console.log('🔍 Discover - Auth complete, user not authenticated');
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      
      // Check if user has valid data before making API call
      if (!hasValidCredentials()) {
        console.error('🔍 Frontend - No valid user data found, cannot fetch profiles');
        toast.error('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Frontend - Fetching profiles from:', `${config.API_URL}/api/discover`);
      
      const headers = getUserHeaders();
      console.log('🔍 Frontend - Sending headers:', headers);
      
      if (!headers['x-user-id'] || !headers['x-user-email']) {
        console.error('🔍 Frontend - Invalid headers generated:', headers);
        toast.error('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${config.API_URL}/api/discover`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });

      console.log('🔍 Frontend - Response status:', response.status);
      console.log('🔍 Frontend - Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Frontend - Profiles data received:', data);
        setProfiles(data);
      } else {
        const errorData = await response.text();
        console.error('🔍 Frontend - Error response:', errorData);
        
        if (response.status === 401) {
          console.log('🔍 Frontend - Authentication failed, checking credentials...');
          debugAuthState();
          
          if (hasValidCredentials()) {
            toast.error('Authentication failed. Please refresh the page or try logging in again.');
          } else {
            toast.error('Please log in to view profiles');
          }
        } else {
          toast.error('Failed to load profiles');
        }
      }
    } catch (error) {
      console.error('🔍 Frontend - Fetch error:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔍 Frontend - Manual refresh requested');
    debugAuthState();
    
    if (!hasValidCredentials()) {
      toast.error('Authentication required. Please log in again.');
      return;
    }
    
    await refreshAuth();
    fetchProfiles();
  };

  const handleSwipe = async (isLike: boolean) => {
    if (currentIndex >= profiles.length || swiping) return;

    if (!hasValidCredentials()) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    setSwiping(true);
    const profile = profiles[currentIndex];

    try {
      const response = await fetch(`${config.API_URL}/api/matching/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getUserHeaders()
        },
        body: JSON.stringify({
          swipedId: profile.userId,
          isLike,
        }),
      });

      if (response.ok) {
        const { isMatch } = await response.json();
        
        if (isLike && isMatch) {
          toast.success(`It's a match with ${profile.userFirstName}! 💕`);
        } else if (isLike) {
          toast.success(`You liked ${profile.userFirstName}!`);
        }
      }
    } catch (error) {
      console.error('Error swiping:', error);
      toast.error('Failed to process swipe');
    }

    // Move to next profile with smooth animation
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setSwiping(false);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swiping) return;
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (swiping) return;
    
    const diff = currentX - startX;
    const threshold = 100;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        handleSwipe(true); // Right swipe = like
      } else {
        handleSwipe(false); // Left swipe = dislike
      }
    }
    
    setCurrentX(0);
  };

  const handleProfileClick = () => {
    setShowExtendedInfo(true);
  };

  // Show authentication loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl font-bold gradient-text">Discover</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={debugAuthState}
                  className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                  title="Debug auth state"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Authentication Loading State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-16 h-16 text-pink-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authenticating...</h2>
            <p className="text-gray-600 mb-6">
              Please wait while we verify your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show profiles loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl font-bold gradient-text">Discover</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  disabled={true}
                  className="p-2 text-gray-400 cursor-not-allowed"
                  title="Loading..."
                >
                  <RefreshCw className="w-5 h-5 animate-spin" />
                </button>
                <button
                  onClick={debugAuthState}
                  className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                  title="Debug auth state"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Profiles Loading State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-50 via-white to-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-16 h-16 text-pink-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Profiles...</h2>
            <p className="text-gray-600 mb-6">
              Please wait while we fetch the latest profiles for you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl font-bold gradient-text">Discover</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={debugAuthState}
                  className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                  title="Debug auth state"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Not Authenticated State */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please log in to view profiles.
            </p>
            <Link
              to="/login"
              className="gradient-button text-white px-6 py-3 rounded-full font-semibold inline-block"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl font-bold gradient-text">Discover</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 text-gray-600 hover:text-pink-500 transition-colors disabled:opacity-50"
                  title="Refresh profiles"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={debugAuthState}
                  className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                  title="Debug auth state"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* No More Profiles */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-16 h-16 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No More Profiles</h2>
            <p className="text-gray-600 mb-6">
              You've seen all available profiles. Check back later for new matches!
            </p>
            <button
              onClick={() => {
                if (hasValidCredentials()) {
                  setCurrentIndex(0);
                  fetchProfiles();
                } else {
                  toast.error('Authentication required. Please log in again.');
                }
              }}
              className="gradient-button text-white px-6 py-3 rounded-full font-semibold"
            >
              Refresh Profiles
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentIndex];
  const swipeOffset = currentX - startX;
  const rotation = swipeOffset * 0.1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-pink-500">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold gradient-text">Discover</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-pink-500 transition-colors disabled:opacity-50"
                title="Refresh profiles"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={debugAuthState}
                className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
                title="Debug auth state"
              >
                <Info className="w-5 h-5" />
              </button>
              <Bell className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Profile Card */}
      <main className="max-w-md mx-auto px-4 py-8">
        <div className="relative">
          {/* Profile Card */}
          <div
            className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
              swiping ? 'pointer-events-none' : ''
            }`}
            style={{
              transform: `translateX(${swipeOffset}px) rotate(${rotation}deg)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Profile Image - Main Focus */}
            <div className="relative h-96 bg-gradient-to-br from-pink-100 to-orange-100 cursor-pointer" onClick={handleProfileClick}>
              {currentProfile.profilePicture || currentProfile.profileImageUrl ? (
                <img
                  src={currentProfile.profilePicture || currentProfile.profileImageUrl}
                  alt={`${currentProfile.userFirstName} ${currentProfile.userLastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-24 h-24 text-gray-400" />
                </div>
              )}
              
              {/* Name + Age Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">
                  {currentProfile.userFirstName} {currentProfile.userLastName}, {currentProfile.age}
                </h2>
              </div>
            </div>
          </div>

          {/* Swipe Buttons */}
          <div className="flex justify-center space-x-6 mt-8">
            {/* Dislike Button - LEFT side */}
            <button
              onClick={() => handleSwipe(false)}
              disabled={swiping}
              className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 border-2 border-red-500"
            >
              <X className="w-8 h-8 text-red-500" />
            </button>
            
            {/* Like Button - RIGHT side */}
            <button
              onClick={() => handleSwipe(true)}
              disabled={swiping}
              className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full shadow-lg flex items-center justify-center hover:from-pink-600 hover:to-red-600 transition-colors disabled:opacity-50"
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {currentIndex + 1} of {profiles.length} profiles
            </p>
          </div>
        </div>
      </main>

      {/* Extended Info Popup */}
      {showExtendedInfo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowExtendedInfo(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                {currentProfile.profilePicture ? (
                  <img
                    src={currentProfile.profilePicture}
                    alt={`${currentProfile.userFirstName} ${currentProfile.userLastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Name and Age */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentProfile.userFirstName} {currentProfile.userLastName}, {currentProfile.age}
              </h3>

              {/* Academic Details */}
              <div className="space-y-2 mb-4">
                <p className="text-gray-700 font-medium">{currentProfile.userCollege}</p>
                <p className="text-gray-600">{currentProfile.branch}</p>
                <p className="text-gray-600">Graduation Year: {currentProfile.graduationYear}</p>
              </div>

              {/* Bio */}
              {currentProfile.bio && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{currentProfile.bio}</p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowExtendedInfo(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default Discover;
