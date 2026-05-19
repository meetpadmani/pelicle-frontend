import { useState, useEffect } from "react";
import { layoutAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  Save, Loader2, MessageSquare, ToggleLeft, ToggleRight,
  Timer, ImageIcon, Type, X, AlignLeft
} from "lucide-react";
import PageWrapper from "../components/PageWrapper";

const DEFAULT_POPUP = {
  enabled: false,
  delay: 3,
  title: "Welcome to Pelicle!",
  subtitle: "Get 10% off your first order",
  description: "Sign up to our newsletter and get exclusive deals, new arrivals and more.",
  buttonText: "Shop Now",
  buttonLink: "/products",
  imageUrl: "",
  showOnce: true,
};

export default function PopupSettings() {
  const [popup, setPopup] = useState(DEFAULT_POPUP);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    layoutAPI.get().then((res) => {
      if (res.data?.success) {
        const stored = res.data.layout?.siteSettings?.popup;
        if (stored) setPopup({ ...DEFAULT_POPUP, ...stored });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function set(k, v) {
    setPopup((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const currentSettings = await layoutAPI.get();
      const existingSiteSettings = currentSettings.data?.layout?.siteSettings || {};
      const res = await layoutAPI.update({
        siteSettings: JSON.stringify({ ...existingSiteSettings, popup }),
      });
      if (res.data?.success) {
        toast.success("Popup settings saved!");
      } else {
        toast.error("Failed to save popup settings.");
      }
    } catch {
      toast.error("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-3 text-sm text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B5345]" />
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B5345] tracking-tight flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-[#0E8A74]" />
              Popup Settings
            </h1>
            <p className="text-[#5C756D] mt-1 text-sm font-medium">
              Configure the welcome popup shown to visitors on your store.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#0B5345] text-white font-bold text-sm rounded-xl hover:bg-[#0E8A74] hover:-translate-y-0.5 shadow-lg shadow-[#0B5345]/20 transition-all disabled:opacity-60 shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: Settings */}
          <div className="space-y-6">
            {/* Toggle */}
            <div className="bg-white border border-[#E3E8E5] rounded-3xl shadow-sm p-6">
              <h3 className="font-bold text-[#0B5345] text-base mb-5 flex items-center gap-2 border-b border-[#F4F7F5] pb-4">
                <Timer className="w-5 h-5 text-[#0E8A74]" /> Display Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#FAFBF9] border border-[#E3E8E5] rounded-2xl px-5 py-4">
                  <div>
                    <p className="font-semibold text-[#0B5345] text-sm">Show Popup</p>
                    <p className="text-xs text-[#8BA699] mt-0.5">Enable or disable the popup for all visitors</p>
                  </div>
                  <button onClick={() => set("enabled", !popup.enabled)}>
                    {popup.enabled ? (
                      <ToggleRight className="w-10 h-10 text-[#0B5345]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-[#8BA699]" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-[#FAFBF9] border border-[#E3E8E5] rounded-2xl px-5 py-4">
                  <div>
                    <p className="font-semibold text-[#0B5345] text-sm">Show Once Per Session</p>
                    <p className="text-xs text-[#8BA699] mt-0.5">Don't show again after user dismisses</p>
                  </div>
                  <button onClick={() => set("showOnce", !popup.showOnce)}>
                    {popup.showOnce ? (
                      <ToggleRight className="w-10 h-10 text-[#0B5345]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-[#8BA699]" />
                    )}
                  </button>
                </div>

                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> Delay (seconds)</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    className={inputClass}
                    value={popup.delay}
                    onChange={(e) => set("delay", Number(e.target.value))}
                  />
                  <p className="text-xs text-[#8BA699] mt-1">Seconds to wait before showing the popup</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white border border-[#E3E8E5] rounded-3xl shadow-sm p-6">
              <h3 className="font-bold text-[#0B5345] text-base mb-5 flex items-center gap-2 border-b border-[#F4F7F5] pb-4">
                <Type className="w-5 h-5 text-[#0E8A74]" /> Popup Content
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input className={inputClass} value={popup.title} onChange={(e) => set("title", e.target.value)} placeholder="Welcome to our store!" />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <input className={inputClass} value={popup.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Get 10% off your first order" />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Description</span>
                  </label>
                  <textarea
                    rows={3}
                    className={inputClass + " resize-none"}
                    value={popup.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Short description about your offer..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Button Text</label>
                    <input className={inputClass} value={popup.buttonText} onChange={(e) => set("buttonText", e.target.value)} placeholder="Shop Now" />
                  </div>
                  <div>
                    <label className={labelClass}>Button Link</label>
                    <input className={inputClass} value={popup.buttonLink} onChange={(e) => set("buttonLink", e.target.value)} placeholder="/products" />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Image URL (optional)</span>
                  </label>
                  <input className={inputClass} value={popup.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://... or leave blank" />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <div className="sticky top-6">
            <div className="bg-white border border-[#E3E8E5] rounded-3xl shadow-sm p-6">
              <h3 className="font-bold text-[#0B5345] text-base mb-4 border-b border-[#F4F7F5] pb-4">
                Popup Preview
              </h3>
              <div className="bg-gray-100 rounded-2xl p-4 flex items-center justify-center min-h-[400px]">
                {popup.enabled ? (
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden border border-[#E3E8E5]">
                    {popup.imageUrl && (
                      <img src={popup.imageUrl} alt="popup" className="w-full h-32 object-cover" onError={(e) => e.target.style.display = "none"} />
                    )}
                    {!popup.imageUrl && (
                      <div className="w-full h-24 bg-gradient-to-br from-[#0B5345] to-[#0E8A74] flex items-center justify-center">
                        <MessageSquare className="w-10 h-10 text-white/50" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#0E8A74]">{popup.subtitle}</p>
                        <X className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                      <h2 className="font-bold text-[#0B5345] text-lg leading-tight mb-2">{popup.title || "Popup Title"}</h2>
                      <p className="text-[#5C756D] text-xs leading-relaxed mb-4">{popup.description}</p>
                      <a
                        href={popup.buttonLink}
                        className="block text-center w-full px-4 py-2.5 bg-[#0B5345] text-white text-sm font-bold rounded-xl hover:bg-[#0E8A74] transition-colors"
                      >
                        {popup.buttonText || "Shop Now"}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-[#8BA699]">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">Popup is disabled</p>
                    <p className="text-xs mt-1">Enable it to see a preview</p>
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[#5C756D]">
                <div className="bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl p-3">
                  <p>Status</p>
                  <p className={`font-bold mt-1 ${popup.enabled ? "text-[#0B5345]" : "text-[#8BA699]"}`}>
                    {popup.enabled ? "Active" : "Disabled"}
                  </p>
                </div>
                <div className="bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl p-3">
                  <p>Delay</p>
                  <p className="font-bold mt-1 text-[#0B5345]">{popup.delay}s</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
