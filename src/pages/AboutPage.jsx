import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, useMotionValueEvent, useMotionValue, useSpring } from 'framer-motion';
import ScrollBeadNav from '../components/common/ScrollBeadNav';
import ScrollProgressBar from '../components/common/ScrollProgressBar';

const SECTIONS = [
  { id: 'hero',      label: 'Intro'     },
  { id: 'story',     label: 'Story'     },
  { id: 'founder',   label: 'Founder'   },
  { id: 'purpose',   label: 'Purpose'   },
  { id: 'pillars',   label: 'Pillars'   },
  { id: 'aesthetic', label: 'Aesthetic' },
  { id: 'journey',   label: 'Journey'   },
  { id: 'manifesto', label: 'Manifesto' },
  { id: 'anatomy',   label: 'Anatomy'   },
  { id: 'closing',   label: 'Closing'   },
];

/* ── Custom Magnetic Cursor ── */
const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700, mass: 0.1 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 14);
      cursorY.set(e.clientY - 14);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <motion.div
      className="hidden md:block"
      style={{
        position: 'fixed', top: 0, left: 0, width: 28, height: 28, borderRadius: '50%',
        border: '1.5px solid rgba(201,165,90,1)', pointerEvents: 'none', zIndex: 99999,
        mixBlendMode: 'difference',
        translateX: cursorXSpring,
        translateY: cursorYSpring,
      }}
    />
  );
};

