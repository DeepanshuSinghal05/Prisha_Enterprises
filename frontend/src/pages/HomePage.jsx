import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaMicrochip,
  FaTag,
  FaShoppingCart,
  FaCertificate,
  FaUsers,
  FaTv,
  FaAward,
} from 'react-icons/fa';

import SectionHeader from '../components/SectionHeader';
import Highlights from '../components/Highlights';
import Testimonials from '../components/Testimonials';
import InstagramSection from '../components/InstagramSection';
import { products } from '../data/products';

/*
 * Home page UI redesign
 * ---------------------
 * Core data/routes/components are intentionally preserved.
 * The hero uses a scoped CSS layer below so alignment does not depend
 * on Tailwind arbitrary/grid utilities being generated correctly.
 *
 * Put the generated sample image at:
 *   public/images/prisha-tv-showcase.png
 *
 * If you already have a real product/hero image, replace only the
 * image src below. No application logic needs to change.
 */

const HomePage = () => {
  // Core logic preserved: first 6 products are featured.
  const featuredProducts = products.slice(0, 6);

  const trustFeatures = [
    { icon: FaShieldAlt, title: '100% Quality', desc: 'Certified Assembly' },
    { icon: FaCertificate, title: '1 Year Warranty', desc: 'On All Products' },
    { icon: FaTruck, title: 'Pan India Delivery', desc: 'Safe & Secure' },
    { icon: FaHeadset, title: 'Expert Support', desc: "We're Here to Help" },
  ];

  const productBenefits = [
    { icon: FaShieldAlt, title: 'Premium', desc: 'Components' },
    { icon: FaMicrochip, title: 'Professional', desc: 'Assembly' },
    { icon: FaCertificate, title: 'Tested', desc: 'Quality' },
    { icon: FaTag, title: 'Best', desc: 'Prices' },
  ];

  const whyChooseUs = [
    {
      icon: FaCheckCircle,
      title: 'Premium Quality',
      desc: 'Only certified components used',
    },
    {
      icon: FaCheckCircle,
      title: 'Expert Assembly',
      desc: 'Certified technicians handle setup',
    },
    {
      icon: FaCheckCircle,
      title: 'Best Warranty',
      desc: 'Extended coverage options available',
    },
    {
      icon: FaCheckCircle,
      title: 'Customer First',
      desc: '24/7 support for all queries',
    },
  ];

  return (
    <div className="pe-home">
      <style>{`
        .pe-home {
          --pe-blue: #2454c7;
          --pe-blue-dark: #173f9d;
          --pe-blue-soft: #edf4ff;
          --pe-text: #14233d;
          --pe-muted: #5f6f86;
          --pe-border: #e4eaf3;
          min-height: 100vh;
          overflow-x: hidden;
          background: #f7f9fc;
          color: var(--pe-text);
        }

        .pe-home * {
          box-sizing: border-box;
        }

        .pe-hero {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          background:
            radial-gradient(circle at 78% 20%, rgba(75, 132, 242, .14), transparent 30%),
            linear-gradient(180deg, #ffffff 0%, #f8fbff 72%, #f4f8ff 100%);
          padding: 116px 0 18px;
        }

        .pe-hero::before {
          content: "";
          position: absolute;
          z-index: -1;
          width: 640px;
          height: 640px;
          right: -205px;
          top: -185px;
          border-radius: 50%;
          background: linear-gradient(145deg, #4b83ed, #1d5bdb);
          opacity: .96;
        }

        .pe-hero::after {
          content: "";
          position: absolute;
          z-index: -1;
          width: 420px;
          height: 420px;
          left: -270px;
          bottom: -250px;
          border-radius: 50%;
          background: #e9f2ff;
        }

        .pe-container {
          width: min(1320px, calc(100% - 48px));
          margin: 0 auto;
        }

        .pe-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
          align-items: center;
          gap: 38px;
        }

        .pe-copy {
          min-width: 0;
          padding: 10px 0 0;
        }

        .pe-trust-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          min-height: 42px;
          padding: 0 17px;
          border-radius: 999px;
          background: #effcf4;
          color: #16a34a;
          border: 1px solid #d9f5e3;
          box-shadow: 0 8px 24px rgba(22, 163, 74, .08);
          font-size: 14px;
          font-weight: 800;
        }

        .pe-trust-pill svg {
          font-size: 17px;
        }

        .pe-title {
          max-width: 720px;
          margin: 19px 0 0;
          font-size: clamp(42px, 4.4vw, 64px);
          line-height: 1.02;
          letter-spacing: -2.4px;
          font-weight: 900;
          color: #111f38;
        }

        .pe-accent {
          margin-top: 9px;
          color: #2863dc;
          font-size: clamp(30px, 3vw, 43px);
          line-height: 1.08;
          letter-spacing: -1.5px;
          font-weight: 900;
        }

        .pe-description {
          max-width: 620px;
          margin: 21px 0 0;
          color: var(--pe-muted);
          font-size: 17px;
          line-height: 1.65;
        }

        .pe-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 27px;
        }

        .pe-btn {
          min-height: 52px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 23px;
          border-radius: 11px;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          transition: transform .25s ease, box-shadow .25s ease, background .25s ease;
        }

        .pe-btn:hover {
          transform: translateY(-2px);
        }

        .pe-btn-primary {
          color: #fff;
          background: linear-gradient(135deg, #285fd7, #1748b9);
          box-shadow: 0 12px 26px rgba(36, 84, 199, .23);
        }

        .pe-btn-primary:hover {
          box-shadow: 0 16px 32px rgba(36, 84, 199, .29);
        }

        .pe-btn-secondary {
          color: #2454c7;
          background: #fff;
          border: 2px solid #2b63d8;
        }

        .pe-service-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0;
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1px solid var(--pe-border);
        }

        .pe-service {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 0 17px;
        }

        .pe-service:first-child {
          padding-left: 0;
        }

        .pe-service + .pe-service {
          border-left: 1px solid #e6ebf3;
        }

        .pe-service-icon {
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--pe-blue-soft);
          color: #2863d9;
          font-size: 16px;
        }

        .pe-service-title {
          color: #1b2940;
          font-size: 12px;
          line-height: 1.35;
          font-weight: 850;
        }

        .pe-service-desc {
          margin-top: 2px;
          color: #718096;
          font-size: 11px;
          line-height: 1.35;
        }

        .pe-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin-top: 23px;
          border: 1px solid var(--pe-border);
          border-radius: 16px;
          background: rgba(255,255,255,.92);
          box-shadow: 0 10px 28px rgba(24, 49, 88, .06);
          overflow: hidden;
        }

        .pe-stat {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          min-height: 82px;
          padding: 12px 15px;
        }

        .pe-stat + .pe-stat {
          border-left: 1px solid #e4e9f1;
        }

        .pe-stat-icon {
          color: #2863d9;
          font-size: 24px;
        }

        .pe-stat-number {
          color: #17243b;
          font-size: 26px;
          line-height: 1;
          font-weight: 900;
        }

        .pe-stat-label {
          margin-top: 5px;
          color: #6b7890;
          font-size: 11px;
        }

        .pe-showcase {
          position: relative;
          min-width: 0;
          min-height: 565px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pe-showcase-glow {
          position: absolute;
          width: 88%;
          height: 72%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(52, 121, 239, .25), rgba(52, 121, 239, 0));
          filter: blur(10px);
          animation: peGlow 6s ease-in-out infinite;
        }

        .pe-tv-image {
          position: relative;
          z-index: 2;
          width: min(100%, 790px);
          max-height: 530px;
          object-fit: contain;
          filter: drop-shadow(0 28px 30px rgba(27, 60, 120, .20));
          animation: peFloat 5s ease-in-out infinite;
          user-select: none;
        }

        .pe-quality-badge {
          position: absolute;
          z-index: 4;
          left: 2%;
          bottom: 104px;
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 235px;
          padding: 13px 16px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 16px 34px rgba(22, 42, 76, .16);
          border: 1px solid #edf0f5;
          animation: peBadge 3.5s ease-in-out infinite;
        }

        .pe-quality-icon {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #dcfce7;
          color: #16a34a;
          font-size: 23px;
        }

        .pe-quality-title {
          font-size: 14px;
          font-weight: 900;
          color: #172238;
        }

        .pe-quality-desc {
          margin-top: 2px;
          font-size: 11px;
          color: #6b778c;
        }

        .pe-benefits {
          position: absolute;
          z-index: 5;
          right: 0;
          bottom: 17px;
          width: 94%;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .pe-benefit {
          min-height: 74px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 10px;
          border-radius: 13px;
          background: rgba(255,255,255,.97);
          border: 1px solid #e8edf5;
          box-shadow: 0 13px 28px rgba(30, 54, 91, .12);
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .pe-benefit:hover {
          transform: translateY(-5px);
          box-shadow: 0 18px 32px rgba(30, 54, 91, .17);
        }

        .pe-benefit-icon {
          width: 37px;
          height: 37px;
          flex: 0 0 37px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #eef4ff;
          color: #2863d9;
          font-size: 16px;
        }

        .pe-benefit-title {
          font-size: 12px;
          line-height: 1.2;
          font-weight: 900;
          color: #1b2940;
        }

        .pe-benefit-desc {
          margin-top: 3px;
          font-size: 10px;
          color: #718096;
        }

        .pe-reassurance {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-top: 17px;
          padding: 10px 16px;
          min-height: 45px;
          border: 1px solid #e1e9f4;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 6px 20px rgba(26, 48, 85, .05);
          color: #66758c;
          font-size: 12px;
        }

        .pe-reassurance-icon {
          width: 30px;
          height: 30px;
          flex: 0 0 30px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #16a34a;
          background: #effcf4;
        }

        .pe-reassurance strong {
          color: #1b2940;
        }

        .pe-section {
          background: #fff;
          padding: 78px 0;
        }

        .pe-products-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 25px;
          margin-top: 36px;
        }

        .pe-product-card {
          overflow: hidden;
          border: 1px solid #e5eaf2;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 7px 24px rgba(23, 47, 82, .05);
          transition: transform .3s ease, box-shadow .3s ease;
        }

        .pe-product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 35px rgba(23, 47, 82, .11);
        }

        .pe-product-image {
          height: 245px;
          display: grid;
          place-items: center;
          padding: 22px;
          background: #f7f9fc;
          overflow: hidden;
        }

        .pe-product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform .5s ease;
        }

        .pe-product-card:hover .pe-product-image img {
          transform: scale(1.06);
        }

        .pe-product-content {
          padding: 20px 21px 22px;
          text-align: center;
        }

        .pe-product-name {
          min-height: 48px;
          margin: 0;
          color: #18253b;
          font-size: 17px;
          line-height: 1.4;
          font-weight: 800;
        }

        .pe-product-price {
          margin: 9px 0 10px;
          color: #2454c7;
          font-size: 22px;
          font-weight: 900;
        }

        .pe-product-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2454c7;
          font-size: 14px;
          font-weight: 750;
          text-decoration: none;
        }

        .pe-product-link:hover {
          color: #173f9d;
        }

        .pe-view-all {
          margin-top: 38px;
          text-align: center;
        }

        .pe-why {
          background: #f7f9fc;
        }

        .pe-why-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
          margin-top: 34px;
        }

        .pe-why-card {
          min-height: 195px;
          padding: 28px 20px;
          text-align: center;
          border: 1px solid #e5eaf2;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 7px 22px rgba(24, 46, 80, .04);
        }

        .pe-why-icon {
          width: 55px;
          height: 55px;
          margin: 0 auto 16px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #edf4ff;
          color: #2863d9;
          font-size: 24px;
        }

        .pe-why-title {
          margin: 0 0 7px;
          color: #18253b;
          font-size: 17px;
          font-weight: 850;
        }

        .pe-why-desc {
          margin: 0;
          color: #6b7890;
          font-size: 13px;
          line-height: 1.55;
        }

        @keyframes peFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes peBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }

        @keyframes peGlow {
          0%, 100% { transform: scale(1); opacity: .8; }
          50% { transform: scale(1.06); opacity: 1; }
        }

        @media (max-width: 1180px) {
          .pe-container {
            width: min(100% - 38px, 1080px);
          }

          .pe-hero-grid {
            grid-template-columns: minmax(0, .95fr) minmax(0, 1.05fr);
            gap: 25px;
          }

          .pe-title {
            font-size: clamp(40px, 4.5vw, 55px);
          }

          .pe-accent {
            font-size: clamp(29px, 3.1vw, 38px);
          }

          .pe-showcase {
            min-height: 500px;
          }

          .pe-quality-badge {
            left: 0;
            bottom: 99px;
          }
        }

        @media (max-width: 900px) {
          .pe-hero {
            padding-top: 100px;
          }

          .pe-hero-grid {
            grid-template-columns: 1fr;
          }

          .pe-copy {
            text-align: center;
          }

          .pe-trust-pill {
            margin-inline: auto;
          }

          .pe-description {
            margin-inline: auto;
          }

          .pe-actions {
            justify-content: center;
          }

          .pe-service-row {
            text-align: left;
          }

          .pe-stats {
            max-width: 650px;
            margin-inline: auto;
          }

          .pe-showcase {
            min-height: 500px;
            margin-top: 4px;
          }

          .pe-tv-image {
            width: min(100%, 700px);
          }

          .pe-benefits {
            width: min(96%, 680px);
            left: 50%;
            right: auto;
            transform: translateX(-50%);
          }

          .pe-quality-badge {
            left: 4%;
          }

          .pe-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pe-why-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .pe-container {
            width: min(100% - 28px, 560px);
          }

          .pe-hero {
            padding: 90px 0 14px;
          }

          .pe-hero::before {
            width: 430px;
            height: 430px;
            right: -250px;
            top: -120px;
          }

          .pe-title {
            margin-top: 16px;
            font-size: 40px;
            letter-spacing: -1.6px;
          }

          .pe-accent {
            font-size: 29px;
            letter-spacing: -.8px;
          }

          .pe-description {
            font-size: 15px;
            line-height: 1.55;
          }

          .pe-actions {
            flex-direction: column;
            width: 100%;
          }

          .pe-btn {
            width: min(100%, 330px);
          }

          .pe-service-row {
            grid-template-columns: repeat(2, 1fr);
            row-gap: 17px;
            margin-top: 23px;
          }

          .pe-service {
            padding: 0 8px;
          }

          .pe-service:nth-child(3) {
            padding-left: 0;
          }

          .pe-service:nth-child(3) {
            border-left: 0;
          }

          .pe-service:nth-child(2),
          .pe-service:nth-child(4) {
            border-left: 1px solid #e6ebf3;
          }

          .pe-stats {
            margin-top: 20px;
          }

          .pe-stat {
            min-height: 75px;
            gap: 7px;
            padding: 9px 5px;
          }

          .pe-stat-icon {
            font-size: 19px;
          }

          .pe-stat-number {
            font-size: 20px;
          }

          .pe-stat-label {
            font-size: 9px;
          }

          .pe-showcase {
            min-height: 375px;
          }

          .pe-tv-image {
            width: 108%;
            max-width: none;
          }

          .pe-quality-badge {
            display: none;
          }

          .pe-benefits {
            bottom: 0;
            width: 100%;
            gap: 6px;
          }

          .pe-benefit {
            min-height: 58px;
            padding: 7px 4px;
            border-radius: 10px;
          }

          .pe-benefit-icon {
            width: 30px;
            height: 30px;
            flex-basis: 30px;
            font-size: 13px;
          }

          .pe-benefit-title {
            font-size: 9px;
          }

          .pe-benefit-desc {
            font-size: 8px;
          }

          .pe-reassurance {
            align-items: flex-start;
            font-size: 11px;
          }

          .pe-section {
            padding: 58px 0;
          }

          .pe-products-grid,
          .pe-why-grid {
            grid-template-columns: 1fr;
          }

          .pe-product-image {
            height: 230px;
          }
        }
      `}</style>

      {/* ========================= HERO ========================= */}
      <section className="pe-hero">
        <div className="pe-container">
          <div className="pe-hero-grid">
            <motion.div
              className="pe-copy"
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <motion.div
                className="pe-trust-pill"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
              >
                <FaShieldAlt />
                Trusted LED TV Specialists
              </motion.div>

              <motion.h1
                className="pe-title"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Premium Assembled
                <br />
                LED TVs
              </motion.h1>

              <motion.div
                className="pe-accent"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.55 }}
              >
                Quality You Can Trust
              </motion.div>

              <motion.p
                className="pe-description"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.43, duration: 0.55 }}
              >
                Best Quality Assembled LED TVs, Trusted by Customers across
                India. Premium components, professional assembly, and
                unbeatable prices.
              </motion.p>

              <motion.div
                className="pe-actions"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.55 }}
              >
                <Link to="/products" className="pe-btn pe-btn-primary">
                  <FaShoppingCart />
                  Browse Products
                  <FaArrowRight />
                </Link>

                <Link to="/contact" className="pe-btn pe-btn-secondary">
                  Get in Touch
                </Link>
              </motion.div>

              <motion.div
                className="pe-service-row"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.55 }}
              >
                {trustFeatures.map((item, index) => (
                  <motion.div
                    className="pe-service"
                    key={item.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.74 + index * 0.08 }}
                  >
                    <div className="pe-service-icon">
                      <item.icon />
                    </div>
                    <div>
                      <div className="pe-service-title">{item.title}</div>
                      <div className="pe-service-desc">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="pe-stats"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.86, duration: 0.55 }}
              >
                <div className="pe-stat">
                  <FaUsers className="pe-stat-icon" />
                  <div>
                    <div className="pe-stat-number">500+</div>
                    <div className="pe-stat-label">Happy Customers</div>
                  </div>
                </div>

                <div className="pe-stat">
                  <FaTv className="pe-stat-icon" />
                  <div>
                    <div className="pe-stat-number">10+</div>
                    <div className="pe-stat-label">TV Models</div>
                  </div>
                </div>

                <div className="pe-stat">
                  <FaAward className="pe-stat-icon" />
                  <div>
                    <div className="pe-stat-number">5+</div>
                    <div className="pe-stat-label">Years Experience</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="pe-showcase"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            >
              <div className="pe-showcase-glow" />

              <img
                src="/images/hompage_tv.png"
                alt="Prisha Enterprises premium LED TV"
                className="pe-tv-image"
                onError={(event) => {
                  // Keep a graceful fallback if the generated sample image
                  // has not yet been copied into public/images.
                  event.currentTarget.style.opacity = '0';
                }}
              />

              <motion.div
                className="pe-quality-badge"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="pe-quality-icon">
                  <FaCheckCircle />
                </div>
                <div>
                  <div className="pe-quality-title">100% Quality</div>
                  <div className="pe-quality-desc">Certified Assembly</div>
                </div>
              </motion.div>

              <div className="pe-benefits">
                {productBenefits.map((item, index) => (
                  <motion.div
                    className="pe-benefit"
                    key={item.title}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 + index * 0.1, duration: 0.45 }}
                  >
                    <div className="pe-benefit-icon">
                      <item.icon />
                    </div>
                    <div>
                      <div className="pe-benefit-title">{item.title}</div>
                      <div className="pe-benefit-desc">{item.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="pe-reassurance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.5 }}
          >
            <div className="pe-reassurance-icon">
              <FaShieldAlt />
            </div>
            <div>
              <strong>Quality You Deserve. Service You Can Trust.</strong>{' '}
              Every TV is assembled with precision and tested for perfect
              performance.
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================= EXISTING SECTIONS ========================= */}
      <Highlights />

      <section className="pe-section">
        <div className="pe-container">
          <SectionHeader
            title="Featured Products"
            subtitle="Explore our most popular LED TV models, curated for quality and value"
          />

          <div className="pe-products-grid">
            {featuredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                className="pe-product-card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
              >
                <div className="pe-product-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(event) => {
                      event.currentTarget.style.opacity = '0';
                    }}
                  />
                </div>

                <div className="pe-product-content">
                  <h3 className="pe-product-name">{product.name}</h3>

                  <p className="pe-product-price">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>

                  <Link to="/products" className="pe-product-link">
                    View Details
                    <FaArrowRight />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="pe-view-all">
            <Link to="/products" className="pe-btn pe-btn-secondary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <Testimonials />

      <InstagramSection />

      <section className="pe-section pe-why">
        <div className="pe-container">
          <SectionHeader
            title="Why Choose Prisha Enterprises?"
            subtitle="We're not just selling TVs - we're providing complete entertainment solutions"
          />

          <div className="pe-why-grid">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                className="pe-why-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <div className="pe-why-icon">
                  <item.icon />
                </div>
                <h3 className="pe-why-title">{item.title}</h3>
                <p className="pe-why-desc">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
