import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaTrash, FaChevronLeft, FaPlus, FaMinus, FaCheck } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { processPayment } from '../services/razorpay';
import { toast } from 'react-toastify';

// Helper to get product info by ID
const getProductInfo = (productId) => {
  const staticProducts = [
    { id: 1, name: 'Prisha Smart LED TV - 32 inch', price: 7500 },
    { id: 2, name: 'Prisha Smart LED TV - 32 inch Voice Remote 4K', price: 10500 },
    { id: 3, name: 'Prisha Smart LED TV - 43 inch', price: 12500 },
    { id: 4, name: 'Prisha Smart LED TV - 43 inch Voice Remote 4K', price: 15500 },
    { id: 5, name: 'Prisha Smart LED TV - 50 inch Voice Remote 4K', price: 17500 },
    { id: 6, name: 'Prisha Smart LED TV - 50 inch Voice Remote 8K', price: 21500 },
    { id: 7, name: 'Prisha Smart LED TV - 55 inch 4K Ultra HD', price: 24500 },
    { id: 8, name: 'Prisha Smart LED TV - 55 inch 8K Ultra HD', price: 28500 },
    { id: 9, name: 'Prisha Smart LED TV - 65 inch 4K Ultra HD', price: 35500 },
    { id: 10, name: 'Prisha Smart LED TV - 65 inch 8K Ultra HD', price: 42500 },
  ];
  return staticProducts.find(p => p.id === productId);
};

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, cartTotal, totalItems, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartProducts, setCartProducts] = useState({});
  const [shippingAddress, setShippingAddress] = useState({
    address_line1: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    is_default: true
  });

  // Load product info for cart items
  useEffect(() => {
    const productsInfo = {};
    for (const item of items) {
      const product = getProductInfo(item.productId);
      if (product) {
        productsInfo[item.productId] = product;
      }
    }
    setCartProducts(productsInfo);
  }, [items]);

  // Load saved address
  useEffect(() => {
    const savedAddress = localStorage.getItem('prisha_shipping_address');
    if (savedAddress) {
      try {
        setShippingAddress(JSON.parse(savedAddress));
      } catch (e) {
        console.error('Failed to parse saved address:', e);
      }
    } else if (isAuthenticated && user) {
      setShippingAddress(prev => ({
        ...prev,
        phone: user.phone || '',
        address_line1: user.address || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.warning('Please login to proceed with checkout');
      navigate('/auth');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }



    setIsCheckingOut(true);

    try {
      // Save address for next time
      localStorage.setItem('prisha_shipping_address', JSON.stringify(shippingAddress));

      // Prepare items for payment
      const paymentItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      // Navigate to checkout page for address editing
      navigate('/checkout', {
        state: {
          items: paymentItems,
          shippingAddress,
          from: 'cart'
        }
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to process checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const clearCartAfterPayment = () => {
    // Clear cart after successful payment
    const cartStorage = localStorage.getItem('prisha_cart');
    if (cartStorage) {
      localStorage.removeItem('prisha_cart');
    }
  };

  const getProductName = (productId) => {
    const product = cartProducts[productId];
    return product ? product.name : 'Product';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/products')}
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4"
          >
            <FaChevronLeft className="mr-2" />
            Continue Shopping
          </button>

          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-sm"
          >
            <div className="inline-block p-8 rounded-full bg-gray-100 mb-6">
              <FaShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Browse our collection of premium LED TVs</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaShoppingCart className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {getProductName(item.productId)}
                      </h3>
                      <p className="text-primary-700 font-bold mt-1">
                        ₹{(cartProducts[item.productId]?.price || 0).toLocaleString('en-IN')}
                      </p>

                      <div className="flex items-center mt-4 space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            <FaMinus className="h-4 w-4" />
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            <FaPlus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="flex items-center text-red-600 hover:text-red-700 text-sm"
                        >
                          <FaTrash className="mr-2" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-32">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-700">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Shipping Address Preview */}
                {isAuthenticated && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Shipping to:</h3>
                    <p className="text-sm text-gray-600">{shippingAddress.address_line1 || 'Address not set'}</p>
                    <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                    <p className="text-sm text-gray-600 mt-1">{shippingAddress.phone}</p>
                  </div>
                )}

                {!isAuthenticated && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                    <p>Login before checkout to track your orders</p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCheckingOut ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <FaCheck className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
