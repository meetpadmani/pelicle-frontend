import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadUsers(); }, []);
  const loadUsers = async () => {
    try { const res = await usersAPI.getAll(); setUsers(res.data.users); } catch (err) {}
  };

  const toggleBlock = async (id) => {
    try {
      await usersAPI.toggleBlock(id);
      toast.success('Status updated');
      loadUsers();
    } catch (err) { toast.error('Error updating status'); }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await usersAPI.createAdmin(formData);
      toast.success('Admin user created successfully!');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-deep-forest">Users & Admins</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-deep-forest text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all"
        >
          + Add Admin
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 border-b">
            <tr><th className="px-6 py-4 font-medium">Name</th><th className="px-6 py-4 font-medium">Email</th><th className="px-6 py-4 font-medium">Role</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'admin' ? 'bg-[#C8A030]/20 text-[#C8A030]' : 'bg-gray-100 text-gray-600'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleBlock(u._id)} className="text-olive-green hover:underline text-xs font-medium">
                      {u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Create Admin User</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">FULL NAME</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-deep-forest" placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">EMAIL ADDRESS</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-deep-forest" placeholder="admin@pelicle.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">PHONE NUMBER</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-deep-forest" placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">PASSWORD</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 border rounded-lg outline-none focus:border-deep-forest" placeholder="••••••••" minLength="6" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-deep-forest text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-colors">
                  {loading ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </PageWrapper>
  );
};
export default AdminUsers;
