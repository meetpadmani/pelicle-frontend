import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Search, Edit2, Trash2, Package,
  Users, ShoppingBag, AlertTriangle, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, X, Tag, Eye
} from 'lucide-react';
import PageWrapper from '../components/PageWrapper';

// ─── Subcategory Chip Map ─────────────────────────────────────────────────────
const SUBCATEGORIES = {
  Men: ['T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Jackets', 'Ethnic Wear', 'Activewear'],
  Women: ['Tops', 'Kurtas', 'Sarees', 'Jeans', 'Dresses', 'Lehengas', 'Activewear'],
};

// ─── Gender Badge ─────────────────────────────────────────────────────────────
const GenderBadge = ({ gender }) => {
  const map = {
    Men:    'bg-blue-50 text-blue-600 border-blue-100',
    Women:  'bg-pink-50 text-pink-600 border-pink-100',
    Unisex: 'bg-purple-50 text-purple-600 border-purple-100',
    Kids:   'bg-orange-50 text-orange-600 border-orange-100',
  };
  return (
    <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-xl border ${map[gender] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {gender}
    </span>
  );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const StatusToggle = ({ isActive, onToggle }) => (
  <button
    onClick={onToggle}
    className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none shadow-inner ${isActive ? 'bg-[#0B5345]' : 'bg-[#E3E8E5]'}`}
  >
    <span
      className={`inline-block w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, sub }) => (
  <div className="bg-white rounded-3xl border border-[#E3E8E5] p-6 shadow-sm shadow-[#0B5345]/5 flex flex-col md:flex-row md:items-start gap-5 hover:border-[#0B5345]/20 hover:shadow-md transition-all">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon size={24} className={iconColor} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-[#5C756D] uppercase tracking-wider mb-1.5">{label}</p>
      <h3 className="text-3xl font-bold text-[#0B5345] leading-none mb-1.5">{value ?? '—'}</h3>
      {sub && <p className="text-xs text-[#8BA699] font-medium">{sub}</p>}
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminProducts = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [products, setProducts]       = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalDocs, setTotalDocs]     = useState(0);

  const [search, setSearch]           = useState('');
  const [genderTab, setGenderTab]     = useState('All');   // 'All' | 'Men' | 'Women'
  const [activeChip, setActiveChip]   = useState('');       // subcategory chip
  const [toggling, setToggling]       = useState(null);     // product id being toggled

  const LIMIT = 15;

  // ── Loaders ────────────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: LIMIT,
        ...(search      && { search }),
        ...(genderTab !== 'All' && { gender: genderTab }),
        ...(activeChip  && { subcategory: activeChip }),
      };
      const res = await productsAPI.getAll(params);
      const d = res.data;
      // Support both shapes: { products, totalPages, total } or { data, pagination }
      setProducts(d.products ?? d.data ?? []);
      setTotalPages(d.totalPages ?? d.pagination?.totalPages ?? 1);
      setTotalDocs(d.total ?? d.pagination?.total ?? 0);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, genderTab, activeChip]);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      // Try /admin/products/stats; fallback gracefully if route doesn't exist
      const res = await productsAPI.getAll({ limit: 1000 });
      const all = res.data.products ?? res.data.data ?? [];
      const menCount    = all.filter(p => p.gender === 'Men').length;
      const womenCount  = all.filter(p => p.gender === 'Women').length;
      const lowStock    = all.filter(p => p.stock <= 5).length;
      setStats({ total: all.length, men: menCount, women: womenCount, lowStock });
    } catch {
      // silently fail — stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Gender tab change ──────────────────────────────────────────────────────
  const handleGenderTab = (tab) => {
    setGenderTab(tab);
    setActiveChip('');
    setPage(1);
  };

  // ── Subcategory chip ───────────────────────────────────────────────────────
  const handleChip = (chip) => {
    setActiveChip(prev => prev === chip ? '' : chip);
    setPage(1);
  };

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ── Toggle active ──────────────────────────────────────────────────────────
  const handleToggle = async (product) => {
    if (toggling) return;
    setToggling(product._id);
    try {
      // Optimistic update
      setProducts(prev =>
        prev.map(p => p._id === product._id ? { ...p, isActive: !p.isActive } : p)
      );
      await productsAPI.update(product._id, { isActive: !product.isActive });
      toast.success(`Product ${!product.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      // Revert on error
      setProducts(prev =>
        prev.map(p => p._id === product._id ? { ...p, isActive: product.isActive } : p)
      );
      toast.error('Failed to update status');
    } finally {
      setToggling(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      loadProducts();
      loadStats();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getCategoryName = (cat) => {
    if (!cat) return '—';
    if (typeof cat === 'string') return cat;
    return cat.name ?? '—';
  };

  const formatPrice = (price) =>
    `₹${Number(price).toLocaleString('en-IN')}`;

  const getDiscountPercent = (price, salePrice) => {
    if (!salePrice || salePrice >= price) return null;
    return Math.round(((price - salePrice) / price) * 100);
  };

  const currentSubcategories = SUBCATEGORIES[genderTab] ?? [];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B5345] tracking-tight">
            Products
          </h1>
          <p className="text-sm font-medium text-[#5C756D] mt-1">
            Manage your catalogue · {totalDocs} items
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-gradient-to-r from-[#0B5345] to-[#0E8A74] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#0B5345]/20 hover:shadow-xl hover:shadow-[#0B5345]/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={ShoppingBag}
          iconBg="bg-[#0B5345]/10"
          iconColor="text-[#0B5345]"
          label="Total Products"
          value={statsLoading ? '…' : stats?.total ?? totalDocs}
          sub="in catalogue"
        />
        <StatCard
          icon={Users}
          iconBg="bg-blue-50 text-blue-500"
          iconColor="text-blue-500"
          label="Men's Products"
          value={statsLoading ? '…' : stats?.men ?? '—'}
          sub="Men's category"
        />
        <StatCard
          icon={Tag}
          iconBg="bg-pink-50 text-pink-500"
          iconColor="text-pink-500"
          label="Women's Products"
          value={statsLoading ? '…' : stats?.women ?? '—'}
          sub="Women's category"
        />
        <StatCard
          icon={AlertTriangle}
          iconBg="bg-amber-50 text-amber-500"
          iconColor="text-amber-500"
          label="Low Stock"
          value={statsLoading ? '…' : stats?.lowStock ?? '—'}
          sub="≤ 5 units remaining"
        />
      </div>

      {/* ── Filters + Search ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-[#E3E8E5] shadow-sm mb-6 overflow-hidden">

        {/* Gender Tabs */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-[#F4F7F5] bg-[#FAFBF9]">
          {['All', 'Men', 'Women'].map(tab => (
            <button
              key={tab}
              onClick={() => handleGenderTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                genderTab === tab
                  ? 'bg-[#0B5345] text-white shadow-md shadow-[#0B5345]/20'
                  : 'text-[#8BA699] hover:text-[#0B5345] hover:bg-white'
              }`}
            >
              {tab}
            </button>
          ))}

          {/* Search – pushed to right */}
          <div className="ml-auto relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8BA699]" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={handleSearch}
              className="pl-11 pr-10 py-2.5 bg-white border border-[#E3E8E5] rounded-xl text-sm font-medium text-[#0B5345] focus:outline-none focus:border-[#0B5345] focus:ring-2 focus:ring-[#0B5345]/20 transition-all w-64 placeholder:text-[#8BA699]"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA699] hover:text-[#0B5345] p-1 rounded-md hover:bg-[#F4F7F5] transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Subcategory Chips */}
        {currentSubcategories.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-4 flex-wrap border-b border-[#F4F7F5]">
            {currentSubcategories.map(chip => (
              <button
                key={chip}
                onClick={() => handleChip(chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
                  activeChip === chip
                    ? 'bg-[#0B5345] text-white border-[#0B5345]'
                    : 'bg-[#FAFBF9] text-[#5C756D] border-[#E3E8E5] hover:border-[#0B5345]/30 hover:text-[#0B5345]'
                }`}
              >
                {chip}
              </button>
            ))}
            {activeChip && (
              <button
                onClick={() => setActiveChip('')}
                className="ml-2 flex items-center gap-1.5 text-xs font-bold text-[#8BA699] hover:text-red-500 transition-colors bg-red-50/50 hover:bg-red-50 px-3 py-1.5 rounded-full"
              >
                <X size={12} strokeWidth={3} /> Clear
              </button>
            )}
          </div>
        )}

        {/* ── Table ──────────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#F4F7F5] bg-[#FAFBF9]">
                {['Product', 'Category', 'Gender', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                  <th
                    key={h}
                    className="px-6 py-4 text-[11px] font-bold text-[#5C756D] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F7F5]">

              {/* Loading Skeleton */}
              {loading && Array(6).fill(0).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse" />
                      <div className="space-y-2.5">
                        <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                        <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-xl animate-pulse" />
                      <div className="w-8 h-8 bg-gray-100 rounded-xl animate-pulse" />
                    </div>
                  </td>
                </tr>
              ))}

              {/* Empty State */}
              {!loading && products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-cool-taupe">
                      <Package size={40} strokeWidth={1.5} />
                      <p className="font-semibold text-sm">No products found</p>
                      {(search || genderTab !== 'All' || activeChip) && (
                        <button
                          onClick={() => { setSearch(''); setGenderTab('All'); setActiveChip(''); setPage(1); }}
                          className="text-xs text-olive-green font-semibold hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}

              {/* Data Rows */}
              {!loading && products.map(product => {
                const discount = getDiscountPercent(product.price, product.salePrice);
                const imageUrl = product.images?.[0]?.url ?? product.images?.[0] ?? '';
                const isLowStock = product.stock <= 5;

                return (
                  <tr
                    key={product._id}
                    className="hover:bg-[#FAFBF9] transition-colors duration-150"
                  >
                    {/* Product cell */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-[#F4F7F5] border border-[#E3E8E5] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[#FAFBF9] border border-[#E3E8E5] flex items-center justify-center shrink-0">
                            <Package size={20} className="text-[#8BA699]" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-[#0B5345] truncate max-w-[200px] text-[14px]">
                            {product.name}
                          </p>
                          {product.sku && (
                            <p className="text-[11px] text-[#5C756D] font-medium mt-0.5">
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-[#5C756D] font-medium whitespace-nowrap">
                      {getCategoryName(product.category)}
                    </td>

                    {/* Gender */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <GenderBadge gender={product.gender} />
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="font-bold text-[#0B5345]">
                          {formatPrice(product.salePrice ?? product.price)}
                        </span>
                        {discount && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-[#8BA699] line-through font-medium">
                              {formatPrice(product.price)}
                            </span>
                            <span className="bg-red-50 text-red-600 border border-red-100 rounded-md font-bold text-[10px] px-1.5 py-0.5">
                              -{discount}%
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                          isLowStock
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-[#0B5345]/5 text-[#0B5345] border-[#0B5345]/10'
                        }`}
                      >
                        {product.stock} in stock
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      <StatusToggle
                        isActive={product.isActive}
                        onToggle={() => handleToggle(product)}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="View on Storefront"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="p-2 rounded-xl text-[#5C756D] hover:bg-[#F4F7F5] hover:text-[#0B5345] transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-5 border-t border-[#F4F7F5] bg-white">
            <p className="text-xs text-[#5C756D] font-bold">
              Page {page} of {totalPages} · {totalDocs} products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-[#E3E8E5] text-[#0B5345] hover:bg-[#FAFBF9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                      pageNum === page
                        ? 'bg-[#0B5345] text-white shadow-md shadow-[#0B5345]/20'
                        : 'text-[#5C756D] hover:text-[#0B5345] hover:bg-[#FAFBF9] border border-[#E3E8E5]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-[#E3E8E5] text-[#0B5345] hover:bg-[#FAFBF9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageWrapper>
  );
};

export default AdminProducts;
