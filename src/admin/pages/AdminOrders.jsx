import React, { useEffect, useState } from 'react';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data.orders);
    } catch (err) {}
  };

  const updateStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, { status });
      toast.success('Status updated');
      loadOrders();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  return (
    <PageWrapper>
    <div>
      <h1 className="text-2xl font-bold text-deep-forest mb-6">Orders</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 border-b">
            <tr>
              <th className="px-6 py-4 font-medium">Order ID</th>
              <th className="px-6 py-4 font-medium">Customer</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(o => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">#{o.orderNumber}</td>
                <td className="px-6 py-4">{o.user?.name || o.shippingAddress?.fullName}</td>
                <td className="px-6 py-4">₹{o.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                      o.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={o.status} 
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    disabled={o.status === 'delivered' || o.status === 'cancelled'}
                    className="border border-gray-300 rounded px-2 py-1 text-xs outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </PageWrapper>
  );
};

export default AdminOrders;
