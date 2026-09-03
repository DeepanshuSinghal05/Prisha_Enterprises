
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Login only needs email + password
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),

  password: yup
    .string()
    .required('Password is required'),
});

// Signup needs all fields
const signupSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),

  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),

  phone: yup
    .string()
    .matches(/^[\+]?[0-9]{10,15}$/, 'Invalid phone number')
    .required('Phone is required'),

  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      'Password must contain uppercase, lowercase, and number'
    )
    .required('Password is required'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup, loading } = useAuth();

  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');

    try {
      if (isLogin) {
        console.log('LOGIN ATTEMPT:', {
          email: data.email,
        });

        await login(data.email, data.password);

        console.log('LOGIN SUCCESS');

        navigate('/');
      } else {
        console.log('SIGNUP ATTEMPT:', {
          name: data.name,
          email: data.email,
          phone: data.phone,
        });

        await signup(
          data.name,
          data.email,
          data.phone,
          data.password,
          data.confirmPassword
        );

        console.log('SIGNUP SUCCESS');

        navigate('/');
        reset();
      }
    } catch (err) {
      console.error('AUTH ERROR:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleModeChange = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-primary-600 px-6 py-8 text-center">
            <h2 className="text-3xl font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>

            <p className="text-primary-100 mt-2">
              {isLogin
                ? 'Sign in to continue shopping'
                : 'Join us to shop the best TVs'}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-8"
          >

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Name - Signup only */}
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>

                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                  <input
                    {...register('name')}
                    type="text"
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.name
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>

                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>

              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                <input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                    errors.email
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
              </div>

              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone - Signup only */}
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>

                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.phone
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>

                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            )}

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>

              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${
                    errors.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password - Signup only */}
            {!isLogin && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>

                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                  <input
                    {...register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      errors.confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-300'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>

                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {loading
                ? 'Processing...'
                : isLogin
                  ? 'Sign In'
                  : 'Sign Up'}
            </button>

            {/* Switch Mode */}
            {isLogin ? (
              <p className="text-center text-gray-600">
                Don't have an account?{' '}

                <button
                  type="button"
                  onClick={() => handleModeChange(false)}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-center text-gray-600">
                Already have an account?{' '}

                <button
                  type="button"
                  onClick={() => handleModeChange(true)}
                  className="text-primary-600 font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            )}
          </form>

          {/* Back Home */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-primary-600"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

