import { motion } from 'framer-motion';
import { FaTag, FaClock, FaArrowRight } from 'react-icons/fa';

const DealsCard = ({ deal }) => {
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919999999999';
  const message = encodeURIComponent(`Hello! I am interested in this deal: ${deal.title}. Please share more details.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="card bg-gradient-to-br from-white to-gray-50"
    >
      {/* Deal Badge */}
      <div className="absolute top-4 right-4 z-10">
        {deal.badge === 'Limited Time' ? (
          <div className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold text-xs flex items-center space-x-2 animate-pulse">
            <FaClock className="h-3 w-3" />
            <span>Limited Time</span>
          </div>
        ) : (
          <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-lg font-bold text-xs">
            {deal.badge}
          </span>
        )}
      </div>

      <div className="p-8 pt-12">
        <div className="flex items-center space-x-3 mb-4">
          <FaTag className="h-8 w-8 text-green-600" />
          <h3 className="text-2xl font-bold text-gray-900">{deal.title}</h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 leading-relaxed">
            {deal.description}
          </p>
        </div>

        {/* Discount Display */}
        <div className="mb-6">
          <span className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-bold text-lg shadow-lg transform -rotate-2">
            {deal.discount}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {deal.validity && (
            <p className="text-sm text-gray-500 flex items-center">
              <FaClock className="h-4 w-4 mr-2" />
              {deal.validity}
            </p>
          )}
          {deal.applicableProducts && (
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Applied to:</span> {deal.applicableProducts.join(', ')}
            </p>
          )}
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp w-full flex items-center justify-center space-x-2 group"
        >
          <span>Grab Offer</span>
          <FaArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
};

export default DealsCard;
