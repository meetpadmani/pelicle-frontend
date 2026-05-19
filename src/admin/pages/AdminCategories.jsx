import React, { useEffect, useState } from 'react';
import { categoriesAPI } from '../../services/api';
import { Plus, Trash2, X, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageWrapper from '../components/PageWrapper';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ _id: null, name: '', description: '', parentCategory: '' });
  const [image, setImage] = useState(null);

  useEffect(() => { load(); }, []);
  const load = async () => { try { const res = await categoriesAPI.getAll(); setCategories(res.data.categories); } catch (e) {} };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(); 
      fd.append('name', form.name); 
      if (form.description) fd.append('description', form.description);
      fd.append('parentCategory', form.parentCategory || '');
      if (image) fd.append('image', image);
      
      if (form._id) {
        await categoriesAPI.update(form._id, fd);
        toast.success('Category updated');
      } else {
        await categoriesAPI.create(fd);
        toast.success('Category created'); 
      }
      setModalOpen(false); 
      load();
    } catch (err) { toast.error('Error saving category'); }
  };

  const handleEdit = (cat) => {
    setForm({ _id: cat._id, name: cat.name, description: cat.description || '', parentCategory: cat.parentCategory || '' });
    setImage(null);
    setModalOpen(true);
  };

  const openAddModal = () => {
    setForm({ _id: null, name: '', description: '', parentCategory: '' });
    setImage(null);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this category?')) {
      try { await categoriesAPI.delete(id); toast.success('Deleted'); load(); } catch(e) { toast.error('Error'); }
    }
  };

  const flattenedCategories = [];
  categories.forEach(c => {
    flattenedCategories.push(c);
    if (c.subcategories?.length > 0) {
      c.subcategories.forEach(sub => flattenedCategories.push({ ...sub, isSub: true, parentName: c.name, parentCategory: c._id }));
    }
  });

  return (
    <PageWrapper>
    <div className="space-y-6">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-deep-forest">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Organise your product catalogue</p>
        </div>
        <button onClick={openAddModal} className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 text-sm transition-all shadow-sm">
          <Plus size={16}/> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {flattenedCategories.map(c => (
          <div key={c._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                {c.image?.url ? (
                  <img src={c.image.url} className="w-full h-full object-cover" alt={c.name} />
                ) : (
                  <span className="text-[10px] text-gray-400 uppercase font-bold text-center leading-tight p-1 break-words w-full">
                    {c.name}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-1">
                  {c.isSub && <span className="text-gray-400 font-normal">↳</span>} {c.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{c.productCount || 0} products</p>
                <div className="mt-1.5">
                  <span className="text-[10px] font-bold tracking-wider text-green-700 bg-green-50 px-2 py-0.5 rounded">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <button onClick={() => handleEdit(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Edit2 size={14} strokeWidth={2.5}/>
              </button>
              <button onClick={() => handleDelete(c._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={14} strokeWidth={2.5}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{form._id ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={()=>setModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="text-xs font-semibold block mb-1">Name</label><input required className="input-field" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
              <div><label className="text-xs font-semibold block mb-1">Description</label><textarea className="input-field" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              <div>
                <label className="text-xs font-semibold block mb-1">Parent Category</label>
                <select className="input-field" value={form.parentCategory} onChange={e=>setForm({...form,parentCategory:e.target.value})}>
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => c._id !== form._id).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div><label className="text-xs font-semibold block mb-1">Image</label><input type="file" accept="image/*" onChange={e=>setImage(e.target.files[0])} className="input-field" /></div>
              <button type="submit" className="btn-primary w-full mt-4">{form._id ? 'Update' : 'Save'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
    </PageWrapper>
  );
};
export default AdminCategories;
