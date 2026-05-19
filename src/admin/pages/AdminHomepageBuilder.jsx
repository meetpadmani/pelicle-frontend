import React, { useState, useEffect } from 'react';
import { layoutAPI, uploadAPI, categoriesAPI, productsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Image as ImageIcon, Layers, Monitor, Layout, Tag, Grid, Folder, Video, Code, Upload, Loader } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';

const sectionTypes = [
  { type: 'Hero Banner', icon: ImageIcon },
  { type: 'Hero Slider', icon: Layers },
  { type: 'Image Slider', icon: ImageIcon },
  { type: 'Collection Banners', icon: Layout },
  { type: 'Staggered Wall', icon: Monitor },
  { type: 'Puzzle Game', icon: Layout },
  { type: 'Promo Banner', icon: Tag },
  { type: 'Product Grid', icon: Grid },
  { type: 'Category Browser', icon: Folder },
  { type: 'Video Showcase', icon: Video },
  { type: 'Custom HTML', icon: Code }
];

const getBadgeStyle = (type) => {
  const m = { ImageSlider: 'text-purple-600 bg-purple-50 border-purple-200', CategoryBrowser: 'text-teal-600 bg-teal-50 border-teal-200', ProductGrid: 'text-gray-600 bg-gray-50 border-gray-200', HeroBanner: 'text-blue-600 bg-blue-50 border-blue-200', PromoBanner: 'text-orange-600 bg-orange-50 border-orange-200', VideoShowcase: 'text-red-600 bg-red-50 border-red-200', HeroSlider: 'text-indigo-600 bg-indigo-50 border-indigo-200', StaggeredWall: 'text-amber-600 bg-amber-50 border-amber-200', PuzzleGame: 'text-pink-600 bg-pink-50 border-pink-200', CustomHTML: 'text-cyan-600 bg-cyan-50 border-cyan-200', CollectionBanners: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  return m[type] || 'text-gray-600 bg-gray-50 border-gray-200';
};

const defaultConfig = (type) => {
  if (type === 'ImageSlider' || type === 'HeroSlider') return { sliderHeight: 'medium', slides: [] };
  if (type === 'ProductGrid') return { categoryFilter: '', sortOrder: 'oldest', searchQuery: '', limit: 6 };
  if (type === 'CategoryBrowser') return { subtitle: '' };
  if (type === 'VideoShowcase') return { videos: [] };
  if (type === 'HeroBanner' || type === 'PromoBanner' || type === 'CollectionBanners') return { slides: [] };
  return {};
};

/* ── Image Upload Field (preview on right side like reference) ── */
const ImageUploadField = ({ label, value, onUrlChange, optional }) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file);
      onUrlChange(res.data.url);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="text-xs font-bold text-gray-700 block mb-2">{label} {optional && <span className="text-gray-400 font-normal">(Optional)</span>}</label>
      <div className="flex gap-3 items-start">
        <div className="flex-1">
          <label className={`flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 cursor-pointer hover:border-gray-300 bg-white text-sm text-gray-500 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? <><Loader size={16} className="animate-spin"/> Uploading...</> : <><Upload size={16}/> Choose Image</>}
            <input type="file" className="hidden" accept="image/*" onChange={handleFile} disabled={uploading}/>
          </label>
        </div>
        {value && <img src={value} alt="" className="h-[46px] w-[70px] object-cover rounded-lg border border-gray-200 shrink-0"/>}
      </div>
      <input type="text" placeholder="Or paste image URL..." className="mt-2 w-full text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 text-gray-500" value={value || ''} onChange={e => onUrlChange(e.target.value)}/>
    </div>
  );
};

const VideoUploadField = ({ value, onUrlChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.uploadVideo(file);
      onUrlChange(res.data.url);
      toast.success('Video uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Video upload failed');
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="text-xs font-bold text-gray-700 block mb-2">Video File</label>
      <label className={`flex items-center justify-center gap-2 border-2 border-dashed border-red-200 rounded-xl py-3 cursor-pointer hover:border-red-300 bg-white text-sm text-red-500 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        {uploading ? <><Loader size={16} className="animate-spin"/> Uploading...</> : <><Video size={16}/> Choose Video (.mp4, .webm)</>}
        <input type="file" className="hidden" accept="video/mp4,video/webm" onChange={handleFile} disabled={uploading}/>
      </label>
      <input type="text" placeholder="Or paste video URL (.mp4/.webm)" className="mt-2 w-full text-[11px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-gray-400 text-gray-500" value={value || ''} onChange={e => onUrlChange(e.target.value)}/>
      {value && (
        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-black">
          <video className="h-52 w-full object-contain" src={value} controls preload="metadata">
            Your browser cannot preview this video.
          </video>
        </div>
      )}
    </div>
  );
};

