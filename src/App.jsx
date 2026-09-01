import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./components/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

// Shared components
const Navbar = lazy(() => import('./components/Navbar'));
const Footer = lazy(() => import('./components/Footer'));
const WhatsAppButton = lazy(() => import('./components/WhatsAppButton'));

function App() {
  return (
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
        <div className="font-sans text-gray-900 antialiased">
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />

          {/* Floating WhatsApp Button */}
          <WhatsAppButton />
        </div>
      </Suspense>
    </Router>
  );
}

export default App;
