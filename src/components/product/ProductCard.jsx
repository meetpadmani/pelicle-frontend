import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import { toggleWishlist } from '../../features/wishlist/wishlistSlice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onQuickView }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { products: wishlistItems } = useSelector(s => s.wishlist);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'Free Size');
  const [isAdding, setIsAdding] = useState(false);

  // Allow either populated objects or just IDs in wishlist array
  const isWishlisted = wishlistItems?.some(p => (p._id || p) === product._id);
  const displayPrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
  
  const imageUrl = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400';
  const hoverImageUrl = product.images?.[1]?.url || imageUrl;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    dispatch(toggleWishlist(product._id));
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (product.stock === 0) return;
    
    setIsAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1, size: selectedSize }));
    setIsAdding(false);
    toast.success('Added to bag ✓', {
      duration: 2500,
      position: 'bottom-right',
      style: { background: '#0d3d2c', color: '#fff', fontSize: '14px', borderRadius: '8px' }
    });
  };

  return (
    <Link to={`/products/${product.slug || product._id}`} className="group block h-full">
      <div className="relative bg-white rounded-xl overflow-hidden transition-all duration-500 flex flex-col h-full border border-stone-gray/20 hover:border-stone-gray/60 hover:-translate-y-1 hover:shadow-lg">
        
        {/* ── IMAGE AREA ── */}
        <div className="relative aspect-[3/4] overflow-hidden bg-light-beige">
          {/* Primary image */}
          <img
            src={imageUrl}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out
              group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />

          {/* Secondary image (Hover swap) */}
          {hoverImageUrl !== imageUrl && (
            <img
              src={hoverImageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {/* ── BADGES ── */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {discountPercent > 0 && (
              <span className="bg-jet-black text-white text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-gold text-deep-forest text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full shadow-sm">
                NEW
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-stone-gray text-charcoal text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full shadow-sm">
                SOLD OUT
              </span>
            )}
          </div>

          {/* ── WISHLIST BUTTON ── */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <Heart
              size={16}
              strokeWidth={1.5}
              fill={isWishlisted ? '#0d3d2c' : 'none'}
              className={isWishlisted ? 'text-deep-forest' : 'text-text-muted'}
            />
          </motion.button>

          {/* ── QUICK VIEW MODAL BUTTON (Desktop Overlay) ── */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView?.(product); }}
              className="bg-white/90 backdrop-blur-sm text-deep-forest text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 rounded-full hover:bg-gold hover:text-white transition-colors shadow-lg scale-95 group-hover:scale-100 duration-300"
            >
              Quick View
            </button>
          </div>

          {/* ── QUICK ADD BUTTON (Slides up) ── */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-black/60 to-transparent flex justify-center">
             <button
                onClick={handleQuickAdd}
                disabled={product.stock === 0 || isAdding}
                className={`w-full max-w-[200px] flex items-center justify-center gap-2 py-2.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all duration-300
                  ${product.stock === 0
                    ? 'bg-stone-gray/80 text-white cursor-not-allowed backdrop-blur-sm'
                    : 'bg-warm-ivory text-deep-forest hover:bg-gold hover:text-white shadow-lg'
                  }`}
              >
                {isAdding ? 'Adding...' : product.stock === 0 ? 'Sold Out' : <><Plus size={14} /> Quick Add</>}
              </button>
          </div>
        </div>

        {/* ── INFO AREA ── */}
        <div className="p-4 flex flex-col flex-1 bg-white">
          <span className="text-[10px] font-semibold tracking-widest text-text-muted uppercase mb-1">
            {product.brand || 'PELLICLE'}
          </span>
          
          <h3 className="font-body text-[14px] font-semibold text-deep-forest line-clamp-1 mb-2 group-hover:text-gold transition-colors">
            {product.name}
          </h3>

          {/* Size Chips */}
          {product.sizes?.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3" onClick={e => e.preventDefault()}>
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSize(size); }}
                  className={`w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors border
                    ${selectedSize === size 
                      ? 'bg-deep-forest text-white border-deep-forest' 
                      : 'bg-transparent text-text-muted border-stone-gray hover:border-deep-forest hover:text-deep-forest'
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between">
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-deep-forest">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              {discountPercent > 0 && (
                <span className="text-[11px] text-text-muted line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-1">
              <Star size={12} className="text-gold fill-gold" />
              <span className="text-[11px] font-medium text-text-muted">{product.ratings > 0 ? product.ratings.toFixed(1) : 'New'}</span>
              {product.numReviews > 0 && (
                <span className="text-[10px] text-stone-gray">({product.numReviews})</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default ProductCard;
