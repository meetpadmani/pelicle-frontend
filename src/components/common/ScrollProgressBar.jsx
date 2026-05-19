import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin gold progress bar fixed at top of viewport */
export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 2, zIndex: 9999,
        background: 'linear-gradient(90deg, #c9a55a, #f0e6c8, #c9a55a)',
        scaleX, transformOrigin: '0% 50%',
        boxShadow: '0 0 12px rgba(201,165,90,0.8)',
      }}
    />
  );
}
