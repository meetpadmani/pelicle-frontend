import React, { useEffect, useState } from 'react';
import { bannersAPI } from '../../services/api';
import { Plus, Trash2, X, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', link: '', buttonText: '', showButton: true });
  const [image, setImage] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => { try { const res = await bannersAPI.getAll(); setBanners(res.data.banners); } catch (e) {} };

  const openEdit = (b) => {
    setEditingId(b._id);
    setForm({ title: b.title || '', subtitle: b.subtitle || '', link: b.link || '', buttonText: b.buttonText || '', showButton: b.showButton !== false });
    setImage(null);
    setModalOpen(true);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ title: '', subtitle: '', link: '', buttonText: '', showButton: true });
    setImage(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(); Object.entries(form).forEach(([k,v])=>fd.append(k,v));
      if (image) fd.append('image', image);
      if (editingId) {
        await bannersAPI.update(editingId, fd);
        toast.success('Updated');
      } else {
        await bannersAPI.create(fd);
        toast.success('Created');
      }
      setModalOpen(false); load();
    } catch (err) { toast.error('Error'); }
  };
  const handleDelete = async (id) => {
    if(window.confirm('Delete?')) { try { await bannersAPI.delete(id); toast.success('Deleted'); load(); } catch(e) {} }
  };

  return (
    <PageWrapper>
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-deep-forest">Banners</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16}/> Add Banner</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 border-b">
            <tr><th className="px-6 py-4">Image</th><th className="px-6 py-4">Title</th><th className="px-6 py-4">Link</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banners.map(b => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><img src={b.image?.url} className="w-20 h-10 rounded bg-gray-100 object-cover" /></td>
                <td className="px-6 py-4 font-medium">{b.title}</td>
                <td className="px-6 py-4">{b.link}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{b.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={()=>openEdit(b)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                  <button onClick={()=>handleDelete(b._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">{editingId ? 'Edit Banner' : 'Add Banner'}</h2><button onClick={()=>setModalOpen(false)}><X size={20}/></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-xs font-semibold block mb-1">Title</label><input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} /></div>
              <div><label className="text-xs font-semibold block mb-1">Subtitle</label><input className="input-field" value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})} /></div>
              <div><label className="text-xs font-semibold block mb-1">Link URL</label><input className="input-field" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} /></div>
              
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={form.showButton} onChange={e=>setForm({...form, showButton: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-forest"></div>
                </label>
                <span className="text-sm font-semibold text-gray-700">Show Button on Banner</span>
              </div>

              {form.showButton && (
                <div><label className="text-xs font-semibold block mb-1">Button Text</label><input className="input-field" value={form.buttonText} onChange={e=>setForm({...form,buttonText:e.target.value})} /></div>
              )}
              <div>
                <label className="text-xs font-semibold block mb-1">Image {editingId && '(Leave empty to keep current)'}</label>
                <input type="file" required={!editingId} accept="image/*" onChange={e=>setImage(e.target.files[0])} className="input-field" />
                {(image || editingId) && (
                  <img 
                    src={image ? URL.createObjectURL(image) : banners.find(b => b._id === editingId)?.image?.url} 
                    alt="Preview" 
                    className="mt-3 w-full h-32 object-cover rounded-xl border border-gray-200 shadow-sm" 
                  />
                )}
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
    </PageWrapper>
  );
};
export default AdminBanners;
