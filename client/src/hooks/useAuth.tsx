import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { config } from '../lib/config';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender?: string;
  college?: string;
  branch?: string;
  graduationYear?: string;
  profileImageUrl?: string;
  bio?: string;
  isApproved: boolean;
  isAdmin: boolean;
  paymentDone: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  getUserHeaders: () => Record<string, string>;
  hasValidCredentials: () => boolean;
  refreshAuth: () => Promise<void>;
  debugAuthState: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
  college: string;
  branch: string;
  graduationYear: string;
  profileImageUrl?: string;
  idCardFront?: string;
  idCardBack?: string;
  phone?: string;
  acceptTerms: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = config.API_URL;

  const checkAuth = async () => {
    try {
      console.log('🔍 Auth - Starting authentication check');
      console.log('🔍 Auth - API URL:', API_URL);
      
      // Check if admin credentials are stored
      const storedAdminCreds = localStorage.getItem('adminCredentials');
      if (storedAdminCreds) {
        try {
          const adminCredentials = JSON.parse(storedAdminCreds);
          console.log('🔍 Auth - Checking admin credentials');
          const adminResponse = await fetch(`${API_URL}/api/admin/credentials-test`, {
            headers: {
              'x-admin-username': adminCredentials.username,
              'x-admin-password': adminCredentials.password
            }
          });

          if (adminResponse.ok) {
            console.log('🔍 Auth - Admin credentials valid');
            // Admin credentials are valid, set admin user
            setUser({
              id: 'ADMIN',
              email: adminCredentials.username,
              firstName: 'Admin',
              lastName: 'User',
              isApproved: true,
              isAdmin: true,
              paymentDone: true
            });
            setLoading(false);
            return;
          } else {
            console.log('🔍 Auth - Admin credentials invalid, removing');
            // Admin credentials are invalid, remove them
            localStorage.removeItem('adminCredentials');
          }
        } catch (error) {
          console.log('🔍 Auth - Admin credentials error:', error);
          localStorage.removeItem('adminCredentials');
        }
      }

      // Check if user credentials are stored in localStorage
      const storedUserCreds = localStorage.getItem('userCredentials');
      if (storedUserCreds) {
        try {
          const userCredentials = JSON.parse(storedUserCreds);
          console.log('🔍 Auth - Found stored user credentials, attempting re-authentication');
          
          // Use stored credentials to authenticate
          const userResponse = await fetch(`${API_URL}/api/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': userCredentials.email,
              'x-user-password': userCredentials.password
            }
          });

          console.log('🔍 Auth - User re-authentication response status:', userResponse.status);

          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('🔍 Auth - User re-authentication successful, user data:', userData.user);
            setUser(userData.user);
          } else {
            console.log('🔍 Auth - User re-authentication failed, clearing invalid credentials');
            localStorage.removeItem('userCredentials');
            setUser(null);
          }
        } catch (error) {
          console.error('🔍 Auth - User re-authentication error:', error);
          localStorage.removeItem('userCredentials');
          setUser(null);
        }
      } else {
        console.log('🔍 Auth - No stored user credentials found');
        setUser(null);
      }
    } catch (error) {
      console.error('🔍 Auth - Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔍 Login - Attempting login for:', email);
      console.log('🔍 Login - API URL:', API_URL);
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔍 Login - Response status:', response.status);
      console.log('🔍 Login - Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('🔍 Login - Response data:', data);

      if (response.ok) {
        console.log('🔍 Login - Login successful, user data:', data.user);
        
        // Store user credentials for header-based authentication (CRITICAL for production)
        const userCredentials = { email, password };
        localStorage.setItem('userCredentials', JSON.stringify(userCredentials));
        console.log('🔍 Login - Credentials stored in localStorage for header auth');
        
        setUser(data.user);
        toast.success('Login successful!');
        
        // Redirect based on user status
        if (data.user.isAdmin) {
          navigate('/admin');
        } else if (!data.user.isApproved) {
          toast.error('Your account is pending approval');
          navigate('/login');
        } else {
          // Payment is bypassed - go directly to dashboard
          navigate('/dashboard');
        }
      } else {
        console.log('🔍 Login - Login failed:', data.error);
        toast.error(data.error || 'Login failed');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('🔍 Login - Login error:', error);
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  const adminLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin credentials as fallback for API access
        const adminCredentials = { username, password };
        localStorage.setItem('adminCredentials', JSON.stringify(adminCredentials));
        
        setUser(data.user);
        toast.success('Admin login successful!');
        navigate('/admin');
      } else {
        toast.error(data.error || 'Invalid admin credentials');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Admin login failed. Please try again.');
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Don't set user state - user should not be logged in after registration
        // They need admin approval first
        toast.success('Registration successful! Please wait for admin approval.');
        // Don't navigate here - let the component handle navigation
      } else {
        toast.error(data.error || 'Registration failed');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  };

  // Get user headers for API calls - always return credentials if available
  const getUserHeaders = () => {
    const storedCreds = localStorage.getItem('userCredentials');
    if (storedCreds) {
      try {
        const creds = JSON.parse(storedCreds);
        const headers = {
          'x-user-email': creds.email,
          'x-user-password': creds.password
        };
        console.log('🔍 Headers - Generated headers for API call:', {
          email: creds.email ? 'Present' : 'Missing',
          password: creds.password ? 'Present' : 'Missing'
        });
        return headers;
      } catch (error) {
        console.error('🔍 Headers - Failed to parse stored user credentials:', error);
        return {};
      }
    }
    
    // If no stored credentials, try to get from current user state
    if (user && user.email) {
      // This is a fallback - in production, credentials should always be stored
      console.log('🔍 Headers - Using fallback user state for headers (not ideal)');
      return {
        'x-user-email': user.email,
        'x-user-password': 'stored-in-localstorage' // This won't work, but helps debug
      };
    }
    
    console.log('🔍 Headers - No credentials available - user will need to relogin');
    return {};
  };

  const logout = async () => {
    try {
      // Clear all credentials
      localStorage.removeItem('adminCredentials');
      localStorage.removeItem('userCredentials');
      console.log('🔍 Logout - All credentials cleared from localStorage');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      const wasAdmin = user?.isAdmin;
      setUser(null);
      // Redirect admin users to admin login, regular users to home
      if (wasAdmin) {
        navigate('/admin-login');
      } else {
        navigate('/');
      }
      toast.success('Logged out successfully');
    }
  };

  // Check if user has valid credentials stored
  const hasValidCredentials = () => {
    const storedCreds = localStorage.getItem('userCredentials');
    if (storedCreds) {
      try {
        const creds = JSON.parse(storedCreds);
        return creds.email && creds.password;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  // Force refresh authentication state (useful for debugging)
  const refreshAuth = async () => {
    console.log('🔍 Refresh Auth - Manually refreshing authentication state');
    setLoading(true);
    await checkAuth();
  };

  // Debug function to show current auth state
  const debugAuthState = () => {
    const storedCreds = localStorage.getItem('userCredentials');
    const storedAdminCreds = localStorage.getItem('adminCredentials');
    
    console.log('🔍 Debug Auth State:', {
      user: user ? { id: user.id, email: user.email, isAdmin: user.isAdmin } : null,
      loading,
      hasUserCredentials: !!storedCreds,
      hasAdminCredentials: !!storedAdminCreds,
      userCredentials: storedCreds ? JSON.parse(storedCreds) : null,
      adminCredentials: storedAdminCreds ? JSON.parse(storedAdminCreds) : null
    });
  };

  // Initial authentication check on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-re-authenticate if user has credentials but no user state (handles page refresh)
  useEffect(() => {
    if (!user && !loading && hasValidCredentials()) {
      console.log('🔍 Auto-re-auth - User has credentials but no user state, attempting re-authentication');
      checkAuth();
    }
  }, [user, loading]);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    adminLogin,
    register,
    logout,
    checkAuth,
    getUserHeaders,
    hasValidCredentials,
    refreshAuth,
    debugAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

