import React, { useEffect, useState } from 'react';
import { reviewsAPI } from '../../services/api';
import { Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => { load(); }, []);
  const load = async () => { try { const res = await reviewsAPI.getByProduct('all'); setReviews(res.data.reviews || []); } catch (e) {} };

  const handleDelete = async (id) => {
    if(window.confirm('Delete?')) { try { await reviewsAPI.delete(id); toast.success('Deleted'); load(); } catch(e) {} }
  };

  return (
    <PageWrapper>
    <div>
      <h1 className="text-2xl font-bold text-deep-forest mb-6">Reviews</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 border-b">
            <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Product</th><th className="px-6 py-4">Rating</th><th className="px-6 py-4">Comment</th><th className="px-6 py-4">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.map(r => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{r.user?.name}</td>
                <td className="px-6 py-4">{r.product?.name}</td>
                <td className="px-6 py-4 flex items-center">{r.rating} <Star size={14} className="text-yellow-400 fill-yellow-400 ml-1"/></td>
                <td className="px-6 py-4 truncate max-w-xs">{r.comment}</td>
                <td className="px-6 py-4"><button onClick={()=>handleDelete(r._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </PageWrapper>
  );
};
export default AdminReviews;
