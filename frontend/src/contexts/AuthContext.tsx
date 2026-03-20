import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

export type UserRole = 'student' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: UserRole, extra?: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user data
      authApi.getMe().then((response) => {
        if (response.data) {
          setUser({
            id: response.data.id,
            email: response.data.email,
            name: response.data.name,
            role: response.data.role,
            avatar: response.data.profile?.avatarUrl,
            profile: response.data.profile,
          });
        } else {
          // Token invalid, clear it
          localStorage.removeItem('token');
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, _role?: UserRole): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login(email, password);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        localStorage.setItem('token', response.data.token);
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          avatar: response.data.user.profile?.avatarUrl,
          profile: response.data.user.profile,
        });
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    extra?: { companyName?: string; university?: string; fieldOfStudy?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.register({
        email,
        password,
        name,
        role,
        ...extra,
      });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        localStorage.setItem('token', response.data.token);
        setUser({
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          avatar: response.data.user.profile?.avatarUrl,
          profile: response.data.user.profile,
        });
        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
