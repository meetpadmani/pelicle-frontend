import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Trash2, Star, Check } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { fetchCurrentUser } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const MyAddresses = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ fullName:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'', country:'India' });

  const loadUser = () => dispatch(fetchCurrentUser());

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.addAddress(form);
      toast.success('Address added');
      setModalOpen(false);
      loadUser();
    } catch(err) { toast.error('Failed to add'); }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this address?')) {
      try { await usersAPI.deleteAddress(id); toast.success('Deleted'); loadUser(); } catch(e) {}
    }
  };

  const setAsDefault = async (id) => {
    try { await usersAPI.setDefaultAddress(id); toast.success('Set as default'); loadUser(); } catch(e) {}
  };

  return (
    <div className="container-custom py-10 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-2 mb-8">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-olive-green">Account</Link><span className="text-gray-400">/</span>
        <span className="text-sm font-semibold text-deep-forest">Addresses</span>
      </div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-deep-forest flex items-center gap-2"><MapPin className="text-olive-green" /> My Addresses</h1>
        <button onClick={() => { setForm({ fullName:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:'', country:'India' }); setModalOpen(true); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2"><Plus size={16}/> Add New</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {user?.addresses?.length === 0 ? (
          <p className="text-gray-500 col-span-2">No addresses saved yet.</p>
        ) : user?.addresses?.map(a => (
          <div key={a._id} className={`card p-5 border-2 ${a.isDefault ? 'border-olive-green' : 'border-transparent'}`}>
            {a.isDefault && <span className="badge-gold mb-3"><Star size={12}/> Default</span>}
            <h3 className="font-semibold text-deep-forest mb-1">{a.fullName}</h3>
            <p className="text-sm text-gray-600 mb-2">{a.phone}</p>
            <p className="text-sm text-gray-500 mb-4">{a.line1}, {a.line2 && `${a.line2},`} {a.city}, {a.state} - {a.pincode}</p>
            <div className="flex gap-2">
              {!a.isDefault && <button onClick={()=>setAsDefault(a._id)} className="text-xs font-semibold text-olive-green hover:underline flex items-center gap-1"><Check size={14}/> Set Default</button>}
              <button onClick={()=>handleDelete(a._id)} className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1 ml-auto"><Trash2 size={14}/> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Address</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><input required placeholder="Full Name" className="input-field" value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} /></div>
                <div className="col-span-2"><input required placeholder="Phone Number" className="input-field" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} /></div>
                <div className="col-span-2"><input required placeholder="Address Line 1" className="input-field" value={form.line1} onChange={e=>setForm({...form,line1:e.target.value})} /></div>
                <div className="col-span-2"><input placeholder="Address Line 2 (Optional)" className="input-field" value={form.line2} onChange={e=>setForm({...form,line2:e.target.value})} /></div>
                <div><input required placeholder="City" className="input-field" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} /></div>
                <div><input required placeholder="State" className="input-field" value={form.state} onChange={e=>setForm({...form,state:e.target.value})} /></div>
                <div><input required placeholder="Pincode" className="input-field" value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value})} /></div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={()=>setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyAddresses;
