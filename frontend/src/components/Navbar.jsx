import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaTimes, FaTag, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import logo from "../assets/logo.jpg";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Deals & Offers', path: '/deals', hasBadge: true },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-lg'
          : 'bg-white/80 backdrop-blur-md'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Prisha Enterprises"
              className="h-12 w-auto rounded"
            />
            <span className="text-xl font-bold text-primary-800 hidden sm:block">
              Prisha Enterprises
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center space-x-1 font-medium transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-primary-800'
                    : 'text-gray-600 hover:text-primary-800'
                }`}
              >
                <span>{link.name}</span>
                {link.hasBadge && (
                  <FaTag className="text-green-500 text-xs" />
                )}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-800"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FaShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Auth State */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Hi, {user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FaUser className="h-4 w-4" />
                <span>Login / Signup</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Cart & Auth (visible when menu is open) */}
        <div className="lg:hidden py-4 border-t">
          <div className="flex items-center justify-between px-2 mb-4">
            <Link
              to="/cart"
              className="flex items-center space-x-2 text-gray-600"
            >
              <FaShoppingCart className="h-5 w-5" />
              <span>Cart ({totalItems})</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="text-sm font-medium text-primary-600"
              >
                Login / Signup
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white border-t shadow-lg"
          >
            <div className="container-custom py-4 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-primary-50 text-primary-800'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.hasBadge && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Hot
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="pt-2"
              >
                <Link
                  to="/cart"
                  className="flex items-center justify-between px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50"
                >
                  <span>My Cart</span>
                  {totalItems > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </motion.div>
              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (navLinks.length + 1) * 0.1 }}
                  className="pt-2"
                >
                  <Link
                    to="/auth"
                    className="btn-primary block text-center w-full"
                  >
                    Login / Signup
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
