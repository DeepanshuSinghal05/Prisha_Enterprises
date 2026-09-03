import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBox, FaCheckCircle, FaShippingFast, FaTruck, FaBan, FaSearch, FaSignOutAlt, FaChartLine, FaMoneyBillWave} from 'react-icons/fa';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import adminAPI from '../../services/adminAPI';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, token, logout } = useAdminAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [token, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        adminAPI.getStats(token),
        adminAPI.getOrders(token, filters)
      ]);

      setStats(statsRes.data);
      setOrders(ordersRes.data.orders);
      setPagination(ordersRes.data.pagination);
    } catch (error) {
      console.error('Failed to load data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status: status === prev.status ? '' : status, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome, {admin.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-400 mt-1">{stats.recentOrders} in last 7 days</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaBox className="text-blue-600 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                    <p className="text-xs text-gray-400 mt-1">Need confirmation</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">In Transit</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.shippedOrders}</p>
                    <p className="text-xs text-gray-400 mt-1">On the way</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FaShippingFast className="text-purple-600 text-xl" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400 mt-1">{stats.deliveredOrders} delivered</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaMoneyBillWave className="text-green-600 text-xl" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Revenue Growth Card */}
            {stats.revenueGrowth !== undefined && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-sm p-6 mb-8 text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-100 mb-2">Monthly Revenue Growth</p>
                    <div className="flex items-baseline gap-4">
                      <p className="text-3xl font-bold">
                        {stats.revenueGrowth > 0 ? '+' : ''}{stats.revenueGrowth}%
                      </p>
                      <div className="flex items-center gap-2">
                        {stats.revenueGrowth >= 0 ? (
                          <FaTrendingUp className="text-green-300" />
                        ) : (
                          <FaTrendingDown className="text-red-300" />
                        )}
                        <span className="text-sm text-primary-100">vs last month</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-6 text-sm">
                      <div>
                        <span className="text-primary-200">Current: </span>
                        <span className="font-semibold">₹{stats.currentMonthRevenue?.toLocaleString('en-IN') || 0}</span>
                      </div>
                      <div>
                        <span className="text-primary-200">Previous: </span>
                        <span className="font-semibold">₹{stats.previousMonthRevenue?.toLocaleString('en-IN') || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <FaChartLine className="text-6xl text-primary-300 opacity-50" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Order Status Distribution */}
              {stats.ordersByStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
                  <div className="space-y-3">
                    {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                      const total = stats.totalOrders || 1;
                      const percentage = ((count / total) * 100).toFixed(1);
                      const colors = {
                        placed: 'bg-blue-600',
                        confirmed: 'bg-yellow-600',
                        shipped: 'bg-purple-600',
                        delivered: 'bg-green-600',
                        cancelled: 'bg-red-600'
                      };
                      return (
                        <div key={status}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 capitalize">{status}</span>
                            <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${colors[status]} h-2 rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Top Products */}
              {stats.topProducts && stats.topProducts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                  <div className="space-y-4">
                    {stats.topProducts.map((item, index) => (
                      <div key={item.product_id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.dataValues?.total_sold || 0} units sold
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            ₹{parseFloat(item.dataValues?.total_revenue || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* Orders Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders</h2>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order ID, customer name or email..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleStatusFilter('placed')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === 'placed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Placed
                </button>
                <button
                  onClick={() => handleStatusFilter('confirmed')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === 'confirmed'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Confirmed
                </button>
                <button
                  onClick={() => handleStatusFilter('shipped')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === 'shipped'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Shipped
                </button>
                <button
                  onClick={() => handleStatusFilter('delivered')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.status === 'delivered'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Delivered
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">#{order.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                          <p className="text-xs text-gray-500">{order.user?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.items?.length || 0} item(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.order_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} orders
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
