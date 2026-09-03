import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

const AUTH_STORAGE_KEY = "prisha_auth_token";
const AUTH_USER_KEY = "prisha_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setAccessToken(storedToken);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse stored auth data:', e);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    setLoading(false);

    // Listen for automatic logout events triggered by api.js (e.g. refresh token expired)
    const handleLogoutEvent = () => {
      setAccessToken(null);
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, []);

  // LOGIN
  const login = async (email, password) => {
    const data = await apiRequest('/auth/login', {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const tokenIndicator = "cookie_auth";
    localStorage.setItem(AUTH_STORAGE_KEY, tokenIndicator);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

    setAccessToken(tokenIndicator);
    setUser(data.user);

    return data;
  };

  // SIGNUP
  const signup = async (name, email, phone, password, confirmPassword) => {
    const data = await apiRequest('/auth/signup', {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password, confirmPassword }),
    });

    const tokenIndicator = "cookie_auth";
    localStorage.setItem(AUTH_STORAGE_KEY, tokenIndicator);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));

    setAccessToken(tokenIndicator);
    setUser(data.user);

    return data;
  };

  // LOGOUT
  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: "POST" });
    } catch (error) {
      console.error("Logout request failed:", error);
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_USER_KEY);

    setAccessToken(null);
    setUser(null);
  };

  const value = {
    user,
    accessToken,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
