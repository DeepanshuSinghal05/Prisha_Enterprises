import { motion } from 'framer-motion';
import { FaCheckCircle, FaClock, FaGift } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { deals } from '../data/deals';
import DealsCard from '../components/DealsCard';
import SectionHeader from '../components/SectionHeader';

const DealsPage = () => {
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
            <div className="inline-block p-3 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <FaGift className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Special Deals & Offers
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Exclusive discounts on premium LED TVs. Limited time offers that
              give you the best value for your money.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="container-custom py-16">
        <SectionHeader
          title="Current Offers"
          subtitle="Discover our latest promotions and limited-time deals on LED TVs"
        />

        {/* Featured Deals */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
              <span className="bg-red-500 text-white p-1 rounded">
                <FaClock className="h-4 w-4" />
              </span>
              <span>Featured Offers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {deals.filter(deal => deal.featured).map((deal) => (
              <DealsCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>

        {/* All Deals Carousel (Mobile) */}
        <div className="hidden xl:block">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
            <span className="bg-green-500 text-white p-1 rounded">
              <FaGift className="h-4 w-4" />
            </span>
            <span>All Deals</span>
          </h2>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            slidesPerView={3}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              1024: { slidesPerView: 3 },
              768: { slidesPerView: 2 },
              640: { slidesPerView: 1 },
            }}
          >
            {deals.map((deal) => (
              <SwiperSlide key={deal.id}>
                <DealsCard deal={deal} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Mobile Carousel */}
        <div className="xl:hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 mt-12">All Deals</h2>
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1.2}
            centeredSlides
            pagination={{ clickable: true }}
          >
            {deals.map((deal) => (
              <SwiperSlide key={deal.id}>
                <DealsCard deal={deal} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <FaCheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Authentic</h3>
              <p className="text-gray-600">
                All products are sourced directly from authorized distributors
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <FaGift className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Best Prices</h3>
              <p className="text-gray-600">
                Compare our prices and see why customers trust us for value
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <FaClock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Limited Time</h3>
              <p className="text-gray-600">
                Offers change frequently - stay updated for the latest deals
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DealsPage;
