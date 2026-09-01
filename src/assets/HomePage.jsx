import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaPlay, FaStar } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import SectionHeader from '../components/SectionHeader';
import Highlights from '../components/Highlights';
import Testimonials from '../components/Testimonials';
import InstagramSection from '../components/InstagramSection';
import { products } from '../data/products';

const HomePage = () => {
  // Featured products (top 6)
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute top-1/2 -left-40 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full font-semibold text-sm mb-6 shadow-lg">
                  Trusted LED TV Specialists
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
              >
                Premium Assembled LED TVs <br />
                <span className="text-gradient">Quality You Can Trust</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                Best Quality Assembled LED TVs, Trusted by Customers across India.
                Premium components, professional assembly, and unbeatable prices.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <Link to="/products" className="btn-primary w-full sm:w-auto">
                  Browse Products
                  <FaArrowRight className="ml-2 inline h-4 w-4" />
                </Link>
                <Link to="/contact" className="btn-secondary w-full sm:w-auto">
                  Get Quote
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="mt-12 flex items-center justify-center lg:justify-start space-x-8"
              >
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-sm text-primary-200">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10+</div>
                  <div className="text-sm text-primary-200">TV Models</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-sm text-primary-200">Years Experience</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary-600 rounded-3xl transform rotate-3 opacity-30"></div>
                <img
                  src="/images/hero-tv.jpg"
                  alt="Premium LED TV"
                  className="relative rounded-3xl shadow-2xl w-full"
                  onError={(e) => {
                    e.target.src = '/vite.svg';
                  }}
                />
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FaCheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">100% Quality</div>
                      <div className="text-sm text-gray-600">Certified Assembly</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <Highlights />

      {/* Featured Products Preview */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <SectionHeader
            title="Featured Products"
            subtitle="Explore our most popular LED TV models, curated for quality and value"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card group text-center p-6"
              >
                <div className="h-48 overflow-hidden bg-gray-50 mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.background = '#f3f4f6';
                      e.target.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>';
                    }}
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>
                <p className="text-primary-600 font-bold text-xl mb-3">
                  ₹{product.price.toLocaleString('en-IN')}
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center text-primary-600 font-medium hover:text-primary-800 transition-colors"
                >
                  View Details <FaArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products" className="btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Instagram Section */}
      <InstagramSection />

      {/* Why Choose Us Section */}
      <section className="bg-white py-20">
        <div className="container-custom">
          <div className="text-center mb-16">
            <SectionHeader
              title="Why Choose Prisha Enterprises?"
              subtitle="We're not just selling TVs - we're providing complete entertainment solutions"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaCheckCircle, title: 'Premium Quality', desc: 'Only certified components used' },
              { icon: FaCheckCircle, title: 'Expert Assembly', desc: 'Certified technicians handle setup' },
              { icon: FaCheckCircle, title: 'Best Warranty', desc: 'Extended coverage options available' },
              { icon: FaCheckCircle, title: 'Customer First', desc: '24/7 support for all queries' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                  <item.icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
