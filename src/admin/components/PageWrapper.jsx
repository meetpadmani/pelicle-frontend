import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1
    }
  }
};

const cardVariant = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

/**
 * PageWrapper — wraps every admin page with:
 *  - Ambient background blobs
 *  - Fade + slide-up entrance animation
 *  - Consistent container width & padding
 *
 * Usage:
 *   <PageWrapper>
 *     <PageWrapper.Card> ... </PageWrapper.Card>
 *   </PageWrapper>
 */
export default function PageWrapper({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`relative min-h-screen ${className}`}
    >
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0E8A74]/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-[#0B5345]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#D4AF37]/4 rounded-full blur-[80px]" />
      </div>

      {children}
    </motion.div>
  );
}

/** Stagger container for child cards */
PageWrapper.Grid = function PageGrid({ children, className = '' }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
};

/** Individual animated card */
PageWrapper.Card = function PageCard({ children, className = '' }) {
  return (
    <motion.div variants={cardVariant} className={className}>
      {children}
    </motion.div>
  );
};

/** Animated section header */
PageWrapper.Header = function PageHeader({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export { cardVariant, staggerContainer, pageVariants };
