import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import SEO from '../components/common/SEO';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORY_MAP = {
  Men:   ['All', 'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Ethnic Wear', 'Kurta', 'Blazer', 'Shorts', 'Activewear', 'Innerwear', 'Accessories'],
  Women: ['All', 'Tops', 'Kurtas', 'Sarees', 'Jeans', 'Dresses', 'Lehengas', 'Skirts', 'Blazers', 'Activewear', 'Innerwear', 'Accessories', 'Co-ord Sets', 'Jumpsuits'],
};

const SORT_OPTIONS = [
  { label: 'Newest First',       value: 'newest'     },
  { label: 'Price: Low → High',  value: 'price-asc'  },
  { label: 'Price: High → Low',  value: 'price-desc' },
  { label: 'Top Rated',          value: 'rating'     },
];

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`;

const getSortedProducts = (products, sort) => {
  const s = [...products];
  if (sort === 'price-asc')  return s.sort((a,b) => (a.discountPrice||a.price)-(b.discountPrice||b.price));
  if (sort === 'price-desc') return s.sort((a,b) => (b.discountPrice||b.price)-(a.discountPrice||a.price));
  if (sort === 'rating')     return s.sort((a,b) => (b.ratings||0)-(a.ratings||0));
  return s.sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt));
};

/* ── Skeleton Card ── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 animate-pulse">
    <div className="aspect-[3/4] bg-gradient-to-br from-[#ede8df] to-[#d9d9d6]" />
    <div className="p-3 space-y-2">
      <div className="h-2.5 w-16 bg-gray-200 rounded-full" />
      <div className="h-3.5 w-full bg-gray-200 rounded-full" />
      <div className="h-3 w-2/3 bg-gray-200 rounded-full" />
      <div className="h-4 w-1/2 bg-gray-200 rounded-full mt-1" />
    </div>
  </div>
);

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const initialGender = searchParams.get('gender') === 'Women' ? 'Women' : 'Men';

  const [mainCategory,       setMainCategory]       = useState(initialGender);
  const [selectedSub,        setSelectedSub]        = useState('All');
  const [sortBy,             setSortBy]             = useState('newest');
  const [priceLimit,         setPriceLimit]         = useState(10000);
  const [search,             setSearch]             = useState('');
  const [mobileFilter,       setMobileFilter]       = useState(false);
  const [allProducts,        setAllProducts]        = useState([]);
  const [loading,            setLoading]            = useState(true);
  const subScrollRef = useRef(null);

  /* fetch */
  useEffect(() => {
    setLoading(true);
    productsAPI.getAll({ gender: mainCategory, limit: 200 })
      .then(res => setAllProducts(res.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mainCategory]);

  /* reset subcategory when gender changes */
  useEffect(() => { setSelectedSub('All'); }, [mainCategory]);

  const visibleSubs = CATEGORY_MAP[mainCategory];

  const subcatProducts = useMemo(() => {
    if (selectedSub === 'All') return allProducts;
    return allProducts.filter(p => p.subCategory === selectedSub);
  }, [allProducts, selectedSub]);

  const catalogMax = useMemo(() => {
    if (!subcatProducts.length) return 10000;
    return Math.max(...subcatProducts.map(p => p.discountPrice || p.price));
  }, [subcatProducts]);

  useEffect(() => { setPriceLimit(catalogMax); }, [catalogMax]);

  const filteredProducts = useMemo(() => {
    let list = subcatProducts.filter(p => (p.discountPrice || p.price) <= priceLimit);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    return getSortedProducts(list, sortBy);
  }, [priceLimit, sortBy, subcatProducts, search]);

  const resetFilters = () => { setPriceLimit(catalogMax); setSearch(''); setSortBy('newest'); };

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-zinc-950 animate-fade-in">
      <SEO
        title={`${mainCategory} Fashion — ${selectedSub !== 'All' ? selectedSub : 'All Categories'}`}
        description={`Shop the latest ${mainCategory} ${selectedSub} collection at Pellicle.`}
        url={`/products?gender=${mainCategory}`}
      />

      {/* ── HERO HEADER ── */}
      <section className="bg-[#0F1F17] text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #6B7A4D 0%, transparent 60%)' }} />
        <div className="container-custom py-8 md:py-12 relative z-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#A7B897] mb-2">
            Pellicle Collection
          </p>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#F4F1EB] leading-tight">
            {mainCategory === 'Women' ? 'Women\'s Fashion' : 'Men\'s Fashion'}
          </h1>
          <p className="text-[#A7B897] text-sm mt-2">
            {filteredProducts.length} styles curated for you
          </p>
        </div>
      </section>

      {/* ── STICKY NAV BAR ── */}
      <div className="sticky top-[60px] sm:top-[100px] z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="container-custom">

          {/* Gender tabs */}
          <div className="flex items-center gap-6 border-b border-gray-100">
            {['Men', 'Women'].map(g => (
              <button
                key={g}
                onClick={() => setMainCategory(g)}
                className={`relative py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                  mainCategory === g ? 'text-[#0F1F17]' : 'text-gray-400 hover:text-[#0F1F17]'
                }`}
              >
                {g}
                <span className={`absolute inset-x-0 -bottom-px h-0.5 bg-[#6B7A4D] transition-transform origin-left ${
                  mainCategory === g ? 'scale-x-100' : 'scale-x-0'
                }`} />
              </button>
            ))}

            {/* Mobile filter trigger */}
            <button
              onClick={() => setMobileFilter(true)}
              className="ml-auto md:hidden flex items-center gap-1.5 text-xs font-semibold text-[#0F1F17] py-3"
            >
              <SlidersHorizontal size={14} />
              Filter & Sort
            </button>
          </div>

          {/* Subcategory scroll row */}
          <div ref={subScrollRef} className="flex gap-1 overflow-x-auto py-2.5 scrollbar-hide">
            {visibleSubs.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSub(sub)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all flex-shrink-0 ${
                  selectedSub === sub
                    ? 'bg-[#0F1F17] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <main className="container-custom py-5 md:py-8">

        {/* Desktop filter bar */}
        <div className="hidden md:flex items-center gap-4 mb-6 bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search in collection..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50
                focus:outline-none focus:border-[#6B7A4D] focus:ring-2 focus:ring-[#6B7A4D]/15 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Price */}
          <label className="flex-1 max-w-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1"><SlidersHorizontal size={12} /> Price</span>
              <span className="text-[#0F1F17]">{fmt(priceLimit)}</span>
            </div>
            <input type="range" min={0} max={catalogMax} step={100}
              value={priceLimit} onChange={e => setPriceLimit(+e.target.value)}
              className="w-full h-1.5 cursor-pointer accent-[#6B7A4D] rounded-full" />
          </label>

          {/* Sort */}
          <label className="w-48">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <ArrowUpDown size={12} /> Sort
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm font-semibold
                  text-[#111] focus:outline-none focus:border-[#6B7A4D] focus:ring-2 focus:ring-[#6B7A4D]/15 appearance-none transition"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </label>

          {/* Count & Reset */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm font-bold text-[#0F1F17]">{filteredProducts.length} products</span>
            {(search || priceLimit < catalogMax || sortBy !== 'newest') && (
              <button onClick={resetFilters}
                className="text-[11px] font-semibold text-red-500 hover:text-red-600 bg-red-50 rounded-lg px-3 py-1.5 transition">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-3xl">
              🛍️
            </div>
            <p className="text-lg font-bold text-[#0F1F17] mb-1">No products found</p>
            <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search term.</p>
            <button onClick={resetFilters}
              className="bg-[#0F1F17] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#1a3020] transition">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* ── MOBILE FILTER DRAWER ── */}
      {mobileFilter && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileFilter(false)} />
          <div className="relative mt-auto w-full bg-white rounded-t-3xl shadow-2xl p-5 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F1F17]">Filter & Sort</h3>
              <button onClick={() => setMobileFilter(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Search</p>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#6B7A4D]" />
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <span>Max Price</span>
                <span className="text-[#0F1F17]">{fmt(priceLimit)}</span>
              </div>
              <input type="range" min={0} max={catalogMax} step={100}
                value={priceLimit} onChange={e => setPriceLimit(+e.target.value)}
                className="w-full h-2 accent-[#6B7A4D]" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>₹0</span><span>{fmt(catalogMax)}</span>
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Sort By</p>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(o => (
                  <button key={o.value} onClick={() => setSortBy(o.value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-semibold border transition ${
                      sortBy === o.value
                        ? 'bg-[#0F1F17] text-white border-[#0F1F17]'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Apply */}
            <div className="flex gap-3 pt-2">
              <button onClick={resetFilters}
                className="flex-1 py-3 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-400 transition">
                Reset
              </button>
              <button onClick={() => setMobileFilter(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#0F1F17] text-white hover:bg-[#1a3020] transition">
                Show {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
