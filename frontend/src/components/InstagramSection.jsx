
import { motion } from 'framer-motion';
import { FaInstagram, FaYoutube } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import instaVideo1 from '../assets/insta-1.mp4';
import instaVideo2 from '../assets/insta-2.mp4';
import instaVideo3 from '../assets/insta-3.mp4';
import instaVideo4 from '../assets/insta-4.mp4';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const instagramPosts = [
  {
    id: 1,
    video: instaVideo1,
    caption: 'New arrival: 55-inch QLED',
  },
  {
    id: 2,
    video: instaVideo2,
    caption: 'Festive season special',
  },
  {
    id: 3,
    video: instaVideo3,
    caption: 'Customer setup service',
  },
  {
    id: 4,
    video: instaVideo4,
    caption: 'Customer setup service',
  }
];

const InstagramSection = () => {
  const instagramLink =
    import.meta.env.VITE_INSTAGRAM_LINK ||
    'https://www.instagram.com/prishaenterprisess';

  const youtubeLink =
    'https://youtube.com/@prisha_enterprises?si=9wP-D5ltRbqKe9QH';

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container-custom">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* =========================
              TEXT CONTENT
          ========================== */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >

            {/* Instagram Heading */}
            <div className="flex items-center space-x-3 mb-6">
              <FaInstagram className="h-8 w-8 text-pink-500" />

              <h2 className="text-3xl font-bold">
                Follow Us on Instagram
              </h2>
            </div>

            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
              Stay updated with our latest arrivals, special offers, and
              customer setups. Follow @prishaenterprisess for daily TV
              inspiration and exclusive content!
            </p>

            {/* Instagram Button */}
            <motion.a
              href={instagramLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <FaInstagram className="h-6 w-6" />

              <span>
                Follow @prishaenterprisess
              </span>
            </motion.a>

            {/* =========================
                YOUTUBE SECTION
            ========================== */}
            <div className="mt-10">

              <div className="flex items-center space-x-3 mb-4">
                <FaYoutube className="h-8 w-8 text-red-500" />

                <h3 className="text-2xl font-bold">
                  Subscribe to Our YouTube
                </h3>
              </div>

              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                Watch our latest TV videos, product showcases, customer
                setups, and more on our YouTube channel.
              </p>

              <motion.a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-3 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <FaYoutube className="h-6 w-6" />

                <span>
                  Visit @prisha_enterprises
                </span>
              </motion.a>

            </div>

          </motion.div>

          {/* =========================
              DESKTOP VIDEO GRID
          ========================== */}
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
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  whileHover={{ scale: 1.03 }}
                  className="relative rounded-xl overflow-hidden group aspect-[4/3] bg-gray-800"
                >

                  {/* Autoplay Video */}
                  <video
                    src={post.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">

                    <p className="text-white font-medium">
                      {post.caption}
                    </p>

                  </div>

                  {/* Instagram Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                    <div className="bg-black/40 backdrop-blur-sm rounded-full p-4">
                      <FaInstagram className="h-10 w-10 text-white" />
                    </div>

                  </div>

                </motion.a>

              ))}

            </div>

          </div>

          {/* =========================
              MOBILE VIDEO CAROUSEL
          ========================== */}
          <div className="lg:hidden">

            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1.2}
              centeredSlides
              pagination={{ clickable: true }}
              navigation
              className="rounded-xl overflow-hidden pb-10"
            >

              {instagramPosts.map((post) => (

                <SwiperSlide key={post.id}>

                  <motion.a
                    href={instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileTap={{ scale: 0.98 }}
                    className="relative block rounded-xl overflow-hidden group aspect-[9/16] bg-gray-800"
                  >

                    {/* Autoplay Video */}
                    <video
                      src={post.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Mobile Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">

                      <div>

                        <div className="flex items-center gap-2 mb-2">

                          <FaInstagram className="h-5 w-5 text-white" />

                          <span className="text-sm text-gray-200">
                            @prishaenterprisess
                          </span>

                        </div>

                        <p className="text-white font-medium">
                          {post.caption}
                        </p>

                      </div>

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

