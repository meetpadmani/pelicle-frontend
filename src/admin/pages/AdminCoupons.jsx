import React, { useEffect, useState } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, Save, X, Tag, ToggleLeft, ToggleRight, BarChart2, ShoppingBag, TrendingDown, BookOpen } from "lucide-react";
import PageWrapper from '../components/PageWrapper';

const t = {
  ok: ({ title, sub }) => toast.success(`${title}${sub ? ': ' + sub : ''}`),
  info: ({ title, sub }) => toast(`${title}${sub ? ': ' + sub : ''}`),
  err: (msg) => toast.error(typeof msg === 'string' ? msg : (msg?.title ? `${msg.title}${msg.sub ? ': ' + msg.sub : ''}` : 'Error'))
};

const EMPTY_FORM = {
  code: "",
  discountType: "percent",
  discountValue: "",
  minOrderValue: "",
  minQty: "",
  maxUses: "",
  expiresAt: "",
  isActive: true,
  description: "",
  requiredBookId: "",
  requiredBookDisplay: "", // "Title (SKU: xxx)" — display only, not sent to API
  isFirstOrderOnly: false,
};

export default function AdminCoupons() {
  const auth = {}; // API interceptor handles token

  const [tab, setTab] = useState("coupons"); // "coupons" | "report"
  const [coupons, setCoupons] = useState([]);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // coupon object to delete

  // Book picker state
  const [bookSearch, setBookSearch] = useState("");
  const [bookResults, setBookResults] = useState([]);
  const [bookSearchLoading, setBookSearchLoading] = useState(false);

  async function searchBooks(q) {
    if (!q.trim()) { setBookResults([]); return; }
    setBookSearchLoading(true);
    try {
      const { data } = await API.get("/books", { params: { q, limit: 10 }, ...auth });
      setBookResults(data.books || data.items || []);
    } catch {
      // silent
    } finally {
      setBookSearchLoading(false);
    }
  }

  function selectBook(book) {
    const sku = book.inventory?.sku;
    set("requiredBookId", book._id);
    set("requiredBookDisplay", sku ? `${sku} — ${book.title}` : book.title);
    setBookSearch("");
    setBookResults([]);
  }

  function clearBook() {
    set("requiredBookId", "");
    set("requiredBookDisplay", "");
    setBookSearch("");
    setBookResults([]);
  }

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get("/coupons", auth);
      if (res.data?.ok || res.data?.success) {
        const mappedCoupons = res.data.coupons.map(c => ({
          ...c,
          discountType: c.discountType === 'percentage' ? 'percent' : 'flat',
          discountValue: c.value,
          minOrderValue: c.minOrderAmount,
          maxUses: c.usageLimit >= 9999 ? null : c.usageLimit,
          expiresAt: c.expiryDate
        }));
        setCoupons(mappedCoupons);
      }
    } catch {
      t.err({ title: "Load failed", sub: "Could not load coupons. Please refresh." });
    } finally {
      setLoading(false);
    }
  }

  async function loadReport() {
    setReportLoading(true);
    try {
      const res = await API.get("/coupons/report", auth);
      if (res.data?.ok) setReport(res.data.report);
    } catch {
      t.err({ title: "Load failed", sub: "Could not load usage report. Please try again." });
    } finally {
      setReportLoading(false);
    }
  }

  function switchTab(t) {
    setTab(t);
    if (t === "report" && report.length === 0) loadReport();
  }

  function openNew() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(c) {
    setEditId(c._id);
    const book = c.requiredBookId; // populated object or null
    const bookId = book?._id || "";
    const bookDisplay = book
      ? (book.inventory?.sku ? `${book.inventory.sku} — ${book.title}` : book.title)
      : "";
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderValue: c.minOrderValue ? String(c.minOrderValue) : "",
      minQty: c.minQty ? String(c.minQty) : "",
      maxUses: c.maxUses ? String(c.maxUses) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      isActive: c.isActive,
      description: c.description || "",
      requiredBookId: bookId,
      requiredBookDisplay: bookDisplay,
      isFirstOrderOnly: c.isFirstOrderOnly || false,
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    if (!form.code.trim()) { t.info({ title: "Code required", sub: "Please enter a coupon code." }); return; }
    if (!form.discountValue || isNaN(Number(form.discountValue))) { t.info({ title: "Invalid discount", sub: "Enter a valid discount value." }); return; }
    if (form.discountType === "percent" && (Number(form.discountValue) <= 0 || Number(form.discountValue) > 100)) {
      t.info({ title: "Invalid percentage", sub: "Percent discount must be between 1 and 100." }); return;
    }
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType === 'percent' ? 'percentage' : 'flat',
        value: Number(form.discountValue),
        minOrderAmount: form.minOrderValue ? Number(form.minOrderValue) : 0,
        usageLimit: form.maxUses ? Number(form.maxUses) : 10000,
        expiryDate: form.expiresAt || new Date(Date.now() + 31536000000).toISOString(),
        isActive: form.isActive,
        description: form.description,
      };
      if (editId) {
        await API.put(`/coupons/${editId}`, payload, auth);
        t.ok({ title: "Coupon updated", sub: "The coupon has been saved." });
      } else {
        await API.post("/coupons", payload, auth);
        t.ok({ title: "Coupon created", sub: "The new coupon is now active." });
      }
      cancelForm();
      load();
    } catch (e) {
      t.err(e?.response?.data?.error || "Could not save coupon. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c) {
    try {
      await API.put(`/coupons/${c._id}`, { isActive: !c.isActive }, auth);
      setCoupons(prev => prev.map(x => x._id === c._id ? { ...x, isActive: !x.isActive } : x));
    } catch {
      t.err({ title: "Update failed", sub: "Could not update coupon status. Please try again." });
    }
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try {
      await API.delete(`/coupons/${deleteConfirm._id}`, auth);
      setCoupons(prev => prev.filter(c => c._id !== deleteConfirm._id));
      t.ok({ title: "Coupon deleted", detail: deleteConfirm.code, sub: "The coupon has been removed." });
    } catch {
      t.err({ title: "Delete failed", sub: "Could not delete coupon. Please try again." });
    } finally {
      setDeleteConfirm(null);
    }
  }

  const fmt = n => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const inputCls = "w-full px-4 py-3 border border-[#E3E8E5] bg-[#FAFBF9] rounded-xl text-sm font-medium text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]";
  const labelCls = "block text-xs font-bold text-[#5C756D] uppercase tracking-wider mb-2";

  return (
    <PageWrapper>
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B5345] tracking-tight flex items-center gap-3">
            <Tag className="w-8 h-8 text-[#0E8A74]" />
            Coupon Codes
          </h1>
          <p className="text-[#5C756D] mt-1 text-sm font-medium">Manage and monitor discount codes for your store.</p>
        </div>
        {tab === "coupons" && (
          <button onClick={openNew} className="flex items-center gap-2 bg-gradient-to-r from-[#0B5345] to-[#0E8A74] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#0B5345]/20 hover:shadow-xl hover:shadow-[#0B5345]/30 hover:-translate-y-0.5 transition-all">
            <Plus className="w-4 h-4" /> Add New Coupon
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 w-full overflow-x-auto hide-scrollbar">
        <button
          onClick={() => switchTab("coupons")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-bold text-sm whitespace-nowrap ${tab === "coupons" ? "border-[#0B5345] text-[#0B5345]" : "border-transparent text-[#8BA699] hover:text-[#0B5345] hover:border-gray-300"}`}
        >
          <Tag className="w-4 h-4" /> All Coupons
        </button>
        <button
          onClick={() => switchTab("report")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all font-bold text-sm whitespace-nowrap ${tab === "report" ? "border-[#0B5345] text-[#0B5345]" : "border-transparent text-[#8BA699] hover:text-[#0B5345] hover:border-gray-300"}`}
        >
          <BarChart2 className="w-4 h-4" /> Usage Report
        </button>
      </div>

      {/* ── COUPONS TAB ── */}
      {tab === "coupons" && (
        <>
          {/* Form */}
          {showForm && (
            <div className="bg-white border border-[#E3E8E5] rounded-3xl p-8 mb-8 shadow-lg shadow-[#0B5345]/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#0E8A74]/5 rounded-bl-full pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-8 relative z-10 border-b border-[#F4F7F5] pb-5">
                <div>
                  <h2 className="font-black text-[#0B5345] text-2xl tracking-tight">{editId ? "Edit Coupon" : "Create New Coupon"}</h2>
                  <p className="text-[#5C756D] text-sm mt-1">Fill in the details to set up your discount code.</p>
                </div>
                <button onClick={cancelForm} className="p-2 text-[#8BA699] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 relative z-10">
                <div>
                  <label className={labelCls}>Coupon Code *</label>
                  <input className={inputCls + " uppercase"} placeholder="e.g. SAVE20" value={form.code} onChange={e => set("code", e.target.value.toUpperCase())} />
                </div>

                <div>
                  <label className={labelCls}>Discount Type *</label>
                  <select className={inputCls} value={form.discountType} onChange={e => set("discountType", e.target.value)}>
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Discount Value * {form.discountType === "percent" ? "(%)" : "(₹)"}</label>
                  <input type="number" className={inputCls} placeholder={form.discountType === "percent" ? "e.g. 20" : "e.g. 100"} value={form.discountValue} onChange={e => set("discountValue", e.target.value)} min="1" max={form.discountType === "percent" ? "100" : undefined} />
                </div>

                <div>
                  <label className={labelCls}>Min Order Value (₹)</label>
                  <input type="number" className={inputCls} placeholder="0 = no minimum" value={form.minOrderValue} onChange={e => set("minOrderValue", e.target.value)} min="0" />
                </div>

                <div>
                  <label className={labelCls}>Min Books in Order</label>
                  <input type="number" className={inputCls} placeholder="e.g. 5 — leave blank for no min" value={form.minQty} onChange={e => set("minQty", e.target.value)} min="1" />
                  <p className="text-xs text-gray-400 mt-1">Customer must add this many books to use this coupon</p>
                </div>

                {/* Required Book Picker */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className={labelCls}>Required Book (optional)</label>
                  <p className="text-xs text-gray-400 mb-2">If set, coupon only works when this specific book is in the cart</p>
                  {form.requiredBookDisplay ? (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-blue-800 flex-1">{form.requiredBookDisplay}</span>
                      <button type="button" onClick={clearBook} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={bookSearch}
                        onChange={e => { setBookSearch(e.target.value); searchBooks(e.target.value); }}
                        placeholder="Search books by title or SKU..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B5345] focus:border-transparent"
                      />
                      {bookSearchLoading && (
                        <div className="absolute right-3 top-2.5">
                          <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-[#0B5345] rounded-full"></div>
                        </div>
                      )}
                      {bookResults.length > 0 && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {bookResults.map(b => (
                            <button
                              key={b._id}
                              type="button"
                              onClick={() => selectBook(b)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-left border-b border-gray-100 last:border-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{b.title}</p>
                                <p className="text-xs text-gray-500">₹{b.price || 0} · {b.inventory?.sku || 'No SKU'}</p>
                              </div>
                              <span className="text-xs text-blue-600 font-medium flex-shrink-0">Select</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Max Uses</label>
                  <input type="number" className={inputCls} placeholder="Leave blank = unlimited" value={form.maxUses} onChange={e => set("maxUses", e.target.value)} min="1" />
                </div>

                <div>
                  <label className={labelCls}>Expiry Date</label>
                  <input type="date" className={inputCls} value={form.expiresAt} onChange={e => set("expiresAt", e.target.value)} />
                </div>

                <div className="lg:col-span-2">
                  <label className={labelCls}>Description (admin notes)</label>
                  <input className={inputCls} placeholder="e.g. Bulk buy discount — 5+ books" value={form.description} onChange={e => set("description", e.target.value)} />
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-[#E3E8E5] rounded-xl w-full bg-[#FAFBF9] hover:border-[#0B5345]/30 transition-all">
                    <button type="button" onClick={() => set("isActive", !form.isActive)} className={`w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-[#0B5345]" : "bg-[#8BA699]"} relative shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B5345]`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? "left-6" : "left-0.5"}`} />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0B5345]">Active Status</span>
                      <span className="text-[11px] text-[#5C756D] font-medium">{form.isActive ? "Coupon is live and usable" : "Coupon is currently disabled"}</span>
                    </div>
                  </label>
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer p-4 border border-[#E3E8E5] rounded-xl w-full bg-[#FAFBF9] hover:border-[#0B5345]/30 transition-all">
                    <button type="button" onClick={() => set("isFirstOrderOnly", !form.isFirstOrderOnly)} className={`w-12 h-6 rounded-full transition-colors ${form.isFirstOrderOnly ? "bg-blue-500" : "bg-[#8BA699]"} relative shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isFirstOrderOnly ? "left-6" : "left-0.5"}`} />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#0B5345]">First Order Only</span>
                      <span className="text-[11px] text-[#5C756D] font-medium">{form.isFirstOrderOnly ? "Valid only for new customers" : "Valid for all customers"}</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-[#F4F7F5] relative z-10">
                <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#0B5345] text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-[#0E8A74] hover:-translate-y-0.5 shadow-lg hover:shadow-[#0B5345]/20 transition-all disabled:opacity-60 disabled:hover:translate-y-0">
                  {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                  {saving ? "Saving…" : editId ? "Update Coupon" : "Create Coupon"}
                </button>
                <button onClick={cancelForm} className="px-8 py-3.5 rounded-xl text-sm font-bold text-[#5C756D] hover:bg-[#F4F7F5] transition-all">Cancel</button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-[#E3E8E5] border-t-[#0B5345] rounded-full"></div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="bg-white border border-[#E3E8E5] rounded-3xl p-16 text-center shadow-sm">
              <div className="w-20 h-20 bg-[#F4F7F5] rounded-full flex items-center justify-center mx-auto mb-5">
                <Tag className="w-10 h-10 text-[#8BA699]" />
              </div>
              <p className="text-xl font-bold text-[#0B5345] mb-2">No coupons yet</p>
              <p className="text-[#5C756D] mb-6">Create your first discount code to boost sales.</p>
              <button onClick={openNew} className="bg-[#0B5345] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0E8A74] transition-all">
                Add Coupon
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#E3E8E5] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F4F7F5] border-b border-[#E3E8E5]">
                    <tr>
                      <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs">Code</th>
                      <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs">Discount</th>
                      <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs">Conditions</th>
                      <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs text-center">Uses</th>
                      <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs">Expires</th>
                      <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs text-center">Status</th>
                      <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E3E8E5]/50">
                    {coupons.map(c => (
                      <tr key={c._id} className="hover:bg-[#FAFBF9] transition-colors group">
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B5345]/10 text-[#0B5345] rounded-xl font-mono text-sm font-black tracking-widest">{c.code}</span>
                          {c.description && <p className="text-[11px] text-[#8BA699] mt-1.5 line-clamp-1">{c.description}</p>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-xl text-[#0B5345]">
                            {c.discountType === "percent" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#5C756D] text-xs space-y-1.5">
                          {c.minOrderValue > 0 && <div className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-[#8BA699]"/> Min order: <b className="text-[#0B5345]">₹{c.minOrderValue}</b></div>}
                          {c.requiredBookId ? (
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                              <span className="truncate max-w-[150px]" title={c.requiredBookId.title}>
                                {c.minQty > 0 ? `×${c.minQty} ` : ""}
                                <b className="text-blue-700">
                                  {c.requiredBookId.inventory?.sku ? `SKU: ${c.requiredBookId.inventory.sku}` : c.requiredBookId.title}
                                </b>
                              </span>
                            </div>
                          ) : (
                            c.minQty > 0 && <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-[#8BA699]"/> Min books: <b className="text-[#0B5345]">{c.minQty}</b></div>
                          )}
                          {c.isFirstOrderOnly && <div className="flex items-center gap-1 text-blue-600 font-bold bg-blue-50 w-fit px-2 py-0.5 rounded-md"><Star className="w-3 h-3"/> 1st order only</div>}
                          {!c.minOrderValue && !c.requiredBookId && !c.minQty && !c.isFirstOrderOnly && <span className="text-[#8BA699] font-medium">No conditions</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center bg-[#F4F7F5] px-3 py-1.5 rounded-xl font-black text-[#0B5345] text-base min-w-[3rem]">
                            {c.usedCount} <span className="text-[#8BA699] text-xs mx-1 font-medium tracking-wide">/</span> {c.maxUses !== null ? c.maxUses : '∞'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {c.expiresAt ? (
                            new Date(c.expiresAt) < new Date() ? (
                              <span className="text-red-500 font-bold text-xs bg-red-50 px-2.5 py-1 rounded-lg">Expired</span>
                            ) : (
                              <span className="text-[#0B5345] font-bold text-sm">{new Date(c.expiresAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            )
                          ) : (
                            <span className="text-[#8BA699] font-medium text-xs bg-[#F4F7F5] px-2.5 py-1 rounded-lg">Never expires</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => toggleActive(c)} className="focus:outline-none hover:scale-105 transition-transform">
                            {c.isActive ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold tracking-wide uppercase">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-[11px] font-bold tracking-wide uppercase">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Inactive
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(c)} className="p-2.5 text-[#5C756D] hover:text-[#0B5345] hover:bg-[#E3E8E5] rounded-xl transition-all" title="Edit">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(c)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── USAGE REPORT TAB ── */}
      {tab === "report" && (
        <>
          {reportLoading ? (
            <div className="text-center py-20 text-gray-400">Loading report…</div>
          ) : report.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
              <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No usage data yet</p>
              <p className="text-sm text-gray-400 mt-1">Data will appear once customers start using coupon codes</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#0B5345]/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F4F7F5] flex items-center justify-center">
                      <Tag className="w-5 h-5 text-[#0B5345]" />
                    </div>
                    <span className="text-sm font-bold text-[#5C756D]">Total Coupons</span>
                  </div>
                  <p className="text-4xl font-black text-[#0B5345]">{report.length}</p>
                </div>
                
                <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-[#5C756D]">Orders with Coupon</span>
                  </div>
                  <p className="text-4xl font-black text-[#0B5345]">{report.reduce((s, r) => s + r.totalOrders, 0)}</p>
                </div>

                <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-sm font-bold text-[#5C756D]">Total Discount Given</span>
                  </div>
                  <p className="text-4xl font-black text-[#0B5345]">{fmt(report.reduce((s, r) => s + r.totalDiscount, 0))}</p>
                </div>
              </div>

              {/* Report table */}
              <div className="bg-white border border-[#E3E8E5] rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#F4F7F5] border-b border-[#E3E8E5]">
                      <tr>
                        <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs">Code</th>
                        <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs">Type</th>
                        <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs text-center">Orders Used</th>
                        <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs text-right">Total Discount</th>
                        <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs text-right">Revenue Generated</th>
                        <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs">Last Used</th>
                        <th className="px-6 py-4 font-bold text-[#5C756D] uppercase tracking-wider text-xs text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E8E5]/50">
                      {report.map(r => (
                        <tr key={r.code} className="hover:bg-[#FAFBF9] transition-colors">
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0B5345]/10 text-[#0B5345] rounded-xl font-mono text-sm font-black tracking-widest">{r.code}</span>
                            {r.coupon?.description && <p className="text-[11px] text-[#8BA699] mt-1.5 line-clamp-1">{r.coupon.description}</p>}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#0B5345]">
                              {r.coupon ? (r.coupon.discountType === "percent" ? `${r.coupon.discountValue}%` : `₹${r.coupon.discountValue}`) : "—"}
                            </div>
                            {r.coupon?.requiredBookId && (
                              <p className="text-[11px] text-blue-600 flex items-center gap-1 mt-1 font-medium bg-blue-50 px-2 py-0.5 rounded w-fit">
                                <BookOpen className="w-3 h-3" />
                                {r.coupon.requiredBookId.inventory?.sku ? `SKU: ${r.coupon.requiredBookId.inventory.sku}` : r.coupon.requiredBookId.title?.slice(0, 20)}
                                {r.coupon.minQty > 0 && ` ×${r.coupon.minQty}`}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center justify-center bg-[#F4F7F5] px-3 py-1.5 rounded-xl font-black text-[#0B5345] text-lg min-w-[3rem]">
                              {r.totalOrders}
                            </div>
                            {r.coupon?.maxUses && <p className="text-[10px] text-[#8BA699] mt-1 font-bold tracking-wider uppercase text-center">{r.coupon.maxUses} MAX</p>}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg">
                              {r.totalDiscount > 0 ? `-${fmt(r.totalDiscount)}` : "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-black text-emerald-600 text-lg">
                              {r.totalRevenue > 0 ? fmt(r.totalRevenue) : "—"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {r.lastUsed ? (
                              <span className="text-[#0B5345] font-medium text-sm">{new Date(r.lastUsed).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            ) : (
                              <span className="text-[#8BA699] font-medium text-xs bg-[#F4F7F5] px-2.5 py-1 rounded-lg">Never</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {r.coupon ? (
                              r.coupon.isActive ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[11px] font-bold tracking-wide uppercase">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Active
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 border border-gray-200 rounded-full text-[11px] font-bold tracking-wide uppercase">
                                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span> Inactive
                                </div>
                              )
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-500 border border-red-200 rounded-full text-[11px] font-bold tracking-wide uppercase">
                                Deleted
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Coupon?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              You are about to delete coupon
            </p>
            <p className="text-center mb-5">
              <span className="font-mono font-bold text-[#0B5345] bg-[#f0f4f8] px-2 py-1 rounded-lg text-sm tracking-widest">
                {deleteConfirm.code}
              </span>
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageWrapper>
  );
}
