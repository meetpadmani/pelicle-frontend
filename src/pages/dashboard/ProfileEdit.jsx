import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../features/auth/authSlice';
import { usersAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileEdit = () => {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });

  const handleUpdate = async (e) => {
    e.preventDefault();
    dispatch(updateProfile({ name, phone }));
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword.length < 6) { toast.error('Password too short'); return; }
    try {
      await usersAPI.changePassword(passForm);
      toast.success('Password changed');
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch(err) { toast.error(err.response?.data?.message || 'Error changing password'); }
  };

  return (
    <div className="container-custom py-10 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-2 mb-8">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-olive-green">Account</Link><span className="text-gray-400">/</span>
        <span className="text-sm font-semibold text-deep-forest">Profile Settings</span>
      </div>
      <h1 className="text-2xl font-bold text-deep-forest mb-6">Profile Settings</h1>

      <div className="card p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Personal Information</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div><label className="text-xs font-semibold block mb-1">Email (cannot be changed)</label><input className="input-field bg-gray-50 text-gray-500" value={user?.email} disabled /></div>
          <div><label className="text-xs font-semibold block mb-1">Full Name</label><input required className="input-field" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div><label className="text-xs font-semibold block mb-1">Phone</label><input className="input-field" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          <button type="submit" className="btn-primary">Update Profile</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">Change Password</h2>
        <form onSubmit={handlePassChange} className="space-y-4">
          <div><label className="text-xs font-semibold block mb-1">Current Password</label><input required type="password" className="input-field" value={passForm.currentPassword} onChange={e=>setPassForm({...passForm, currentPassword:e.target.value})} /></div>
          <div><label className="text-xs font-semibold block mb-1">New Password</label><input required type="password" className="input-field" value={passForm.newPassword} onChange={e=>setPassForm({...passForm, newPassword:e.target.value})} /></div>
          <button type="submit" className="btn-secondary">Change Password</button>
        </form>
      </div>
    </div>
  );
};
export default ProfileEdit;
