import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById, cancelOrder } from '../../features/orders/ordersSlice';
import { MapPin, CheckCircle, Package } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedOrder: order, loading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id, dispatch]);

  const handleCancel = () => {
    if(window.confirm('Are you sure you want to cancel this order?')) {
      dispatch(cancelOrder({ id: order._id, reason: 'Customer requested' }));
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="container-custom py-10 max-w-4xl animate-fade-in">
      <div className="flex items-center gap-2 mb-8">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-olive-green">Account</Link><span className="text-gray-400">/</span>
        <Link to="/dashboard/orders" className="text-sm text-gray-500 hover:text-olive-green">My Orders</Link><span className="text-gray-400">/</span>
        <span className="text-sm font-semibold text-deep-forest">#{order.orderNumber}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-deep-forest">Order Details</h1>
        {order.status === 'pending' && (
          <button onClick={handleCancel} className="text-sm text-red-600 hover:underline font-semibold">Cancel Order</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card p-5"><h3 className="font-semibold mb-2">Shipping Address</h3><p className="text-sm text-gray-600">{order.shippingAddress?.fullName}<br/>{order.shippingAddress?.line1}, {order.shippingAddress?.city}<br/>{order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p></div>
        <div className="card p-5"><h3 className="font-semibold mb-2">Payment Method</h3><p className="text-sm text-gray-600 capitalize">{order.payment?.method}</p><p className="text-sm mt-1">Status: <span className={order.payment?.status==='paid'?'text-green-600':'text-orange-500'}>{order.payment?.status}</span></p></div>
        <div className="card p-5"><h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm"><div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.itemsPrice}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discountAmount}</span></div>}
          <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>₹{order.shippingPrice}</span></div>
          <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>Total</span><span>₹{order.totalAmount}</span></div></div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-deep-forest mb-4">Items in Order</h3>
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item._id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <img src={item.image} alt={item.name} className="w-16 h-20 rounded-lg object-cover" />
              <div className="flex-1">
                <Link to={`/products/${item.product}`} className="font-semibold text-sm hover:text-olive-green">{item.name}</Link>
                <p className="text-xs text-gray-500 mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                <p className="font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default OrderDetail;
