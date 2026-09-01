import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaCheck, FaFilter, FaSort, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { products } from '../data/products';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [filterSize, setFilterSize] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply size filter
    if (filterSize !== 'all') {
      result = result.filter(p => p.screenSize.includes(filterSize));
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'size-large') {
      result.sort((a, b) => {
        const sizeA = parseInt(a.screenSize) || 0;
        const sizeB = parseInt(b.screenSize) || 0;
        return sizeB - sizeA;
      });
    }

    return result;
  }, [filterSize, sortBy]);

  const handleWhatsApp = (productName) => {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';
    const message = encodeURIComponent(`Hello! I am interested in: ${productName}. Please share more details.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Available sizes for filter
  const sizes = ['all', '32', '40', '43', '50', '55', '65', '75'];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title text-primary-800"
          >
            Premium LED TVs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="section-subtitle"
          >
            Choose from our wide range of assembled LED TVs with premium features
          </motion.p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={filterSize}
                onChange={(e) => setFilterSize(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="all">All Sizes</option>
                {sizes.slice(1).map(size => (
                  <option key={size} value={size}>{size} inch</option>
                ))}
              </select>
              <FaChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 rotate-90" />
            </div>

            <div className="relative">
              <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="default">Sort By</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="size-large">Size: Large to Small</option>
              </select>
              <FaChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 rotate-90" />
            </div>
          </div>

          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredProducts.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card group"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/vite.svg';
                      e.target.alt = 'Product image not available';
                    }}
                  />
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                      {product.badge}
                    </span>
                  )}
                  {product.inStock === false && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Screen:</span> {product.screenSize}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">Resolution:</span> {product.resolution}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.originalPrice && (
                        <p className="text-sm text-gray-400 line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </p>
                      )}
                      <p className="text-xl font-bold text-primary-700">
                        ₹{product.price.toLocaleString('en-IN')}<span className="text-sm font-normal text-gray-500">/-</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleViewDetails(product.id)}
                      className="w-full py-2 px-4 border border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-600 hover:text-white transition-colors duration-200"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleWhatsApp(product.name)}
                      disabled={!product.inStock}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                        product.inStock
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Enquire on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-8 rounded-full bg-gray-100 mb-6">
              <FaShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              Try adjusting your filters to find what you're looking for
            </p>
            <button
              onClick={() => {
                setFilterSize('all');
                setSortBy('default');
              }}
              className="mt-6 btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
