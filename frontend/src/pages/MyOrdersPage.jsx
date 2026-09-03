import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaShoppingCart, FaCheck, FaEye, FaBox, FaCheckCircle, FaShippingFast, FaTruck, FaBan } from 'react-icons/fa';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyOrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
      placed: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-purple-100 text-purple-700',
      shipped: 'bg-orange-100 text-orange-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getOrderStatusSteps = (currentStatus) => {
    const steps = [
      { key: 'placed', label: 'Placed', icon: FaBox },
      { key: 'confirmed', label: 'Confirmed', icon: FaCheckCircle },
      { key: 'shipped', label: 'Shipped', icon: FaShippingFast },
      { key: 'delivered', label: 'Delivered', icon: FaTruck }
    ];

    const statusOrder = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    if (currentStatus === 'cancelled') {
      return steps.map((step, idx) => ({
        ...step,
        completed: false,
        active: false,
        cancelled: true
      }));
    }

    return steps.map((step, idx) => {
      const stepIndex = statusOrder.indexOf(step.key);
      return {
        ...step,
        completed: stepIndex < currentIndex,
        active: step.key === currentStatus,
        cancelled: false
      };
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="inline-block p-8 rounded-full bg-gray-100 mb-6">
            <FaShoppingCart className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to login to view your orders</p>
          <a href="/auth" className="btn-primary">Login / Signup</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="inline-block p-8 rounded-full bg-gray-100 mb-6">
                <FaShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <a href="/products" className="btn-primary">Browse Products</a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusSteps = getOrderStatusSteps(order.order_status);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    {/* Order Header */}
                    <div className="p-6 border-b bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm text-gray-500">Order #{order.id}</span>
                          <div className="flex items-center space-x-3 mt-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.order_status)}`}>
                              {order.order_status.toUpperCase()}
                            </span>
                            {order.order_status === 'cancelled' && (
                              <span className="flex items-center text-red-600 text-sm">
                                <FaBan className="mr-1" />
                                Cancelled
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-700">
                            ₹{order.total_amount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Status Tracker */}
                    {order.order_status !== 'cancelled' && (
                      <div className="p-6 bg-white border-b">
                        <div className="relative">
                          <div className="flex justify-between items-center">
                            {statusSteps.map((step, idx) => {
                              const Icon = step.icon;
                              return (
                                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                                  {/* Connecting Line */}
                                  {idx < statusSteps.length - 1 && (
                                    <div
                                      className={`absolute top-6 left-1/2 w-full h-0.5 ${
                                        step.completed ? 'bg-primary-600' : 'bg-gray-200'
                                      }`}
                                      style={{ zIndex: 0 }}
                                    />
                                  )}

                                  {/* Status Icon */}
                                  <div
                                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                                      step.active
                                        ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                                        : step.completed
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                                  >
                                    <Icon className="text-lg" />
                                  </div>

                                  {/* Status Label */}
                                  <span className={`text-xs font-medium text-center ${
                                    step.active || step.completed ? 'text-gray-900' : 'text-gray-400'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Items */}
                    <div className="p-6 border-b">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              {item.product?.image_url ? (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product?.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <FaShoppingCart className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{item.product?.name || 'Product'}</h4>
                              <div className="text-sm text-gray-500">
                                Qty: {item.quantity} × ₹{item.price_at_purchase.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="font-bold text-gray-900">
                              ₹{(item.price_at_purchase * item.quantity).toLocaleString('en-IN')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div className="p-6 bg-gray-50">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>{order.shipping_address.address_line1}</p>
                          {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
                          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                          <p className="mt-1">Phone: {order.shipping_address.phone}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
