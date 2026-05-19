import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../features/orders/ordersSlice';
import SEO from '../components/common/SEO';
import { CheckCircle, Package, Truck, MapPin, Clock } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const statusSteps = ['pending','processing','shipped','delivered'];

const OrderConfirmPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedOrder: order, loading } = useSelector(s => s.orders);

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [id, dispatch]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="container-custom py-20 text-center"><p>Order not found.</p></div>;

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="container-custom py-10 max-w-3xl animate-fade-in">
      <SEO title="Order Confirmed" description="Your order has been placed successfully. Thank you for shopping with PELLICLE!" noIndex />
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-deep-forest mb-2">Order Confirmed! 🎉</h1>
        <p className="text-gray-500">Thank you for shopping with PELLICLE</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
          <Package size={14} className="text-olive-green" />
          <span className="text-sm font-semibold text-deep-forest">Order #{order.orderNumber}</span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-deep-forest mb-5">Order Status</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-8">
            <div className="h-full bg-olive-green transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
          </div>
          {statusSteps.map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2 relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${i <= currentStep ? 'bg-olive-green border-olive-green text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className={`text-xs capitalize font-medium ${i <= currentStep ? 'text-olive-green' : 'text-gray-400'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Delivery Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-deep-forest mb-3 flex items-center gap-2"><MapPin size={16} className="text-olive-green"/>Delivery Address</h3>
          <p className="text-sm text-gray-700 font-medium">{order.shippingAddress?.fullName}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.phone}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.line1}, {order.shippingAddress?.city}</p>
          <p className="text-sm text-gray-500">{order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
          {order.estimatedDelivery && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
              <Clock size={14} /> Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          )}
        </div>
        {/* Payment Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-deep-forest mb-3">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium capitalize">{order.payment?.method}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span>
              <span className={`font-medium capitalize ${order.payment?.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{order.payment?.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.itemsPrice?.toLocaleString('en-IN')}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discountAmount}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
            <div className="flex justify-between font-bold text-deep-forest border-t pt-2"><span>Total</span><span>₹{order.totalAmount?.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5 mb-8">
        <h3 className="font-semibold text-deep-forest mb-4">Order Items</h3>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item._id} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-14 h-18 rounded-lg object-cover" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-deep-forest">{item.name}</p>
                <p className="text-gray-400">Size: {item.size} × {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard/orders" className="btn-primary">Track Your Order</Link>
        <Link to="/products" className="btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderConfirmPage;
