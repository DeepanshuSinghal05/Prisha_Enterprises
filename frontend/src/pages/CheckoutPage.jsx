import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { processPayment } from '../services/razorpay';
import { addressAPI } from '../services/api';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const { user } = useAuth();

  // Helper to get product price
  const getProductPrice = (productId) => {
    const staticProducts = [
      { id: 1, price: 7500 },
      { id: 2, price: 10500 },
      { id: 3, price: 12500 },
      { id: 4, price: 15500 },
      { id: 5, price: 17500 },
      { id: 6, price: 21500 },
      { id: 7, price: 24500 },
      { id: 8, price: 28500 },
      { id: 9, price: 35500 },
      { id: 10, price: 42500 },
    ];
    const product = staticProducts.find(p => p.id === productId);
    return product?.price || 0;
  };

  // Get items from navigation state
  const [paymentItems, setPaymentItems] = useState([]);

  useEffect(() => {
    // Check if items were passed via navigation state
    const state = location.state;
    if (state && state.items) {
      setPaymentItems(state.items);
    } else {
      // Fallback to localStorage
      const savedCart = localStorage.getItem('prisha_cart');
      if (savedCart) {
        try {
          setPaymentItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse saved cart:', e);
        }
      }
    }
  }, [location.state]);

  // Calculate cart total from payment items
  const cartTotal = paymentItems.reduce((sum, item) => {
    return sum + getProductPrice(item.productId) * item.quantity;
  }, 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'failed'
  const [shippingAddress, setShippingAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    is_default: true
  });
  const [savedAddresses, setSavedAddresses] = useState([]);

  // Load user's saved addresses from backend
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const data = await addressAPI.getAll();
        setSavedAddresses(data.addresses || []);
      } catch (error) {
        console.error('Failed to load addresses:', error);
        // Fallback to localStorage if API fails
        const savedAddress = localStorage.getItem('prisha_shipping_address');
        if (savedAddress) {
          try {
            setShippingAddress(JSON.parse(savedAddress));
          } catch (e) {
            console.error('Failed to parse saved address:', e);
          }
        }
      }
    };
    loadAddresses();
  }, []);

  // Pre-fill from user profile if available
  useEffect(() => {
    if (user && user.phone) {
      setShippingAddress(prev => ({
        ...prev,
        phone: user.phone || '',
        city: user.city || '',
        state: user.state || '',
        address_line1: user.address || ''
      }));
    }
  }, [user]);

  // Pre-fill from saved addresses
  useEffect(() => {
    if (savedAddresses.length > 0 && !shippingAddress.address_line1) {
      const defaultAddress = savedAddresses.find(addr => addr.is_default) || savedAddresses[0];
      if (defaultAddress) {
        setShippingAddress({
          address_line1: defaultAddress.address_line1,
          address_line2: defaultAddress.address_line2 || '',
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
          phone: defaultAddress.phone,
          is_default: defaultAddress.is_default
        });
      }
    }
  }, [savedAddresses]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveAddressToBackend = async () => {
    try {
      const data = await addressAPI.create(shippingAddress);
      return data.address;
    } catch (error) {
      console.error('Failed to save address:', error);
      // Fallback to localStorage
      localStorage.setItem('prisha_shipping_address', JSON.stringify(shippingAddress));
      return null;
    }
  };

  const saveAddressToLocalStorage = () => {
    localStorage.setItem('prisha_shipping_address', JSON.stringify(shippingAddress));
  };

  const handlePayment = async () => {
    if (paymentItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    if (!shippingAddress.address_line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
      toast.warning('Please fill in all shipping address details');
      return;
    }

    // Validate pincode format
    if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
      toast.warning('Pincode must be 6 digits');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Save address to backend
      const savedAddress = await saveAddressToBackend();
      if (savedAddress) {
        setShippingAddress(savedAddress);
      } else {
        saveAddressToLocalStorage();
      }

      // Step 2: Create order and process payment
      const orderItems = paymentItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      // Process payment using Razorpay service
      await processPayment({
        items: orderItems,
        shippingAddress,
        token: localStorage.getItem('prisha_auth_token'),
        onSuccess: (data) => {
          setPaymentStatus('success');
          clearCart();
          toast.success('Payment successful! Order confirmed.');
          setTimeout(() => {
            navigate(`/orders/${data.order.id}`);
          }, 1500);
        },
        onError: (error) => {
          setPaymentStatus('failed');
          toast.error(error || 'Payment failed. Please try again.');
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast.error('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const getProductName = (productId) => {
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
    const product = staticProducts.find(p => p.id === productId);
    const item = paymentItems.find(i => i.productId === productId);
    return product ? `${product.name} (x${item?.quantity || 1})` : 'Product';
  };

  const cartItems = paymentItems.map(item => ({
    ...item,
    price: [7500, 10500, 12500, 15500, 17500, 21500, 24500, 28500, 35500, 42500][item.productId - 1]
  }));

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back to Cart
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          {paymentStatus === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm p-12 text-center"
            >
              <div className="inline-block p-6 rounded-full bg-green-100 mb-6">
                <FaCheckCircle className="h-16 w-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
              <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been confirmed.</p>
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <p className="text-sm text-gray-500 mb-2">Order ID</p>
                <p className="font-mono text-gray-900">ORD-{Date.now().toString().slice(-8)}</p>
              </div>
              <button
                onClick={() => navigate('/products')}
                className="btn-primary"
              >
                Continue Shopping
              </button>
            </motion.div>
          ) : paymentStatus === 'failed' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm p-12 text-center"
            >
              <div className="inline-block p-6 rounded-full bg-red-100 mb-6">
                <FaCheckCircle className="h-16 w-16 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
              <p className="text-gray-600 mb-8">Your payment could not be processed. Please try again.</p>
              <button
                onClick={handlePayment}
                className="btn-primary"
              >
                Retry Payment
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h2 className="font-semibold text-gray-900 flex items-center">
                      Shipping Address
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <textarea
                        name="address_line1"
                        value={shippingAddress.address_line1}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="House number, street name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                      <input
                        name="address_line2"
                        value={shippingAddress.address_line2}
                        onChange={handleInputChange}
                        type="text"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Apartment, suite, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleInputChange}
                            type="text"
                            className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="City"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          name="state"
                          value={shippingAddress.state}
                          onChange={handleInputChange}
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                        <input
                          name="pincode"
                          value={shippingAddress.pincode}
                          onChange={handleInputChange}
                          type="text"
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="Pincode"
                          maxLength="6"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            name="phone"
                            value={shippingAddress.phone}
                            onChange={handleInputChange}
                            type="tel"
                            className="w-full pl-10 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Phone number"
                            maxLength="15"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center pt-4">
                      <input
                        type="checkbox"
                        name="is_default"
                        id="is_default"
                        checked={shippingAddress.is_default}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
                        Set as default address
                      </label>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <h2 className="font-semibold text-gray-900">Order Summary</h2>
                  </div>
                  <div className="p-6">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex justify-between py-3 border-b border-gray-100 last:border-0">
                        <span className="text-gray-600 text-sm">{getProductName(item.productId)}</span>
                        <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg mt-6 mb-4">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-bold text-gray-900">₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-lg mb-4">
                      <span className="text-gray-600">Delivery</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary-700 border-t pt-4 mb-6">
                      <span>Total</span>
                      <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <span>Pay with Razorpay</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-32">
                  <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div className="flex items-start">
                      <FaEnvelope className="mr-3 mt-1 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Payment securely handled by</p>
                        <p className="text-primary-600 font-semibold mt-1">Razorpay</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <FaCheckCircle className="mr-3 mt-1 text-green-500" />
                      <span>Secure payment gateway</span>
                    </div>
                    <div className="flex items-start">
                      <FaCheckCircle className="mr-3 mt-1 text-green-500" />
                      <span>Multiple payment options available</span>
                    </div>
                  </div>

                  {user && user.name && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="font-semibold text-gray-900 mb-4">Logged in as</h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CheckoutPage;
