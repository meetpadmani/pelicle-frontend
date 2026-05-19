import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, Heart, Search, User, Menu, X, ChevronRight, LogOut, Package, MapPin, Settings, Home, ArrowRight } from 'lucide-react';
import { logoutUser } from '../../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { removeFromCart } from '../../features/cart/cartSlice';

const defaultAnnouncements = [
  { text: "Free shipping on orders above ₹999", highlighted: false, showTimer: false },
  { text: "Use code PELLICLE10 for 10% off", highlighted: true, showTimer: false },
  { text: "New arrivals every Friday", highlighted: false, showTimer: true }
];

const megaMenuData = {
  Men: [
    { title: 'T-Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80', url: '/products?category=T-Shirts&gender=Men' },
    { title: 'Shirts', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=300&q=80', url: '/products?category=Shirts&gender=Men' },
    { title: 'Bottoms', image: 'https://images.unsplash.com/photo-1624378439575-d1ead6bb17f0?w=300&q=80', url: '/products?category=Bottoms&gender=Men' },
  ],
  Women: [
    { title: 'Dresses', image: 'https://images.unsplash.com/photo-1515347619220-b452f38bc8bb?w=300&q=80', url: '/products?category=Dresses&gender=Women' },
    { title: 'Tops', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&q=80', url: '/products?category=Tops&gender=Women' },
    { title: 'Bottoms', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&q=80', url: '/products?category=Bottoms&gender=Women' },
  ]
};

const CountdownTimer = ({ item }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Determine configured duration
    const currentH = item.timerHours || 0;
    const currentM = item.timerMinutes || 0;
    const currentS = item.timerSeconds || 0;
    const currentDuration = (currentH * 3600) + (currentM * 60) + currentS;
    
    let duration = item.timerDuration || (currentDuration > 0 ? currentDuration : (44 * 60 + 10));
    let endTime = item.timerEndTime;

    if (!endTime) endTime = Date.now() + duration * 1000;

    const tick = () => {
      const now = Date.now();
      let remaining = Math.floor((endTime - now) / 1000);
      
      if (remaining <= 0) {
          const timePassed = now - endTime;
          const cycles = Math.floor(timePassed / (duration * 1000)) + 1;
          endTime = endTime + (cycles * duration * 1000);
          remaining = Math.floor((endTime - now) / 1000);
      }
      setTimeLeft(Math.max(0, remaining));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [item]);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  
  const timeStr = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/20 border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] backdrop-blur-md">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
      <span className="text-[#D4AF37] font-mono font-black text-[12px] tracking-wider leading-none mt-0.5">{timeStr}</span>
    </span>
  );
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(s => s.auth);
  const { items: cartItems, totalItems, cartTotal } = useSelector(s => s.cart);
  const { products: wishlistItems } = useSelector(s => s.wishlist);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const [logo, setLogo] = useState({ type: 'text', text: 'Pelicle', imageUrl: '' });
  const [ticker, setTicker] = useState({
    enabled: true,
    speed: 30,
    items: defaultAnnouncements
  });

  // Load logo & announcements from layout API
  useEffect(() => {
    import('../../services/api').then(({ layoutAPI }) => {
      layoutAPI.get().then(res => {
        const layoutData = res.data?.layout;
        if (layoutData) {
          const logoData = layoutData.logo;
          if (logoData && (logoData.imageUrl || logoData.text)) {
            setLogo({
              type: logoData.type || 'text',
              text: logoData.text || 'Pelicle',
              imageUrl: logoData.imageUrl || '',
            });
          }
          if (layoutData.ticker) {
            try {
              const parsed = JSON.parse(layoutData.ticker);
              if (parsed) setTicker(parsed);
            } catch(e) {}
          } else if (layoutData.announcements && layoutData.announcements.length > 0) {
            setTicker(prev => ({ ...prev, items: layoutData.announcements.map(a => ({ text: a })) }));
          }
        }
      }).catch(() => {});
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCartDrawerOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
    setActiveMegaMenu(null);
  }, [location]);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen || cartDrawerOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen, cartDrawerOpen, searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const navLinks = [
    { label: 'Men', url: '/products?gender=Men', hasMegaMenu: true },
    { label: 'Women', url: '/products?gender=Women', hasMegaMenu: true },
    { label: 'Track Order', url: '/track-order', hasMegaMenu: false },
    { label: 'About', url: '/about', hasMegaMenu: false },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 transition-all duration-300">
        {/* ── Announcement Bar (Ticker) ── */}
        {ticker.enabled && ticker.items && ticker.items.length > 0 && (
          <div className="bg-deep-forest py-2 overflow-hidden flex whitespace-nowrap">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-33.33%); }
              }
            `}</style>
            <div 
              className="flex items-center shrink-0"
              style={{ animation: `marquee ${ticker.speed}s linear infinite` }}
            >
              {[0, 1, 2].map(copy => (
                <span key={copy} className="inline-flex items-center">
                  {ticker.items.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-5 mx-8">
                      {item.showTimer ? (
                        <span className="inline-flex items-center gap-2 text-white text-[12px] font-body font-semibold tracking-widest uppercase">
                          {item.text}
                          <CountdownTimer item={item} />
                        </span>
                      ) : (
                        <span className={`text-[12px] tracking-widest uppercase font-body ${item.highlighted ? "text-white font-black drop-shadow-md" : "text-white/80 font-semibold"}`}>
                          {item.text}
                        </span>
                      )}
                      <span className="text-white/40 text-[8px]">◆</span>
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Nav ── */}
        <nav 
          className={`h-[68px] flex items-center transition-all duration-300 bg-[#f5f0e8] ${scrolled ? 'border-b border-deep-forest/10 shadow-sm' : ''}`}
          onMouseLeave={() => setActiveMegaMenu(null)}
        >
          <div className="w-full px-4 md:px-8 mx-auto flex items-center justify-between">
            
            {/* Mobile Hamburger */}
            <button className="lg:hidden p-2 -ml-2 text-deep-forest" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} strokeWidth={1.5} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center flex-1 lg:flex-none justify-center lg:justify-start">
              {logo.type === 'image' && logo.imageUrl ? (
                <img src={logo.imageUrl} alt={logo.text || 'Pelicle'} className="h-10 w-auto object-contain" />
              ) : (
                <span className="font-display font-bold text-[28px] text-deep-forest tracking-wider uppercase">
                  {logo.text || 'Pelicle'}
                </span>
              )}
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center justify-center flex-1 gap-10 h-full">
              {navLinks.map(link => (
                <div 
                  key={link.label} 
                  className="h-full flex items-center relative group cursor-pointer"
                  onMouseEnter={() => link.hasMegaMenu && setActiveMegaMenu(link.label)}
                >
                  <Link to={link.url} className="text-[13px] font-semibold tracking-[0.15em] uppercase text-deep-forest relative py-2 overflow-hidden">
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gold -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-4 lg:gap-6 justify-end">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)} className="text-deep-forest hover:text-gold transition-colors hidden md:block">
                <Search size={22} strokeWidth={1.5} />
              </button>

              {/* Wishlist */}
              <Link to="/dashboard/wishlist" className="relative text-deep-forest hover:text-gold transition-colors hidden md:block">
                <Heart size={22} strokeWidth={1.5} />
                {wishlistItems?.length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-gold rounded-full border border-warm-ivory" />
                )}
              </Link>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="text-deep-forest hover:text-gold transition-colors flex items-center gap-1">
                    <User size={22} strokeWidth={1.5} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-4 w-56 bg-warm-ivory border border-deep-forest/10 shadow-xl rounded-none py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-deep-forest/10 mb-2">
                          <p className="font-semibold text-sm text-deep-forest font-display tracking-widest uppercase">{user?.name}</p>
                          <p className="text-xs text-text-muted mt-1">{user?.email}</p>
                        </div>
                        {[
                          { label: 'Orders', href: '/dashboard/orders' },
                          { label: 'Wishlist', href: '/dashboard/wishlist' },
                          { label: 'Profile', href: '/dashboard/profile' },
                          ...(user?.role === 'admin' ? [{ label: 'Admin', href: '/admin' }] : []),
                        ].map(item => (
                          <Link key={item.href} to={item.href} className="block px-4 py-2 text-sm text-deep-forest hover:bg-gold/10 hover:text-gold transition-colors font-semibold tracking-widest uppercase text-[11px]">
                            {item.label}
                          </Link>
                        ))}
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-[11px] font-semibold tracking-widest uppercase text-red-500 hover:bg-red-50 transition-colors mt-2 border-t border-deep-forest/10 pt-3">
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="text-deep-forest hover:text-gold transition-colors hidden md:block">
                  <User size={22} strokeWidth={1.5} />
                </Link>
              )}

              {/* Cart */}
              <button onClick={() => setCartDrawerOpen(true)} className="relative text-deep-forest hover:text-gold transition-colors">
                <ShoppingBag size={22} strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 bg-gold text-deep-forest text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Mega Dropdown ── */}
          <AnimatePresence>
            {activeMegaMenu && megaMenuData[activeMegaMenu] && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="absolute top-full left-0 w-full bg-warm-ivory border-t border-deep-forest/10 shadow-lg z-40 overflow-hidden"
                onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <div className="max-w-5xl mx-auto px-8 py-10">
                  <div className="grid grid-cols-3 gap-8">
                    {megaMenuData[activeMegaMenu].map((cat, idx) => (
                      <Link key={idx} to={cat.url} className="group block">
                        <div className="relative aspect-[4/5] overflow-hidden mb-4 bg-light-beige">
                          <img src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                        </div>
                        <h3 className="font-display text-xl text-deep-forest tracking-widest uppercase group-hover:text-gold transition-colors flex items-center justify-between">
                          {cat.title} <ArrowRight size={16} className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </h3>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* ── Desktop Search Overlay (Slides down from top) ── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{ y: '-100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-warm-ivory flex flex-col"
          >
            <div className="h-[100px] border-b border-deep-forest/10 flex items-center justify-between px-4 md:px-8">
              <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-4xl mx-auto">
                <Search size={28} className="text-deep-forest/50 shrink-0" strokeWidth={1} />
                <input 
                  ref={searchRef} autoFocus type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="flex-1 bg-transparent px-6 py-4 text-2xl md:text-4xl outline-none font-display text-deep-forest placeholder:text-deep-forest/30" 
                />
                <button type="submit" className="hidden md:block ml-4 text-[13px] font-semibold tracking-widest uppercase text-deep-forest border-b border-deep-forest hover:text-gold hover:border-gold transition-colors pb-1">Search</button>
              </form>
              <button onClick={() => setSearchOpen(false)} className="p-2 hover:rotate-90 transition-transform duration-300 ml-4">
                <X size={32} strokeWidth={1} className="text-deep-forest" />
              </button>
            </div>
            <div className="flex-1 bg-deep-forest/5 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Slide-in Drawer ── */}
      <AnimatePresence>
        {cartDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-sm" onClick={() => setCartDrawerOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-warm-ivory z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-deep-forest/10 flex items-center justify-between">
                <h2 className="font-display text-2xl text-deep-forest tracking-widest uppercase">Your Cart ({totalItems})</h2>
                <button onClick={() => setCartDrawerOpen(false)} className="hover:rotate-90 transition-transform duration-300">
                  <X size={24} strokeWidth={1.5} className="text-deep-forest" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {cartItems?.length > 0 ? (
                  cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="w-20 h-24 bg-light-beige shrink-0 overflow-hidden">
                        <img src={item.product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'} alt={item.product?.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start">
                          <Link to={`/products/${item.product?.slug || item.product?._id}`} onClick={() => setCartDrawerOpen(false)} className="font-semibold text-sm text-deep-forest line-clamp-1 hover:text-gold transition-colors">{item.product?.name}</Link>
                          <button onClick={() => dispatch(removeFromCart(item._id))} className="text-text-muted hover:text-red-500 transition-colors p-1"><X size={14} /></button>
                        </div>
                        <p className="text-xs text-text-muted mt-1 tracking-widest uppercase">{item.size || 'Free Size'} &nbsp;|&nbsp; Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-deep-forest mt-auto tracking-wide">₹{(item.product?.discountPrice || item.product?.price || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-text-muted">
                    <ShoppingBag size={48} strokeWidth={1} className="mb-4 opacity-50" />
                    <p className="font-body text-sm tracking-widest uppercase">Your cart is empty</p>
                    <button onClick={() => { setCartDrawerOpen(false); navigate('/products'); }} className="mt-6 border border-deep-forest text-deep-forest px-6 py-3 text-xs tracking-widest uppercase font-semibold hover:bg-deep-forest hover:text-warm-ivory transition-colors">
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>

              {cartItems?.length > 0 && (
                <div className="p-6 border-t border-deep-forest/10 bg-warm-ivory">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm tracking-widest uppercase text-deep-forest">Subtotal</span>
                    <span className="text-lg font-semibold tracking-wide text-deep-forest">₹{(cartTotal || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <button onClick={() => { setCartDrawerOpen(false); navigate('/checkout'); }} className="w-full bg-deep-forest text-warm-ivory py-4 text-xs font-semibold tracking-widest uppercase hover:bg-gold transition-colors mb-3">
                    Checkout
                  </button>
                  <button onClick={() => { setCartDrawerOpen(false); navigate('/cart'); }} className="w-full border border-deep-forest text-deep-forest py-4 text-xs font-semibold tracking-widest uppercase hover:bg-deep-forest hover:text-warm-ivory transition-colors">
                    View Cart
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile Full-Screen Slide-in Menu (Left) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-warm-ivory flex flex-col lg:hidden"
          >
            <div className="h-[68px] border-b border-deep-forest/10 flex items-center justify-between px-4">
              <span className="font-display font-bold text-[24px] text-deep-forest tracking-wider uppercase">Pelicle</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-deep-forest">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-6">
              {navLinks.map(link => (
                <div key={link.label} className="border-b border-deep-forest/10 pb-4">
                  <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => link.hasMegaMenu ? setMobileAccordion(mobileAccordion === link.label ? null : link.label) : navigate(link.url)}
                  >
                    <span className="font-display text-2xl text-deep-forest tracking-widest uppercase">{link.label}</span>
                    {link.hasMegaMenu && <ChevronRight size={20} className={`text-deep-forest transition-transform ${mobileAccordion === link.label ? 'rotate-90' : ''}`} />}
                  </div>
                  
                  {link.hasMegaMenu && (
                    <AnimatePresence>
                      {mobileAccordion === link.label && megaMenuData[link.label] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 flex flex-col gap-4">
                            {megaMenuData[link.label].map((cat, idx) => (
                              <Link key={idx} to={cat.url} onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold tracking-widest uppercase text-text-muted hover:text-deep-forest flex items-center gap-4">
                                <div className="w-12 h-16 bg-light-beige overflow-hidden">
                                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                                </div>
                                {cat.title}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 bg-light-beige flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold tracking-widest uppercase text-deep-forest flex items-center gap-2"><User size={16} /> My Account</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-sm font-semibold tracking-widest uppercase text-red-500 flex items-center gap-2"><LogOut size={16} /> Sign Out</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full bg-deep-forest text-warm-ivory py-4 text-center text-xs font-semibold tracking-widest uppercase">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-warm-ivory border-t border-deep-forest/10 z-40 px-2 py-3 flex justify-between items-center pb-safe">
        <Link to="/" className="flex flex-col items-center gap-1 w-1/5 text-text-muted hover:text-deep-forest transition-colors">
          <Home size={20} strokeWidth={1.5} />
          <span className="text-[9px] tracking-widest uppercase font-semibold">Home</span>
        </Link>
        <button onClick={() => setSearchOpen(true)} className="flex flex-col items-center gap-1 w-1/5 text-text-muted hover:text-deep-forest transition-colors">
          <Search size={20} strokeWidth={1.5} />
          <span className="text-[9px] tracking-widest uppercase font-semibold">Search</span>
        </button>
        <Link to="/dashboard/wishlist" className="flex flex-col items-center gap-1 w-1/5 text-text-muted hover:text-deep-forest transition-colors relative">
          <Heart size={20} strokeWidth={1.5} />
          <span className="text-[9px] tracking-widest uppercase font-semibold">Wishlist</span>
          {wishlistItems?.length > 0 && <span className="absolute top-0 right-[25%] w-2 h-2 bg-gold rounded-full border border-warm-ivory" />}
        </Link>
        <button onClick={() => setCartDrawerOpen(true)} className="flex flex-col items-center gap-1 w-1/5 text-text-muted hover:text-deep-forest transition-colors relative">
          <ShoppingBag size={20} strokeWidth={1.5} />
          <span className="text-[9px] tracking-widest uppercase font-semibold">Cart</span>
          {totalItems > 0 && <span className="absolute -top-1 right-[15%] bg-gold text-deep-forest text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
        </button>
        <Link to={isAuthenticated ? "/dashboard/profile" : "/login"} className="flex flex-col items-center gap-1 w-1/5 text-text-muted hover:text-deep-forest transition-colors">
          <User size={20} strokeWidth={1.5} />
          <span className="text-[9px] tracking-widest uppercase font-semibold">Profile</span>
        </Link>
      </div>

    </>
  );
};

export default Navbar;
