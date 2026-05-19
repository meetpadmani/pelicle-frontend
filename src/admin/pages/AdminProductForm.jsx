import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoriesAPI, productsAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Save, Upload, X, Plus,
  Package, Tag, Image as ImageIcon, Star, Eye, EyeOff, Shirt
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const GENDER_OPTIONS = ['Men', 'Women', 'Unisex', 'Kids'];

const CLOTHING_SUBCATEGORIES = {
  Men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Ethnic Wear', 'Kurta', 'Blazer', 'Shorts', 'Activewear', 'Innerwear', 'Accessories'],
  Women: ['Tops', 'Kurtas', 'Sarees', 'Jeans', 'Dresses', 'Lehengas', 'Skirts', 'Blazers', 'Activewear', 'Innerwear', 'Accessories', 'Co-ord Sets', 'Jumpsuits'],
  Unisex: ['T-Shirts', 'Hoodies', 'Jackets', 'Joggers', 'Shorts', 'Activewear']
};

const PRESET_COLORS = [
  { name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#000000' }, { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Red', hex: '#E53E3E' }, { name: 'Green', hex: '#276749' }, { name: 'Yellow', hex: '#ECC94B' },
  { name: 'Pink', hex: '#ED64A6' }, { name: 'Orange', hex: '#ED8936' }, { name: 'Purple', hex: '#805AD5' },
  { name: 'Grey', hex: '#718096' }, { name: 'Brown', hex: '#7B3F00' }, { name: 'Beige', hex: '#F5F0E8' },
  { name: 'Maroon', hex: '#800000' }, { name: 'Teal', hex: '#285E61' }, { name: 'Olive', hex: '#556B2F' }
];

const EMPTY_CORE = {
  name: '', sku: '', category: '', gender: '', subCategory: '', sizes: [], colors: [],
  fabric: '', fit: '', sleeve: '', occasion: [], pattern: '', washCare: '', countryOfOrigin: 'India',
  brand: '', styleCode: '',
  price: '', salePrice: '', stock: '',
  shortDescription: '', description: '',
  isFeatured: false, isActive: true,
  tags: '', benefits: '',
  seo: { metaTitle: '', metaDescription: '', keywords: '' },
};

// ─── Small helpers ────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-xs font-semibold text-charcoal mb-1.5 uppercase tracking-wide">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const Toggle = ({ value, onChange, label }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${value ? 'bg-green-500' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-5' : ''}`} />
    </button>
    <span className="text-sm font-medium text-charcoal">{label}</span>
  </div>
);

