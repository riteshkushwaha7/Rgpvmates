import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const checkAuth = async () => {
    try {
      // First try admin session check
      const adminResponse = await fetch(`${API_URL}/api/admin/check-session`, {
        credentials: 'include',
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        setUser(adminData.user);
        setLoading(false);
        return;
      }

      // If not admin, try regular user session check
      const userResponse = await fetch(`${API_URL}/api/me`, {
        credentials: 'include',
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
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
        toast.error(data.error || 'Login failed');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
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
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
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

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
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

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