/* ── Reusable 3D fade-in-up wrapper ── */
const Reveal = ({ children, delay = 0, className = '', variant = '3d', side = 'left' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  const getInitial = () => {
    if (variant === '3d') return { opacity: 0, y: 120, rotateX: 45, scale: 0.85 };
    if (variant === 'side') return { opacity: 0, x: side === 'left' ? -120 : 120, rotateY: side === 'left' ? -45 : 45, scale: 0.9 };
    return { opacity: 0, y: 48 };
  };

  const getAnimate = () => {
    if (variant === '3d') return { opacity: 1, y: 0, rotateX: 0, scale: 1 };
    if (variant === 'side') return { opacity: 1, x: 0, rotateY: 0, scale: 1 };
    return { opacity: 1, y: 0 };
  };

  return (
    <div ref={ref} style={{ perspective: 2000 }} className={className}>
      <motion.div
        initial={getInitial()}
        animate={inView ? getAnimate() : {}}
        transition={{ duration: 1.2, delay, type: 'spring', bounce: 0.3 }}
        style={{ 
          transformOrigin: variant === 'side' ? (side === 'left' ? 'left center' : 'right center') : 'center center', 
          transformStyle: 'preserve-3d' 
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

/* ── Timeline Bead ── */
const TimelineBead = ({ scrollYProgress, index, total }) => {
  const center = total > 1 ? index / (total - 1) : 0;
  const [active, setActive] = useState(index === 0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.abs(v - center) < 0.18);
  });
  return (
    <motion.div
      animate={{
        scale: active ? 1.9 : 0.65,
        opacity: active ? 1 : 0.25,
        boxShadow: active ? '0 0 18px rgba(201,165,90,0.9)' : '0 0 0px transparent',
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{ width: 10, height: 10, borderRadius: '50%', background: '#c9a55a' }}
    />
  );
};

/* ── Advanced Horizontal Sticky Scroll (Desktop Only) ── */
const HorizontalTimeline = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
  const bgX = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  const phases = [
    { phase: '01', icon: '💡', title: 'The Spark', text: 'A vision born from frustration — fashion that was either too generic or too unaffordable. Pelicle was conceived as the middle ground: premium without pretension.' },
    { phase: '02', icon: '✏️', title: 'The Design', text: 'Weeks of sketches, fabric swatches, and countless iterations. Every cut was deliberate. Every detail earned its place on the garment.' },
    { phase: '03', icon: '🧵', title: 'The Craft', text: 'Partnering with skilled artisans, Pelicle brought its first collection to life — threading identity into every stitch, building quality that speaks without words.' },
    { phase: '04', icon: '🚀', title: 'The Launch', text: 'Pelicle entered the world. Real people, real responses. A brand that instantly resonated with those who refused to blend into the crowd.' },
  ];

  return (
    <section ref={targetRef} className="relative h-[400vh] bg-[rgba(13,61,44,0.04)]">
      <div className="sticky top-0 h-screen flex flex-col items-start justify-center overflow-hidden">
        
        {/* Massive Background Text Mask Parallax */}
        <motion.div 
          style={{ x: bgX }}
          className="absolute top-1/2 left-0 -translate-y-1/2 text-[25vw] font-serif font-bold text-white/5 whitespace-nowrap pointer-events-none select-none"
        >
          EVOLUTION
        </motion.div>

        <div className="absolute top-24 left-0 right-0 text-center z-10">
          <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 16 }}>Our Journey</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700 }}>
            From Idea to Icon
          </h2>
        </div>

        <motion.div style={{ x }} className="flex w-[400vw] h-full items-center pt-24 md:pt-32">
          {phases.map((step, i) => (
            <div key={i} className="w-[100vw] flex justify-center items-center px-4 md:px-10">
               <motion.div 
                 whileHover={{ scale: 1.02, y: -5, rotateY: 3, rotateX: 3 }} 
                 className="w-full max-w-3xl bg-[#080c0a]/80 border border-[#c9a55a]/20 rounded-[24px] md:rounded-[32px] p-8 md:p-16 relative overflow-hidden backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
                 style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
               >
                 <div className="absolute -top-6 -right-6 md:-top-12 md:-right-12 text-[120px] md:text-[240px] font-serif text-[#c9a55a]/5 select-none">{step.phase}</div>
                 
                 {/* Framer Motion Light Sweep */}
                 <motion.div
                   initial={{ x: '-100%', skewX: -20 }}
                   whileHover={{ x: '200%' }}
                   transition={{ duration: 1, ease: 'easeInOut' }}
                   className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-[rgba(201,165,90,0.15)] to-transparent pointer-events-none"
                   style={{ zIndex: 10 }}
                 />

                 <div className="text-4xl md:text-6xl mb-6 md:mb-10" style={{ transform: 'translateZ(30px)' }}>{step.icon}</div>
                 <h3 className="font-serif text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-white" style={{ transform: 'translateZ(40px)' }}>{step.title}</h3>
                 <p className="text-white/70 text-lg md:text-2xl leading-relaxed" style={{ transform: 'translateZ(20px)' }}>{step.text}</p>
                 <div className="mt-6 md:mt-10 w-16 md:w-24 h-1 bg-gradient-to-r from-[#c9a55a] to-transparent" style={{ transform: 'translateZ(20px)' }} />
               </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Timeline Scrolling Beads */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
          {phases.map((_, i) => (
            <div key={i} className="relative w-3 h-3 flex items-center justify-center">
              <TimelineBead scrollYProgress={scrollYProgress} index={i} total={phases.length} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Core Pillars 3D Accordion ── */
const CorePillars = () => {
  const [hovered, setHovered] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const pillars = [
    { title: 'Exclusivity', desc: 'Limited drops. No restocks. Wearing Pelicle means you belong to a rare collective.', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800' },
    { title: 'Craftsmanship', desc: 'Every seam, every hem, every fabric is engineered for longevity and luxurious feel.', img: 'https://images.unsplash.com/photo-1594938298596-70f56fb3cecb?q=80&w=800' },
    { title: 'Identity', desc: 'We don\'t follow trends. We create timeless pieces that amplify your personal edge.', img: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=800' },
  ];

  return (
    <ScrollCard id="pillars" style={{ padding: 'clamp(80px,12vw,140px) clamp(16px,8vw,80px)', position: 'relative', overflow: 'hidden' }}>
       {/* Background Glow */}
       <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(201,165,90,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
       
       <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>The Pillars</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, textAlign: 'center', marginBottom: 72 }}>
              The Pelicle Experience
            </h2>
          </Reveal>

          <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-[85vh] md:h-[60vh] min-h-[400px]" style={{ perspective: 1200 }}>
             {pillars.map((p, i) => (
                <motion.div
                  key={i}
                  onHoverStart={() => setHovered(i)}
                  onClick={() => setHovered(i)}
                  animate={{ 
                    flex: hovered === i ? 4 : 1,
                    filter: hovered === i ? 'brightness(1) grayscale(0)' : 'brightness(0.3) grayscale(0.8)',
                    rotateY: isMobile ? 0 : (hovered === i ? 0 : (i < hovered ? 15 : -15)),
                    rotateX: isMobile ? (hovered === i ? 0 : (i < hovered ? -10 : 10)) : 0,
                    z: hovered === i ? 50 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="relative rounded-3xl overflow-hidden cursor-pointer border border-[#c9a55a]/15"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.div 
                    animate={{ scale: hovered === i ? 1.05 : 1.2 }} 
                    transition={{ duration: 1.5 }}
                    style={{ position: 'absolute', inset: -20, backgroundImage: `url(${p.img})`, backgroundSize: 'cover', backgroundPosition: 'center', transform: 'translateZ(-20px)' }} 
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,12,10,0.95) 0%, rgba(8,12,10,0.2) 50%, rgba(8,12,10,0) 100%)' }} />
                  
                  {/* Content (Visible only when hovered) */}
                  <motion.div 
                     animate={{ opacity: hovered === i ? 1 : 0, y: hovered === i ? 0 : 20, rotateX: hovered === i ? 0 : -20 }}
                     className="absolute bottom-6 md:bottom-10 left-6 right-6 md:left-10 md:right-10"
                     style={{ transformStyle: 'preserve-3d' }}
                  >
                     <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, color: '#c9a55a', marginBottom: 12, transform: 'translateZ(30px)' }}>{p.title}</h3>
                     <p className="hidden md:block" style={{ fontSize: 'clamp(14px, 1vw, 18px)', color: 'rgba(240,237,231,0.8)', lineHeight: 1.6, transform: 'translateZ(10px)', maxWidth: 400 }}>{p.desc}</p>
                  </motion.div>

                  {/* Vertical Text (Visible when not hovered) */}
                  <motion.div
                     animate={{ opacity: hovered === i ? 0 : 1 }}
                     style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: '#fff', writingMode: isMobile ? 'horizontal-tb' : 'vertical-rl', transform: isMobile ? 'none' : 'rotate(180deg)', letterSpacing: '0.1em' }}>
                      {p.title}
                    </h3>
                  </motion.div>
                </motion.div>
             ))}
          </div>
       </div>
    </ScrollCard>
  );
};

/* ── Signature Aesthetic 3D Gallery ── */
const SignatureAesthetic = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  
  const y1 = useTransform(scrollYProgress, [0, 1], ['10%', '-30%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const rotateY1 = useTransform(scrollYProgress, [0, 1], [10, 40]);
  const rotateY2 = useTransform(scrollYProgress, [0, 1], [-10, -40]);

  return (
    <ScrollCard id="aesthetic" style={{ padding: 'clamp(80px,12vw,140px) 0', overflow: 'hidden', position: 'relative' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center', padding: '0 clamp(24px,8vw,80px)', position: 'relative', zIndex: 10 }}>
        <Reveal>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 16 }}>The Aesthetic</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, marginBottom: 80 }}>
            Unapologetically Bold
          </h2>
        </Reveal>
      </div>

      <div ref={containerRef} className="flex gap-2 md:gap-8 justify-center perspective-[1500px] px-2 md:px-5">
        {/* Left Column */}
        <motion.div style={{ y: y1, rotateY: rotateY1, transformOrigin: 'right center', transformStyle: 'preserve-3d', display: 'flex', flexDirection: 'column' }} className="gap-2 md:gap-8">
           <img src="/assets/aesthetic-black.png" alt="Aesthetic Black" className="w-[28vw] md:w-[22vw] aspect-[3/4] object-cover rounded-xl md:rounded-[24px] shadow-[20px_30px_60px_rgba(0,0,0,0.8)] border border-white/5 opacity-80" />
           <img src="/assets/aesthetic-white.png" alt="Aesthetic White" className="w-[28vw] md:w-[22vw] aspect-[3/4] object-cover rounded-xl md:rounded-[24px] shadow-[20px_30px_60px_rgba(0,0,0,0.8)] border border-white/5 opacity-80" />
        </motion.div>

        {/* Center Column - Group Photo */}
        <motion.div style={{ y: y2, zIndex: 5, transformStyle: 'preserve-3d', display: 'flex', flexDirection: 'column', marginTop: '-8vh' }} className="gap-2 md:gap-8">
           <img src="/assets/aesthetic-group.png" alt="Aesthetic Group" className="w-[36vw] md:w-[28vw] aspect-[4/5] object-cover rounded-2xl md:rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.9)] border border-[#c9a55a]/40" />
        </motion.div>

        {/* Right Column */}
        <motion.div style={{ y: y1, rotateY: rotateY2, transformOrigin: 'left center', transformStyle: 'preserve-3d', display: 'flex', flexDirection: 'column' }} className="gap-2 md:gap-8">
           <img src="/assets/aesthetic-grey.png" alt="Aesthetic Grey" className="w-[28vw] md:w-[22vw] aspect-[3/4] object-cover rounded-xl md:rounded-[24px] shadow-[-20px_30px_60px_rgba(0,0,0,0.8)] border border-white/5 opacity-80" />
           <img src="/assets/aesthetic-navy.png" alt="Aesthetic Navy" className="w-[28vw] md:w-[22vw] aspect-[3/4] object-cover rounded-xl md:rounded-[24px] shadow-[-20px_30px_60px_rgba(0,0,0,0.8)] border border-white/5 opacity-80" />
        </motion.div>
      </div>
    </ScrollCard>
  );
};

/* ── 3D Manifesto Scroll Ring ── */
const ManifestoRing = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  
  // Rotate the entire cylinder based on scroll
  const rotateY = useTransform(scrollYProgress, [0, 1], [-90, 270]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [-25, 15]);

  const words = ['PELICLE', 'PELICLE', 'PELICLE', 'PELICLE'];
  
  // Responsive radius
  const [radius, setRadius] = useState(350);
  useEffect(() => {
    setRadius(window.innerWidth < 768 ? 220 : 600);
  }, []);

  return (
    <ScrollCard id="manifesto" style={{ padding: '0', position: 'relative', overflow: 'hidden', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080c0a' }}>
       {/* Vignette */}
       <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 150px rgba(8,12,10,1)', zIndex: 10, pointerEvents: 'none' }} />
       <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(201,165,90,0.15) 0%, transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
       
       <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', perspective: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
             style={{ position: 'relative', width: '100%', height: 100, transformStyle: 'preserve-3d', rotateY, rotateX }}
          >
             {words.map((word, i) => {
                const angle = (i / words.length) * 360;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      top: 0, left: '50%', width: 'auto',
                      transformOrigin: 'center center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 'clamp(50px, 10vw, 150px)',
                      letterSpacing: '0.05em',
                      fontWeight: 700,
                      color: 'transparent',
                      WebkitTextStroke: '2px rgba(201,165,90,0.9)',
                      transform: `translateX(-50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                      textShadow: '0 0 30px rgba(201,165,90,0.3)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {word}
                  </div>
                );
             })}
          </motion.div>
       </div>

       {/* Floating Center Text */}
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         whileInView={{ scale: 1, opacity: 1 }}
         transition={{ duration: 1, type: 'spring' }}
         style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20, textAlign: 'center' }}
       >
          <motion.div 
            animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ width: 64, height: 64, margin: '0 auto 16px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a55a, #8f7236)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(201,165,90,0.8)' }}
          >
            <span style={{ color: '#080c0a', fontSize: 24, fontWeight: 700 }}>✦</span>
          </motion.div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#f0ede7', letterSpacing: '0.5em', textTransform: 'uppercase', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>The Core</p>
       </motion.div>
    </ScrollCard>
  )
}

/* ── Scroll Card ── wraps a section and scales/rotates it out as user scrolls past */
const ScrollCard = ({ id, children, style = {}, className = '' }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.05', 'end start'] });
  const scale = useTransform(scrollYProgress, [0.6, 1], [1, 0.84]);
  const opacity = useTransform(scrollYProgress, [0.7, 1], [1, 0]);
  const rotateX = useTransform(scrollYProgress, [0.6, 1], ['0deg', '10deg']);
  return (
    <div ref={ref} id={id}>
      <motion.section
        style={{ scale, opacity, rotateX, transformOrigin: 'top center', transformStyle: 'preserve-3d', ...style }}
        className={className}
      >
        {children}
      </motion.section>
    </div>
  );
};

/* ── Animated counter ── */
const Counter = ({ to, suffix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = () => {
      start += Math.ceil(to / 60);
      if (start >= to) { setVal(to); return; }
      setVal(start);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
};

export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroScroll, [0, 1], ['0%', '50%']);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.75]);
  const heroRotateX = useTransform(heroScroll, [0, 1], [0, 30]);

  /* Magnetic button state */
  const [magPos, setMagPos] = useState({ x: 0, y: 0 });
  const btnRef = useRef(null);
  const onMagMove = (e) => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    setMagPos({ x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3 });
  };
  const onMagLeave = () => setMagPos({ x: 0, y: 0 });

  return (
    <div className="w-full" style={{ background: '#080c0a', color: '#f0ede7', fontFamily: "'Outfit', sans-serif", perspective: '1200px' }}>
      <CustomCursor />
      {/* Noise Overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none', opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      <ScrollProgressBar />
      <ScrollBeadNav sections={SECTIONS} />

      {/* ═══════════════════════════ 1. HERO ═══════════════════════════ */}
      <section id="hero" ref={heroRef} style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Gradient orbs */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,90,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '8%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,61,44,0.3) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        </div>

        {/* 3D Perspective Grid Floor */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '45%', pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%) rotateX(80deg)', transformOrigin: 'bottom center',
            width: '200%', height: '200%',
            backgroundImage: 'linear-gradient(rgba(201,165,90,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(201,165,90,0.12) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 60% 60% at 50% 100%, black 30%, transparent 100%)'
          }} />
        </div>

        {/* Floating fabric elements */}
        {[
          { top: '12%', left: '7%', size: 90, rot: -20, delay: 0 },
          { top: '70%', left: '4%', size: 60, rot: 15, delay: 0.4 },
          { top: '20%', right: '6%', size: 75, rot: 25, delay: 0.2 },
          { top: '65%', right: '5%', size: 50, rot: -10, delay: 0.6 },
          { top: '45%', left: '2%', size: 40, rot: 5, delay: 0.8 },
        ].map((f, i) => (
          <motion.div key={i}
            style={{ position: 'absolute', top: f.top, left: f.left, right: f.right, width: f.size, height: f.size * 1.4, borderRadius: 12, background: 'linear-gradient(135deg, rgba(201,165,90,0.15), rgba(13,61,44,0.25))', border: '1px solid rgba(201,165,90,0.2)', backdropFilter: 'blur(4px)', rotate: f.rot }}
            animate={{ y: [0, -18, 0], rotate: [f.rot, f.rot + 6, f.rot] }}
            transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
          />
        ))}

        <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale, rotateX: heroRotateX, transformOrigin: 'bottom center', textAlign: 'center', position: 'relative', zIndex: 2, transformStyle: 'preserve-3d', perspective: 1200 }}>
          {/* Eyebrow */}
          <motion.p initial={{ opacity: 0, letterSpacing: '0.3em' }} animate={{ opacity: 1, letterSpacing: '0.5em' }} transition={{ duration: 1.2 }}
            style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', textTransform: 'uppercase', marginBottom: 32, letterSpacing: '0.5em' }}>
            Since 2024 · Wear Your Identity
          </motion.p>

          {/* 3D Brand name */}
          <div style={{ perspective: 1200, marginBottom: 28 }}>
            {'PELICLE'.split('').map((ch, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 80, rotateX: -90, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3 + i * 0.08, type: 'spring', bounce: 0.4 }}
                style={{ display: 'inline-block', fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(72px,14vw,160px)', fontWeight: 700, lineHeight: 1, letterSpacing: '0.04em', color: '#f0ede7', textShadow: '0 8px 40px rgba(201,165,90,0.4)', transformStyle: 'preserve-3d' }}>
                {ch}
              </motion.span>
            ))}
          </div>

          <motion.p initial={{ opacity: 0, y: 30, rotateX: 45 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1, delay: 1.2, type: 'spring' }}
            style={{ fontSize: 'clamp(15px,2vw,22px)', color: 'rgba(240,237,231,0.6)', fontWeight: 300, letterSpacing: '0.15em', marginBottom: 48, transformStyle: 'preserve-3d' }}>
            Wear Your Identity
          </motion.p>

          <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1, delay: 1.5 }}
            style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, #c9a55a, transparent)', margin: '0 auto 48px' }} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'rgba(240,237,231,0.4)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Scroll</span>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, #c9a55a, transparent)' }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════ 2. BRAND STORY ═══════════════════════════ */}
      <ScrollCard id="story" style={{ padding: 'clamp(80px,12vw,160px) clamp(24px,8vw,120px)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,165,90,0.3), transparent)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 80, alignItems: 'center' }}>
          <div>
            <Reveal>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 20 }}>Our Story</p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px,6vw,72px)', fontWeight: 700, lineHeight: 1.1, marginBottom: 32 }}>
                More than<br /><em style={{ color: '#c9a55a', fontStyle: 'italic' }}>clothing.</em>
              </h2>
            </Reveal>
          </div>
          <div>
            <Reveal delay={0.2}>
              <p style={{ fontSize: 'clamp(16px,1.5vw,20px)', lineHeight: 1.9, color: 'rgba(240,237,231,0.7)', marginBottom: 28 }}>
                Pelicle is more than clothing — it's expression. Built for individuals who stand out, not fit in.
              </p>
              <p style={{ fontSize: 'clamp(16px,1.5vw,20px)', lineHeight: 1.9, color: 'rgba(240,237,231,0.7)', marginBottom: 40 }}>
                Every piece is designed to reflect confidence, identity, and bold simplicity. We don't follow trends — we set them.
              </p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[{ n: 500, s: '+', label: 'Designs', icon: '✦' }, { n: 12, s: 'K+', label: 'Customers', icon: '◈' }, { n: 100, s: '%', label: 'Premium', icon: '◎' }].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -12, rotateX: -10, rotateY: 8, scale: 1.06 }}
                    initial={{ opacity: 0, y: 40, rotateX: 30 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.15, type: 'spring' }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(201,165,90,0.1), rgba(13,61,44,0.2))',
                      border: '1px solid rgba(201,165,90,0.25)',
                      borderRadius: 16, padding: '20px 28px',
                      transformStyle: 'preserve-3d', cursor: 'default',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,165,90,0.2)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#c9a55a', marginBottom: 8, transform: 'translateZ(8px)' }}>{stat.icon}</div>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 700, color: '#c9a55a', lineHeight: 1, transform: 'translateZ(16px)' }}>
                      <Counter to={stat.n} suffix={stat.s} />
                    </p>
                    <p style={{ fontSize: 10, color: 'rgba(240,237,231,0.45)', letterSpacing: '0.4em', textTransform: 'uppercase', marginTop: 8, transform: 'translateZ(6px)' }}>{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </ScrollCard>

      {/* ═══════════════════════════ 3. FOUNDER ═══════════════════════════ */}
      <ScrollCard id="founder" style={{ padding: 'clamp(80px,12vw,140px) clamp(24px,8vw,120px)', background: 'rgba(13,61,44,0.08)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,165,90,0.2), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,165,90,0.2), transparent)' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 20 }}>The Visionary</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, lineHeight: 1.15, marginBottom: 60 }}>
              Founded by<br /><span style={{ color: '#c9a55a', fontStyle: 'italic' }}>Meet Paddmani</span>
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <motion.div
              whileHover={{ rotateY: 5, rotateX: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(201,165,90,0.06) 100%)', border: '1px solid rgba(201,165,90,0.2)', borderRadius: 24, padding: 'clamp(40px,5vw,64px)', position: 'relative', transformStyle: 'preserve-3d', cursor: 'default' }}>
              <div style={{ position: 'absolute', top: 24, left: 24, width: 48, height: 48, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,90,0.3), transparent)', filter: 'blur(16px)' }} />
              <div style={{ position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,61,44,0.4), transparent)', filter: 'blur(20px)' }} />

              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0d3d2c, #c9a55a)',
                margin: '0 auto 28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontFamily: "'Cormorant Garamond', serif", fontWeight: 700,
                color: '#f0ede7', boxShadow: '0 8px 32px rgba(201,165,90,0.4)',
                position: 'relative'
              }}>
                {/* Orbiting ring 1 */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute', inset: -12, borderRadius: '50%',
                    border: '1px solid rgba(201,165,90,0.4)',
                    borderTopColor: '#c9a55a', borderTopWidth: 2,
                  }}
                />
                {/* Orbiting ring 2 */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute', inset: -24, borderRadius: '50%',
                    border: '1px dashed rgba(201,165,90,0.2)',
                    borderRightColor: 'rgba(201,165,90,0.6)', borderRightWidth: 2,
                  }}
                />
                {/* Orbiting dot */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  style={{ position: 'absolute', inset: -8, borderRadius: '50%' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, borderRadius: '50%', background: '#c9a55a', boxShadow: '0 0 8px rgba(201,165,90,0.9)' }} />
                </motion.div>
                M
              </div>

              <p style={{ fontSize: 'clamp(16px,1.5vw,20px)', lineHeight: 1.9, color: 'rgba(240,237,231,0.75)', maxWidth: 600, margin: '0 auto 32px' }}>
                "Driven by passion and vision, <strong style={{ color: '#c9a55a', fontWeight: 700, letterSpacing: '0.02em', textShadow: '0 2px 10px rgba(201,165,90,0.3)' }}>Meet Paddmani</strong> created Pelicle to redefine everyday fashion with a premium edge. Every stitch is intentional. Every design is a statement."
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 1, background: '#c9a55a' }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Meet Paddmani — Founder & Creative Director</p>
                <div style={{ width: 32, height: 1, background: '#c9a55a' }} />
              </div>
            </motion.div>
          </Reveal>
        </div>
      </ScrollCard>

      {/* ═══════════════════════════ 4. VISION & MISSION ═══════════════════════════ */}
      <ScrollCard id="purpose" style={{ padding: 'clamp(80px,12vw,140px) clamp(24px,8vw,80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>Purpose</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, textAlign: 'center', marginBottom: 72 }}>
              Vision & Mission
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
            {[
              {
                label: 'Vision', icon: '◎',
                title: 'A World Dressed in Identity',
                body: 'To be the global symbol of self-expression through fashion — where every garment tells the wearer\'s unique story with confidence, elegance, and edge.',
                accent: 'rgba(201,165,90,0.08)',
                side: 'left',
              },
              {
                label: 'Mission', icon: '◈',
                title: 'Crafting Premium with Purpose',
                body: 'To design and deliver premium clothing that empowers individuals to stand out — combining bold simplicity with impeccable craftsmanship, accessible to all.',
                accent: 'rgba(13,61,44,0.2)',
                side: 'right',
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.15} variant="side" side={item.side}>
                <motion.div
                  whileHover={{ y: -12, rotateX: 5, rotateY: item.side === 'left' ? -5 : 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  style={{ background: item.accent, border: '1px solid rgba(201,165,90,0.15)', borderRadius: 20, padding: 'clamp(36px,4vw,56px)', height: '100%', position: 'relative', overflow: 'hidden', transformStyle: 'preserve-3d' }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 120, color: 'rgba(201,165,90,0.04)', fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, pointerEvents: 'none', userSelect: 'none', transform: 'translateZ(-50px)' }}>
                    {item.icon}
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 16, transform: 'translateZ(20px)' }}>{item.label}</p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px,3vw,38px)', fontWeight: 700, lineHeight: 1.2, marginBottom: 20, transform: 'translateZ(30px)' }}>{item.title}</h3>
                  <p style={{ fontSize: 16, lineHeight: 1.8, color: 'rgba(240,237,231,0.65)', transform: 'translateZ(10px)' }}>{item.body}</p>
                  <div style={{ marginTop: 32, width: 40, height: 2, background: 'linear-gradient(90deg, #c9a55a, transparent)', transform: 'translateZ(20px)' }} />
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </ScrollCard>

      {/* ═══════════════════════════ 4.2. CORE PILLARS ═══════════════════════════ */}
      <CorePillars />

      {/* ═══════════════════════════ 4.5. THE AESTHETIC GALLERY ═══════════════════════════ */}
      <SignatureAesthetic />

      {/* ═══════════════════════════ 5. EVOLUTION TIMELINE ═══════════════════════════ */}
      <div id="journey">
        {/* Horizontal Sticky Scroll (Now for both Mobile and Desktop) */}
        <HorizontalTimeline />
      </div>

      {/* ═══════════════════════════ 5.2. MANIFESTO CYLINDER ═══════════════════════════ */}
      <ManifestoRing />

      {/* ═══════════════════════════ 5.5. CRAFTSMANSHIP ═══════════════════════════ */}
      <ScrollCard id="anatomy" style={{ padding: 'clamp(80px,12vw,140px) clamp(24px,8vw,80px)', position: 'relative' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>The Details</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, textAlign: 'center', marginBottom: 80 }}>
              Anatomy of Pelicle
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { title: 'French Terry Cotton', desc: 'Sourced for its breathability and weighted drape, giving every garment a structured, architectural silhouette.', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600' },
              { title: 'Reinforced Stitching', desc: 'Micro-stitches per inch are doubled at stress points. Built to withstand time, not just seasons.', img: 'https://images.unsplash.com/photo-1584288008084-25cb27845ba0?q=80&w=600' },
              { title: 'Matte Hardware', desc: 'Custom molded, obsidian-finished zippers and aglets that feel cold to the touch and heavy in the hand.', img: 'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=600' }
            ].map((feature, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <motion.div whileHover={{ scale: 1.02, y: -10 }} className="group cursor-default">
                  <div className="overflow-hidden rounded-2xl mb-6 relative aspect-[4/5] bg-[#0d1a13] border border-[#c9a55a]/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                     <motion.img 
                       src={feature.img} 
                       alt={feature.title}
                       className="w-full h-full object-cover opacity-50 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-90 group-hover:scale-110 transition-all duration-700 ease-out"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#080c0a] via-transparent to-transparent opacity-90" />
                  </div>
                  <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: '#c9a55a', marginBottom: 12 }}>{feature.title}</h4>
                  <p style={{ fontSize: 15, color: 'rgba(240,237,231,0.6)', lineHeight: 1.8 }}>{feature.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </ScrollCard>

      {/* ═══════════════════════════ 5.8. THE PROMISE — 3D CARD FLIP GRID ═══════════════════════════ */}
      <ScrollCard id="promise" style={{ padding: 'clamp(80px,12vw,140px) clamp(24px,8vw,80px)', position: 'relative', overflow: 'hidden' }}>
        {/* bg radial glow */}
        <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(13,61,44,0.4) 0%, transparent 65%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>Our Pledge</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, textAlign: 'center', marginBottom: 16 }}>
              The Pelicle Promise
            </h2>
            <p style={{ textAlign: 'center', color: 'rgba(240,237,231,0.5)', fontSize: 16, maxWidth: 500, margin: '0 auto 72px', lineHeight: 1.8 }}>
              Hover each card to reveal our commitment to you.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {[
              {
                front: { icon: '✦', title: 'Premium Only' },
                back: { title: 'Premium Only', body: 'Every fabric is sourced from certified mills. We accept nothing below luxury grade — period.' },
                accent: '#c9a55a',
              },
              {
                front: { icon: '◉', title: 'Fit Perfected' },
                back: { title: 'Fit Perfected', body: 'Each pattern is cut and graded across 12 size points, engineered to drape perfectly on every body type.' },
                accent: '#7ec8a4',
              },
              {
                front: { icon: '◈', title: 'Conscious Craft' },
                back: { title: 'Conscious Craft', body: 'Sustainable production, ethical sourcing. We build garments that respect both you and the planet.' },
                accent: '#c9a55a',
              },
              {
                front: { icon: '◆', title: 'Bold Always' },
                back: { title: 'Bold Always', body: 'No watered-down aesthetics. Pelicle is a declaration — every drop is designed to make you unforgettable.' },
                accent: '#7ec8a4',
              },
            ].map((card, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover="flipped"
                  initial="idle"
                  style={{ perspective: 1000, height: 280, cursor: 'pointer' }}
                >
                  <motion.div
                    variants={{ idle: { rotateY: 0 }, flipped: { rotateY: 180 } }}
                    transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                    style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
                  >
                    {/* Front Face */}
                    <div style={{
                      position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                      background: 'linear-gradient(135deg, rgba(13,61,44,0.3) 0%, rgba(8,12,10,0.8) 100%)',
                      border: `1px solid rgba(${card.accent === '#c9a55a' ? '201,165,90' : '126,200,164'},0.25)`,
                      borderRadius: 24, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 16,
                      backdropFilter: 'blur(20px)',
                    }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', border: `1.5px solid ${card.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: card.accent }}>{card.front.icon}</div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: '#f0ede7', textAlign: 'center' }}>{card.front.title}</h3>
                      <p style={{ fontSize: 11, color: card.accent, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Hover to reveal</p>
                    </div>

                    {/* Back Face */}
                    <div style={{
                      position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      background: `linear-gradient(135deg, ${card.accent === '#c9a55a' ? 'rgba(201,165,90,0.15)' : 'rgba(126,200,164,0.1)'} 0%, rgba(8,12,10,0.95) 100%)`,
                      border: `1px solid ${card.accent}40`,
                      borderRadius: 24, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', padding: 36,
                      backdropFilter: 'blur(20px)',
                    }}>
                      <div style={{ width: 2, height: 40, background: card.accent, marginBottom: 24, borderRadius: 2 }} />
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, color: card.accent, textAlign: 'center', marginBottom: 16 }}>{card.back.title}</h3>
                      <p style={{ fontSize: 15, color: 'rgba(240,237,231,0.75)', lineHeight: 1.8, textAlign: 'center' }}>{card.back.body}</p>
                    </div>
                  </motion.div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </ScrollCard>

      {/* ═══════════════════════════ 5.9. BEHIND THE SCENES — CINEMATIC SPLIT ═══════════════════════════ */}
      <ScrollCard style={{ padding: 'clamp(60px,10vw,140px) clamp(20px,6vw,80px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>The Process</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,5vw,64px)', fontWeight: 700, textAlign: 'center', marginBottom: 'clamp(40px,6vw,80px)' }}>
              Born From Obsession
            </h2>
          </Reveal>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 items-center">
            {/* Left — Image with floating badge */}
            <div className="w-full lg:flex-1" style={{ position: 'relative', paddingBottom: 32 }}>
              <motion.div
                initial={{ opacity: 0, x: -40, rotateY: -10 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, type: 'spring', stiffness: 80 }}
                style={{ position: 'relative', zIndex: 2, borderRadius: 20, overflow: 'hidden', transformStyle: 'preserve-3d', perspective: 1000 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800"
                  alt="Crafting"
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,12,10,0.3), transparent)' }} />
              </motion.div>
              {/* Floating badge — repositioned for mobile */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute bottom-0 right-2 md:right-0"
                style={{ background: 'linear-gradient(135deg, #c9a55a, #8f7236)', borderRadius: 14, padding: 'clamp(12px,2vw,20px) clamp(16px,3vw,28px)', zIndex: 10, boxShadow: '0 20px 60px rgba(201,165,90,0.4)' }}
              >
                <p style={{ fontSize: 10, color: '#080c0a', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 2 }}>Since</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px,4vw,36px)', fontWeight: 700, color: '#080c0a', lineHeight: 1 }}>2022</p>
              </motion.div>
            </div>

            {/* Right — Steps */}
            <div className="w-full lg:flex-1" style={{ paddingTop: 8 }}>
              {[
                { num: '01', title: 'The Sketch', body: 'Every piece begins with a hand-drawn concept. No computer shortcuts — raw creative instinct on paper first.' },
                { num: '02', title: 'The Fabric', body: 'We travel sourcing fairs across India to handpick fabrics that meet our strict weight, texture, and drape standards.' },
                { num: '03', title: 'The Drop', body: 'Limited-run production. Each garment is quality-checked by hand before it ever reaches your doorstep.' },
              ].map((step, i) => (
                <Reveal key={i} delay={i * 0.12} variant="side" side="right">
                  <motion.div
                    whileHover={{ x: 6 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    style={{
                      display: 'flex', gap: 'clamp(12px,3vw,24px)',
                      paddingBottom: 'clamp(24px,4vw,40px)',
                      borderBottom: i < 2 ? '1px solid rgba(201,165,90,0.1)' : 'none',
                      marginBottom: i < 2 ? 'clamp(24px,4vw,40px)' : 0,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px,6vw,56px)', fontWeight: 700, color: 'rgba(201,165,90,0.12)', lineHeight: 1, minWidth: 'clamp(40px,6vw,60px)', flexShrink: 0 }}>{step.num}</div>
                    <div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(22px,3vw,28px)', fontWeight: 700, color: '#c9a55a', marginBottom: 8 }}>{step.title}</h3>
                      <p style={{ fontSize: 'clamp(14px,1.5vw,16px)', color: 'rgba(240,237,231,0.6)', lineHeight: 1.8 }}>{step.body}</p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </ScrollCard>

      {/* ═══════════════════════════ 5.95. BRAND DNA TAPE ═══════════════════════════ */}
      <div style={{ padding: 'clamp(28px,5vw,60px) 0', overflow: 'hidden', borderTop: '1px solid rgba(201,165,90,0.08)', borderBottom: '1px solid rgba(201,165,90,0.08)', background: 'rgba(13,61,44,0.08)' }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', gap: 0, width: 'max-content', alignItems: 'center' }}
        >
          {[...Array(2)].map((_, rep) =>
            ['PREMIUM', '✦', 'BOLD', '◆', 'CRAFTED', '✦', 'AUTHENTIC', '◆', 'LIMITED', '✦', 'ELEVATED', '◆', 'PELICLE', '✦'].map((word, i) => (
              <span
                key={`${rep}-${i}`}
                style={{
                  fontFamily: word === '✦' || word === '◆' ? 'serif' : "'Cormorant Garamond', serif",
                  fontSize: word === '✦' || word === '◆' ? 'clamp(14px,2vw,20px)' : 'clamp(18px,3.5vw,44px)',
                  fontWeight: 700,
                  color: word === '✦' || word === '◆' ? '#c9a55a' : 'rgba(240,237,231,0.2)',
                  letterSpacing: '0.12em',
                  padding: '0 clamp(12px,2.5vw,36px)',
                  whiteSpace: 'nowrap',
                  textTransform: 'uppercase',
                }}
              >
                {word}
              </span>
            ))
          )}
        </motion.div>
      </div>

      {/* ═══════════════════════════ 6. CLOSING CTA ═══════════════════════════ */}
      <ScrollCard id="closing" style={{ padding: 'clamp(100px,15vw,180px) clamp(24px,8vw,80px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,165,90,0.08) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        </div>

        <Reveal>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#c9a55a', letterSpacing: '0.5em', textTransform: 'uppercase', marginBottom: 32 }}>The Brand</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(56px,12vw,140px)', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 24 }}>
            This is<br /><span style={{ background: 'linear-gradient(135deg, #c9a55a 0%, #f0e6c8 50%, #c9a55a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pelicle.</span>
          </h2>
          <p style={{ fontSize: 'clamp(16px,1.5vw,20px)', color: 'rgba(240,237,231,0.55)', maxWidth: 480, margin: '0 auto 56px', lineHeight: 1.8 }}>
            Where every thread carries intention, and every piece is a declaration of who you are.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <Link to="/products">
            <motion.button
              ref={btnRef}
              onMouseMove={onMagMove}
              onMouseLeave={onMagLeave}
              whileTap={{ scale: 0.96 }}
              animate={{ x: magPos.x, y: magPos.y }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{ background: 'linear-gradient(135deg, #c9a55a, #a07c3a)', color: '#080c0a', border: 'none', borderRadius: 4, padding: '18px 52px', fontSize: 13, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 32px rgba(201,165,90,0.35)', fontFamily: "'Outfit', sans-serif", display: 'inline-block' }}>
              Explore Collection
            </motion.button>
          </Link>
        </Reveal>
      </ScrollCard>

    </div>
  );
}
