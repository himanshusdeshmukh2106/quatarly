import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, loginUser, logoutUser as apiLogout, getUserDetails } from '../services/api';

interface User {
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  authToken: string | null;
  user: User | null;
  isLoading: boolean;
  onboardingComplete: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  authToken: null,
  user: null,
  isLoading: true,
  onboardingComplete: false,
  login: async () => {},
  logout: async () => {},
  completeOnboarding: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadState = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const onboardingStatus = await AsyncStorage.getItem('onboardingComplete');
          const storedUser = await AsyncStorage.getItem('user');
          setAuthTokenState(token);
          setAuthToken(token);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          setOnboardingComplete(onboardingStatus === 'true');
        }
      } catch (e) {
        console.error('Failed to load auth state.', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadState();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const loginResponse = await loginUser({ username, password });
      const { key: token } = loginResponse;

      if (!token) {
        throw new Error("Login response did not include an auth token.");
      }

      setAuthToken(token);

      const userDetails = await getUserDetails();
      
      const userData = userDetails;
      const onboarding_complete = userDetails.onboarding_complete || false;

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('onboardingComplete', String(onboarding_complete));

      setAuthTokenState(token);
      setUser(userData);
      setOnboardingComplete(onboarding_complete);
    } catch (e) {
      console.error('Failed to save auth state.', e);
      setAuthToken(null);
      throw e;
    }
  };

  const logout = async () => {
    try {
      if (authToken) {
        await apiLogout();
      }
    } catch (e) {
      console.error('Failed to logout from API, clearing session anyway.', e);
    } finally {
      await AsyncStorage.multiRemove(['authToken', 'user', 'onboardingComplete']);
      setAuthTokenState(null);
      setAuthToken(null);
      setUser(null);
      setOnboardingComplete(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingComplete', 'true');
      setOnboardingComplete(true);
    } catch (e) {
      console.error('Failed to update onboarding status', e);
    }
  };

  return (
    <AuthContext.Provider value={{ authToken, user, isLoading, onboardingComplete, login, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 