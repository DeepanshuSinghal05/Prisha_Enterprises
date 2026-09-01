import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaWhatsapp, FaCheck, FaArrowRight } from 'react-icons/fa';
import { FaHdd, FaDisplay, FaMicrochip, FaAudio, FaWifi, FaRulerCombined } from 'react-icons/fa6';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';

  if (!product || !isOpen) return null;

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hello! I am interested in: ${product.name}. Please share more details.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const specs = [
    {
      label: 'Screen Size',
      value: product.screenSize,
      icon: FaRulerCombined,
      category: 'Display'
    },
    {
      label: 'Resolution',
      value: product.resolution,
      icon: FaDisplay,
      category: 'Display'
    },
    {
      label: 'Panel Type',
      value: product.panelType,
      icon: FaHdd,
      category: 'Display'
    },
    {
      label: 'Operating System',
      value: product.os,
      icon: FaMicrochip,
      category: 'Software'
    },
    {
      label: 'RAM / ROM',
      value: `${product.ram} / ${product.rom}`,
      icon: FaMicrochip,
      category: 'Storage'
    },
    {
      label: 'Audio Output',
      value: product.audio,
      icon: FaAudio,
      category: 'Audio'
    },
    {
      label: 'Wi-Fi',
      value: product.wifi ? 'Yes, ' + product.wifi : 'No',
      icon: FaWifi,
      category: 'Connectivity'
    },
    {
      label: 'Bluetooth',
      value: product.bluetooth,
      icon: FaWifi,
      category: 'Connectivity'
    },
    {
      label: 'HDMI Ports',
      value: `${product.hdmiPorts} Ports`,
      icon: FaHdd,
      category: 'Connectivity'
    },
    {
      label: 'USB Ports',
      value: `${product.usbPorts} Ports`,
      icon: FaHdd,
      category: 'Connectivity'
    },
    {
      label: 'Aux Port',
      value: product.auxPort ? 'Yes' : 'No',
      icon: FaAudio,
      category: 'Connectivity'
    },
    {
      label: 'LAN Port',
      value: product.lanPort ? 'Yes' : 'No',
      icon: FaWifi,
      category: 'Connectivity'
    },
  ];

  const smartFeatures = product.smartFeatures || [];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
        >
          <FaTimes className="h-5 w-5 text-gray-600" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Product Image */}
          <div className="bg-gray-50 p-8 flex items-center justify-center">
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-[50vh] object-contain"
            />
          </div>

          {/* Product Info */}
          <div className="p-8">
            <div className="mb-6">
              {product.badge && (
                <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-lg text-sm font-bold mb-3">
                  {product.badge}
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>
              <p className="text-gray-500">
                {product.screenSize} • {product.resolution}
              </p>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-primary-700">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.originalPrice && `₹${product.originalPrice.toLocaleString('en-IN')}/-`}
                </span>
              </div>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  In Stock
                </span>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-3">
                {specs.slice(0, 6).map((spec, index) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-primary-600 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">{spec.label}</p>
                        <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Features */}
            {smartFeatures.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">Smart Features</h3>
                <ul className="space-y-2">
                  {smartFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <FaCheck className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleWhatsApp}
                className="btn-whatsapp w-full flex items-center justify-center space-x-2 py-4"
              >
                <FaWhatsapp className="h-5 w-5" />
                <span>Enquire on WhatsApp</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>

        {/* Full Specs Section */}
        <div className="bg-gray-50 border-t border-gray-100 p-8">
          <h3 className="font-semibold text-gray-900 mb-6">Complete Specifications</h3>

          {/* Display Specs */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Display</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {specs.filter(s => s.category === 'Display').map((spec, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                  <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Software & Storage */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Software & Storage</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {specs.filter(s => s.category === 'Software' || s.category === 'Storage').map((spec, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                  <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Connectivity */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Connectivity</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {specs.filter(s => s.category === 'Connectivity').map((spec, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                  <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audio */}
          <div>
            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Audio</h4>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Audio Output</p>
              <p className="text-sm font-medium text-gray-900">{specs.find(s => s.category === 'Audio')?.value}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailModal;
