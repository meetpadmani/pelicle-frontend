import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, RefreshCw, Star, CheckCircle, Mail, ChevronRight, ShieldCheck, BadgeCheck } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import QuickViewModal from '../components/product/QuickViewModal';
import SEO from '../components/common/SEO';
import { fetchFeatured, fetchNewArrivals } from '../features/products/productsSlice';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const heroSlides = [
  {
    id: 1,
    eyebrow: "New Collection 2025",
    title: "Move Freely. Stay Stylish.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000",
    cta1: { label: "Shop Men", url: "/products?gender=Men" },
    cta2: { label: "Shop Women", url: "/products?gender=Women" }
  },
  {
    id: 2,
    eyebrow: "Women's Edit",
    title: "Effortless Style. Every Day.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000",
    cta1: { label: "Shop Women", url: "/products?gender=Women" },
    cta2: { label: "Explore Lookbook", url: "#lookbook" }
  },
  {
    id: 3,
    eyebrow: "New Arrivals",
    title: "Fresh Drops. This Season.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000",
    cta1: { label: "Shop New Arrivals", url: "/products?isNewArrival=true" },
    cta2: { label: "View All", url: "/products" }
  }
];

const lookbookImages = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&auto=format&fit=crop&q=80',
];

const HomePage = () => {
  const dispatch = useDispatch();
  const { featured, newArrivals, loading } = useSelector(s => s.products);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  
  // Dynamic Layout state
  const [dynamicSlides, setDynamicSlides] = useState(heroSlides);
  const [dynamicBanners, setDynamicBanners] = useState([
    {
      id: 'default_men',
      title: "Men's Collection",
      image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=1200',
      linkUrl: '/products?gender=Men'
    },
    {
      id: 'default_women',
      title: "Women's Collection",
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200',
      linkUrl: '/products?gender=Women'
    }
  ]);

  const getFilteredProducts = () => {
    let list = [...(featured || [])];
    if (filter === 'Men') list = list.filter(p => p.gender === 'Men');
    else if (filter === 'Women') list = list.filter(p => p.gender === 'Women');
    else if (filter === 'New Arrivals') list = list.filter(p => p.isNewArrival);
    else if (filter === 'On Sale') list = list.filter(p => p.discountPrice);

    if (sort === 'Price Low-High') list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    else if (sort === 'Price High-Low') list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    else if (sort === 'Top Rated') list.sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
    else if (sort === 'Newest') list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    
    return list;
  };
  const displayProducts = getFilteredProducts();

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchNewArrivals());
    
    // Fetch layout config from DB
    import('../services/api').then(({ layoutAPI }) => {
      layoutAPI.get().then(res => {
        const layoutData = res.data?.layout;
        if (layoutData?.homeBuilder) {
          // Find the Hero Slider or Image Slider
          const sliderSection = layoutData.homeBuilder.find(s => s.type === 'HeroSlider' || s.type === 'ImageSlider');
          if (sliderSection && sliderSection.config?.slides?.length > 0) {
            // Map dynamic slides to match the expected format
            const mappedSlides = sliderSection.config.slides.map((s, idx) => ({
              id: s.id || idx,
              eyebrow: s.altText || '',
              title: s.title || '',
              desktopImage: s.desktopImage || s.mobileImage || '',
              mobileImage: s.mobileImage || s.desktopImage || '',
              cta1: s.linkUrl ? { label: "Shop Now", url: s.linkUrl } : null,
              cta2: null
            }));
            setDynamicSlides(mappedSlides);
          }

          // Find the Collection Banners
          const collectionSection = layoutData.homeBuilder.find(s => s.type === 'CollectionBanners');
          if (collectionSection && collectionSection.config?.slides?.length > 0) {
            const mappedBanners = collectionSection.config.slides.map((s, idx) => ({
              id: s.id || idx,
              title: s.title || '',
              image: s.desktopImage || s.mobileImage || '',
              linkUrl: s.linkUrl || '',
            }));
            setDynamicBanners(mappedBanners);
          }
        }
      }).catch(() => {});
    });
  }, [dispatch]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
    pauseOnHover: false,
    beforeChange: (current, next) => setCurrentSlide(next),
    appendDots: dots => (
      <div style={{ position: 'absolute', bottom: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <ul style={{ margin: '0px', padding: 0, display: 'flex', gap: '8px' }}> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div
        className={`h-1 rounded-full transition-all duration-500 ${
          i === currentSlide ? 'w-12 bg-gold' : 'w-6 bg-white/40 hover:bg-white/60'
        }`}
      />
    ),
  };

  return (
    <div className="animate-fade-in bg-warm-ivory min-h-screen">
      <SEO
        title="Wear Your Story | Premium Fashion"
        description="India's premium fashion destination — shop the latest in streetwear and loungewear for Men and Women."
      />

      {/* ── 1. HERO SECTION ── */}
      <section className="relative h-screen min-h-[560px] w-full overflow-hidden bg-deep-forest">
        <Slider {...sliderSettings} className="h-full w-full">
          {dynamicSlides.map((slide, index) => (
            <div key={slide.id} className="relative h-screen min-h-[560px] w-full focus:outline-none bg-deep-forest">
              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
              <picture>
                <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                <img
                  src={slide.desktopImage || slide.image}
                  alt={slide.title || 'Banner image'}
                  className="w-full h-full object-cover opacity-80"
                />
              </picture>
              
              <div className="absolute inset-0 z-20 flex flex-col justify-end pb-32 px-6 md:px-16 max-w-7xl mx-auto">
                {slide.eyebrow && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={index === currentSlide ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <span className="inline-block text-gold font-body tracking-[0.2em] uppercase text-xs font-semibold mb-4 border-l-2 border-gold pl-3">
                      {slide.eyebrow}
                    </span>
                  </motion.div>
                )}

                {slide.title && (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={index === currentSlide ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-warm-ivory mb-10 tracking-wide drop-shadow-xl max-w-3xl">
                      {slide.title}
                    </h1>
                  </motion.div>
                )}

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={index === currentSlide ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex items-center gap-4 md:gap-6 flex-wrap"
                >
                  {slide.cta1 && (
                    <Link to={slide.cta1.url} className="group relative overflow-hidden bg-warm-ivory text-deep-forest px-8 py-4 flex items-center gap-2 font-bold tracking-[0.15em] uppercase text-xs hover:text-warm-ivory transition-colors duration-300">
                      <span className="relative z-10">{slide.cta1.label}</span>
                      <div className="absolute inset-0 bg-gold scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                    </Link>
                  )}
                  {slide.cta2 && (
                    <Link to={slide.cta2.url} className="group relative overflow-hidden border border-warm-ivory text-warm-ivory px-8 py-4 flex items-center gap-2 font-bold tracking-[0.15em] uppercase text-xs hover:border-gold hover:text-deep-forest transition-colors duration-300">
                      <span className="relative z-10">{slide.cta2.label}</span>
                      <div className="absolute inset-0 bg-gold scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="w-full bg-white border-b border-stone-gray/50 py-6 hidden md:block">
        <div className="container-custom flex items-center justify-between divide-x divide-stone-gray/30">
          <div className="flex-1 flex items-center justify-center gap-3 px-4">
            <Truck size={24} strokeWidth={1} className="text-deep-forest" />
            <span className="text-[11px] uppercase tracking-widest font-semibold text-deep-forest">Free Shipping above ₹999</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-3 px-4">
            <ShieldCheck size={24} strokeWidth={1} className="text-deep-forest" />
            <span className="text-[11px] uppercase tracking-widest font-semibold text-deep-forest">Secure Payments</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-3 px-4">
            <BadgeCheck size={24} strokeWidth={1} className="text-deep-forest" />
            <span className="text-[11px] uppercase tracking-widest font-semibold text-deep-forest">100% Authentic</span>
          </div>
        </div>
      </section>

      {/* ── 2. COLLECTION BANNERS ── */}
      <section className="w-full">
        <style>{`
          .collection-card { position: relative; min-height: 420px; overflow: hidden; cursor: pointer; display: flex; text-decoration: none; }
          @media (max-width: 767px) { .collection-card { min-height: 320px; } }
          .collection-card .card-overlay { transition: background 0.4s ease; }
          .collection-card:hover .card-overlay { background: rgba(0,0,0,0.45) !important; }
          .collection-card .explore-label { transition: transform 0.3s ease; display: inline-block; }
          .collection-card:hover .explore-label { transform: translateX(6px); }
          .collection-card .card-bg-img { transition: transform 0.7s ease; }
          .collection-card:hover .card-bg-img { transform: scale(1.05); }
        `}</style>

        <div className="grid grid-cols-1 md:grid-cols-2">

          {dynamicBanners.map((banner, index) => (
            <Link
              key={banner.id || index}
              to={banner.linkUrl}
              aria-label={`Shop ${banner.title}`}
              className="collection-card group shadow-sm hover:shadow-xl transition-shadow duration-300"
              style={{ background: '#D4CFC7' }}
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading="lazy"
                  className="card-bg-img w-full h-full object-cover"
                />
              </div>
              <div
                className="card-overlay absolute inset-0 z-10"
                style={{ background: 'rgba(0,0,0,0.3)' }}
              />
              {/* Gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

              <div className="relative z-20 flex flex-col justify-end w-full p-8 md:p-10">
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '40px',
                  fontWeight: 400,
                  color: '#fff',
                  lineHeight: 1.1,
                  marginBottom: '12px'
                }}>
                  {banner.title}
                </h2>
                <span className="explore-label" style={{
                  color: '#C8A030',
                  fontSize: '11px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  EXPLORE →
                </span>
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* ── 3. PRODUCT GRID: PELLICLE SPECIAL ── */}
      <section className="container-custom py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-stone-gray/50 pb-6 gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] text-gold uppercase mb-2 block">Our Top Picks</span>
            <h2 className="font-display text-4xl text-deep-forest tracking-wide">Pellicle Special</h2>
          </div>
          <Link to="/products" className="group inline-flex items-center gap-2 text-deep-forest font-semibold tracking-widest uppercase text-[11px] hover:text-gold transition-colors">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {['All', 'Men', 'Women', 'New Arrivals', 'On Sale'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all whitespace-nowrap
                  ${filter === f 
                    ? 'bg-deep-forest text-warm-ivory shadow-lg' 
                    : 'bg-white text-text-muted border border-stone-gray hover:border-deep-forest hover:text-deep-forest'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative flex items-center gap-3 shrink-0">
            <span className="text-[11px] font-bold tracking-widest uppercase text-text-muted hidden sm:block">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white border border-stone-gray text-deep-forest text-[11px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-full outline-none hover:border-deep-forest transition-colors cursor-pointer pr-10"
            >
              <option value="Newest">Newest</option>
              <option value="Price Low-High">Price Low-High</option>
              <option value="Price High-Low">Price High-Low</option>
              <option value="Top Rated">Top Rated</option>
            </select>
            <ChevronRight size={14} className="absolute right-4 text-deep-forest pointer-events-none rotate-90" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="bg-stone-gray/30 aspect-[3/4] rounded-2xl" />
                <div className="bg-stone-gray/30 h-4 w-2/3" />
                <div className="bg-stone-gray/30 h-4 w-1/2" />
              </div>
            ))
          ) : displayProducts.length > 0 ? (
            displayProducts.slice(0, 8).map((product, i) => (
              <motion.div 
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <ProductCard product={product} onQuickView={setQuickViewProduct} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-text-muted font-body">
              No products found matching these filters.
            </div>
          )}
        </div>
      </section>

      {/* ── 5. FEATURED LOOKBOOK ── */}
      <section className="py-24 overflow-hidden bg-white">
        <div className="container-custom mb-12">
          <h2 className="font-display text-4xl text-deep-forest tracking-wide">Lookbook</h2>
          <p className="text-charcoal/60 mt-2 font-body tracking-wide">Styling inspiration for every season.</p>
        </div>

        {/* Horizontal Scrolling Strip */}
        <div className="flex gap-4 px-4 md:px-8 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar">
          {lookbookImages.map((img, i) => (
            <div key={i} className="relative min-w-[85vw] md:min-w-[40vw] aspect-[4/5] snap-center group overflow-hidden bg-light-beige">
              <img src={img} alt={`Lookbook ${i+1}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <Link to="/products" className="bg-warm-ivory text-deep-forest px-8 py-3 font-semibold tracking-widest text-sm uppercase hover:bg-gold hover:text-white transition-colors">
                  Shop the Look
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. NEWSLETTER SECTION ── */}
      <section className="bg-deep-forest py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#c9a84c 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="container-custom relative z-10 max-w-3xl text-center">
          <Mail size={48} className="text-gold mx-auto mb-6" strokeWidth={1} />
          <h2 className="font-display text-4xl md:text-5xl text-warm-ivory mb-4 tracking-wide">Join The Club</h2>
          <p className="text-warm-ivory/70 mb-10 tracking-widest text-sm uppercase">Join 10,000+ Pelicle fans for exclusive drops & offers.</p>
          
          <form className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto" onSubmit={e => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-transparent border-b border-warm-ivory/30 text-warm-ivory px-4 py-3 outline-none focus:border-gold transition-colors placeholder:text-warm-ivory/30 font-light tracking-wide"
              required
            />
            <button type="submit" className="bg-gold text-deep-forest px-8 py-4 font-semibold tracking-widest uppercase text-sm hover:bg-warm-ivory transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <QuickViewModal product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
};

export default HomePage;
