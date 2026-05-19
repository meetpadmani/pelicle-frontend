import React, { useState, useEffect } from 'react';
import { layoutAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, X, Truck, Shield, RefreshCw, Headphones, Star, CheckCircle, Gift, Heart, ChevronDown, Layout } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';

const iconMap = { Truck, Shield, RefreshCw, Headphones, Star, CheckCircle, Gift, Heart };

const AdminLayoutEditor = () => {
  const [layout, setLayout] = useState({
    navbar: [],
    features: [],
    homeSections: {
      featured: { title: 'Featured Collection', subtitle: 'Handpicked just for you' },
      newArrivals: { title: 'New Arrivals', subtitle: 'Fresh styles, just dropped' }
    },
    footer: {
      description: '',
      phone: '',
      email: '',
      socials: { instagram: '', twitter: '', facebook: '', youtube: '' },
      columns: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('navbar');

  useEffect(() => {
    layoutAPI.get().then(res => {
      // Merge layout with defaults so undefined properties don't cause errors
      setLayout({
        ...res.data.layout,
        homeSections: res.data.layout.homeSections || {
          featured: { title: 'Featured Collection', subtitle: 'Handpicked just for you' },
          newArrivals: { title: 'New Arrivals', subtitle: 'Fresh styles, just dropped' }
        }
      });
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const [logoFile, setLogoFile] = useState(null);

  const handleSave = async () => {
    try {
      const fd = new FormData();
      fd.append('navbar', JSON.stringify(layout.navbar));
      fd.append('features', JSON.stringify(layout.features));
      fd.append('homeSections', JSON.stringify(layout.homeSections));
      fd.append('footer', JSON.stringify(layout.footer));
      if (logoFile) {
        fd.append('logoImage', logoFile);
      }
      
      // we need to set a generic header for FormData but Axios usually handles it.
      await layoutAPI.update(fd);
      toast.success('Layout updated successfully!');
      setLogoFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update layout');
    }
  };

  const addNavbarLink = () => {
    setLayout({ ...layout, navbar: [...layout.navbar, { label: '', url: '', isHighlight: false }] });
  };
  
  const removeNavbarLink = (idx) => {
    const newNav = [...layout.navbar];
    newNav.splice(idx, 1);
    setLayout({ ...layout, navbar: newNav });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading layout...</div>;

  return (
    <PageWrapper>
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B5345] tracking-tight flex items-center gap-3">
            <Layout className="w-8 h-8 text-[#0E8A74]" />
            Layout & Storefront
          </h1>
          <p className="text-[#5C756D] mt-1 text-sm font-medium">Design your store's navigation, trust badges, and footer content.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-gradient-to-r from-[#0B5345] to-[#0E8A74] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#0B5345]/20 hover:shadow-xl hover:shadow-[#0B5345]/30 hover:-translate-y-0.5 transition-all">
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#E3E8E5] overflow-hidden">
        <div className="flex gap-2 border-b border-[#F4F7F5] px-6 pt-4 bg-[#FAFBF9]">
          {[
            { id: 'navbar', label: 'Navigation Menu' },
            { id: 'features', label: 'Trust Badges' },
            { id: 'footer', label: 'Footer Content' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-6 font-bold text-sm rounded-t-2xl transition-all border-b-2 ${activeTab === tab.id ? 'bg-white text-[#0B5345] border-[#0B5345] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]' : 'border-transparent text-[#8BA699] hover:text-[#0B5345] hover:bg-[#F4F7F5]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Navigation Bar Editor */}
          {activeTab === 'navbar' && (
            <div className="animate-fade-in max-w-5xl mx-auto p-2">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F4F7F5]">
                <h2 className="text-xl font-bold text-[#0B5345]">Navbar Links</h2>
                <button onClick={addNavbarLink} className="text-white text-sm font-bold flex items-center gap-1.5 bg-[#0B5345] hover:bg-[#0E8A74] px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#0B5345]/10">
                  <Plus size={16} /> Add Main Link
                </button>
              </div>
              <div className="space-y-6">
                {layout.navbar?.map((link, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E3E8E5] relative shadow-sm shadow-[#0B5345]/5 hover:border-[#0B5345]/20 transition-colors">
                    <button onClick={() => removeNavbarLink(idx)} className="absolute top-4 right-4 text-[#8BA699] p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18}/></button>
                    <div className="flex flex-col md:flex-row md:items-center gap-6 pr-12 mb-6">
                      <div className="flex-[1.5]">
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Menu Label</label>
                        <input 
                          type="text" placeholder="e.g. Activity Books" className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-bold text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]"
                          value={link.label}
                          onChange={(e) => {
                            const newNav = [...layout.navbar]; newNav[idx].label = e.target.value;
                            setLayout({ ...layout, navbar: newNav });
                          }}
                        />
                      </div>
                      <div className="flex-[2]">
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Target URL</label>
                        <input 
                          type="text" placeholder="e.g. /products?category=activity" className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-medium text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]"
                          value={link.url}
                          onChange={(e) => {
                            const newNav = [...layout.navbar]; newNav[idx].url = e.target.value;
                            setLayout({ ...layout, navbar: newNav });
                          }}
                        />
                      </div>
                      <div className="flex items-end pb-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div className={`w-11 h-6 rounded-full transition-colors relative ${link.isHighlight ? "bg-[#0B5345]" : "bg-[#8BA699]"}`}>
                             <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${link.isHighlight ? "left-5.5" : "left-0.5"}`} style={{ left: link.isHighlight ? '22px' : '2px' }} />
                          </div>
                          <input type="checkbox" className="hidden" checked={link.isHighlight} 
                            onChange={(e) => {
                              const newNav = [...layout.navbar]; newNav[idx].isHighlight = e.target.checked;
                              setLayout({ ...layout, navbar: newNav });
                            }} 
                          /> 
                          <span className="text-sm font-bold text-[#0B5345] group-hover:text-[#0E8A74] transition-colors">Highlight</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* SubLinks */}
                    <div className="ml-2 pl-6 border-l-2 border-[#E3E8E5] space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-[#5C756D] uppercase tracking-wider">Dropdown Subpages</label>
                        <button onClick={() => {
                          const newNav = [...layout.navbar]; 
                          newNav[idx] = { ...newNav[idx], subLinks: [...(newNav[idx].subLinks || [])] };
                          newNav[idx].subLinks.push({ label: '', url: '' });
                          setLayout({ ...layout, navbar: newNav });
                        }} className="text-[#0B5345] text-xs font-bold flex items-center gap-1.5 hover:bg-[#F4F7F5] px-3 py-1.5 rounded-lg transition-all">
                          <Plus size={14} /> Add Subpage
                        </button>
                      </div>
                      {link.subLinks?.map((sublink, sIdx) => (
                        <div key={sIdx} className="flex gap-4 items-center bg-[#FAFBF9] p-3 rounded-xl border border-[#E3E8E5]">
                          <div className="w-1/3">
                            <input type="text" placeholder="Sub Label (e.g. Coloring)" className="w-full px-3 py-2 border border-[#E3E8E5] bg-white rounded-lg text-sm font-semibold text-[#0B5345] focus:outline-none focus:border-[#0B5345] placeholder:text-[#8BA699]" value={sublink.label}
                              onChange={e => {
                                const newNav = [...layout.navbar]; 
                                newNav[idx] = { ...newNav[idx], subLinks: [...newNav[idx].subLinks] };
                                newNav[idx].subLinks[sIdx] = { ...newNav[idx].subLinks[sIdx], label: e.target.value };
                                setLayout({ ...layout, navbar: newNav });
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <input type="text" placeholder="URL (e.g. /products?subcategory=coloring)" className="w-full px-3 py-2 border border-[#E3E8E5] bg-white rounded-lg text-sm font-medium text-[#0B5345] focus:outline-none focus:border-[#0B5345] placeholder:text-[#8BA699]" value={sublink.url}
                              onChange={e => {
                                const newNav = [...layout.navbar];
                                newNav[idx] = { ...newNav[idx], subLinks: [...newNav[idx].subLinks] };
                                newNav[idx].subLinks[sIdx] = { ...newNav[idx].subLinks[sIdx], url: e.target.value };
                                setLayout({ ...layout, navbar: newNav });
                              }}
                            />
                          </div>
                          <button onClick={() => {
                            const newNav = [...layout.navbar];
                            newNav[idx] = { ...newNav[idx], subLinks: [...newNav[idx].subLinks] };
                            newNav[idx].subLinks.splice(sIdx, 1);
                            setLayout({ ...layout, navbar: newNav });
                          }} className="text-[#8BA699] hover:text-red-500 p-2 hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-gray-200"><X size={16}/></button>
                        </div>
                      ))}
                      {(!link.subLinks || link.subLinks.length === 0) && (
                        <p className="text-xs text-[#8BA699] font-medium bg-[#FAFBF9] p-4 rounded-xl border border-dashed border-[#E3E8E5] text-center">No subpages added yet. Click "Add Subpage" to create a dropdown.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Editor */}
          {activeTab === 'features' && (
            <div className="animate-fade-in max-w-5xl mx-auto p-2">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#F4F7F5]">
                <h2 className="text-xl font-bold text-[#0B5345]">Store Trust Badges</h2>
                <button onClick={() => setLayout({ ...layout, features: [...(layout.features || []), { icon: 'Star', title: 'New Badge', desc: '' }] })} className="text-white text-sm font-bold flex items-center gap-1.5 bg-[#0B5345] hover:bg-[#0E8A74] px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#0B5345]/10">
                  <Plus size={16} /> Add Badge
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {layout.features?.map((feature, fIdx) => (
                  <div key={fIdx} className="bg-white p-6 rounded-2xl border border-[#E3E8E5] relative shadow-sm shadow-[#0B5345]/5 hover:border-[#0B5345]/20 transition-colors">
                    <button onClick={() => {
                      const newFeat = [...layout.features]; newFeat.splice(fIdx, 1);
                      setLayout({ ...layout, features: newFeat });
                    }} className="absolute top-4 right-4 text-[#8BA699] p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={18}/></button>
                    
                    <div className="space-y-4 pr-10">
                      <div>
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Icon</label>
                        <div className="flex items-center bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl overflow-hidden focus-within:border-[#0B5345] focus-within:ring-2 focus-within:ring-[#0B5345]/20 transition-all h-[46px]">
                          <div className="pl-4 text-[#0B5345] flex-shrink-0">
                            {React.createElement(iconMap[feature.icon] || Star, { size: 18 })}
                          </div>
                          <select className="bg-transparent border-none outline-none py-2 px-3 font-semibold text-sm w-full cursor-pointer appearance-none text-[#0B5345] h-full" value={feature.icon}
                            onChange={e => {
                              const newFeat = [...layout.features]; newFeat[fIdx] = { ...newFeat[fIdx], icon: e.target.value };
                              setLayout({ ...layout, features: newFeat });
                            }}
                          >
                            <option value="Truck">Truck (Delivery)</option>
                            <option value="Shield">Shield (Secure)</option>
                            <option value="RefreshCw">Refresh (Returns)</option>
                            <option value="Headphones">Headphones (Support)</option>
                            <option value="Star">Star (Quality)</option>
                            <option value="CheckCircle">Check (Verified)</option>
                            <option value="Gift">Gift (Presents)</option>
                            <option value="Heart">Heart (Loved)</option>
                          </select>
                          <ChevronDown size={16} className="text-[#8BA699] mr-4 pointer-events-none flex-shrink-0" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Title</label>
                        <input type="text" placeholder="e.g. Free Shipping" className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-bold text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]"
                          value={feature.title}
                          onChange={e => {
                            const newFeat = [...layout.features]; newFeat[fIdx] = { ...newFeat[fIdx], title: e.target.value };
                            setLayout({ ...layout, features: newFeat });
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Description</label>
                        <input type="text" placeholder="e.g. On orders above ₹999" className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-medium text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]"
                          value={feature.desc}
                          onChange={e => {
                            const newFeat = [...layout.features]; newFeat[fIdx] = { ...newFeat[fIdx], desc: e.target.value };
                            setLayout({ ...layout, features: newFeat });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {(!layout.features || layout.features.length === 0) && (
                  <div className="col-span-full py-10 bg-[#FAFBF9] rounded-2xl border border-dashed border-[#E3E8E5] text-center">
                    <Shield className="w-10 h-10 text-[#8BA699] mx-auto mb-3" />
                    <p className="text-[#0B5345] font-bold">No trust badges added</p>
                    <p className="text-sm text-[#5C756D] mt-1">Trust badges appear on the homepage to build customer confidence.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Editor */}
          {activeTab === 'footer' && (
            <div className="animate-fade-in max-w-5xl mx-auto space-y-10 p-2">
              <div>
                <h2 className="text-xl font-bold text-[#0B5345] mb-6 pb-4 border-b border-[#F4F7F5]">Brand Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Footer Logo Text (Fallback)</label>
                      <input type="text" placeholder="e.g. Pelicle Books" className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-bold text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]" value={layout.footer?.logoText || 'Pelicle'}
                        onChange={e => setLayout({ ...layout, footer: { ...layout.footer, logoText: e.target.value }})}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Upload Footer Logo</label>
                      <div className="relative">
                        <input type="file" accept="image/*" 
                          className="block w-full text-sm text-[#5C756D] file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#0B5345]/10 file:text-[#0B5345] hover:file:bg-[#0B5345]/20 transition-all cursor-pointer border border-[#E3E8E5] rounded-xl bg-[#FAFBF9]"
                          onChange={e => setLogoFile(e.target.files[0])}
                        />
                      </div>
                      
                      {(logoFile || layout.footer?.logoImage?.url) && (
                        <div className="mt-4 p-5 bg-[#FAFBF9] border border-[#E3E8E5] rounded-2xl w-fit flex flex-col gap-3 shadow-sm">
                          <span className="text-[10px] font-bold text-[#8BA699] uppercase tracking-wider">{logoFile ? 'New Logo Preview' : 'Current Logo'}</span>
                          <div className="bg-[#0B5345] p-5 rounded-xl flex items-center justify-center min-w-[160px] shadow-inner shadow-black/20">
                            <img 
                              src={logoFile ? URL.createObjectURL(logoFile) : layout.footer?.logoImage?.url} 
                              alt="Logo Preview" 
                              className="h-12 w-auto object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Brand Description</label>
                      <textarea className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-medium text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699] resize-none" rows="4" placeholder="e.g. Bringing stories to life with beautiful books for growing minds." value={layout.footer?.description || ''}
                        onChange={e => setLayout({ ...layout, footer: { ...layout.footer, description: e.target.value }})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Phone</label>
                        <input type="text" placeholder="+91 98765..." className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-medium text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]" value={layout.footer?.phone || ''}
                          onChange={e => setLayout({ ...layout, footer: { ...layout.footer, phone: e.target.value }})}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Email</label>
                        <input type="text" placeholder="hello@pelicle.in" className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-medium text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]" value={layout.footer?.email || ''}
                          onChange={e => setLayout({ ...layout, footer: { ...layout.footer, email: e.target.value }})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0B5345] mb-6 pb-4 border-b border-[#F4F7F5]">Social Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['instagram', 'twitter', 'facebook', 'youtube'].map(social => (
                    <div key={social} className="flex items-center gap-4 bg-[#FAFBF9] border border-[#E3E8E5] p-3 rounded-xl focus-within:border-[#0B5345] focus-within:ring-2 focus-within:ring-[#0B5345]/20 transition-all">
                      <span className="text-xs font-bold uppercase w-20 text-[#5C756D] text-right">{social}</span>
                      <input type="text" placeholder={`https://${social}.com/...`} className="bg-white border border-[#E3E8E5] rounded-lg px-4 py-2 text-sm flex-1 font-medium text-[#0B5345] outline-none focus:border-[#0B5345] placeholder:text-[#8BA699]"
                        value={layout.footer?.socials?.[social] || ''}
                        onChange={e => setLayout({ ...layout, footer: { ...layout.footer, socials: { ...layout.footer.socials, [social]: e.target.value }}})}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F4F7F5]">
                  <div>
                    <h2 className="text-xl font-bold text-[#0B5345]">Navigation Columns</h2>
                    <p className="text-xs text-[#5C756D] font-medium mt-1">Organize footer links into columns like "Shop", "Learn", etc.</p>
                  </div>
                  <button onClick={() => setLayout({ ...layout, footer: { ...layout.footer, columns: [...(layout.footer?.columns || []), { title: 'New Column', links: [] }] }})} className="text-white text-sm font-bold flex items-center gap-1.5 bg-[#0B5345] hover:bg-[#0E8A74] px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#0B5345]/10">
                    <Plus size={16} /> Add Column
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {layout.footer?.columns?.map((col, cIdx) => (
                    <div key={cIdx} className="bg-white p-6 rounded-2xl border border-[#E3E8E5] relative shadow-sm shadow-[#0B5345]/5 hover:border-[#0B5345]/20 transition-colors">
                      <button onClick={() => {
                        const newCols = [...layout.footer.columns]; newCols.splice(cIdx, 1);
                        setLayout({ ...layout, footer: { ...layout.footer, columns: newCols } });
                      }} className="absolute top-4 right-4 text-[#8BA699] p-2 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors"><Trash2 size={18}/></button>
                      
                      <div className="mb-6 pr-10">
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Column Title</label>
                        <input type="text" placeholder="e.g. Explore" className="w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-bold text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]" value={col.title}
                          onChange={e => {
                            const newCols = [...layout.footer.columns]; 
                            newCols[cIdx] = { ...newCols[cIdx], title: e.target.value };
                            setLayout({ ...layout, footer: { ...layout.footer, columns: newCols } });
                          }}
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <label className="text-[11px] font-bold block text-[#5C756D] uppercase tracking-wider mb-2">Links</label>
                        {col.links?.map((link, lIdx) => (
                          <div key={lIdx} className="flex gap-3 items-center bg-[#FAFBF9] p-2.5 rounded-xl border border-[#E3E8E5]">
                            <input type="text" placeholder="Label" className="w-1/3 px-3 py-2 border border-[#E3E8E5] bg-white rounded-lg text-sm font-semibold text-[#0B5345] focus:outline-none focus:border-[#0B5345] placeholder:text-[#8BA699]" value={link.label}
                              onChange={e => {
                                const newCols = [...layout.footer.columns]; 
                                newCols[cIdx] = { ...newCols[cIdx], links: [...newCols[cIdx].links] };
                                newCols[cIdx].links[lIdx] = { ...newCols[cIdx].links[lIdx], label: e.target.value };
                                setLayout({ ...layout, footer: { ...layout.footer, columns: newCols } });
                              }}
                            />
                            <input type="text" placeholder="URL" className="flex-1 px-3 py-2 border border-[#E3E8E5] bg-white rounded-lg text-sm font-medium text-[#0B5345] focus:outline-none focus:border-[#0B5345] placeholder:text-[#8BA699]" value={link.url}
                              onChange={e => {
                                const newCols = [...layout.footer.columns]; 
                                newCols[cIdx] = { ...newCols[cIdx], links: [...newCols[cIdx].links] };
                                newCols[cIdx].links[lIdx] = { ...newCols[cIdx].links[lIdx], url: e.target.value };
                                setLayout({ ...layout, footer: { ...layout.footer, columns: newCols } });
                              }}
                            />
                            <button onClick={() => {
                              const newCols = [...layout.footer.columns]; 
                              newCols[cIdx] = { ...newCols[cIdx], links: [...newCols[cIdx].links] };
                              newCols[cIdx].links.splice(lIdx, 1);
                              setLayout({ ...layout, footer: { ...layout.footer, columns: newCols } });
                            }} className="text-[#8BA699] hover:text-red-500 p-2 hover:bg-white rounded-lg transition-all shadow-sm shadow-transparent hover:shadow-gray-200"><X size={16}/></button>
                          </div>
                        ))}
                        <button onClick={() => {
                          const newCols = [...layout.footer.columns]; 
                          newCols[cIdx] = { ...newCols[cIdx], links: [...(newCols[cIdx].links || [])] };
                          newCols[cIdx].links.push({ label: '', url: '' });
                          setLayout({ ...layout, footer: { ...layout.footer, columns: newCols } });
                        }} className="text-[#0B5345] text-xs font-bold flex items-center gap-1.5 mt-4 hover:bg-[#F4F7F5] bg-white px-3 py-2 border border-[#E3E8E5] rounded-xl w-full justify-center transition-all">
                          <Plus size={14} /> Add Link
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!layout.footer?.columns || layout.footer.columns.length === 0) && (
                    <div className="col-span-full py-10 bg-[#FAFBF9] rounded-2xl border border-dashed border-[#E3E8E5] text-center">
                      <p className="text-[#0B5345] font-bold">No columns added</p>
                      <p className="text-sm text-[#5C756D] mt-1">Add columns to display helpful links in the footer.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default AdminLayoutEditor;
