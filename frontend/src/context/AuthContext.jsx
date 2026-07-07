import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.service.js';
import { storage } from '../utils/storage.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = storage.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      setUser(response.data.user);
    } catch {
      storage.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    storage.setToken(response.data.token);
    // Fetch fresh user profile from /me instead of trusting login response data.
    // This guarantees the role and all user fields match the backend exactly.
    try {
      const meResponse = await authService.getMe();
      const freshUser = meResponse.data.user;
      setUser(freshUser);
      return freshUser;
    } catch (err) {
      // getMe failed — remove the token we just stored so no stale token lingers
      storage.removeToken();
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Client-side logout still proceeds if server call fails
    } finally {
      storage.removeToken();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      hasRole: (...roles) => roles.includes(user?.role),
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
