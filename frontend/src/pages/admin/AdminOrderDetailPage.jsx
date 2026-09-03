import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBox, FaCheckCircle, FaShippingFast, FaTruck, FaBan, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCreditCard } from 'react-icons/fa';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import adminAPI from '../../services/adminAPI';
import { toast } from 'react-toastify';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, logout } = useAdminAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadOrder();
  }, [token, id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrderById(token, id);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Failed to load order:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/admin/login');
      } else if (error.response?.status === 404) {
        toast.error('Order not found');
        navigate('/admin/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(`Update order status to "${newStatus}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      const response = await adminAPI.updateOrderStatus(token, id, { status: newStatus });
      setOrder(response.data.order);
      toast.success(response.message);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update status';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      placed: { color: 'bg-blue-100 text-blue-800', icon: FaBox },
      confirmed: { color: 'bg-yellow-100 text-yellow-800', icon: FaCheckCircle },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: FaShippingFast },
      delivered: { color: 'bg-green-100 text-green-800', icon: FaTruck },
      cancelled: { color: 'bg-red-100 text-red-800', icon: FaBan }
    };
    const badge = badges[status] || badges.placed;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAvailableActions = (currentStatus) => {
    const transitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };
    return transitions[currentStatus] || [];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const availableActions = getAvailableActions(order.order_status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Order Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order #{order.id}</h1>
                <p className="text-sm text-gray-500">Placed on {formatDate(order.created_at)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                {getStatusBadge(order.order_status)}
              </div>
            </div>

            {/* Status Update Actions */}
            {availableActions.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Update Order Status:</p>
                <div className="flex flex-wrap gap-3">
                  {availableActions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updating}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        status === 'cancelled'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : status === 'delivered'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                </div>
                <div className="p-6 space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                      {item.product?.image_url && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h3>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-500">Price: ₹{parseFloat(item.price).toLocaleString('en-IN')} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-primary-600">
                      ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-primary-600" />
                  Shipping Address
                </h2>
                <div className="text-gray-700 space-y-1">
                  <p>{order.shipping_address?.address_line1}</p>
                  {order.shipping_address?.address_line2 && (
                    <p>{order.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.pincode}
                  </p>
                  <p className="flex items-center mt-3 pt-3 border-t border-gray-100">
                    <FaPhone className="mr-2 text-gray-400" />
                    {order.shipping_address?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaUser className="mr-3 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium text-gray-900">{order.user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaEnvelope className="mr-3 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{order.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaPhone className="mr-3 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{order.user?.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {order.payment && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaCreditCard className="mr-2 text-primary-600" />
                    Payment Details
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="font-medium text-gray-900 capitalize">{order.payment.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-medium ${
                        order.payment.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.payment.payment_status.charAt(0).toUpperCase() + order.payment.payment_status.slice(1)}
                      </span>
                    </div>
                    {order.payment.razorpay_payment_id && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-gray-500 mb-1">Razorpay Payment ID</p>
                        <p className="font-mono text-xs text-gray-900 break-all">
                          {order.payment.razorpay_payment_id}
                        </p>
                      </div>
                    )}
                    {order.payment.created_at && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-gray-500 mb-1">Payment Date</p>
                        <p className="text-gray-900">{formatDate(order.payment.created_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;