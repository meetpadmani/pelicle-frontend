import React, { useState } from 'react';
import { X, Star, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import toast from 'react-hot-toast';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Free Size');
  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  if (!product || !isOpen) return null;

  const displayPrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast('Please login to add items to cart', { icon: '🔒' });
      return;
    }
    setIsAdding(true);
    await dispatch(addToCart({ productId: product._id, quantity: 1, size: selectedSize }));
    setIsAdding(false);
    toast.success('Added to bag ✓', {
      duration: 2500,
      position: 'bottom-right',
      style: { background: '#0d3d2c', color: '#fff', fontSize: '14px', borderRadius: '8px' }
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-stone-gray transition-colors"
              >
                <X size={20} className="text-deep-forest" />
              </button>

              {/* ── Left: Image Gallery ── */}
              <div className="w-full md:w-1/2 bg-light-beige p-6 flex flex-col">
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-4">
                  <img
                    src={product.images?.[activeImage]?.url || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {discountPercent > 0 && (
                    <span className="absolute top-4 left-4 bg-jet-black text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                {/* Thumbnails */}
                {product.images?.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-16 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          activeImage === idx ? 'border-deep-forest' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Right: Details ── */}
              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
                <span className="text-[11px] font-bold tracking-[0.2em] text-text-muted uppercase mb-2">
                  {product.brand || 'PELLICLE'}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-deep-forest mb-4">
                  {product.name}
                </h2>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < Math.round(product.ratings || 5) ? '#c9a55a' : 'none'} className={i < Math.round(product.ratings || 5) ? 'text-gold' : 'text-stone-gray'} />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted font-medium ml-1">({product.numReviews || 0} reviews)</span>
                </div>

                <div className="flex items-end gap-3 mb-8 pb-8 border-b border-stone-gray/30">
                  <span className="text-2xl font-bold text-deep-forest">₹{displayPrice.toLocaleString('en-IN')}</span>
                  {discountPercent > 0 && (
                    <span className="text-sm text-text-muted line-through mb-1">₹{product.price.toLocaleString('en-IN')}</span>
                  )}
                </div>

                {/* Color Swatches (Static visual only if no variants) */}
                <div className="mb-6">
                  <span className="block text-[11px] font-bold tracking-widest text-deep-forest uppercase mb-3">Color</span>
                  <div className="flex items-center gap-3">
                    <button className="w-8 h-8 rounded-full bg-[#0a1f14] border-2 border-deep-forest outline outline-offset-2 outline-1 outline-stone-gray" />
                    <button className="w-8 h-8 rounded-full bg-[#f5f0e8] border border-stone-gray/30" />
                    <button className="w-8 h-8 rounded-full bg-[#607D8B]" />
                  </div>
                </div>

                {/* Size Selector */}
                {product.sizes?.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold tracking-widest text-deep-forest uppercase">Size</span>
                      <button className="text-[11px] font-semibold text-text-muted hover:text-deep-forest underline flex items-center gap-1">
                        <Ruler size={12} /> Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[48px] h-10 px-3 rounded-lg text-[12px] font-bold flex items-center justify-center transition-all border
                            ${selectedSize === size
                              ? 'bg-deep-forest text-white border-deep-forest'
                              : 'bg-transparent text-text-muted border-stone-gray hover:border-deep-forest hover:text-deep-forest'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isAdding}
                    className={`w-full py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all
                      ${product.stock === 0 
                        ? 'bg-stone-gray text-white cursor-not-allowed' 
                        : 'bg-deep-forest text-warm-ivory hover:bg-gold shadow-lg hover:shadow-gold/30 hover:-translate-y-1'
                      }`}
                  >
                    {isAdding ? 'Adding to Cart...' : product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                  </button>
                  <p className="text-center text-[10px] font-semibold tracking-widest text-text-muted uppercase mt-4 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> {product.stock > 0 ? 'In Stock — Ready to ship' : 'Out of stock'}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
