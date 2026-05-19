import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetail } from '../features/products/productsSlice';
import { addToCart } from '../features/cart/cartSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { productsAPI, reviewsAPI } from '../services/api';
import SEO from '../components/common/SEO';
import { Heart, ShoppingBag, Star, Truck, Shield, RefreshCw, ChevronRight, Minus, Plus, Check } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedProduct: product, detailLoading } = useSelector(s => s.products);
  const { isAuthenticated } = useSelector(s => s.auth);
  const { products: wishlistItems } = useSelector(s => s.wishlist);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  const isWishlisted = wishlistItems?.some(p => (p._id || p) === product?._id);

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductDetail(slug));
      window.scrollTo(0, 0);
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (product?._id) {
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || null);
      setActiveImage(0);
      productsAPI.getRelated(product._id).then(r => setRelated(r.data.products)).catch(() => {});
      reviewsAPI.getByProduct(product._id).then(r => setReviews(r.data.reviews)).catch(() => {});
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!selectedSize && product.sizes?.length > 0) { alert('Please select a size'); return; }
    dispatch(addToCart({ productId: product._id, quantity, size: selectedSize, color: selectedColor }));
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!selectedSize && product.sizes?.length > 0) { alert('Please select a size'); return; }
    handleAddToCart();
    navigate('/cart');
  };

  if (detailLoading) return <LoadingSpinner fullScreen />;
  if (!product) return (
    <div className="container-custom py-20 text-center">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
    </div>
  );

  const displayPrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const highlights = [
    { icon: '🧵', label: 'Fabric', value: product.fabric },
    { icon: '👔', label: 'Fit', value: product.fit },
    { icon: '🏷️', label: 'Pattern', value: product.pattern },
    { icon: '👗', label: 'Category', value: product.subCategory },
    { icon: '🌍', label: 'Origin', value: product.countryOfOrigin },
    { icon: '🎯', label: 'Occasion', value: product.occasion?.join(', ') }
  ].filter(h => h.value && h.value.length > 0);

  return (
    <div className="animate-fade-in bg-[#F5F0E8] min-h-screen pb-20">
      <SEO
        title={product.name}
        description={product.description?.substring(0, 160) || `Buy ${product.name} from PELLICLE. Premium quality ${product.gender || ''} fashion.`}
        keywords={`${product.name}, ${product.brand}, ${product.gender}, pellicle, buy online`}
        image={product.images?.[0]?.url}
        url={`/products/${slug}`}
        type="product"
        product={{
          name: product.name,
          description: product.description,
          image: product.images?.[0]?.url,
          price: displayPrice,
          currency: 'INR',
          availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
          brand: product.brand,
          sku: product.sku,
          rating: product.ratings,
          reviewCount: product.numReviews,
        }}
      />
      
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <a href="/" className="hover:text-[#4A5E3A]">Home</a>
          <ChevronRight size={14} />
          <a href="/products" className="hover:text-[#4A5E3A]">Products</a>
          <ChevronRight size={14} />
          <span className="text-[#1A1A1A] font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          
          {/* SECTION 1 — PRODUCT IMAGES */}
          <div className="flex flex-col-reverse lg:flex-row gap-4">
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:w-20 shrink-0 pb-2 lg:pb-0 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square w-20 lg:w-full rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === i ? 'border-[#4A5E3A]' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover bg-white" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-gray-100 group">
              <img 
                src={product.images?.[activeImage]?.url} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              {product.images?.length > 0 && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                  {activeImage + 1} / {product.images.length}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2 — PRODUCT INFO */}
          <div className="flex flex-col">
            {/* Brand */}
            {product.brand && (
              <div className="mb-3">
                <span className="bg-[#4A5E3A]/10 text-[#4A5E3A] px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider">
                  {product.brand}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h1 className="font-heading text-2xl md:text-[32px] font-bold text-[#1A1A1A] leading-tight mb-3">
              {product.name}
            </h1>
            
            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center bg-white px-2 py-1 rounded-full border border-gray-200">
                <Star size={14} className="text-[#4A5E3A] fill-[#4A5E3A]" />
                <span className="text-sm font-bold ml-1 text-[#1A1A1A]">{product.ratings?.toFixed(1) || '0.0'}</span>
              </div>
              <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-[#1A1A1A]">
                ({product.numReviews || 0} reviews)
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <Check size={12} /> Verified
              </span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-8">
              <span className="text-3xl font-bold text-[#1A1A1A]">₹{displayPrice.toLocaleString('en-IN')}</span>
              {discountPercent > 0 && (
                <>
                  <span className="text-gray-400 text-lg line-through mb-0.5">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="bg-green-100 text-green-700 rounded-full px-2.5 py-1 text-xs font-bold mb-1">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>

            <hr className="border-gray-200 mb-6" />

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#1A1A1A]">
                    Color: <span className="font-medium text-gray-600 ml-1">{selectedColor?.name}</span>
                  </p>
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedColor(color)} 
                      title={color.name}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor?.name === color.name 
                          ? 'border-white ring-2 ring-offset-2 ring-[#4A5E3A] scale-110 shadow-sm' 
                          : 'border-gray-200 hover:scale-105 hover:shadow-sm'
                      }`}
                      style={{ backgroundColor: color.hex }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#1A1A1A]">
                    Size: <span className="font-medium text-gray-600 ml-1">{selectedSize || 'Select a size'}</span>
                  </p>
                  <button className="text-xs text-[#4A5E3A] font-medium underline underline-offset-4 hover:text-[#1A1A1A]">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map(size => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all
                        ${selectedSize === size 
                          ? 'bg-[#4A5E3A] text-white border-[#4A5E3A] shadow-sm' 
                          : 'bg-white border-gray-200 hover:border-[#4A5E3A] text-gray-700 hover:text-[#4A5E3A]'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-sm font-bold text-[#1A1A1A] mb-3">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3.5 py-2.5 hover:bg-gray-50 text-gray-600 transition-colors"><Minus size={16} /></button>
                  <span className="w-10 text-center text-sm font-bold text-[#1A1A1A]">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3.5 py-2.5 hover:bg-gray-50 text-gray-600 transition-colors"><Plus size={16} /></button>
                </div>
                {product.stock > 0 ? (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {product.stock} in stock
                  </div>
                ) : (
                  <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">Out of stock</span>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3 mb-8">
              <button 
                onClick={handleAddToCart} 
                disabled={product.stock === 0}
                className="flex-1 border-2 border-[#4A5E3A] text-[#4A5E3A] hover:bg-[#4A5E3A] hover:text-white rounded-xl py-3.5 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button 
                onClick={handleBuyNow} 
                disabled={product.stock === 0}
                className="flex-1 bg-[#4A5E3A] text-white hover:bg-[#3A4A2E] rounded-xl py-3.5 text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button 
                onClick={() => dispatch(toggleWishlist(product._id))}
                className={`w-14 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all bg-white
                  ${isWishlisted ? 'border-red-200 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'}`}
              >
                <Heart size={22} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'scale-110' : ''} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'Above ₹999' },
                { icon: Shield, label: 'Authentic', sub: '100% genuine' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-3.5 text-center flex flex-col items-center gap-1 hover:shadow-sm transition-shadow">
                  <Icon size={20} className="text-[#4A5E3A] mb-1" />
                  <p className="text-xs font-bold text-[#1A1A1A]">{label}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{sub}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* SECTION 3 — PRODUCT HIGHLIGHTS BAR */}
        {highlights.length > 0 && (
          <div className="mt-12 mb-8">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">Product Highlights</h3>
            <div className="flex flex-wrap gap-2.5">
              {highlights.map(h => (
                <span key={h.label} className="flex items-center gap-2 text-xs font-semibold bg-white border border-gray-200 rounded-full px-3.5 py-2 text-gray-700 shadow-sm hover:border-[#4A5E3A] transition-colors cursor-default">
                  <span>{h.icon}</span> 
                  <span className="text-gray-400">{h.label}:</span> 
                  <span className="text-[#1A1A1A]">{h.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4 — TABS */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide px-4 sm:px-8 pt-4">
            {['description', 'details', 'reviews'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-6 pb-4 text-sm capitalize border-b-2 transition-all whitespace-nowrap
                  ${activeTab === tab 
                    ? 'border-[#4A5E3A] text-[#4A5E3A] font-bold' 
                    : 'border-transparent text-gray-400 hover:text-gray-600 font-semibold'
                  }`}
              >
                {tab} {tab === 'reviews' && `(${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 min-h-[300px]">
            {activeTab === 'description' && (
              <div className="max-w-3xl animate-fade-in">
                <div className="prose max-w-none text-gray-600 leading-relaxed text-sm md:text-base">
                  <p>{product.description}</p>
                </div>
                
                {product.benefits && product.benefits.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold text-[#1A1A1A] mb-4 text-lg">Key Features</h3>
                    <div className="space-y-3">
                      {product.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#4A5E3A]/10 text-[#4A5E3A] flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={12} strokeWidth={3} />
                          </span>
                          <span className="text-sm md:text-base text-gray-600 font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="max-w-3xl animate-fade-in">
                <h3 className="font-bold text-[#1A1A1A] mb-6 text-lg">Product Specifications</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-1 bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                  {[
                    { label: 'Brand', value: product.brand },
                    { label: 'Style Code', value: product.styleCode },
                    { label: 'Fabric', value: product.fabric },
                    { label: 'Fit', value: product.fit },
                    { label: 'Sleeve Type', value: product.sleeve },
                    { label: 'Pattern', value: product.pattern },
                    { label: 'Occasion', value: product.occasion?.join(', ') },
                    { label: 'Gender', value: product.gender },
                    { label: 'Sub Category', value: product.subCategory },
                    { label: 'Country of Origin', value: product.countryOfOrigin },
                  ].filter(item => item.value).map(item => (
                    <div key={item.label} className="flex flex-col gap-1 py-3 border-b border-gray-200/60 last:border-0 sm:even:last:border-b-0 sm:last:border-0">
                      <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">{item.label}</span>
                      <span className="text-sm font-semibold text-[#1A1A1A]">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                {product.washCare && product.washCare.length > 0 && (
                  <div className="mt-8 bg-blue-50/50 rounded-xl p-6 border border-blue-100/50">
                    <h3 className="font-bold text-[#1A1A1A] mb-4 text-sm flex items-center gap-2">
                      <span className="text-xl">🧺</span> Wash & Care Instructions
                    </h3>
                    <ul className="space-y-2.5">
                      {product.washCare.map((instruction, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4A5E3A] shrink-0 mt-2" />
                          <span className="flex-1">{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl font-heading font-bold text-[#1A1A1A]">
                      {product.ratings?.toFixed(1) || '0.0'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18} className={i < Math.round(product.ratings || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                      <p className="text-sm font-medium text-gray-500">Based on {product.numReviews || 0} reviews</p>
                    </div>
                  </div>
                  <button className="px-6 py-2.5 rounded-xl border-2 border-[#4A5E3A] text-[#4A5E3A] font-bold text-sm hover:bg-[#4A5E3A] hover:text-white transition-colors">
                    Write a Review
                  </button>
                </div>

                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl">
                      <p className="text-4xl mb-3">⭐</p>
                      <h4 className="text-lg font-bold text-[#1A1A1A] mb-1">No reviews yet</h4>
                      <p className="text-sm text-gray-500">Be the first to share your thoughts on this product!</p>
                    </div>
                  ) : reviews.map(r => (
                    <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#4A5E3A]/10 text-[#4A5E3A] flex items-center justify-center font-bold text-sm">
                            {r.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#1A1A1A] text-sm">{r.user?.name}</span>
                              {r.isVerifiedPurchase && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-uppercase tracking-wider">
                                  <Check size={10} /> VERIFIED
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 font-medium">
                              {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex bg-gray-50 px-2 py-1 rounded-lg">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                      </div>
                      {r.title && <p className="font-bold text-sm text-[#1A1A1A] mb-1.5">{r.title}</p>}
                      <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5 — SIMILAR PRODUCTS */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-heading font-bold text-[#1A1A1A]">You May Also Like</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#4A5E3A] hover:text-[#4A5E3A] transition-colors"><ChevronRight size={18} className="rotate-180" /></button>
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#4A5E3A] hover:text-[#4A5E3A] transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>
            
            <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {related.map(p => {
                const pDisplayPrice = p.discountPrice || p.price;
                return (
                  <div key={p._id} className="w-[240px] shrink-0 group">
                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300">
                      <a href={`/products/${p.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
                        <img 
                          src={p.images?.[0]?.url || '/placeholder.png'} 
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <button className="w-full bg-white text-[#1A1A1A] hover:bg-[#4A5E3A] hover:text-white font-bold text-sm py-2.5 rounded-xl transition-colors shadow-sm">
                            View Details
                          </button>
                        </div>
                      </a>
                      <div className="p-4">
                        {p.brand && <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{p.brand}</p>}
                        <a href={`/products/${p.slug}`} className="block">
                          <h3 className="text-sm font-bold text-[#1A1A1A] line-clamp-1 mb-1.5 group-hover:text-[#4A5E3A] transition-colors">{p.name}</h3>
                        </a>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1A1A1A]">₹{pDisplayPrice.toLocaleString('en-IN')}</span>
                          {p.discountPrice && p.price > p.discountPrice && (
                            <span className="text-[11px] text-gray-400 line-through">₹{p.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
