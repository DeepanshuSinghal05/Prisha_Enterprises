import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaCheckCircle,
  FaExclamationCircle,
  FaInstagram
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Validation schema
const contactSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),

  email: yup.string()
    .required('Email is required')
    .email('Invalid email format'),

  phone: yup.string()
    .required('Phone number is required')
    .matches(/^[0-9]{10,15}$/, 'Please enter a valid phone number'),

  subject: yup.string()
    .required('Subject is required'),

  message: yup.string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters'),
});

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitStatus('success');

    toast.success(
      'Message sent successfully! We will contact you soon.',
      {
        position: 'top-right',
      }
    );

    reset();

    // Reset status after 5 seconds
    setTimeout(() => setSubmitStatus(null), 5000);
  };

  // Business info from env
  const businessEmail =
    import.meta.env.VITE_BUSINESS_EMAIL ||
    'info@prishaenterprises.com';

  const businessPhone =
    import.meta.env.VITE_BUSINESS_PHONE ||
    '+91 97177 18175';

  const businessAddress =
    import.meta.env.VITE_BUSINESS_ADDRESS ||
    '60, Mirzajaan, Sihani Gate, Bihari Nagar, Naya Ganj, Ghaziabad, Uttar Pradesh 201001';

  const whatsappNumber =
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    '919999999999';

  const instagramLink =
    import.meta.env.VITE_INSTAGRAM_LINK ||
    'https://www.instagram.com/prishaenterprisess';

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <ToastContainer />

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
              Get In Touch
            </h1>

            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Have questions about our LED TVs? We're here to help!
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">

              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send Us a Message
              </h2>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    {...register('name')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-500'
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="John Doe"
                  />

                  {errors.name && (
                    <p className="mt-1 text-red-500 text-sm flex items-center">
                      <FaExclamationCircle className="h-4 w-4 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>

                  <input
                    type="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-500'
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="john@example.com"
                  />

                  {errors.email && (
                    <p className="mt-1 text-red-500 text-sm flex items-center">
                      <FaExclamationCircle className="h-4 w-4 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    {...register('phone')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-500'
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="9876543210"
                  />

                  {errors.phone && (
                    <p className="mt-1 text-red-500 text-sm flex items-center">
                      <FaExclamationCircle className="h-4 w-4 mr-1" />
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>

                  <input
                    type="text"
                    {...register('subject')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.subject
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-500'
                    } focus:outline-none focus:ring-2 transition-all`}
                    placeholder="Inquiry about LED TVs"
                  />

                  {errors.subject && (
                    <p className="mt-1 text-red-500 text-sm flex items-center">
                      <FaExclamationCircle className="h-4 w-4 mr-1" />
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>

                  <textarea
                    {...register('message')}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.message
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-primary-500'
                    } focus:outline-none focus:ring-2 transition-all resize-none`}
                    placeholder="How can we help you?"
                  />

                  {errors.message && (
                    <p className="mt-1 text-red-500 text-sm flex items-center">
                      <FaExclamationCircle className="h-4 w-4 mr-1" />
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-800 hover:bg-primary-700 hover:shadow-lg transform hover:scale-[1.02]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>

                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <FaPaperPlane className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Success Message */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-800"
                  >
                    <FaCheckCircle className="h-5 w-5 mr-2" />

                    <span className="text-sm font-medium">
                      Message sent successfully! We'll contact you soon.
                    </span>
                  </motion.div>
                )}

              </form>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-8">

              {/* Business Info */}
              <div className="bg-white rounded-2xl shadow-xl p-8">

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">

                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="h-6 w-6 text-primary-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Our Location
                      </h3>

                      <p className="text-gray-600 mt-1">
                        {businessAddress}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaPhone className="h-6 w-6 text-green-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Phone
                      </h3>

                      <a
                        href={`tel:${businessPhone.replace(/\s/g, '')}`}
                        className="text-primary-600 mt-1 block hover:underline"
                      >
                        {businessPhone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="h-6 w-6 text-purple-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Email
                      </h3>

                      <a
                        href={`mailto:${businessEmail}`}
                        className="text-primary-600 mt-1 block hover:underline"
                      >
                        {businessEmail}
                      </a>
                    </div>
                  </div>

                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl shadow-xl p-8">

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Follow Us
                </h2>

                <div className="space-y-4">

                  <a
                    href={instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    <FaInstagram className="h-6 w-6" />

                    <span className="font-semibold">
                      @prishaenterprisess
                    </span>
                  </a>

                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 p-4 bg-green-500 rounded-xl text-white hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    <FaPhone className="h-6 w-6" />

                    <span className="font-semibold">
                      Chat on WhatsApp
                    </span>
                  </a>

                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-2xl shadow-xl p-8">

                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Business Hours
                </h2>

                <div className="space-y-3">
                  {[
                    {
                      day: 'Monday - Friday',
                      time: '9:00 AM - 8:00 PM'
                    },
                    {
                      day: 'Saturday',
                      time: '10:00 AM - 7:00 PM'
                    },
                    {
                      day: 'Sunday',
                      time: '11:00 AM - 6:00 PM'
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-gray-700">
                        {item.day}
                      </span>

                      <span className="text-gray-600">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Maps */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">
                    Visit Our Store
                  </h3>
                </div>

                <div className="aspect-video bg-gray-200">
                  <iframe
                    title="Prisha Enterprises Location"
                    src="https://www.google.com/maps?q=60%2C%20Mirzajaan%2C%20Sihani%20Gate%2C%20Bihari%20Nagar%2C%20Naya%20Ganj%2C%20Ghaziabad%2C%20Uttar%20Pradesh%20201001&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;