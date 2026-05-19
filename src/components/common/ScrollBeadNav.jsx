import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ScrollBeadNav — fixed right-side dot navigation
 * Props:
 *   sections: [{ id: string, label: string }]
 */
export default function ScrollBeadNav({ sections = [] }) {
  const [active, setActive] = useState(sections[0]?.id || '');
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      let current = sections[0]?.id || '';
      for (const sec of sections) {
        const el = document.getElementById(sec.id);
        if (el && window.scrollY >= el.offsetTop - window.innerHeight / 2) {
          current = sec.id;
        }
      }
      setActive(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="hidden md:flex" style={{
      position: 'fixed', right: 28, top: '50%', transform: 'translateY(-50%)',
      zIndex: 50, flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      {/* Vertical connector line */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: '50%',
        transform: 'translateX(-50%)', width: 1,
        background: 'linear-gradient(to bottom, transparent, rgba(201,165,90,0.25), transparent)',
      }} />

      {sections.map((sec) => {
        const isActive = active === sec.id;
        return (
          <div
            key={sec.id}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setHovered(sec.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Label tooltip */}
            <AnimatePresence>
              {hovered === sec.id && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute', right: 22,
                    background: 'rgba(8,12,10,0.9)',
                    border: '1px solid rgba(201,165,90,0.3)',
                    color: '#c9a55a', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 4, whiteSpace: 'nowrap',
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {sec.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Bead dot */}
            <motion.button
              onClick={() => scrollTo(sec.id)}
              animate={{
                scale: isActive ? 1 : 0.6,
                backgroundColor: isActive ? '#c9a55a' : 'rgba(201,165,90,0.25)',
                boxShadow: isActive ? '0 0 14px rgba(201,165,90,0.7)' : '0 0 0px transparent',
              }}
              whileHover={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                border: '1px solid rgba(201,165,90,0.5)',
                cursor: 'pointer', outline: 'none', position: 'relative', zIndex: 1,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