/* ── Slide Editor (matching reference screenshot layout) ── */
const SlideEditor = ({ slide, idx, onChange, onDelete }) => (
  <div className="relative bg-gray-50/60 rounded-xl border border-gray-100 p-5 mt-4">
    <div className="absolute -top-3 left-4 w-6 h-6 rounded-full bg-[#0B5345] text-white text-[11px] font-bold flex items-center justify-center">{idx + 1}</div>
    <button onClick={onDelete} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"><Trash2 size={14}/></button>

    <div className="space-y-5 pt-2 pr-6">
      {/* Row 1: Desktop Image (full width) */}
      <ImageUploadField label="Desktop Image" value={slide.desktopImage} onUrlChange={url => onChange({ ...slide, desktopImage: url })} />

      {/* Row 2: Mobile Image + Image Fit side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImageUploadField label="Mobile Image" value={slide.mobileImage} onUrlChange={url => onChange({ ...slide, mobileImage: url })} optional />
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2">Image Fit</label>
          <select className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none" value={slide.imageFit || 'cover'} onChange={e => onChange({ ...slide, imageFit: e.target.value })}>
            <option value="cover">Cover (Hero Style)</option>
            <option value="contain">Contain (Full Image)</option>
            <option value="fill">Fill (Stretch)</option>
          </select>
        </div>
      </div>

      {/* Row 3: Link URL + Alt Text side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2">Link URL</label>
          <input type="text" placeholder="/products or https://..." className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={slide.linkUrl || ''} onChange={e => onChange({ ...slide, linkUrl: e.target.value })}/>
          {slide.linkUrl && (
            <p className="mt-1.5 text-[10px] text-gray-400 break-all leading-relaxed">→ {slide.linkUrl}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2">Alt Text</label>
          <input type="text" placeholder="Description" className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={slide.altText || ''} onChange={e => onChange({ ...slide, altText: e.target.value })}/>
        </div>
      </div>
    </div>
  </div>
);

const emptyVideo = () => ({
  id: Date.now().toString(),
  videoUrl: '',
  posterImage: '',
  coverImage: '',
  title: '',
  linkedProductId: '',
  linkedProductSlug: '',
  linkedProductName: '',
  linkedProductImage: '',
  linkedProductPrice: '',
});

const VideoShowcaseEditor = ({ section, cfg, setConfig, onUpdate, products = [] }) => {
  const videos = cfg.videos || [];
  const updateVideo = (index, video) => {
    const nextVideos = [...videos];
    nextVideos[index] = video;
    setConfig({ ...cfg, videos: nextVideos });
  };

  const selectProduct = (index, productId) => {
    const product = products.find(p => p._id === productId);
    updateVideo(index, {
      ...videos[index],
      linkedProductId: productId,
      linkedProductSlug: product?.slug || '',
      linkedProductName: product?.name || '',
      linkedProductImage: product?.images?.[0]?.url || '',
      linkedProductPrice: product?.discountPrice || product?.price || '',
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2">Section Title</label>
          <input type="text" className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={section.title || ''} onChange={e => onUpdate({ ...section, title: e.target.value })} placeholder="Video Showcase"/>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-700 block mb-2">Section Subtitle (optional)</label>
          <input type="text" className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={section.subtitle || ''} onChange={e => onUpdate({ ...section, subtitle: e.target.value })} placeholder="Short description"/>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-gray-700">Videos ({videos.length})</h4>
        <button onClick={() => setConfig({ ...cfg, videos: [...videos, emptyVideo()] })} className="text-sm text-[#0B5345] font-semibold flex items-center gap-1 hover:underline">
          <Plus size={14}/> Add Video
        </button>
      </div>

      {videos.map((video, i) => (
        <div key={video.id || i} className="relative bg-gray-50/60 rounded-xl border border-gray-100 p-5 mt-4">
          <div className="absolute -top-3 left-4 w-6 h-6 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</div>
          <button onClick={() => setConfig({ ...cfg, videos: videos.filter((_, j) => j !== i) })} className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1"><Trash2 size={14}/></button>

          <div className="space-y-5 pt-2 pr-6">
            <div>
              <VideoUploadField value={video.videoUrl} onUrlChange={url => updateVideo(i, { ...video, videoUrl: url })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField label="Video Poster / Thumbnail" value={video.posterImage} onUrlChange={url => updateVideo(i, { ...video, posterImage: url })} optional />
              <ImageUploadField label="Product Cover Image (hover)" value={video.coverImage} onUrlChange={url => updateVideo(i, { ...video, coverImage: url })} optional />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Video Title</label>
                <input type="text" placeholder="e.g. The Magic Forest" className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={video.title || ''} onChange={e => updateVideo(i, { ...video, title: e.target.value })}/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Linked Product (Buy Now button)</label>
                <select className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={video.linkedProductId || ''} onChange={e => selectProduct(i, e.target.value)}>
                  <option value="">Choose Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>{product.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      ))}

      {videos.length === 0 && <p className="text-xs text-gray-400 italic py-4 text-center">No videos yet. Click "+ Add Video" to begin.</p>}
    </div>
  );
};

/* ── Expanded Config Panel per section type ── */
const SectionConfig = ({ section, onUpdate, categories = [], products = [] }) => {
  const cfg = section.config && Object.keys(section.config).length > 0 ? section.config : defaultConfig(section.type);
  const setConfig = (c) => onUpdate({ ...section, config: { ...c } });

  if (section.type === 'ImageSlider' || section.type === 'HeroSlider') {
    const slides = cfg.slides || [];
    return (
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Slider Height</label>
            <select className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none w-52" value={cfg.sliderHeight || 'medium'} onChange={e => setConfig({ ...cfg, sliderHeight: e.target.value })}>
              <option value="small">Small (Banner)</option>
              <option value="medium">Medium (Matches Hero)</option>
              <option value="large">Large (Full Screen)</option>
            </select>
          </div>
          <button onClick={() => setConfig({ ...cfg, slides: [...slides, { id: Date.now().toString(), desktopImage: '', mobileImage: '', imageFit: 'cover', linkUrl: '', altText: '' }] })} className="text-sm text-[#0B5345] font-semibold flex items-center gap-1 hover:underline">
            <Plus size={14}/> Add Slide
          </button>
        </div>
        {slides.map((slide, i) => (
          <SlideEditor key={slide.id || i} slide={slide} idx={i}
            onChange={s => { const ns = [...slides]; ns[i] = s; setConfig({ ...cfg, slides: ns }); }}
            onDelete={() => setConfig({ ...cfg, slides: slides.filter((_, j) => j !== i) })}
          />
        ))}
        {slides.length === 0 && <p className="text-xs text-gray-400 italic py-4 text-center">No slides yet. Click "+ Add Slide" to begin.</p>}
      </div>
    );
  }

  if (section.type === 'HeroBanner' || section.type === 'PromoBanner' || section.type === 'CollectionBanners') {
    const slides = cfg.slides || [];
    return (
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
        <div className="flex justify-end">
          <button onClick={() => setConfig({ ...cfg, slides: [...slides, { id: Date.now().toString(), desktopImage: '', mobileImage: '', imageFit: 'cover', linkUrl: '', altText: '' }] })} className="text-sm text-[#0B5345] font-semibold flex items-center gap-1 hover:underline">
            <Plus size={14}/> Add Slide
          </button>
        </div>
        {slides.map((slide, i) => (
          <SlideEditor key={slide.id || i} slide={slide} idx={i}
            onChange={s => { const ns = [...slides]; ns[i] = s; setConfig({ ...cfg, slides: ns }); }}
            onDelete={() => setConfig({ ...cfg, slides: slides.filter((_, j) => j !== i) })}
          />
        ))}
        {slides.length === 0 && <p className="text-xs text-gray-400 italic py-4 text-center">No slides yet. Click "+ Add Slide" to begin.</p>}
      </div>
    );
  }

  if (section.type === 'ProductGrid') {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Section Title</label>
            <input type="text" className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={section.title || ''} onChange={e => onUpdate({ ...section, title: e.target.value })} placeholder="e.g. Featured Products"/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Category Filter</label>
            <select className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={cfg.categoryFilter || ''} onChange={e => setConfig({ ...cfg, categoryFilter: e.target.value })}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.slug || cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Sort Order</label>
            <select className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={cfg.sortOrder || 'oldest'} onChange={e => setConfig({ ...cfg, sortOrder: e.target.value })}>
              <option value="oldest">Oldest First</option>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Search Query</label>
            <input type="text" className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={cfg.searchQuery || ''} onChange={e => setConfig({ ...cfg, searchQuery: e.target.value })} placeholder="Search keywords..."/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Limit</label>
            <input type="number" className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-gray-400" value={cfg.limit || 6} onChange={e => setConfig({ ...cfg, limit: parseInt(e.target.value) || 6 })}/>
          </div>
        </div>
      </div>
    );
  }

  if (section.type === 'CategoryBrowser') {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <label className="text-xs font-bold text-gray-700 block mb-2">Subtitle</label>
        <input type="text" className="w-full text-sm bg-white border border-gray-200 rounded-lg px-3 py-2.5 outline-none max-w-md" value={cfg.subtitle || ''} onChange={e => setConfig({ ...cfg, subtitle: e.target.value })} placeholder="e.g. Browse by Category"/>
      </div>
    );
  }

  if (section.type === 'VideoShowcase') {
    return <VideoShowcaseEditor section={section} cfg={cfg} setConfig={setConfig} onUpdate={onUpdate} products={products} />;
  }

  return <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 italic">No additional configuration for this section type.</div>;
};

