import { useEffect, useState } from "react";
import { layoutAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Search, Plus, X, Save, CheckCircle2, Circle, Globe, Layout, Tag, Fingerprint, Loader2 } from "lucide-react";
import PageWrapper from '../components/PageWrapper';

const t = {
  ok: ({ title, sub }) => toast.success(`${title}${sub ? ': ' + sub : ''}`),
  info: ({ title, sub }) => toast(`${title}${sub ? ': ' + sub : ''}`),
  err: (msg) => toast.error(typeof msg === 'string' ? msg : (msg?.title ? `${msg.title}${msg.sub ? ': ' + msg.sub : ''}` : 'Error'))
};

export default function SeoSettings() {
  const auth = {};

  const [form, setForm] = useState({
    globalKeywords: "",
    homepageVariants: [],
    defaultDescription: "",
    defaultOgImage: "",
    googleVerification: "",
    extraMeta: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // keyword tag input
  const [kwInput, setKwInput] = useState("");

  useEffect(() => {
    layoutAPI.get().then(res => {
      if (res.data?.ok || res.data?.success) {
        const s = res.data.layout?.seo || {};
        setForm({
          globalKeywords: s.globalKeywords || "",
          homepageVariants: Array.isArray(s.homepageVariants) ? s.homepageVariants : [],
          defaultDescription: s.defaultDescription || "",
          defaultOgImage: s.defaultOgImage || "",
          googleVerification: s.googleVerification || "",
          extraMeta: Array.isArray(s.extraMeta) ? s.extraMeta : [],
        });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  // ── keyword tag helpers ──────────────────────────────────────────────────
  const keywords = form.globalKeywords
    ? form.globalKeywords.split(",").map(k => k.trim()).filter(Boolean)
    : [];

  function addKeyword() {
    const kw = kwInput.trim();
    if (!kw) return;
    const next = [...keywords.filter(k => k.toLowerCase() !== kw.toLowerCase()), kw];
    set("globalKeywords", next.join(", "));
    setKwInput("");
  }

  function removeKeyword(kw) {
    set("globalKeywords", keywords.filter(k => k !== kw).join(", "));
  }

  // ── homepage variant helpers ─────────────────────────────────────────────
  function addVariant() {
    set("homepageVariants", [
      ...form.homepageVariants,
      { id: String(Date.now()), title: "", description: "", active: form.homepageVariants.length === 0 },
    ]);
  }

  function updateVariant(id, field, val) {
    set("homepageVariants", form.homepageVariants.map(v => v.id === id ? { ...v, [field]: val } : v));
  }

  function removeVariant(id) {
    const remaining = form.homepageVariants.filter(v => v.id !== id);
    // if we removed the active one, make the first remaining active
    if (form.homepageVariants.find(v => v.id === id)?.active && remaining.length > 0) {
      remaining[0].active = true;
    }
    set("homepageVariants", remaining);
  }

  function setActiveVariant(id) {
    set("homepageVariants", form.homepageVariants.map(v => ({ ...v, active: v.id === id })));
  }

  // ── extra meta helpers ───────────────────────────────────────────────────
  function addExtraMeta() {
    set("extraMeta", [...form.extraMeta, { name: "", content: "" }]);
  }

  function updateExtraMeta(i, field, val) {
    const next = form.extraMeta.map((m, idx) => idx === i ? { ...m, [field]: val } : m);
    set("extraMeta", next);
  }

  function removeExtraMeta(i) {
    set("extraMeta", form.extraMeta.filter((_, idx) => idx !== i));
  }

  // ── save ─────────────────────────────────────────────────────────────────
  async function handleSave(e) {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await layoutAPI.update({ seo: JSON.stringify(form) });
      if (res.data?.ok || res.data?.success) {
        t.ok({ title: "Saved", sub: "SEO settings have been updated." });
      } else {
        t.err({ title: "Save failed", sub: "Could not save SEO settings. Please try again." });
      }
    } catch (e) {
      t.err(e.response?.data?.error || "Failed to save SEO settings.");
    } finally {
      setSaving(false);
    }
  }

  const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2";
  const inputClass = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-3 text-sm text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B5345]" />
      </div>
    );
  }

  const activeVariant = form.homepageVariants.find(v => v.active) || form.homepageVariants[0] || { title: "Your Site Title", description: "Your site description will appear here..." };

  return (
    <PageWrapper>
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B5345] tracking-tight flex items-center gap-3">
            <Globe className="w-8 h-8 text-[#0E8A74]" />
            SEO Configuration
          </h1>
          <p className="text-[#5C756D] mt-1 text-sm font-medium">Optimize your store's visibility and search engine presence.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#E3E8E5] rounded-3xl shadow-sm p-8 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0E8A74]/5 rounded-bl-full pointer-events-none"></div>
            
            {/* Global Keywords */}
            <div className="relative z-10">
              <h3 className="font-bold text-[#0B5345] text-lg border-b border-[#F4F7F5] pb-4 mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0E8A74]" /> Global Keywords
              </h3>
              <p className="text-xs text-[#5C756D] font-medium mb-4">
                These keywords are automatically added to the meta tags of every page.
              </p>

              <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
                {keywords.map(kw => (
                  <span key={kw} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0B5345]/5 border border-[#0B5345]/10 text-[#0B5345] text-sm rounded-xl font-bold">
                    {kw}
                    <button onClick={() => removeKeyword(kw)} className="text-[#8BA699] hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                {keywords.length === 0 && <p className="text-xs text-[#8BA699] font-medium self-center">No keywords added yet</p>}
              </div>

              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="e.g. bhagavad gita for kids"
                  value={kwInput}
                  onChange={e => setKwInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                />
                <button
                  onClick={addKeyword}
                  className="flex items-center justify-center gap-1.5 px-6 py-3 bg-[#0B5345] text-white text-sm font-bold rounded-xl hover:bg-[#0E8A74] hover:-translate-y-0.5 shadow-md shadow-[#0B5345]/10 transition-all shrink-0"
                >
                  <Plus className="w-5 h-5" /> Add
                </button>
              </div>
            </div>

            {/* Homepage SEO Variants */}
            <div className="relative z-10">
              <div className="flex items-center justify-between border-b border-[#F4F7F5] pb-4 mb-6">
                <h3 className="font-bold text-[#0B5345] text-lg flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#0E8A74]" /> Homepage SEO
                </h3>
                <button
                  onClick={addVariant}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F7F5] text-[#0B5345] text-xs font-bold rounded-xl hover:bg-[#E3E8E5] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add variant
                </button>
              </div>
              <p className="text-xs text-[#5C756D] font-medium mb-4">
                Add title + description pairs. The active one is shown on Google search results.
              </p>

              {form.homepageVariants.length === 0 && (
                <div className="border-2 border-dashed border-[#E3E8E5] rounded-xl py-8 text-center bg-[#FAFBF9]">
                  <p className="text-sm text-[#8BA699]">No variants yet. Click <strong>Add variant</strong> to create your first.</p>
                </div>
              )}

              <div className="space-y-4">
                {form.homepageVariants.map((v, idx) => (
                  <div key={v.id} className={`border-2 rounded-xl p-5 transition-colors ${v.active ? "border-[#0B5345] bg-[#FAFBF9]" : "border-[#E3E8E5] bg-white"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setActiveVariant(v.id)}
                        className="flex items-center gap-2 text-sm font-bold"
                      >
                        {v.active
                          ? <CheckCircle2 className="w-5 h-5 text-[#0B5345]" />
                          : <Circle className="w-5 h-5 text-[#8BA699]" />}
                        <span className={v.active ? "text-[#0B5345]" : "text-[#5C756D]"}>
                          {v.active ? "Active (shown on Google)" : `Variant ${idx + 1} — click to activate`}
                        </span>
                      </button>
                      <button onClick={() => removeVariant(v.id)} className="text-[#8BA699] hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>Title <span className="normal-case font-normal text-[10px]">— shown as the heading</span></label>
                      <input
                        className={inputClass}
                        placeholder="e.g. Kiddos Intellect - Bhagavad Gita for Kids"
                        value={v.title}
                        onChange={e => updateVariant(v.id, "title", e.target.value)}
                        maxLength={80}
                      />
                      <p className="text-[10px] text-[#8BA699] mt-1 text-right">{v.title.length}/80</p>
                    </div>

                    <div>
                      <label className={labelClass}>Description <span className="normal-case font-normal text-[10px]">— shown below title</span></label>
                      <textarea
                        rows={2}
                        className={`${inputClass} resize-none`}
                        placeholder="e.g. Shop Bhagavad Gita for kids..."
                        value={v.description}
                        onChange={e => updateVariant(v.id, "description", e.target.value)}
                        maxLength={200}
                      />
                      <p className="text-[10px] text-[#8BA699] mt-1 text-right">{v.description.length}/200</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Default / Fallback */}
            <div className="relative z-10">
              <h3 className="font-bold text-[#0B5345] text-lg border-b border-[#F4F7F5] pb-4 mb-6 flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#0E8A74]" /> Default Fallbacks
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Default Description</label>
                  <textarea
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Fallback description..."
                    value={form.defaultDescription}
                    onChange={e => set("defaultDescription", e.target.value)}
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className={labelClass}>Default Social Image URL</label>
                  <input
                    className={inputClass}
                    placeholder="/images/share-banner.jpg or https://..."
                    value={form.defaultOgImage}
                    onChange={e => set("defaultOgImage", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="relative z-10">
              <h3 className="font-bold text-[#0B5345] text-lg border-b border-[#F4F7F5] pb-4 mb-6 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-[#0E8A74]" /> Verification & Advanced
              </h3>
              
              <div className="mb-6">
                <label className={labelClass}>Google Search Console Code</label>
                <input
                  className={`${inputClass} font-mono`}
                  placeholder="abcdef1234567890"
                  value={form.googleVerification}
                  onChange={e => set("googleVerification", e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={labelClass} style={{marginBottom: 0}}>Extra Meta Tags</label>
                  <button
                    onClick={addExtraMeta}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#F4F7F5] text-[#0B5345] rounded-xl hover:bg-[#E3E8E5]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add tag
                  </button>
                </div>
                
                {form.extraMeta.length === 0 && (
                  <p className="text-xs text-[#8BA699]">No extra meta tags added.</p>
                )}

                <div className="space-y-2">
                  {form.extraMeta.map((m, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        className={`${inputClass} !py-2 w-1/3`}
                        placeholder='name="..."'
                        value={m.name}
                        onChange={e => updateExtraMeta(i, "name", e.target.value)}
                      />
                      <input
                        className={`${inputClass} !py-2 flex-1`}
                        placeholder="content"
                        value={m.content}
                        onChange={e => updateExtraMeta(i, "content", e.target.value)}
                      />
                      <button onClick={() => removeExtraMeta(i)} className="text-[#8BA699] hover:text-red-500">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#F4F7F5] flex justify-end relative z-10">
              <button
                onClick={handleSave}
                disabled={saving}
                className="
                  flex items-center gap-2 px-8 py-3.5 rounded-xl 
                  bg-gradient-to-r from-[#0B5345] to-[#0E8A74] text-white font-bold text-sm shadow-lg shadow-[#0B5345]/20 
                  hover:shadow-xl hover:shadow-[#0B5345]/30 hover:-translate-y-0.5 active:scale-95 transition-all 
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
                "
              >
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                {saving ? "Saving Changes..." : "Save Configuration"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Card */}
          <div className="bg-white border border-[#E3E8E5] rounded-3xl shadow-sm overflow-hidden p-8 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0B5345] text-lg leading-tight">Google Search Preview</h3>
                  <p className="text-[#5C756D] text-xs font-medium mt-0.5">See how your active variant appears on Google.</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm shadow-gray-100 mt-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-[#F4F7F5] rounded-full flex items-center justify-center border border-gray-200 shrink-0">
                    <Globe className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] text-[#202124] font-medium leading-tight truncate">{form.title || "Your Website"}</div>
                    <div className="text-[12px] text-[#4d5156] leading-tight truncate mt-0.5">https://yourdomain.com</div>
                  </div>
                </div>
                <div className="text-[#1a0dab] text-[20px] font-medium leading-tight mb-2 hover:underline cursor-pointer">
                  {activeVariant.title || "Your Site Title"}
                </div>
                <div className="text-[#4d5156] text-[14px] leading-[1.5] line-clamp-2">
                  {activeVariant.description || "Your site description will appear here in search results. Make it compelling to improve click-through rates."}
                </div>
              </div>
          </div>

          {/* Helper Info */}
          <div className="bg-[#0B5345]/5 border border-[#0B5345]/10 rounded-3xl p-8">
              <div className="flex items-start gap-4">
                  <div className="p-3 bg-white text-[#0B5345] rounded-xl shrink-0 shadow-sm shadow-[#0B5345]/10">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                      <h4 className="font-bold text-[#0B5345] text-base mb-2">SEO Best Practices</h4>
                      <ul className="text-sm text-[#5C756D] mt-2 space-y-3 font-medium list-disc ml-4">
                          <li>Keep titles under <strong className="text-[#0B5345]">60 characters</strong> to prevent truncation.</li>
                          <li>Keep descriptions under <strong className="text-[#0B5345]">160 characters</strong>.</li>
                          <li>Include primary keywords naturally in your title and description.</li>
                          <li>Use different variants to A/B test your organic click-through rate.</li>
                      </ul>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
    </PageWrapper>
  );
}
