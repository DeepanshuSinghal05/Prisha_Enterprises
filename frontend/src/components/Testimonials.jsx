import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay, FaStar, FaArrowRight } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    location: 'Mumbai, Maharashtra',
    comment: 'Prisha Enterprises provided excellent service. My 55-inch TV was assembled professionally and delivered on time. The picture quality is incredible!',
    rating: 5,
    videoThumbnail: '/images/testimonial-1.jpg'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    location: 'Delhi',
    comment: 'Great experience buying a 43-inch LED TV. The team explained all the features and helped me choose the perfect one. Highly recommended!',
    rating: 5,
    videoThumbnail: '/images/testimonial-2.jpg'
  },
  {
    id: 3,
    name: 'Amit Patel',
    location: 'Ahmedabad, Gujarat',
    comment: 'The best quality assembled TVs in town. My 65-inch Prisha TV has been running smoothly for over a year now. Worth every penny!',
    rating: 4,
    videoThumbnail: '/images/testimonial-3.jpg'
  }
];

const Testimonials = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-title text-primary-800 mb-4"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subtitle"
          >
            Trust from thousands of satisfied customers across the country
          </motion.p>
        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mb-8"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <motion.div
                whileHover={{ y: -5 }}
                className="card p-8 bg-white"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                  <button
                    onClick={() => setActiveVideo(testimonial.id)}
                    className="flex items-center space-x-2 text-primary-600 hover:text-primary-800 font-medium transition-colors"
                  >
                    <FaPlay className="h-4 w-4" />
                    <span>Watch Video</span>
                  </button>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a
              href="/contact"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-800 font-semibold transition-colors"
            >
              <span>Share Your Experience</span>
              <FaArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
                {/* Placeholder for video content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <FaPlay className="h-16 w-16 text-white/50 mx-auto mb-4" />
                    <p className="text-white">Video testimonial player would go here</p>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">
                {testimonials.find(t => t.id === activeVideo)?.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {testimonials.find(t => t.id === activeVideo)?.location}
              </p>
              <p className="text-gray-700">
                {testimonials.find(t => t.id === activeVideo)?.comment}
              </p>
              <button
                onClick={() => setActiveVideo(null)}
                className="mt-6 px-6 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Testimonials;