/* ── Main Component ── */
const AdminHomepageBuilder = () => {
  const [layout, setLayout] = useState({ homeBuilder: [] });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // Fetch categories for the dropdowns
    categoriesAPI.getAll().then(res => setCategories(res.data.categories)).catch(() => {});
    productsAPI.getAll({ limit: 100 }).then(res => setProducts(res.data.products || [])).catch(() => {});

    layoutAPI.get().then(res => {
      const data = { ...res.data.layout };
      // Ensure all sections have config initialized
      if (data.homeBuilder) {
        data.homeBuilder = data.homeBuilder.map(s => ({
          ...s,
          config: (s.config && Object.keys(s.config).length > 0) ? s.config : defaultConfig(s.type)
        }));
      }
      setLayout(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      const fd = new FormData();
      const builderClean = (layout.homeBuilder || []).map(s => {
        const c = { ...s.config };
        if (c.slides) c.slides = c.slides.map(sl => ({ id: sl.id, desktopImage: sl.desktopImage, mobileImage: sl.mobileImage, imageFit: sl.imageFit, linkUrl: sl.linkUrl, altText: sl.altText }));
        return { ...s, config: c };
      });
      fd.append('homeBuilder', JSON.stringify(builderClean));
      await layoutAPI.update(fd);
      toast.success('Homepage layout saved!');
    } catch (err) { toast.error('Failed to save layout'); }
  };

  const updateSection = (updated) => {
    const nb = layout.homeBuilder.map(s => s.id === updated.id ? updated : s);
    setLayout({ ...layout, homeBuilder: nb });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading builder...</div>;
  const arr = [...(layout.homeBuilder || [])].sort((a, b) => a.position - b.position);

  return (
    <PageWrapper>
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-slate-800 tracking-tight">Homepage Builder</h1>
        <p className="text-gray-500 mt-1">Design your storefront layout.</p>
      </div>

      {/* Add New Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-[10px] font-bold text-gray-400 mb-5 uppercase tracking-widest">Add New Section</h3>
        <div className="flex flex-wrap gap-3">
          {sectionTypes.map(({ type, icon: Icon }) => (
            <button key={type} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2.5 shadow-sm"
              onClick={() => {
                const newId = Date.now().toString();
                const typeKey = type.replace(/\s/g, '');
                const cfg = defaultConfig(typeKey);
                // Auto-add first slide for slider types
                if ((typeKey === 'ImageSlider' || typeKey === 'HeroSlider') && cfg.slides) {
                  cfg.slides = [{ id: Date.now().toString() + '_0', desktopImage: '', mobileImage: '', imageFit: 'cover', linkUrl: '', altText: '' }];
                }
                if (typeKey === 'VideoShowcase' && cfg.videos) {
                  cfg.videos = [emptyVideo()];
                }
                const newSec = { id: newId, type: typeKey, title: type, subtitle: '', position: arr.length + 1, config: cfg };
                setLayout({ ...layout, homeBuilder: [...arr, newSec] });
                setExpandedId(newId);
              }}
            >
              <Icon size={16} className="text-gray-400"/> {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{arr.length} Sections</span>
        <button onClick={() => setExpandedId(expandedId ? null : 'all')} className="text-[11px] font-bold text-gray-500 hover:text-gray-800 tracking-wide">
          {expandedId === 'all' ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Section List */}
      <div className="space-y-3">
        {arr.map((section, index) => {
          const isExpanded = expandedId === section.id || expandedId === 'all';
          return (
            <div key={section.id} className={`bg-white rounded-2xl border ${isExpanded ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'} transition-all`}>
              {/* Row Header */}
              <div className="p-3.5 flex items-center gap-4 cursor-pointer group" onClick={() => setExpandedId(isExpanded ? null : section.id)}>
                <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-100">{index + 1}</div>
                <div className="shrink-0 min-w-[140px]">
                  <span className={`px-2.5 py-1 text-[9px] font-bold tracking-widest rounded uppercase border ${getBadgeStyle(section.type)}`}>
                    {section.type.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex-1 px-2" onClick={e => e.stopPropagation()}>
                  <input type="text" className="w-full bg-transparent font-semibold text-[13px] text-gray-700 outline-none placeholder-gray-300" value={section.title}
                    onChange={e => updateSection({ ...section, title: e.target.value })}/>
                </div>
                <div className="flex items-center gap-3 shrink-0 pr-2" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center bg-gray-50/80 rounded-lg border border-gray-200/60 px-2.5 py-1 gap-2">
                    <span className="text-[10px] font-bold text-gray-400">POS</span>
                    <select className="bg-transparent text-xs font-bold text-gray-700 border-none outline-none cursor-pointer pr-4 appearance-none" value={section.position}
                      onChange={e => {
                        const newPos = parseInt(e.target.value);
                        const nb = [...layout.homeBuilder];
                        const ti = nb.findIndex(s => s.id === section.id);
                        const op = nb[ti].position;
                        const sw = nb.find(s => s.position === newPos);
                        if (sw) sw.position = op;
                        nb[ti].position = newPos;
                        setLayout({ ...layout, homeBuilder: nb });
                      }}>
                      {arr.map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
                    </select>
                    <ChevronDown size={12} className="text-gray-400 -ml-2 pointer-events-none"/>
                  </div>
                  <div className="flex items-center gap-1 text-gray-300">
                    <button className="p-1 hover:text-gray-600" onClick={() => {
                      if (index > 0) { const nb=[...layout.homeBuilder]; const p=arr[index-1]; const ti=nb.findIndex(s=>s.id===section.id); const pi=nb.findIndex(s=>s.id===p.id); const t=nb[ti].position; nb[ti].position=nb[pi].position; nb[pi].position=t; setLayout({...layout,homeBuilder:nb}); }
                    }}>↑</button>
                    <button className="p-1 hover:text-gray-600" onClick={() => {
                      if (index<arr.length-1) { const nb=[...layout.homeBuilder]; const n=arr[index+1]; const ti=nb.findIndex(s=>s.id===section.id); const ni=nb.findIndex(s=>s.id===n.id); const t=nb[ti].position; nb[ti].position=nb[ni].position; nb[ni].position=t; setLayout({...layout,homeBuilder:nb}); }
                    }}>↓</button>
                    <button className="p-1.5 ml-1 text-red-300 hover:text-red-500 hover:bg-red-50 rounded" onClick={() => {
                      const nb=layout.homeBuilder.filter(s=>s.id!==section.id); nb.sort((a,b)=>a.position-b.position).forEach((s,i)=>s.position=i+1); setLayout({...layout,homeBuilder:nb});
                    }}><Trash2 size={13}/></button>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600">{isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</button>
                </div>
              </div>
              {/* Expanded Config */}
              {isExpanded && (
                <div className="px-5 pb-5">
                  <SectionConfig section={section} onUpdate={updateSection} categories={categories} products={products} />
                </div>
              )}
            </div>
          );
        })}
        {arr.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-semibold mb-1">No Sections Added</p>
            <p className="text-xs text-gray-400">Click a button above to add a section to your homepage.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-8">
        <button onClick={handleSave} className="bg-[#1e293b] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-slate-900 transition-colors flex items-center gap-2">
          <Save size={18}/> Save Changes
        </button>
      </div>
    </div>
    </PageWrapper>
  );
};

export default AdminHomepageBuilder;
