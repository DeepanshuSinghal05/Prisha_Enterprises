import { motion } from 'framer-motion';

const SectionHeader = ({ title, subtitle, align = 'center' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      {title && (
        <h2 className="section-title mb-4">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="section-subtitle">{subtitle}</p>
      )}
    </motion.div>
  );
};

export default SectionHeader;
