import { createContext, useContext, useState, useEffect } from 'react';
import adminAPI from '../services/adminAPI';
import { toast } from 'react-toastify';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('prisha_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('prisha_admin_token');
      if (savedToken) {
        try {
          const response = await adminAPI.getProfile(savedToken);
          setAdmin(response.data.admin);
          setToken(savedToken);
        } catch (error) {
          console.error('Failed to load admin profile:', error);
          localStorage.removeItem('prisha_admin_token');
          setToken(null);
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await adminAPI.login(credentials);
      const { admin: adminData } = response.data;
      const dummyToken = "cookie_admin_auth";

      setAdmin(adminData);
      setToken(dummyToken);
      localStorage.setItem('prisha_admin_token', dummyToken);

      toast.success('Admin login successful');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await adminAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdmin(null);
      setToken(null);
      localStorage.removeItem('prisha_admin_token');
      toast.info('Logged out');
    }
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!admin
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
