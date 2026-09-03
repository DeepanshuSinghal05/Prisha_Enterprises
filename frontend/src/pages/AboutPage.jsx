import { motion } from 'framer-motion';
import { FaCheckCircle, FaAward, FaHandshake, FaHeadset } from 'react-icons/fa';
import aboutUsImage from '../assets/about-us.jpeg';

const AboutPage = () => {
  const stats = [
    { id: 1, value: '500+', label: 'Customers Served', icon: FaHeadset },
    { id: 2, value: '100%', label: 'Satisfaction', icon: FaCheckCircle },
    { id: 3, value: '5+', label: 'Years of Experience', icon: FaAward },
    { id: 4, value: '24/7', label: 'Support', icon: FaHandshake },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About Prisha Enterprises
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Your trusted partner for premium assembled LED TVs with quality you can count on
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="section-title mb-6">
              Who We Are
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                Prisha Enterprises has been serving customers across the country with
                premium assembled LED TVs for over 5 years. We specialize in providing
                high-quality television solutions that combine cutting-edge technology
                with exceptional value.
              </p>
              <p>
                Our journey began with a simple mission: to make premium LED TVs
                accessible to every household. We believe that quality shouldn't come
                with a premium price tag, and we work tirelessly to bring you the best
                products at the most competitive prices.
              </p>
              <p>
                Every TV we sell undergoes rigorous quality checks and is assembled by
                our certified technicians. We don't just sell TVs - we provide complete
                solutions including professional installation and after-sales support.
              </p>
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-gray-900 mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                {[
                  'Authorized distributor partnerships',
                  'Certified professional assembly',
                  'Comprehensive warranty coverage',
                  'Dedicated customer support team',
                  'Transparent pricing, no hidden costs',
                ].map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <FaCheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary-800 rounded-2xl transform rotate-3 opacity-20"></div>
            <img
              src={aboutUsImage}
              alt="About Prisha Enterprises"
              className="relative rounded-2xl shadow-2xl w-full"
              onError={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #1E40AF, #3B82F6)';
                e.target.style.height = '400px';
                e.target.style.display = 'flex';
                e.target.style.alignItems = 'center';
                e.target.style.justifyContent = 'center';
                e.target.style.borderRadius = '0.5rem';
                e.target.innerHTML = '<span style="color: white; font-size: 24px;">About Prisha Enterprises</span>';
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-20">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: stat.id * 0.1 }}
                className="p-6"
              >
                <div className="mx-auto w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <stat.icon className="h-7 w-7 text-primary-600" />
                </div>
                <div className="text-4xl font-bold text-primary-800 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-gray-900 py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title text-white">
              Our Commitment To You
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We stand behind our products with unwavering quality standards
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center p-8 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6">
                <FaCheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Quality Assured</h3>
              <p className="text-gray-400">
                Every TV undergoes 15-point quality checks before delivery
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-8 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <FaAward className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Warranty Protected</h3>
              <p className="text-gray-400">
                Manufacturer warranty on all products with extended coverage options
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-8 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <FaHeadset className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">After-Sales Support</h3>
              <p className="text-gray-400">
                Dedicated support team available 24/7 to assist with any queries
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-custom py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Upgrade Your Viewing Experience?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Browse our collection of premium LED TVs or contact us for personalized
            recommendations based on your needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/products" className="btn-primary">
              Browse Products
            </a>
            <a href="/contact" className="btn-secondary">
              Contact Us
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;
