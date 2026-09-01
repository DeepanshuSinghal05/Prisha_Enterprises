import { motion } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const instagramPosts = [
  { id: 1, image: '/images/insta-1.jpg', caption: 'New arrival: 55-inch QLED' },
  { id: 2, image: '/images/insta-2.jpg', caption: 'Festive season special' },
  { id: 3, image: '/images/insta-3.jpg', caption: 'Customer setup service' },
  { id: 4, image: '/images/insta-4.jpg', caption: 'Bulk order celebration' },
  { id: 5, image: '/images/insta-5.jpg', caption: '4K HDR experience' },
  { id: 6, image: '/images/insta-6.jpg', caption: 'Home theater setup' },
];

const InstagramSection = () => {
  const instagramLink = import.meta.env.VITE_INSTAGRAM_LINK || 'https://www.instagram.com/prishaenterprisess';

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <FaInstagram className="h-8 w-8 text-pink-500" />
              <h2 className="text-3xl font-bold">Follow Us on Instagram</h2>
            </div>
            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
              Stay updated with our latest arrivals, special offers, and customer setups.
              Follow @prishaenterprisess for daily TV inspiration and exclusive content!
            </p>
            <motion.a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <FaInstagram className="h-6 w-6" />
              <span>Follow @prishaenterprisess</span>
            </motion.a>
          </motion.div>

          {/* Instagram Grid/Carousel */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {instagramPosts.map((post, index) => (
                <motion.a
                  key={post.id}
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative rounded-xl overflow-hidden group aspect-[4/3]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${post.image})`,
                      backgroundColor: '#2d3748'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <p className="text-white font-medium">{post.caption}</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FaInstagram className="h-12 w-12 text-white" />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Mobile Carousel */}
          <div className="lg:hidden">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.5}
              centeredSlides
              pagination={{ clickable: true }}
              className="rounded-xl overflow-hidden"
            >
              {instagramPosts.map((post, index) => (
                <SwiperSlide key={post.id}>
                  <motion.a
                    href={instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    className="relative rounded-xl overflow-hidden group aspect-[16/9]"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${post.image})`,
                        backgroundColor: '#2d3748'
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                      <p className="text-white font-medium">{post.caption}</p>
                    </div>
                  </motion.a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
