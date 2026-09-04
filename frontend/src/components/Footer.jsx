import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logo from '../assets/logo.jpg';
import {
  FaInstagram,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const instagramLink =
    import.meta.env.VITE_INSTAGRAM_LINK ||
    'https://www.instagram.com/prishaenterprisess';

  const youtubeLink =
    'https://youtube.com/@prisha_enterprises?si=9wP-D5ltRbqKe9QH';

  const businessEmail =
    import.meta.env.VITE_BUSINESS_EMAIL ||
    'enterprisesprisha82@gmail.com';

  const businessPhone =
    import.meta.env.VITE_BUSINESS_PHONE ||
    '+91 97177 18175';

  const businessAddress =
    import.meta.env.VITE_BUSINESS_ADDRESS ||
    '60, Mirzajaan, Sihani Gate, Bihari Nagar, Naya Ganj, Ghaziabad, Uttar Pradesh 20100';

  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Deals & Offers', path: '/deals' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const productCategories = [
    { name: '32 inch LED TVs', path: '/products?size=32' },
    { name: '43 inch LED TVs', path: '/products?size=43' },
    { name: '55 inch LED TVs', path: '/products?size=55' },
    { name: '65 inch LED TVs', path: '/products?size=65' },
    { name: 'View All Products', path: '/products' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Prisha Enterprises"
                className="h-12 w-auto rounded bg-white p-1"
              />

              <span className="text-xl font-bold">
                Prisha Enterprises
              </span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted destination for premium assembled LED TVs.
              We bring you the best quality at unbeatable prices with
              exceptional customer service.
            </p>

            {/* Social Media Links */}
            <div className="flex space-x-4">

              {/* Instagram */}
              <motion.a
                href={instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg hover:shadow-lg transition-shadow"
                aria-label="Follow us on Instagram"
                title="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </motion.a>

              {/* YouTube */}
              <motion.a
                href={youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600 p-3 rounded-lg hover:bg-red-700 hover:shadow-lg transition-all"
                aria-label="Subscribe to our YouTube channel"
                title="YouTube"
              >
                <FaYoutube className="h-5 w-5" />
              </motion.a>

            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              Quick Links
            </h3>

            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              Products
            </h3>

            <ul className="space-y-3">
              {productCategories.map((category) => (
                <li key={category.path}>
                  <Link
                    to={category.path}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">
              Contact Us
            </h3>

            <ul className="space-y-4">

              {/* Address */}
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />

                <span className="text-gray-400 text-sm">
                  {businessAddress}
                </span>
              </li>

              {/* Phone */}
              <li className="flex items-center space-x-3">
                <FaPhone className="h-5 w-5 text-primary-400 flex-shrink-0" />

                <a
                  href={`tel:${businessPhone.replace(/\s/g, '')}`}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {businessPhone}
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center space-x-3">
                <FaEnvelope className="h-5 w-5 text-primary-400 flex-shrink-0" />

                <a
                  href={`mailto:${businessEmail}`}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {businessEmail}
                </a>
              </li>

            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} Prisha Enterprises. All rights reserved.
            </p>

            <p className="text-gray-400 text-sm flex items-center">
              Made with
              <FaHeart className="h-4 w-4 text-red-500 mx-1" />
              in India
            </p>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;