// ─── Main form component ──────────────────────────────────────────────────────
const AdminProductForm = ({ productId, initialData }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isEdit = Boolean(productId);

  const [categories, setCategories] = useState([]);
  const [core, setCore] = useState(EMPTY_CORE);
  const [images, setImages] = useState([]); // string URLs
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('core');
  const [dragging, setDragging] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [loadingProduct, setLoadingProduct] = useState(isEdit && !initialData);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');

  // helper to patch one core key
  const setCore_ = (k, v) => setCore(prev => ({ ...prev, [k]: v }));
  const setSeo_   = (k, v) => setCore(prev => ({ ...prev, seo: { ...prev.seo, [k]: v } }));

  // ── Load categories ─────────────────────────────────────────────────────────
  useEffect(() => {
    categoriesAPI.getAll()
      .then(res => setCategories(res.data.categories ?? []))
      .catch(() => {});
  }, []);

  // ── Pre-fill when editing ───────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      prefill(initialData);
    } else if (isEdit) {
      setLoadingProduct(true);
      productsAPI.getById(productId)
        .then(res => {
          const p = res.data.product ?? res.data;
          prefill(p);
        })
        .catch(() => toast.error('Failed to load product'))
        .finally(() => setLoadingProduct(false));
    }
  }, [productId, initialData]);

  const prefill = (p) => {
    setCore({
      name:             p.name ?? '',
      sku:              p.sku ?? '',
      category:         p.category?._id ?? p.category ?? '',
      gender:           p.gender ?? '',
      subCategory:      p.subCategory ?? '',
      sizes:            p.sizes ?? [],
      colors:           p.colors ?? [],
      fabric:           p.fabric ?? '',
      fit:              p.fit ?? '',
      sleeve:           p.sleeve ?? '',
      occasion:         p.occasion ?? [],
      pattern:          p.pattern ?? '',
      washCare:         Array.isArray(p.washCare) ? p.washCare.join('\n') : (p.washCare ?? ''),
      countryOfOrigin:  p.countryOfOrigin ?? 'India',
      brand:            p.brand ?? '',
      styleCode:        p.styleCode ?? '',
      price:            p.price ?? '',
      salePrice:        p.discountPrice ?? p.salePrice ?? '',
      stock:            p.stock ?? '',
      shortDescription: p.shortDescription ?? '',
      description:      p.description ?? '',
      isFeatured:       p.isFeatured ?? false,
      isActive:         p.isActive ?? true,
      tags:             Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags ?? ''),
      benefits:         Array.isArray(p.benefits) ? p.benefits.join('\n') : (p.benefits ?? ''),
      seo: {
        metaTitle:       p.seo?.metaTitle ?? '',
        metaDescription: p.seo?.metaDescription ?? '',
        keywords:        Array.isArray(p.seo?.keywords) ? p.seo.keywords.join(', ') : (p.seo?.keywords ?? ''),
      },
    });
    // images: support { url } objects or raw strings
    const imgs = (p.images ?? []).map(img => (typeof img === 'string' ? img : img.url));
    setImages(imgs);
  };

  // ── SKU generator ───────────────────────────────────────────────────────────
  const generateSku = () => {
    const prefix = core.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4) || 'PROD';
    const rand = Math.random().toString(36).toUpperCase().slice(2, 6);
    setCore_('sku', `${prefix}-${rand}`);
  };

  // ── Image upload ────────────────────────────────────────────────────────────
  const uploadFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const results = await Promise.all(
        Array.from(files).map(async (file) => {
          const fd = new FormData();
          fd.append('image', file);
          const res = await uploadAPI.uploadImage(file);
          return res.data?.url ?? res.data?.image?.url ?? null;
        })
      );
      const valid = results.filter(Boolean);
      setImages(prev => [...prev, ...valid]);
      if (valid.length) toast.success(`${valid.length} image${valid.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  const addPasteUrl = () => {
    if (!pasteUrl.trim()) return;
    setImages(prev => [...prev, pasteUrl.trim()]);
    setPasteUrl('');
  };

  // ── Validate + Save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!core.name.trim())        { toast.error('Product name is required'); setTab('core'); return; }
    if (!core.category)           { toast.error('Please select a category'); setTab('core'); return; }
    if (!core.price)              { toast.error('Price is required');         setTab('core'); return; }
    if (!core.description.trim()) { toast.error('Description is required');  setTab('core'); return; }

    if (!core.gender) { toast.error('Gender is required'); setTab('clothing'); return; }
    if (!core.subCategory) { toast.error('Sub Category is required'); setTab('clothing'); return; }
    if (core.sizes.length === 0) { toast.error('Select at least one size'); setTab('clothing'); return; }
    if (core.colors.length === 0) { toast.error('Select at least one color'); setTab('clothing'); return; }

    setSaving(true);
    try {
      const payload = {
        name:             core.name,
        sku:              core.sku,
        category:         core.category,
        gender:           core.gender,
        subCategory:      core.subCategory,
        sizes:            core.sizes,
        colors:           core.colors,
        fabric:           core.fabric,
        fit:              core.fit,
        sleeve:           core.sleeve,
        occasion:         core.occasion,
        pattern:          core.pattern,
        washCare:         core.washCare ? core.washCare.split('\n').map(w => w.trim()).filter(Boolean) : [],
        countryOfOrigin:  core.countryOfOrigin,
        brand:            core.brand,
        styleCode:        core.styleCode,
        price:            Number(core.price),
        discountPrice:    core.salePrice ? Number(core.salePrice) : undefined,
        stock:            Number(core.stock) || 0,
        shortDescription: core.shortDescription,
        description:      core.description,
        isFeatured:       core.isFeatured,
        isActive:         core.isActive,
        images,
        tags:     core.tags.split(',').map(t => t.trim()).filter(Boolean),
        benefits: core.benefits.split('\n').map(b => b.trim()).filter(Boolean),
        seo: {
          metaTitle:       core.seo.metaTitle,
          metaDescription: core.seo.metaDescription,
          keywords:        core.seo.keywords.split(',').map(k => k.trim()).filter(Boolean),
        },
      };

      if (isEdit) {
        await productsAPI.update(productId, payload);
        toast.success('Product updated!');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || `Failed to ${isEdit ? 'update' : 'create'} product`);
    } finally {
      setSaving(false);
    }
  };

  // ── Tabs config ─────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'core',     label: 'Core Info',          icon: Package },
    { key: 'clothing', label: '👕 Clothing Details', icon: Shirt },
    { key: 'images',   label: `Images (${images.length})`, icon: ImageIcon },
    { key: 'seo',      label: 'SEO',                icon: Tag },
  ];

  // ── Full-page loader while fetching product ─────────────────────────────────
  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-deep-forest border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/products" className="p-2 rounded-lg text-cool-taupe hover:bg-light-beige hover:text-charcoal transition-all">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[22px] font-heading font-extrabold text-deep-forest leading-tight">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
          {isEdit && core.name && (
            <p className="text-sm text-cool-taupe font-medium mt-0.5">{core.name}</p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm ml-auto"
        >
          <Save size={16} />
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-stone-gray mb-6">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
              tab === key
                ? 'border-deep-forest text-deep-forest'
                : 'border-transparent text-cool-taupe hover:text-charcoal'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: CORE INFO
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'core' && (
        <div className="space-y-5">

          {/* Basic */}
          <div className="card p-6 space-y-5">
            <h2 className="font-heading font-bold text-deep-forest">Basic Information</h2>

            <div>
              <Label required>Product Name</Label>
              <input
                className="input-field"
                placeholder="e.g. Classic Linen Shirt"
                value={core.name}
                onChange={e => setCore_('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU</Label>
                <div className="flex gap-2">
                  <input
                    className="input-field"
                    placeholder="e.g. SHRT-A1B2"
                    value={core.sku}
                    onChange={e => setCore_('sku', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={generateSku}
                    className="px-3 py-2 text-xs font-semibold rounded-lg border border-stone-gray text-cool-taupe hover:border-deep-forest hover:text-deep-forest transition-all whitespace-nowrap"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <Label required>Category</Label>
                <select
                  className="input-field"
                  value={core.category}
                  onChange={e => setCore_('category', e.target.value)}
                >
                  <option value="">Select category…</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stock</Label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="0"
                  value={core.stock}
                  onChange={e => setCore_('stock', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6 space-y-5">
            <h2 className="font-heading font-bold text-deep-forest">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Price (₹)</Label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="999"
                  value={core.price}
                  onChange={e => setCore_('price', e.target.value)}
                />
              </div>
              <div>
                <Label>Sale Price (₹)</Label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="Leave blank for no discount"
                  value={core.salePrice}
                  onChange={e => setCore_('salePrice', e.target.value)}
                />
              </div>
            </div>
            {core.price && core.salePrice && Number(core.salePrice) < Number(core.price) && (
              <p className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">
                💰 {Math.round(((core.price - core.salePrice) / core.price) * 100)}% discount applied
              </p>
            )}
          </div>

          {/* Description */}
          <div className="card p-6 space-y-5">
            <h2 className="font-heading font-bold text-deep-forest">Description</h2>
            <div>
              <Label>Short Description</Label>
              <input
                className="input-field"
                placeholder="One-line product summary (shown in listings)"
                value={core.shortDescription}
                onChange={e => setCore_('shortDescription', e.target.value)}
              />
            </div>
            <div>
              <Label required>Full Description</Label>
              <textarea
                rows={5}
                className="input-field resize-none"
                placeholder="Detailed product description…"
                value={core.description}
                onChange={e => setCore_('description', e.target.value)}
              />
            </div>
            <div>
              <Label>Benefits (one per line)</Label>
              <textarea
                rows={3}
                className="input-field resize-none"
                placeholder={`100% Pure Cotton\nMachine Washable\nComfort Fit`}
                value={core.benefits}
                onChange={e => setCore_('benefits', e.target.value)}
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <input
                className="input-field"
                placeholder="casual, summer, cotton, linen"
                value={core.tags}
                onChange={e => setCore_('tags', e.target.value)}
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="card p-6 space-y-4">
            <h2 className="font-heading font-bold text-deep-forest">Visibility</h2>
            <Toggle
              value={core.isActive}
              onChange={v => setCore_('isActive', v)}
              label="Published (visible to customers)"
            />
            <Toggle
              value={core.isFeatured}
              onChange={v => setCore_('isFeatured', v)}
              label="Featured (shown on homepage)"
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: CLOTHING DETAILS
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'clothing' && (
        <div className="space-y-5">
          {/* Section 1: Basic Clothing Info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-sm text-gray-800 flex items-center gap-2"><Shirt size={15}/> Basic Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand</Label>
                <input className="input-field" placeholder="e.g. Zara, H&M, Fabindia" value={core.brand} onChange={e => setCore_('brand', e.target.value)} />
              </div>
              <div>
                <Label>Style Code</Label>
                <div className="flex gap-2">
                  <input className="input-field" placeholder="e.g. STY-ABC12" value={core.styleCode} onChange={e => setCore_('styleCode', e.target.value)} />
                  <button type="button" onClick={() => setCore_('styleCode', `STY-${Math.random().toString(36).toUpperCase().slice(2,7)}`)} className="px-3 py-2 text-xs font-semibold rounded-lg border border-stone-gray text-cool-taupe hover:border-deep-forest hover:text-deep-forest transition-all whitespace-nowrap">Auto</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label required>Gender</Label>
                <select className="input-field" value={core.gender} onChange={e => { setCore_('gender', e.target.value); setCore_('subCategory', ''); }}>
                  <option value="">Select...</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div>
                <Label required>Sub Category</Label>
                <select className="input-field" value={core.subCategory} onChange={e => setCore_('subCategory', e.target.value)} disabled={!core.gender}>
                  {!core.gender ? <option value="">Select gender first</option> : <option value="">Select...</option>}
                  {core.gender && CLOTHING_SUBCATEGORIES[core.gender]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>
              <div>
                <Label>Fit</Label>
                <select className="input-field" value={core.fit} onChange={e => setCore_('fit', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Regular">Regular</option>
                  <option value="Slim">Slim</option>
                  <option value="Oversized">Oversized</option>
                  <option value="Relaxed">Relaxed</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fabric/Material</Label>
                <input className="input-field" placeholder="e.g. 100% Cotton, Polyester Blend" value={core.fabric} onChange={e => setCore_('fabric', e.target.value)} />
              </div>
              <div>
                <Label>Pattern</Label>
                <input className="input-field" placeholder="e.g. Solid, Striped, Floral, Checked" value={core.pattern} onChange={e => setCore_('pattern', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sleeve Type</Label>
                <select className="input-field" value={core.sleeve} onChange={e => setCore_('sleeve', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Full Sleeve">Full Sleeve</option>
                  <option value="Half Sleeve">Half Sleeve</option>
                  <option value="Sleeveless">Sleeveless</option>
                  <option value="Cap Sleeve">Cap Sleeve</option>
                </select>
              </div>
              <div>
                <Label>Country of Origin</Label>
                <input className="input-field" value={core.countryOfOrigin} onChange={e => setCore_('countryOfOrigin', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section 2: Sizes */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-sm">📐 Available Sizes</h2>
            
            <div>
              <p className="text-xs text-gray-400 mb-2">Standard Sizes</p>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => {
                  const isSelected = core.sizes.includes(size);
                  return (
                    <button key={size} type="button" onClick={() => setCore_('sizes', isSelected ? core.sizes.filter(s => s !== size) : [...core.sizes, size])} className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${isSelected ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2 mt-3">Numeric Sizes</p>
              <div className="flex flex-wrap gap-2">
                {['28', '30', '32', '34', '36', '38', '40', '42'].map(size => {
                  const isSelected = core.sizes.includes(size);
                  return (
                    <button key={size} type="button" onClick={() => setCore_('sizes', isSelected ? core.sizes.filter(s => s !== size) : [...core.sizes, size])} className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${isSelected ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
            <span className="block text-xs text-gray-400 mt-2">{core.sizes.length} sizes selected</span>
          </div>

          {/* Section 3: Colors */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-sm">🎨 Available Colors</h2>
            
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => {
                const isSelected = core.colors.some(cc => cc.hex === c.hex);
                return (
                  <button key={c.hex} type="button" title={c.name} onClick={() => setCore_('colors', isSelected ? core.colors.filter(cc => cc.hex !== c.hex) : [...core.colors, c])} className={`w-8 h-8 rounded-full border-2 transition-all ${isSelected ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-400' : 'border-gray-200 hover:border-gray-400'}`} style={{ backgroundColor: c.hex }} />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {core.colors.map(c => (
                <span key={c.hex} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                  <span style={{background: c.hex}} className="w-3 h-3 rounded-full border border-gray-300 inline-block"/>
                  {c.name}
                  <button type="button" onClick={() => setCore_('colors', core.colors.filter(cc => cc.hex !== c.hex))} className="text-gray-400 hover:text-red-500 ml-1">
                    <X size={11}/>
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 max-w-sm">
              <input type="text" placeholder="Color name e.g. Dusty Rose" value={customColorName} onChange={e => setCustomColorName(e.target.value)} className="input-field flex-1 text-sm py-2" />
              <input type="color" value={customColorHex} onChange={e => setCustomColorHex(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1 shrink-0" />
              <button type="button" onClick={() => { if(customColorName.trim()){ setCore_('colors', [...core.colors, { name: customColorName.trim(), hex: customColorHex }]); setCustomColorName(''); } }} className="btn-secondary py-2 px-4 text-sm whitespace-nowrap">Add</button>
            </div>
          </div>

          {/* Section 4: Occasion & Care */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-sm">✨ Occasion & Care</h2>
            
            <div>
              <Label>Occasion</Label>
              <div className="flex flex-wrap gap-2">
                {['Casual', 'Formal', 'Party', 'Ethnic', 'Festive', 'Wedding', 'Sports', 'Beach', 'Lounge', 'Office'].map(occ => {
                  const isSelected = core.occasion.includes(occ);
                  return (
                    <button key={occ} type="button" onClick={() => setCore_('occasion', isSelected ? core.occasion.filter(o => o !== occ) : [...core.occasion, occ])} className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${isSelected ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {occ}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <Label>Wash Care Instructions</Label>
              <textarea rows={3} className="input-field resize-none" placeholder="e.g. Machine wash cold\nDo not bleach\nTumble dry low\nIron on medium heat" value={core.washCare} onChange={e => setCore_('washCare', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">One instruction per line</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: IMAGES
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'images' && (
        <div className="space-y-5">
          <div className="card p-6 space-y-5">
            <h2 className="font-heading font-bold text-deep-forest">Product Images</h2>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
                dragging ? 'border-deep-forest bg-light-beige' : 'border-stone-gray hover:border-deep-forest hover:bg-light-beige/50'
              }`}
            >
              {uploading ? (
                <div className="w-8 h-8 rounded-full border-2 border-deep-forest border-t-transparent animate-spin" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-light-beige flex items-center justify-center">
                    <Upload size={22} className="text-cool-taupe" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-charcoal">Drop images here or click to browse</p>
                    <p className="text-xs text-cool-taupe mt-1">PNG, JPG, WEBP — first image becomes the cover</p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={e => uploadFiles(e.target.files)}
            />

            {/* Paste URL */}
            <div className="flex gap-2">
              <input
                className="input-field text-sm"
                placeholder="Or paste an image URL…"
                value={pasteUrl}
                onChange={e => setPasteUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPasteUrl()}
              />
              <button
                type="button"
                onClick={addPasteUrl}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-stone-gray text-charcoal hover:border-deep-forest hover:text-deep-forest transition-all whitespace-nowrap flex items-center gap-1.5"
              >
                <Plus size={14} /> Add URL
              </button>
            </div>

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((src, idx) => (
                  <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-stone-gray bg-light-beige">
                    <img src={src} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-deep-forest text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: SEO
         ══════════════════════════════════════════════════════════════════════ */}
      {tab === 'seo' && (
        <div className="space-y-5">
          <div className="card p-6 space-y-5">
            <h2 className="font-heading font-bold text-deep-forest">SEO Settings</h2>
            <p className="text-xs text-cool-taupe -mt-3">Optimise how this product appears in search engines.</p>

            <div>
              <Label>Meta Title</Label>
              <input
                className="input-field"
                placeholder="60 characters recommended"
                value={core.seo.metaTitle}
                onChange={e => setSeo_('metaTitle', e.target.value)}
              />
              <p className="text-[11px] text-cool-taupe mt-1">{core.seo.metaTitle.length}/60 characters</p>
            </div>

            <div>
              <Label>Meta Description</Label>
              <textarea
                rows={3}
                className="input-field resize-none"
                placeholder="160 characters recommended"
                value={core.seo.metaDescription}
                onChange={e => setSeo_('metaDescription', e.target.value)}
              />
              <p className="text-[11px] text-cool-taupe mt-1">{core.seo.metaDescription.length}/160 characters</p>
            </div>

            <div>
              <Label>Keywords (comma-separated)</Label>
              <input
                className="input-field"
                placeholder="men shirt, casual wear, cotton"
                value={core.seo.keywords}
                onChange={e => setSeo_('keywords', e.target.value)}
              />
            </div>

            {/* Live preview */}
            {(core.seo.metaTitle || core.name) && (
              <div className="bg-light-beige rounded-xl p-4 border border-stone-gray">
                <p className="text-[11px] text-cool-taupe font-semibold uppercase tracking-wider mb-2">Search Preview</p>
                <p className="text-blue-700 text-sm font-medium truncate">
                  {core.seo.metaTitle || core.name}
                </p>
                <p className="text-green-700 text-[11px] mt-0.5">pelicle.com/products/{core.name.toLowerCase().replace(/\s+/g, '-') || '...'}</p>
                <p className="text-charcoal text-xs mt-1 line-clamp-2">
                  {core.seo.metaDescription || core.shortDescription || core.description || 'No meta description provided.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom Save Bar ───────────────────────────────────────────────────── */}
      <div className="sticky bottom-4 mt-8">
        <div className="bg-white/90 backdrop-blur-sm border border-stone-gray rounded-2xl px-6 py-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-xs text-cool-taupe font-medium">
              {isEdit ? 'Editing:' : 'Creating:'} <span className="font-semibold text-charcoal">{core.name || 'Untitled product'}</span>
            </p>
            {images.length > 0 && (
              <p className="text-[11px] text-cool-taupe mt-0.5">{images.length} image{images.length !== 1 ? 's' : ''} attached</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/products" className="btn-secondary text-sm py-2 px-5">
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6"
            >
              <Save size={15} />
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;
