import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, registerUser, fetchCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

const TOKEN_KEY = "prepspace_token";
const USER_KEY = "prepspace_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(USER_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  // On first load, verify the cached token is still valid and refresh the user.
  useEffect(() => {
    const bootstrap = async () => {
      const cachedToken = localStorage.getItem(TOKEN_KEY);
      if (!cachedToken) {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchCurrentUser();
        setUser(data.user ?? data);
      } catch (err) {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await loginUser({ email, password });
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const data = await registerUser({ name, email, password });
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
