import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../features/orders/ordersSlice';
import SEO from '../components/common/SEO';
import { MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, discountAmount, couponApplied } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const { createLoading } = useSelector(s => s.orders);

  const shippingPrice = totalPrice > 999 ? 0 : 99;
  const taxAmount = Math.round(totalPrice * 0.05);
  const finalTotal = totalPrice + shippingPrice + taxAmount - (discountAmount || 0);

  const [address, setAddress] = useState(
    user?.addresses?.find(a => a.isDefault) || {
      fullName: user?.name || '', phone: user?.phone || '',
      line1: '', line2: '', city: '', state: '', pincode: '', country: 'India',
    }
  );
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [step, setStep] = useState(1);

  const handlePlaceOrder = async () => {
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      alert('Please fill all required address fields'); return;
    }
    const result = await dispatch(createOrder({
      shippingAddress: address, paymentMethod,
      couponCode: couponApplied?.code,
    }));
    if (result.payload?._id) {
      navigate(`/order-confirm/${result.payload._id}`);
    }
  };

  const states = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

  return (
    <div className="container-custom py-10 animate-fade-in">
      <SEO title="Checkout" description="Complete your purchase securely at PELLICLE." noIndex url="/checkout" />
      <h1 className="text-2xl font-bold text-deep-forest mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[{ n: 1, label: 'Address', icon: MapPin }, { n: 2, label: 'Payment', icon: CreditCard }, { n: 3, label: 'Review', icon: CheckCircle }].map(({ n, label, icon: Icon }) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
              ${step >= n ? 'bg-olive-green text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step >= n ? 'text-deep-forest' : 'text-gray-400'}`}>{label}</span>
            {n < 3 && <div className={`h-px w-8 sm:w-16 ${step > n ? 'bg-olive-green' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg text-deep-forest mb-5 flex items-center gap-2"><MapPin size={20} className="text-olive-green" /> Delivery Address</h2>
              {user?.addresses?.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-deep-forest mb-3">Saved Addresses</p>
                  <div className="space-y-2">
                    {user.addresses.map(a => (
                      <label key={a._id} className={`flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${JSON.stringify(address) === JSON.stringify(a) ? 'border-olive-green bg-light-beige' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="savedAddr" onChange={() => setAddress(a)} className="mt-1 accent-brand-600" defaultChecked={a.isDefault} />
                        <div className="text-sm">
                          <p className="font-semibold">{a.fullName} · {a.phone}</p>
                          <p className="text-gray-500">{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-deep-forest mt-5 mb-3">Or Add New Address</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
                  <input className="input-field" value={address.fullName} onChange={e => setAddress(a => ({ ...a, fullName: e.target.value }))} /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Phone *</label>
                  <input className="input-field" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} /></div>
                <div className="sm:col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">Address Line 1 *</label>
                  <input className="input-field" value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} placeholder="House no, street name" /></div>
                <div className="sm:col-span-2"><label className="text-xs font-semibold text-gray-600 mb-1 block">Address Line 2</label>
                  <input className="input-field" value={address.line2} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))} placeholder="Landmark, area (optional)" /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">City *</label>
                  <input className="input-field" value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} /></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">State *</label>
                  <select className="input-field" value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}>
                    <option value="">Select state</option>
                    {states.map(s => <option key={s}>{s}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-gray-600 mb-1 block">Pincode *</label>
                  <input className="input-field" value={address.pincode} onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))} /></div>
              </div>
              <button onClick={() => setStep(2)} className="btn-primary mt-6 w-full sm:w-auto px-10">Continue to Payment</button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg text-deep-forest mb-5 flex items-center gap-2"><CreditCard size={20} className="text-olive-green" /> Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                  { id: 'razorpay', label: 'Razorpay', desc: 'UPI, Cards, Net Banking, Wallets', icon: '💳' },
                ].map(method => (
                  <label key={method.id} className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
                    ${paymentMethod === method.id ? 'border-olive-green bg-light-beige' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)} className="accent-brand-600" />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold text-deep-forest">{method.label}</p>
                      <p className="text-sm text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-secondary px-6">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary px-10">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card p-6">
              <h2 className="font-bold text-lg text-deep-forest mb-5 flex items-center gap-2"><CheckCircle size={20} className="text-olive-green" /> Review Order</h2>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-deep-forest mb-1 flex items-center gap-2"><MapPin size={14} className="text-olive-green" /> Delivery to</p>
                <p className="text-sm text-gray-600">{address.fullName} · {address.phone}</p>
                <p className="text-sm text-gray-500">{address.line1}, {address.city}, {address.state} - {address.pincode}</p>
              </div>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item._id} className="flex items-center gap-3">
                    <img src={item.product?.images?.[0]?.url} alt="" className="w-12 h-16 rounded-lg object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-deep-forest line-clamp-1">{item.product?.name}</p>
                      <p className="text-gray-400">Size: {item.size} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-deep-forest text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="btn-secondary px-6">Back</button>
                <button onClick={handlePlaceOrder} disabled={createLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {createLoading ? 'Placing Order...' : '🎉 Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit sticky top-24">
          <h3 className="font-bold text-deep-forest mb-4">Price Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Items ({items.length})</span><span>₹{totalPrice.toLocaleString('en-IN')}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discountAmount}</span></div>}
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shippingPrice === 0 ? <span className="text-green-600">FREE</span> : `₹${shippingPrice}`}</span></div>
            <div className="flex justify-between text-gray-600"><span>GST</span><span>₹{taxAmount}</span></div>
            <div className="flex justify-between font-bold text-deep-forest border-t border-gray-100 pt-2 text-base"><span>Total</span><span>₹{finalTotal.toLocaleString('en-IN')}</span></div>
          </div>
          {discountAmount > 0 && <p className="mt-3 text-xs text-green-600 bg-green-50 rounded-lg p-2 text-center">🎉 You save ₹{discountAmount} on this order!</p>}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
