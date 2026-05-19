import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../../features/orders/ordersSlice';
import { Package } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MyOrders = () => {
  const dispatch = useDispatch();
  const { list: orders, loading } = useSelector(s => s.orders);

  useEffect(() => { document.title = 'My Orders — PELLICLE'; dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container-custom py-10 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-2 mb-8">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-olive-green">Account</Link>
        <span className="text-gray-400">/</span>
        <span className="text-sm font-semibold text-deep-forest">My Orders</span>
      </div>

      <h1 className="text-2xl font-bold text-deep-forest mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-deep-forest mb-2">No orders found</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary inline-flex">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Placed</p>
                  <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-sm font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order #</p>
                  <p className="text-sm font-semibold">{order.orderNumber}</p>
                </div>
                <Link to={`/dashboard/orders/${order._id}`} className="btn-secondary px-4 py-2 text-xs">View Details</Link>
              </div>

              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item._id} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-20 rounded-lg object-cover bg-gray-100" />
                    <div>
                      <p className="font-semibold text-sm text-deep-forest">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Size: {item.size} | Qty: {item.quantity}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyOrders;
