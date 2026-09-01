import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaCheck, FaArrowLeft, FaRulerCombined, FaTv, FaHdd, FaWifi, FaMusic, FaMicrochip } from 'react-icons/fa';
import { products } from '../data/products';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the product by ID
    const foundProduct = products.find(p => p.id === parseInt(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setLoading(false);
      window.scrollTo(0, 0);
    } else {
      navigate('/products');
    }
  }, [id, navigate]);

  const handleWhatsApp = () => {
    if (!product) return;
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';
    const message = encodeURIComponent(`Hello! I am interested in: ${product.name}. Please share more details.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Group specs by category
  const displaySpecs = [
    { label: 'Screen Size', value: product.screenSize, icon: FaRulerCombined },
    { label: 'Resolution', value: product.resolution, icon: FaTv },
    { label: 'Panel Type', value: product.panelType, icon: FaTv },
  ];

  const hardwareSpecs = [
    { label: 'RAM', value: product.ram, icon: FaMicrochip },
    { label: 'ROM', value: product.rom, icon: FaHdd },
    { label: 'Audio Output', value: product.audio, icon: FaMusic },
  ];

  const connectivitySpecs = [
    { label: 'Wi-Fi', value: product.wifi ? `Yes (${product.wifi})` : 'No', icon: FaWifi },
    { label: 'Bluetooth', value: product.bluetooth || 'No', icon: FaWifi },
    { label: 'HDMI Ports', value: `${product.hdmiPorts} Ports`, icon: FaHdd },
    { label: 'USB Ports', value: `${product.usbPorts} Ports`, icon: FaHdd },
    { label: 'Aux Port', value: product.auxPort ? 'Yes' : 'No', icon: FaMusic },
    { label: 'LAN Port', value: product.lanPort ? 'Yes' : 'No', icon: FaWifi },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="container-custom">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link to="/products" className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors">
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-auto object-contain p-8 bg-gray-50"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #1E40AF, #3B82F6)';
                  e.target.style.minHeight = '400px';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.innerHTML = `<div style="text-align:center"><svg class="w-32 h-32 text-white mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg><h3 style="color:white;font-size:24px">${product.name}</h3></div>`;
                }}
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {product.badge && (
                <span className="inline-block bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold mb-4 shadow-md">
                  {product.badge}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-gray-600 mb-6 text-lg">
                {product.screenSize} • {product.resolution}
              </p>

              <div className="flex items-baseline space-x-4 mb-8">
                <span className="text-4xl md:text-5xl font-bold text-primary-700">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.inStock === false && (
                  <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-bold">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quick Specs */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FaCheck className="mr-2 text-green-600" />
                  Key Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displaySpecs.map((spec, index) => (
                    <SpecItem key={index} spec={spec} />
                  ))}
                  {hardwareSpecs.map((spec, index) => (
                    <SpecItem key={index} spec={spec} />
                  ))}
                </div>
              </div>

              {/* Connectivity Specs */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Connectivity & Ports
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {connectivitySpecs.map((spec, index) => (
                    <SpecItem key={index} spec={spec} />
                  ))}
                </div>
              </div>

              {/* Smart Features */}
              {product.smartFeatures && product.smartFeatures.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Smart Features
                  </h3>
                  <ul className="space-y-2">
                    {product.smartFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3 text-gray-600">
                        <FaCheck className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="mt-auto">
                <button
                  onClick={handleWhatsApp}
                  disabled={!product.inStock}
                  className={`w-full py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-300 ${
                    product.inStock
                      ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-1'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <FaWhatsapp className="h-6 w-6" />
                  <span>Enquire on WhatsApp</span>
                </button>

                <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FaCheck className="h-4 w-4 text-green-500 mr-2" />
                    <span>Free Delivery</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheck className="h-4 w-4 text-green-500 mr-2" />
                    <span>Professional Setup</span>
                  </div>
                  <div className="flex items-center">
                    <FaCheck className="h-4 w-4 text-green-500 mr-2" />
                    <span>Warranty Included</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for spec items
const SpecItem = ({ spec }) => {
  const Icon = spec.icon;
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <Icon className="h-6 w-6 text-primary-600 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-500">{spec.label}</p>
        <p className="text-sm font-semibold text-gray-900">{spec.value}</p>
      </div>
    </div>
  );
};

export default ProductDetailPage;
