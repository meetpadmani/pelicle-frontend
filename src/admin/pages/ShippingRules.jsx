import { useState, useEffect } from "react";
import { layoutAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Save, Loader2, Truck, Plus, Trash2, ToggleLeft, ToggleRight, IndianRupee, Package } from "lucide-react";
import PageWrapper from "../components/PageWrapper";

const DEFAULT = { freeShippingEnabled: true, freeShippingThreshold: 999, baseShippingCharge: 79, codEnabled: true, codCharge: 49, expressEnabled: false, expressCharge: 149, weightRules: [] };

export default function ShippingRules() {
  const [rules, setRules] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    layoutAPI.get().then(res => {
      if (res.data?.success) {
        const s = res.data.layout?.siteSettings?.shippingRules;
        if (s) setRules({ ...DEFAULT, ...s });
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setRules(r => ({ ...r, [k]: v }));
  const addRule = () => setRules(r => ({ ...r, weightRules: [...r.weightRules, { id: String(Date.now()), upToKg: "", charge: "" }] }));
  const removeRule = id => setRules(r => ({ ...r, weightRules: r.weightRules.filter(w => w.id !== id) }));
  const updateRule = (id, f, v) => setRules(r => ({ ...r, weightRules: r.weightRules.map(w => w.id === id ? { ...w, [f]: v } : w) }));

  async function handleSave() {
    setSaving(true);
    try {
      const cur = await layoutAPI.get();
      const existing = cur.data?.layout?.siteSettings || {};
      const res = await layoutAPI.update({ siteSettings: JSON.stringify({ ...existing, shippingRules: rules }) });
      res.data?.success ? toast.success("Shipping rules saved!") : toast.error("Failed to save.");
    } catch { toast.error("Error saving rules."); }
    finally { setSaving(false); }
  }

  const inp = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-3 text-sm text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]";
  const lbl = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2";

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#0B5345]" /></div>;

  return (
    <PageWrapper>
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B5345] flex items-center gap-3"><Truck className="w-8 h-8 text-[#0E8A74]" />Shipping Rules</h1>
            <p className="text-[#5C756D] mt-1 text-sm">Configure shipping charges, free shipping, and COD options.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-[#0B5345] text-white font-bold text-sm rounded-xl hover:bg-[#0E8A74] shadow-lg shadow-[#0B5345]/20 transition-all disabled:opacity-60 shrink-0">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? "Saving…" : "Save Rules"}
          </button>
        </div>

        <div className="space-y-5">
          {/* Free Shipping */}
          <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6">
            <div className="flex items-center justify-between border-b border-[#F4F7F5] pb-4 mb-5">
              <h3 className="font-bold text-[#0B5345] flex items-center gap-2"><Package className="w-5 h-5 text-[#0E8A74]" />Free Shipping</h3>
              <button onClick={() => set("freeShippingEnabled", !rules.freeShippingEnabled)}>{rules.freeShippingEnabled ? <ToggleRight className="w-10 h-10 text-[#0B5345]" /> : <ToggleLeft className="w-10 h-10 text-[#8BA699]" />}</button>
            </div>
            <div className={rules.freeShippingEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}>
              <label className={lbl}>Minimum Order Amount (₹)</label>
              <div className="relative max-w-xs"><IndianRupee className="w-4 h-4 text-[#8BA699] absolute left-3 top-1/2 -translate-y-1/2" /><input type="number" className={inp + " pl-9"} value={rules.freeShippingThreshold} onChange={e => set("freeShippingThreshold", Number(e.target.value))} /></div>
              <p className="text-xs text-[#8BA699] mt-2">Orders above this amount ship free</p>
            </div>
          </div>

          {/* Standard + COD + Express */}
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { key: "base", label: "Standard Charge", valKey: "baseShippingCharge", toggle: null },
              { key: "cod", label: "COD Extra Charge", valKey: "codCharge", toggle: "codEnabled" },
              { key: "exp", label: "Express Charge", valKey: "expressCharge", toggle: "expressEnabled" },
            ].map(({ key, label, valKey, toggle }) => (
              <div key={key} className="bg-white border border-[#E3E8E5] rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-[#0B5345] text-sm">{label}</p>
                  {toggle && (
                    <button onClick={() => set(toggle, !rules[toggle])}>{rules[toggle] ? <ToggleRight className="w-8 h-8 text-[#0B5345]" /> : <ToggleLeft className="w-8 h-8 text-[#8BA699]" />}</button>
                  )}
                </div>
                <div className={toggle && !rules[toggle] ? "opacity-40 pointer-events-none" : ""}>
                  <div className="relative"><IndianRupee className="w-4 h-4 text-[#8BA699] absolute left-3 top-1/2 -translate-y-1/2" /><input type="number" className={inp + " pl-9"} value={rules[valKey]} onChange={e => set(valKey, Number(e.target.value))} /></div>
                </div>
              </div>
            ))}
          </div>

          {/* Weight Rules */}
          <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6">
            <div className="flex items-center justify-between border-b border-[#F4F7F5] pb-4 mb-5">
              <h3 className="font-bold text-[#0B5345] flex items-center gap-2"><Truck className="w-5 h-5 text-[#0E8A74]" />Weight-Based Surcharges</h3>
              <button onClick={addRule} className="flex items-center gap-1.5 px-4 py-2 bg-[#0B5345]/10 text-[#0B5345] text-xs font-bold rounded-xl hover:bg-[#0B5345] hover:text-white transition-all"><Plus className="w-4 h-4" />Add Rule</button>
            </div>
            {rules.weightRules.length === 0 ? (
              <p className="text-center text-[#8BA699] text-sm py-6">No weight rules. Click "Add Rule" to create one.</p>
            ) : (
              <div className="space-y-3">
                {rules.weightRules.map(wr => (
                  <div key={wr.id} className="flex items-end gap-3 bg-[#FAFBF9] border border-[#E3E8E5] rounded-2xl p-4">
                    <div className="flex-1"><label className={lbl}>Up to (kg)</label><input type="number" className={inp} value={wr.upToKg} onChange={e => updateRule(wr.id, "upToKg", e.target.value)} placeholder="e.g. 2" /></div>
                    <div className="flex-1"><label className={lbl}>Extra Charge (₹)</label><div className="relative"><IndianRupee className="w-4 h-4 text-[#8BA699] absolute left-3 top-1/2 -translate-y-1/2" /><input type="number" className={inp + " pl-9"} value={wr.charge} onChange={e => updateRule(wr.id, "charge", e.target.value)} placeholder="e.g. 50" /></div></div>
                    <button onClick={() => removeRule(wr.id)} className="text-red-400 hover:text-red-600 mb-0.5"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-[#0B5345] to-[#0E8A74] rounded-3xl p-6 text-white">
            <h3 className="font-bold text-lg mb-4">Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Standard", val: `₹${rules.baseShippingCharge}` },
                { label: "Free above", val: rules.freeShippingEnabled ? `₹${rules.freeShippingThreshold}` : "Off" },
                { label: "COD fee", val: rules.codEnabled ? `₹${rules.codCharge}` : "Off" },
              ].map(({ label, val }) => (
                <div key={label} className="bg-white/10 rounded-2xl p-4">
                  <p className="text-xs text-white/70 uppercase tracking-wider">{label}</p>
                  <p className="text-2xl font-bold mt-1">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
