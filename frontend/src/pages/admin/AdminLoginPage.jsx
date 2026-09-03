import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(credentials);

    setIsLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    }
  };

  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <FaLock className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Prisha Enterprises</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="admin@prishaenterprises.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Admin access only. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Website
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
