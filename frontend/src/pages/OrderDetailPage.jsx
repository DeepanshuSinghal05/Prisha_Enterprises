import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaBox, FaShippingFast, FaTruck, FaBan, FaShoppingCart, FaRupeeSign } from 'react-icons/fa';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const getStatusSteps = (currentStatus, order) => {
  const steps = [
    { key: 'placed', label: 'Placed', icon: FaBox, timestamp: order?.created_at },
    { key: 'confirmed', label: 'Confirmed', icon: FaCheckCircle },
    { key: 'shipped', label: 'Shipped', icon: FaShippingFast, timestamp: order?.shipped_at },
    { key: 'delivered', label: 'Delivered', icon: FaTruck, timestamp: order?.delivered_at }
  ];

  const statusOrder = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  if (currentStatus === 'cancelled') {
    return steps.map((step) => ({
      ...step, completed: false, active: false, cancelled: true
    }));
  }

  return steps.map((step) => {
    const stepIndex = statusOrder.indexOf(step.key);
    return {
      ...step,
      completed: stepIndex < currentIndex,
      active: step.key === currentStatus,
      cancelled: false
    };
  });
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getById(id);
      if (response && response.order) {
        setOrder(response.order);
      } else {
        setError('Order could not be found.');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Order cannot be shown error. Please try again or contact support.');
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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <button
            onClick={() => navigate('/my-orders')}
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Details</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
               <div className="inline-block p-6 rounded-full bg-red-100 mb-4">
                 <FaBan className="h-12 w-12 text-red-600" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
               <p className="text-gray-600">{error}</p>
            </div>
          ) : order ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
               {/* Order Header */}
               <div className="p-6 border-b bg-gray-50">
                 <div className="flex flex-col md:flex-row md:items-center justify-between">
                   <div>
                     <span className="font-mono text-sm text-gray-500">Order #{order.id}</span>
                     <div className="flex items-center space-x-3 mt-2">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.order_status)}`}>
                         {order.order_status.toUpperCase()}
                       </span>
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.payment_status)}`}>
                         PAYMENT: {order.payment_status.toUpperCase()}
                       </span>
                     </div>
                   </div>
                   <div className="text-left md:text-right mt-4 md:mt-0">
                     <div className="text-2xl font-bold text-primary-700 flex items-center md:justify-end">
                       <FaRupeeSign className="text-xl mr-1" />
                       {Number(order.total_amount).toLocaleString('en-IN')}
                     </div>
                     <div className="text-sm text-gray-500 mt-1">
                       {new Date(order.created_at).toLocaleDateString('en-IN', {
                         year: 'numeric',
                         month: 'short',
                         day: 'numeric',
                         hour: '2-digit',
                         minute: '2-digit'
                       })}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Tracking Information */}
               {order.order_status !== 'cancelled' && (
                 <div className="p-6 bg-white border-b overflow-x-auto">
                   <div className="min-w-[500px] max-w-2xl mx-auto relative px-4 pt-4 pb-2">
                     <div className="flex justify-between items-center relative">
                       {/* Background Line */}
                       <div className="absolute top-6 left-10 right-10 h-0.5 bg-gray-200" style={{ zIndex: 0 }} />
                       {/* Active Line */}
                       <div className="absolute top-6 left-10 h-0.5 bg-primary-600 transition-all duration-500"
                            style={{
                              zIndex: 0,
                              width: `${(getStatusSteps(order.order_status, order).findIndex(s => s.active) / (getStatusSteps(order.order_status, order).length - 1)) * 100}%`
                            }}
                       />

                       {getStatusSteps(order.order_status, order).map((step) => {
                         const Icon = step.icon;
                         return (
                           <div key={step.key} className="relative z-10 flex flex-col items-center">
                             <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                               step.active
                                 ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-md'
                                 : step.completed
                                 ? 'bg-primary-600 text-white shadow-md'
                                 : 'bg-white text-gray-400 border-2 border-gray-200'
                             }`}>
                               <Icon className="text-lg" />
                             </div>
                             <span className={`text-xs font-medium text-center ${
                               step.active || step.completed ? 'text-gray-900 font-bold' : 'text-gray-400'
                             }`}>
                               {step.label}
                             </span>
                             {step.timestamp && (step.completed || step.active) && (
                               <span className="text-[10px] text-gray-500 mt-0.5 text-center">
                                 {new Date(step.timestamp).toLocaleDateString('en-IN', {
                                   day: 'numeric', month: 'short'
                                 })}
                               </span>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 </div>
               )}

               {/* Items List */}
               <div className="p-6 border-b">
                 <h4 className="text-lg font-semibold text-gray-800 mb-4">Items Ordered</h4>
                 <div className="space-y-4">
                   {order.items?.map((item) => (
                     <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 border border-gray-100 rounded-lg p-4 bg-gray-50">
                       <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border p-2">
                         {item.product?.image_url ? (
                           <img
                             src={item.product.image_url}
                             alt={item.product?.name}
                             className="w-full h-full object-contain"
                           />
                         ) : (
                           <FaShoppingCart className="h-8 w-8 text-gray-300" />
                         )}
                       </div>
                       <div className="flex-1 min-w-0 text-center sm:text-left w-full">
                         <h4 className="font-medium text-gray-900">{item.product?.name || 'Product'}</h4>
                         <div className="text-sm text-gray-500 mt-1">
                           Quantity: {item.quantity} × <FaRupeeSign className="inline text-[10px]" />{Number(item.price_at_purchase).toLocaleString('en-IN')}
                         </div>
                       </div>
                       <div className="font-bold text-gray-900 text-lg sm:text-right w-full sm:w-auto">
                         <FaRupeeSign className="inline text-sm mr-0.5" />{(Number(item.price_at_purchase) * item.quantity).toLocaleString('en-IN')}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Payment Info */}
               <div className="p-6 bg-gray-50">
                 <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                   <div>
                     <p className="text-gray-500 mb-1">Transaction ID</p>
                     <p className="font-medium font-mono">{order.payment?.gateway_payment_id || order.payment_id || 'N/A'}</p>
                   </div>
                   <div>
                     <p className="text-gray-500 mb-1">Payment Method</p>
                     <p className="font-medium capitalize">{order.payment?.method || 'N/A'}</p>
                   </div>
                 </div>
               </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
