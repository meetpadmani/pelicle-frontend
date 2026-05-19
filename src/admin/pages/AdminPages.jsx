import { useState, useEffect } from "react";
import API from "../../services/api";
import toast from "react-hot-toast";
import {
  FileText, Plus, Trash2, Save, Loader2, Edit2,
  Eye, EyeOff, X, Globe, ChevronRight, Search, ExternalLink
} from "lucide-react";
import PageWrapper from "../components/PageWrapper";

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editPage, setEditPage] = useState(null); // null = list view, object = editing
  const [isNew, setIsNew] = useState(false);

  const BLANK = { title: "", slug: "", content: "", isPublished: false, metaTitle: "", metaDescription: "" };

  const PRESETS = [
    { title: "Privacy Policy", slug: "privacy-policy", metaTitle: "Privacy Policy — Pelicle", metaDescription: "Read our privacy policy to understand how we collect and use your data.", content: `<h2>Privacy Policy</h2><p>Last updated: ${new Date().toLocaleDateString('en-IN')}</p><p>At Pelicle, we are committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and share information about you when you use our services.</p><h3>Information We Collect</h3><p>We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, email address, phone number, and shipping address.</p><h3>How We Use Your Information</h3><p>We use the information we collect to process your orders, send you order confirmations and updates, respond to your inquiries, and improve our services.</p><h3>Contact Us</h3><p>If you have questions about this privacy policy, please contact us at support@pelicle.in</p>` },
    { title: "Shipping Policy", slug: "shipping-policy", metaTitle: "Shipping Policy — Pelicle", metaDescription: "Learn about our shipping options, delivery times, and charges.", content: `<h2>Shipping Policy</h2><p>We process and ship orders within 1–2 business days of payment confirmation.</p><h3>Delivery Timeline</h3><p>Standard Delivery: 5–7 business days across India. Express Delivery: 2–3 business days (available in select cities).</p><h3>Shipping Charges</h3><p>Free shipping on all orders above ₹999. A flat shipping fee of ₹79 applies to orders below ₹999.</p><h3>Order Tracking</h3><p>Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order on our website or via the courier partner's website.</p><h3>Contact Us</h3><p>For shipping queries, email us at support@pelicle.in</p>` },
    { title: "Terms & Conditions", slug: "terms-and-conditions", metaTitle: "Terms & Conditions — Pelicle", metaDescription: "Read our terms and conditions for using Pelicle.", content: `<h2>Terms & Conditions</h2><p>By accessing or using the Pelicle website, you agree to be bound by these terms and conditions.</p><h3>Use of the Website</h3><p>You agree to use this website for lawful purposes only. You must not misuse our platform or attempt to access it using unauthorized methods.</p><h3>Products and Pricing</h3><p>All prices displayed on the website are in Indian Rupees (INR) and are inclusive of applicable taxes. We reserve the right to modify prices at any time without prior notice.</p><h3>Order Cancellation</h3><p>Orders may be cancelled within 24 hours of placement. Once shipped, orders cannot be cancelled.</p><h3>Governing Law</h3><p>These terms are governed by the laws of India.</p>` },
    { title: "Returns & Refunds", slug: "returns-and-refunds", metaTitle: "Returns & Refunds Policy — Pelicle", metaDescription: "Understand our easy returns and refund process.", content: `<h2>Returns & Refunds Policy</h2><p>We want you to love every Pelicle purchase. If you are not completely satisfied, we're here to help.</p><h3>Return Window</h3><p>We accept returns within 7 days of delivery for eligible items. Products must be unused, unwashed, and in their original packaging with all tags intact.</p><h3>Non-Returnable Items</h3><p>Innerwear, customised products, and items purchased during sale are not eligible for return.</p><h3>Refund Process</h3><p>Once we receive and inspect your return, we will notify you of the approval status. Approved refunds are processed within 5–7 business days to your original payment method.</p><h3>How to Initiate a Return</h3><p>Email us at returns@pelicle.in with your order number and reason for return.</p>` },
    { title: "FAQs", slug: "faqs", metaTitle: "Frequently Asked Questions — Pelicle", metaDescription: "Find answers to common questions about orders, shipping, and returns.", content: `<h2>Frequently Asked Questions</h2><h3>How do I track my order?</h3><p>Once shipped, you will receive a tracking link via email and SMS. You can also use the Track Order page on our website.</p><h3>Can I change my delivery address after placing an order?</h3><p>Address changes can be requested within 12 hours of placing the order by contacting our support team.</p><h3>What payment methods do you accept?</h3><p>We accept all major credit/debit cards, UPI, net banking, and Cash on Delivery (COD) for eligible orders.</p><h3>How long does delivery take?</h3><p>Standard delivery takes 5–7 business days. Express delivery (2–3 days) is available in select cities.</p><h3>Is Cash on Delivery available?</h3><p>Yes, COD is available on most pin codes across India with a small handling fee.</p>` },
    { title: "Contact Us", slug: "contact-us", metaTitle: "Contact Us — Pelicle", metaDescription: "Get in touch with the Pelicle support team.", content: `<h2>Contact Us</h2><p>We'd love to hear from you! Whether you have a question about your order, our products, or anything else — our team is ready to help.</p><h3>Customer Support</h3><p>Email: <a href="mailto:support@pelicle.in">support@pelicle.in</a><br/>Phone: +91 98765 43210<br/>Hours: Monday to Saturday, 10 AM – 6 PM IST</p><h3>Returns & Refunds</h3><p>Email: <a href="mailto:returns@pelicle.in">returns@pelicle.in</a></p><h3>Business Enquiries</h3><p>Email: <a href="mailto:hello@pelicle.in">hello@pelicle.in</a></p>` },
    { title: "About Us", slug: "about-us", metaTitle: "About Us — Pelicle", metaDescription: "Learn about Pelicle — India's premium fashion destination.", content: `<h2>About Pelicle</h2><p>Welcome to Pelicle — where fashion meets story.</p><p>Founded with a passion for style and quality, Pelicle is India's premium online fashion destination for Men, Women & Kids. We bring you the finest ethnic and western wear, crafted to help you express your unique identity.</p><h3>Our Mission</h3><p>To make premium fashion accessible to every Indian — with quality you can trust and designs you'll love.</p><h3>Why Choose Pelicle?</h3><ul><li>Curated collections updated every week</li><li>Premium fabrics at honest prices</li><li>Fast delivery across India</li><li>Easy returns & dedicated customer support</li></ul><h3>Our Story</h3><p>What started as a small passion project has grown into a beloved brand trusted by thousands of customers across India. At Pelicle, every garment tells a story — and we'd love for that story to be yours.</p>` },
  ];

  const [seeding, setSeeding] = useState(false);

  async function seedPresets() {
    setSeeding(true);
    let count = 0;
    for (const preset of PRESETS) {
      try {
        const existing = pages.find(p => p.slug === preset.slug);
        if (!existing) {
          await API.post("/pages", { ...preset, isPublished: true });
          count++;
        }
      } catch {}
    }
    toast.success(`${count} pages created!`);
    fetchPages();
    setSeeding(false);
  }

  async function openPreset(preset) {
    const existing = pages.find(p => p.slug === preset.slug);
    if (existing) { openEdit(existing); }
    else { setEditPage({ ...preset, isPublished: true }); setIsNew(true); }
  }

  useEffect(() => { fetchPages(); }, []);

  async function fetchPages() {
    setLoading(true);
    try {
      const res = await API.get("/pages");
      if (res.data?.success) setPages(res.data.pages);
    } catch { toast.error("Failed to load pages."); }
    finally { setLoading(false); }
  }

  function openNew() { setEditPage({ ...BLANK }); setIsNew(true); }
  function openEdit(p) { setEditPage({ ...p }); setIsNew(false); }
  function closeEdit() { setEditPage(null); setIsNew(false); }

  function autoSlug(title) {
    return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function handleTitleChange(val) {
    setEditPage(p => ({ ...p, title: val, slug: isNew ? autoSlug(val) : p.slug }));
  }

  async function handleSave() {
    if (!editPage.title.trim()) { toast.error("Title is required."); return; }
    if (!editPage.slug.trim()) { toast.error("Slug is required."); return; }
    setSaving(true);
    try {
      const res = isNew
        ? await API.post("/pages", editPage)
        : await API.put(`/pages/${editPage._id}`, editPage);
      if (res.data?.success) {
        toast.success(isNew ? "Page created!" : "Page updated!");
        fetchPages();
        closeEdit();
      } else {
        toast.error(res.data?.message || "Failed to save page.");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error saving page.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this page? This cannot be undone.")) return;
    try {
      await API.delete(`/pages/${id}`);
      toast.success("Page deleted.");
      fetchPages();
    } catch { toast.error("Failed to delete page."); }
  }

  async function togglePublish(page) {
    try {
      const res = await API.put(`/pages/${page._id}`, { ...page, isPublished: !page.isPublished });
      if (res.data?.success) {
        toast.success(page.isPublished ? "Page unpublished." : "Page published!");
        fetchPages();
      }
    } catch { toast.error("Failed to update page."); }
  }

  const inp = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-3 text-sm text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]";
  const lbl = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2";

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  // ── EDIT / CREATE VIEW ──────────────────────────────────────────────────────
  if (editPage !== null) {
    return (
      <PageWrapper>
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button onClick={closeEdit} className="p-2 rounded-xl hover:bg-[#0B5345]/10 text-[#0B5345] transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#0B5345]">
                  {isNew ? "New Page" : `Edit: ${editPage.title}`}
                </h1>
                <p className="text-[#5C756D] text-sm mt-0.5">Fill in the details below and save.</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#0B5345] text-white font-bold text-sm rounded-xl hover:bg-[#0E8A74] shadow-lg shadow-[#0B5345]/20 transition-all disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Page"}
            </button>
          </div>

          <div className="space-y-5">
            {/* Basic Info */}
            <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6">
              <h3 className="font-bold text-[#0B5345] mb-5 flex items-center gap-2 border-b border-[#F4F7F5] pb-4">
                <FileText className="w-5 h-5 text-[#0E8A74]" /> Page Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Page Title *</label>
                  <input className={inp} value={editPage.title} onChange={e => handleTitleChange(e.target.value)} placeholder="e.g. About Us" />
                </div>
                <div>
                  <label className={lbl}>URL Slug *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#8BA699] whitespace-nowrap">/pages/</span>
                    <input className={inp} value={editPage.slug} onChange={e => setEditPage(p => ({ ...p, slug: e.target.value }))} placeholder="about-us" />
                  </div>
                  <p className="text-xs text-[#8BA699] mt-1">Your page will be live at <span className="font-mono text-[#0B5345]">/pages/{editPage.slug || "slug"}</span></p>
                </div>
                <div className="flex items-center justify-between bg-[#FAFBF9] border border-[#E3E8E5] rounded-2xl px-5 py-4">
                  <div>
                    <p className="font-semibold text-[#0B5345] text-sm">Published</p>
                    <p className="text-xs text-[#8BA699] mt-0.5">Make this page visible on your store</p>
                  </div>
                  <button onClick={() => setEditPage(p => ({ ...p, isPublished: !p.isPublished }))}>
                    {editPage.isPublished
                      ? <div className="w-12 h-6 bg-[#0B5345] rounded-full flex items-center justify-end pr-1 transition-all"><div className="w-4 h-4 bg-white rounded-full" /></div>
                      : <div className="w-12 h-6 bg-[#E3E8E5] rounded-full flex items-center pl-1 transition-all"><div className="w-4 h-4 bg-white rounded-full" /></div>
                    }
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6">
              <h3 className="font-bold text-[#0B5345] mb-5 flex items-center gap-2 border-b border-[#F4F7F5] pb-4">
                <Edit2 className="w-5 h-5 text-[#0E8A74]" /> Page Content
              </h3>
              <label className={lbl}>Content (HTML supported)</label>
              <textarea
                rows={14}
                className={inp + " resize-y font-mono text-xs"}
                value={editPage.content}
                onChange={e => setEditPage(p => ({ ...p, content: e.target.value }))}
                placeholder="<h2>About Us</h2><p>Write your page content here...</p>"
              />
            </div>

            {/* SEO */}
            <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6">
              <h3 className="font-bold text-[#0B5345] mb-5 flex items-center gap-2 border-b border-[#F4F7F5] pb-4">
                <Globe className="w-5 h-5 text-[#0E8A74]" /> SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Meta Title</label>
                  <input className={inp} value={editPage.metaTitle} onChange={e => setEditPage(p => ({ ...p, metaTitle: e.target.value }))} placeholder="Shown in browser tab & Google results" />
                  <p className="text-xs text-[#8BA699] mt-1">{editPage.metaTitle.length}/60 characters</p>
                </div>
                <div>
                  <label className={lbl}>Meta Description</label>
                  <textarea rows={3} className={inp + " resize-none"} value={editPage.metaDescription} onChange={e => setEditPage(p => ({ ...p, metaDescription: e.target.value }))} placeholder="Short description shown in Google search results..." />
                  <p className="text-xs text-[#8BA699] mt-1">{editPage.metaDescription.length}/160 characters</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── LIST VIEW ───────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-5xl py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B5345] flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#0E8A74]" />Pages
            </h1>
            <p className="text-[#5C756D] mt-1 text-sm">Manage static pages like About Us, Contact, Privacy Policy, etc.</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-6 py-3 bg-[#0B5345] text-white font-bold text-sm rounded-xl hover:bg-[#0E8A74] shadow-lg shadow-[#0B5345]/20 transition-all shrink-0 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />New Page
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-[#8BA699] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            className="w-full bg-white border border-[#E3E8E5] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]"
            placeholder="Search pages by title or slug…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B5345]" />
          </div>
        ) : filtered.length === 0 ? (
          <>
          {/* Quick Setup section shown when no pages exist yet */}
          {pages.length === 0 && !search && (
            <div className="bg-gradient-to-br from-[#0B5345] to-[#0E8A74] rounded-3xl p-6 mb-5 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-lg">Quick Setup</h3>
                  <p className="text-white/80 text-sm mt-1">Create all 7 standard pages with pre-filled content in one click.</p>
                </div>
                <button onClick={seedPresets} disabled={seeding} className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0B5345] font-bold text-sm rounded-xl hover:bg-white/90 transition-all disabled:opacity-60 shrink-0">
                  {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{seeding ? "Creating…" : "Create All Pages"}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
                {PRESETS.map(p => (
                  <button key={p.slug} onClick={() => openPreset(p)} className="bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-2 rounded-xl text-left transition-all">
                    📄 {p.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="bg-white border border-[#E3E8E5] rounded-3xl p-16 text-center">
            <FileText className="w-14 h-14 mx-auto text-[#E3E8E5] mb-4" />
            <h3 className="font-bold text-[#0B5345] text-lg mb-2">{search ? "No pages found" : "No pages yet"}</h3>
            <p className="text-[#5C756D] text-sm mb-6">{search ? "Try a different search." : "Create your first page or use Quick Setup above."}</p>
            {!search && (
              <button onClick={openNew} className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B5345] text-white font-bold text-sm rounded-xl hover:bg-[#0E8A74] transition-all">
                <Plus className="w-4 h-4" />Create Custom Page
              </button>
            )}
          </div>
          </>
        ) : (
          <div className="space-y-3">
            {filtered.map(p => (
              <div key={p._id} className="bg-white border border-[#E3E8E5] rounded-2xl px-5 py-4 flex items-center gap-4 hover:shadow-md hover:border-[#0B5345]/20 transition-all group">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.isPublished ? "bg-green-500" : "bg-gray-300"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#0B5345] truncate">{p.title}</p>
                  <p className="text-xs text-[#8BA699] mt-0.5 font-mono">/pages/{p.slug}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${p.isPublished ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                  {p.isPublished ? "Published" : "Draft"}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => togglePublish(p)} title={p.isPublished ? "Unpublish" : "Publish"} className="p-2 rounded-xl hover:bg-[#0B5345]/10 text-[#5C756D] hover:text-[#0B5345] transition-all">
                    {p.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <a href={`/pages/${p.slug}`} target="_blank" rel="noreferrer" title="View live page" className="p-2 rounded-xl hover:bg-[#0B5345]/10 text-[#5C756D] hover:text-[#0B5345] transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-xl hover:bg-[#0B5345]/10 text-[#5C756D] hover:text-[#0B5345] transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="p-2 rounded-xl hover:bg-red-50 text-[#5C756D] hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <ChevronRight className="w-4 h-4 text-[#E3E8E5] group-hover:text-[#0B5345] transition-colors cursor-pointer" onClick={() => openEdit(p)} />
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {pages.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "Total Pages", val: pages.length },
              { label: "Published", val: pages.filter(p => p.isPublished).length },
              { label: "Drafts", val: pages.filter(p => !p.isPublished).length },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white border border-[#E3E8E5] rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-[#0B5345]">{val}</p>
                <p className="text-xs text-[#5C756D] mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
