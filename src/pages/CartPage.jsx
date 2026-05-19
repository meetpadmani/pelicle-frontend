import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon } from '../features/cart/cartSlice';
import { couponsAPI } from '../services/api';
import SEO from '../components/common/SEO';
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, totalItems, couponApplied, discountAmount } = useSelector(s => s.cart);
  const { isAuthenticated } = useSelector(s => s.auth);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  const shippingPrice = totalPrice > 999 ? 0 : 99;
  const taxAmount = Math.round(totalPrice * 0.05);
  const finalTotal = totalPrice + shippingPrice + taxAmount - (discountAmount || 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    setCouponLoading(true);
    try {
      const res = await couponsAPI.validate({ code: couponCode, cartTotal: totalPrice });
      dispatch(applyCoupon({ coupon: res.data.coupon, discountAmount: res.data.discountAmount }));
      toast.success(`Coupon applied! Saved ₹${res.data.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Please login to view cart</h2>
        <Link to="/login" className="btn-primary inline-flex">Login</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-deep-forest mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Add some items to get started!</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          <ShoppingBag size={18} /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-10 animate-fade-in">
      <SEO title="Shopping Cart" description="Review your cart and checkout securely at PELLICLE." noIndex url="/cart" />
      <h1 className="text-2xl font-bold text-deep-forest mb-8">Shopping Cart ({totalItems} items)</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const img = item.product?.images?.[0]?.url || '';
            const p = item.product;
            return (
              <div key={item._id} className="card p-4 flex gap-4 animate-fade-in">
                <Link to={`/products/${p?.slug || p?._id}`} className="w-28 h-36 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={img} alt={p?.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{p?.brand}</p>
                      <Link to={`/products/${p?.slug || p?._id}`} className="font-semibold text-deep-forest text-sm hover:text-olive-green line-clamp-2">{p?.name}</Link>
                    </div>
                    <button onClick={() => dispatch(removeFromCart(item._id))} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex gap-3 mt-2">
                    {item.size && <span className="badge bg-gray-100 text-gray-600">Size: {item.size}</span>}
                    {item.color?.name && <span className="badge bg-gray-100 text-gray-600">{item.color.name}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button onClick={() => item.quantity > 1 ? dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 })) : dispatch(removeFromCart(item._id))}
                        className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"><Minus size={14} /></button>
                      <span className="px-3 py-1.5 text-sm font-semibold border-x border-gray-300">{item.quantity}</span>
                      <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                        className="px-2.5 py-1.5 hover:bg-gray-100 transition-colors"><Plus size={14} /></button>
                    </div>
                    <span className="font-bold text-deep-forest">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-deep-forest text-lg mb-5">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-5">
              {couponApplied ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2 text-green-700">
                    <Tag size={15} />
                    <span className="text-sm font-semibold">{couponApplied.code}</span>
                    <span className="text-xs">(-₹{discountAmount})</span>
                  </div>
                  <button onClick={() => dispatch(removeCoupon())}><X size={16} className="text-green-600" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code" className="input-field text-sm py-2.5" id="coupon-input" />
                  <button onClick={handleApplyCoupon} disabled={couponLoading}
                    className="bg-deep-forest text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-olive-green transition-colors whitespace-nowrap disabled:opacity-50">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span><span>-₹{discountAmount}</span></div>}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? <span className="text-green-600 font-medium">FREE</span> : `₹${shippingPrice}`}</span>
              </div>
              <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{taxAmount}</span></div>
              <div className="flex justify-between font-bold text-deep-forest text-base border-t border-gray-100 pt-3">
                <span>Total</span><span>₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-5 flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <Link to="/products" className="block text-center text-sm text-olive-green hover:text-olive-green mt-3">Continue Shopping</Link>

            {totalPrice <= 999 && (
              <p className="text-xs text-gray-400 text-center mt-4">
                Add ₹{(999 - totalPrice + 1).toLocaleString('en-IN')} more for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
