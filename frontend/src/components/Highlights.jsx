import { motion } from 'framer-motion';
import { FaCheckCircle, FaUsers, FaTag, FaWrench } from 'react-icons/fa';

const features = [
  {
    id: 1,
    icon: FaCheckCircle,
    title: 'Best Quality',
    description: 'Premium assembled LED TVs with certified components for lasting performance',
    delay: 0
  },
  {
    id: 2,
    icon: FaUsers,
    title: 'Trusted Business',
    description: 'Serving customers across the country with honest pricing and reliable service',
    delay: 0.1
  },
  {
    id: 3,
    icon: FaTag,
    title: 'Best Offers',
    description: 'Exclusive deals and festive discounts that give you the best value for money',
    delay: 0.2
  },
  {
    id: 4,
    icon: FaWrench,
    title: 'Professional Assembly',
    description: 'Expert installation and setup service ensuring your TV is ready to use',
    delay: 0.3
  }
];

const Highlights = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ y: -10 }}
              className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="mx-auto w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group">
                <feature.icon className="h-8 w-8 text-primary-600 group-hover:text-primary-800 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Highlights;
