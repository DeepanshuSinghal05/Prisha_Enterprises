import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./components/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));

// Admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));

// Shared components
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const WhatsAppButton = lazy(() => import('./components/WhatsAppButton'));

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Admin protected route component
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminAuthProvider>
          <Router>
            <Suspense
              fallback={
                <div className="fixed inset-0 flex items-center justify-center bg-white">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-primary-800 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading Prisha Enterprises...</p>
                  </div>
                </div>
              }
            >
              <Routes>
                {/* Admin Routes - No navbar/footer */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/dashboard" element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin/orders/:id" element={
                  <AdminProtectedRoute>
                    <AdminOrderDetailPage />
                  </AdminProtectedRoute>
                } />

                {/* Customer Routes - With navbar/footer */}
                <Route path="/*" element={
                  <div className="font-sans text-gray-900 antialiased">
                    <Navbar />
                    <main>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/product/:id" element={<ProductDetailPage />} />
                        <Route path="/deals" element={<DealsPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={
                          <ProtectedRoute>
                            <CheckoutPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/orders/:id" element={
                          <ProtectedRoute>
                            <MyOrdersPage />
                          </ProtectedRoute>
                        } />
                        <Route path="/my-orders" element={
                          <ProtectedRoute>
                            <MyOrdersPage />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </main>
                    <Footer />
                    <WhatsAppButton />
                  </div>
                } />
              </Routes>
            </Suspense>
          </Router>
        </AdminAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
