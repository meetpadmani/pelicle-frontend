import { useState, useEffect } from 'react';
import { layoutAPI, uploadAPI } from "../../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Upload, Image as ImageIcon, Save, Loader2,
  MousePointerClick, CheckCircle2, Type, Sparkles,
  Palette, Link as LinkIcon, LayoutTemplate, Star
} from "lucide-react";
import PageWrapper from '../components/PageWrapper';

const t = {
  ok: ({ title, sub }) => toast.success(`${title}${sub ? ': ' + sub : ''}`),
  err: (msg) => toast.error(typeof msg === 'string' ? msg : (msg?.title ? `${msg.title}${msg.sub ? ': ' + msg.sub : ''}` : 'Error'))
};

export default function SiteSettings() {
  const [form, setForm] = useState({ title: "Pelicle", logoType: "text", logoUrl: "", faviconUrl: "" });
  const [saving, setSaving] = useState(false);
  const [upLogo, setUpLogo] = useState(false);
  const [upFavi, setUpFavi] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await layoutAPI.get();
        if (data && data.layout) {
          let parsedLogo = { text: "Pelicle", type: "text", imageUrl: "" };
          try { if (data.layout.logo) parsedLogo = JSON.parse(data.layout.logo); } catch(e){}
          let parsedSite = { title: "", faviconUrl: "" };
          try { if (data.layout.siteSettings) parsedSite = JSON.parse(data.layout.siteSettings); } catch(e){}
          setForm({
            title: parsedLogo.text || parsedSite.title || "Pelicle",
            logoType: parsedLogo.type || "text",
            logoUrl: parsedLogo.imageUrl || "",
            faviconUrl: parsedSite.faviconUrl || "",
          });
        }
      } catch (e) { console.error("Failed to load layout settings"); }
    })();
  }, []);

  async function uploadImage(file) {
    try {
      const res = await uploadAPI.uploadImage(file);
      const url = res.data?.url || res.data?.imageUrl || res.data?.secure_url;
      return { path: url };
    } catch {
      t.err({ title: "Upload failed", sub: "Could not upload image." });
      return {};
    }
  }

  async function onPickLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpLogo(true);
    try {
      const { path } = await uploadImage(file);
      if (path) setForm(f => ({ ...f, logoUrl: path, logoType: 'image' }));
    } finally { setUpLogo(false); }
  }

  async function onPickFavicon(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpFavi(true);
    try {
      const { path } = await uploadImage(file);
      if (path) setForm(f => ({ ...f, faviconUrl: path }));
    } finally { setUpFavi(false); }
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const logoPayload = { type: form.logoType, text: form.title, imageUrl: form.logoUrl };
      const sitePayload = { title: form.title, faviconUrl: form.faviconUrl };
      await layoutAPI.update({ 
        logo: JSON.stringify(logoPayload),
        siteSettings: JSON.stringify(sitePayload)
      });
      t.ok({ title: "Settings saved", sub: "Site & Logo settings updated." });
      if (form.faviconUrl) {
        let link = document.querySelector("link[rel='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = form.faviconUrl;
      }
      if (form.title) document.title = form.title;
    } catch (error) {
      t.err(error.response?.data?.error || "Could not save site settings.");
    } finally { setSaving(false); }
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 bg-gradient-to-br from-[#0B5345] to-[#0E8A74] rounded-2xl shadow-lg shadow-[#0B5345]/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-[#0B5345] to-[#0E8A74] bg-clip-text text-transparent tracking-tight">
                Brand Identity
              </h1>
            </div>
            <p className="text-[#8BA699] text-sm font-medium ml-14">Manage your store's identity, logo and visual branding</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={save}
            disabled={saving || upLogo || upFavi}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0B5345] to-[#0E8A74] text-white font-bold rounded-2xl shadow-xl shadow-[#0B5345]/25 hover:shadow-2xl hover:shadow-[#0B5345]/30 transition-all disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving..." : "Save Configuration"}
          </motion.button>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* ── LEFT FORM ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Brand Name Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              <div className="px-8 py-5 border-b border-black/5 flex items-center gap-3">
                <div className="p-2 bg-[#0B5345]/10 rounded-xl">
                  <Globe className="w-4 h-4 text-[#0B5345]" />
                </div>
                <div>
                  <h2 className="font-black text-[#0B5345] text-base">General Identity</h2>
                  <p className="text-xs text-[#8BA699] font-medium">Your store's public-facing name</p>
                </div>
              </div>
              <div className="p-8">
                <label className="block text-xs font-black uppercase tracking-[0.15em] text-[#8BA699] mb-3">
                  Store / Brand Name
                </label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8BA699]" />
                  <input
                    className="w-full bg-[#F4F7F5] border border-transparent rounded-2xl pl-11 pr-5 py-4 text-base font-semibold text-[#0B5345] focus:bg-white focus:border-[#0B5345]/20 focus:ring-4 focus:ring-[#0B5345]/10 outline-none transition-all placeholder:text-[#8BA699] placeholder:font-normal"
                    placeholder="e.g. Pelicle"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    maxLength={30}
                  />
                </div>
                <p className="text-xs text-[#8BA699] mt-3 flex items-center gap-1.5">
                  <Star className="w-3 h-3" />
                  Shown in the browser tab, search results, and as the text logo.
                </p>
              </div>
            </motion.div>

            {/* Branding Assets Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden"
            >
              <div className="px-8 py-5 border-b border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0B5345]/10 rounded-xl">
                    <Palette className="w-4 h-4 text-[#0B5345]" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#0B5345] text-base">Branding Assets</h2>
                    <p className="text-xs text-[#8BA699] font-medium">Logo image and browser favicon</p>
                  </div>
                </div>

                {/* Logo Type Toggle */}
                <div className="flex bg-[#F4F7F5] p-1 rounded-xl gap-1">
                  {['text', 'image'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({...form, logoType: type})}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                        form.logoType === type
                          ? 'bg-white shadow-sm text-[#0B5345]'
                          : 'text-[#8BA699] hover:text-[#5C756D]'
                      }`}
                    >
                      {type === 'text' ? <Type className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 grid sm:grid-cols-2 gap-8">
                {/* LOGO UPLOAD */}
                <div className={form.logoType === 'text' ? 'opacity-40 pointer-events-none transition-all' : 'transition-all'}>
                  <label className="block text-xs font-black uppercase tracking-[0.15em] text-[#8BA699] mb-3">
                    Main Logo Image
                  </label>
                  <div className="relative group">
                    <input type="file" id="logo-upload" accept="image/*" onChange={onPickLogo} className="hidden" />
                    <label
                      htmlFor="logo-upload"
                      className={`flex flex-col items-center justify-center w-full h-44 rounded-2xl cursor-pointer transition-all border-2 border-dashed ${
                        form.logoUrl
                          ? 'border-[#0B5345]/20 bg-white hover:border-[#0B5345]/40'
                          : 'border-black/10 bg-[#F4F7F5] hover:bg-white hover:border-[#0B5345]/30'
                      }`}
                    >
                      {upLogo ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-[#0B5345]/10 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-[#0B5345]" />
                          </div>
                          <span className="text-xs text-[#5C756D] font-medium">Uploading...</span>
                        </div>
                      ) : form.logoUrl ? (
                        <div className="relative w-full h-full p-4 flex items-center justify-center">
                          <img src={form.logoUrl} alt="Logo" className="max-h-full w-auto object-contain rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <div className="bg-white/90 rounded-xl px-4 py-2 flex items-center gap-2">
                              <Upload className="w-4 h-4 text-[#0B5345]" />
                              <span className="text-xs font-bold text-[#0B5345]">Change Logo</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-[#8BA699] group-hover:text-[#0B5345] transition-colors">
                          <div className="w-14 h-14 rounded-2xl bg-[#0B5345]/8 flex items-center justify-center group-hover:bg-[#0B5345]/15 transition-colors">
                            <ImageIcon className="w-7 h-7" />
                          </div>
                          <div className="text-center">
                            <span className="block text-sm font-bold">Upload Logo</span>
                            <span className="block text-[11px] mt-0.5">PNG / SVG preferred</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="mt-3 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8BA699]" />
                    <input
                      className="w-full bg-[#F4F7F5] border border-transparent rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#5C756D] focus:bg-white focus:border-[#0B5345]/20 outline-none transition-all"
                      placeholder="Or paste image URL..."
                      value={form.logoUrl}
                      onChange={e => setForm({...form, logoUrl: e.target.value})}
                    />
                  </div>
                </div>

                {/* FAVICON UPLOAD */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-[0.15em] text-[#8BA699] mb-3">
                    Browser Favicon
                  </label>
                  <div className="relative group">
                    <input type="file" id="favi-upload" accept="image/*,.ico" onChange={onPickFavicon} className="hidden" />
                    <label
                      htmlFor="favi-upload"
                      className={`flex flex-col items-center justify-center w-full h-44 rounded-2xl cursor-pointer transition-all border-2 border-dashed ${
                        form.faviconUrl
                          ? 'border-[#0B5345]/20 bg-white hover:border-[#0B5345]/40'
                          : 'border-black/10 bg-[#F4F7F5] hover:bg-white hover:border-[#0B5345]/30'
                      }`}
                    >
                      {upFavi ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-[#0B5345]/10 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-[#0B5345]" />
                          </div>
                          <span className="text-xs text-[#5C756D] font-medium">Uploading...</span>
                        </div>
                      ) : form.faviconUrl ? (
                        <div className="relative w-full h-full p-4 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl border border-black/10 shadow-md bg-white p-2 flex items-center justify-center">
                              <img src={form.faviconUrl} alt="Favicon" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xs font-medium text-[#5C756D]">32×32px</span>
                          </div>
                          <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <div className="bg-white/90 rounded-xl px-4 py-2 flex items-center gap-2">
                              <Upload className="w-4 h-4 text-[#0B5345]" />
                              <span className="text-xs font-bold text-[#0B5345]">Change Favicon</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-[#8BA699] group-hover:text-[#0B5345] transition-colors">
                          <div className="w-14 h-14 rounded-2xl bg-[#0B5345]/8 flex items-center justify-center group-hover:bg-[#0B5345]/15 transition-colors">
                            <MousePointerClick className="w-7 h-7" />
                          </div>
                          <div className="text-center">
                            <span className="block text-sm font-bold">Upload Favicon</span>
                            <span className="block text-[11px] mt-0.5">32×32px · .ico / .png</span>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="mt-3 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8BA699]" />
                    <input
                      className="w-full bg-[#F4F7F5] border border-transparent rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#5C756D] focus:bg-white focus:border-[#0B5345]/20 outline-none transition-all"
                      placeholder="Or paste favicon URL..."
                      value={form.faviconUrl}
                      onChange={e => setForm({...form, faviconUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ── RIGHT PREVIEW ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Live Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B5345] via-[#0a4538] to-[#063028] shadow-2xl shadow-[#0B5345]/30"
            >
              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 p-6 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <LayoutTemplate className="w-4 h-4 text-white/60" />
                  <h3 className="font-bold text-white text-sm">Live Preview</h3>
                </div>
                <p className="text-white/40 text-xs mb-5">How customers see your brand</p>

                {/* Browser mockup */}
                <div className="bg-[#061510] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  {/* Tab bar */}
                  <div className="bg-[#0a2018] px-3 pt-2.5 flex items-end gap-1">
                    <div className="flex items-center gap-1.5 bg-white text-[#0B5345] px-3 py-1.5 rounded-t-lg text-[10px] font-semibold max-w-[130px] shadow-sm">
                      {form.faviconUrl ? (
                        <img src={form.faviconUrl} className="w-3 h-3 object-contain flex-shrink-0" alt="" />
                      ) : (
                        <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{form.title || "New Tab"}</span>
                      <span className="ml-auto text-gray-300 flex-shrink-0">✕</span>
                    </div>
                  </div>
                  {/* Address bar */}
                  <div className="bg-white px-3 py-1.5 flex items-center gap-2 border-b border-gray-100">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-md h-4 text-[9px] text-gray-400 flex items-center px-2">
                      pelicle.store
                    </div>
                  </div>
                  {/* Navbar */}
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-4">
                      {form.logoType === 'image' && form.logoUrl ? (
                        <img src={form.logoUrl} className="h-7 w-auto object-contain" alt="Brand" />
                      ) : (
                        <span style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: '14px', fontWeight: 700,
                          color: '#0d3d2c', letterSpacing: '0.08em',
                          textTransform: 'uppercase'
                        }}>
                          {form.title || 'Brand'}
                        </span>
                      )}
                      <div className="hidden sm:flex gap-3 text-[8px] font-bold text-gray-400">
                        <span>MEN</span><span>WOMEN</span><span>ABOUT</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-100" />
                      <div className="w-5 h-5 rounded-full bg-gray-100" />
                    </div>
                  </div>
                  {/* Content area */}
                  <div className="bg-gray-50 h-20 flex items-center justify-center">
                    <span className="text-[10px] text-gray-300 font-medium">Page Content Area</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pro Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-[#D4AF37]/15 rounded-xl">
                  <Star className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <h4 className="font-black text-[#0B5345] text-sm">Pro Tips</h4>
              </div>
              <ul className="space-y-3">
                {[
                  "Use a transparent PNG or SVG for the logo to blend with any background.",
                  "Favicons should be square (1:1 ratio) for best results.",
                  "Keep your site title concise (under 60 chars) for better SEO."
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#5C756D]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5345] shrink-0 mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: tip.replace(/(transparent PNG|SVG|square|1:1|60 chars)/g, '<strong class="text-[#0B5345]">$1</strong>') }} />
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}