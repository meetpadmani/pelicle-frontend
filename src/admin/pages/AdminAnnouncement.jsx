import React, { useState, useEffect } from "react";
import { layoutAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  Plus, Trash2, Save, Loader2,
  Timer, Type, Zap,
  Eye, EyeOff, ChevronUp, ChevronDown, Megaphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from '../components/PageWrapper';

const DEFAULT_TICKER = {
  enabled: true,
  speed: 30,
  items: [
    { id: "1", text: "⚡ Flash Deal", highlighted: true,  showTimer: false, timerHours: 0, timerMinutes: 44, timerSeconds: 10 },
    { id: "2", text: "Ultimate Discount on All Books Here", highlighted: false, showTimer: false, timerHours: 0, timerMinutes: 44, timerSeconds: 10 },
  ],
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const CountdownTimer = ({ item, small = false }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // If not set, use what's in the input fields or default to 44:10
    const currentH = item.timerHours || 0;
    const currentM = item.timerMinutes || 0;
    const currentS = item.timerSeconds || 0;
    const currentDuration = (currentH * 3600) + (currentM * 60) + currentS;
    
    let duration = item.timerDuration || (currentDuration > 0 ? currentDuration : (44 * 60 + 10));
    let endTime = item.timerEndTime;

    if (!endTime) endTime = Date.now() + duration * 1000;

    const tick = () => {
      const now = Date.now();
      let remaining = Math.floor((endTime - now) / 1000);
      
      if (remaining <= 0) {
          const timePassed = now - endTime;
          const cycles = Math.floor(timePassed / (duration * 1000)) + 1;
          endTime = endTime + (cycles * duration * 1000);
          remaining = Math.floor((endTime - now) / 1000);
      }
      setTimeLeft(Math.max(0, remaining));
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [item]);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0');
  const s = (timeLeft % 60).toString().padStart(2, '0');
  
  const timeStr = h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;

  if (small) {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/20 border border-[#D4AF37]/50">
        <span className="w-1 h-1 rounded-full bg-[#D4AF37] animate-pulse" />
        <span className="text-[#D4AF37] font-mono font-black text-[10px] tracking-wider leading-none mt-px">{timeStr}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/20 border border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.3)] backdrop-blur-md">
      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
      <span className="text-[#D4AF37] font-mono font-black text-[11px] tracking-wider leading-none mt-0.5">{timeStr}</span>
    </span>
  );
};

export default function AdminAnnouncement() {
  const [enabled, setEnabled] = useState(true);
  const [speed, setSpeed] = useState(30);
  const [items, setItems] = useState(DEFAULT_TICKER.items);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load existing settings
  useEffect(() => {
    (async () => {
      try {
        const { data } = await layoutAPI.get();
        if (data.layout && data.layout.ticker) {
          let t = {};
          try { t = JSON.parse(data.layout.ticker); } catch(e){}
          setEnabled(t.enabled ?? true);
          setSpeed(t.speed ?? 30);
          
          if (t.items && Array.isArray(t.items)) {
            setItems(t.items.map(i => {
               if (i.timerDuration) {
                  return {
                     ...i,
                     timerHours: Math.floor(i.timerDuration / 3600),
                     timerMinutes: Math.floor((i.timerDuration % 3600) / 60),
                     timerSeconds: i.timerDuration % 60
                  };
               }
               return { ...i, timerHours: 0, timerMinutes: 44, timerSeconds: 10 };
            }));
          } else {
            setItems(DEFAULT_TICKER.items);
          }
        } else if (data.layout && data.layout.announcements) {
           // Fallback for old simple array format
           let oldAnns = Array.isArray(data.layout.announcements) ? data.layout.announcements : [];
           if (typeof data.layout.announcements === 'string') {
             try { oldAnns = JSON.parse(data.layout.announcements); } catch(e){}
           }
           if (Array.isArray(oldAnns) && oldAnns.length > 0) {
              setItems(oldAnns.map((a, i) => ({ id: uid(), text: a, highlighted: false, showTimer: false, timerHours: 0, timerMinutes: 44, timerSeconds: 10 })));
           }
        }
      } catch {
        // fall back to defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── item helpers ──────────────────────────────────────────────────────────
  const addItem = () =>
    setItems(prev => [...prev, { id: uid(), text: "", highlighted: false, showTimer: false, timerHours: 0, timerMinutes: 44, timerSeconds: 10 }]);

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const updateItem = (id, patch) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));

  const moveItem = (idx, dir) => {
    setItems(prev => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  // ── save ──────────────────────────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      const itemsToSave = items.filter(i => i.text.trim()).map(i => {
         if (i.showTimer) {
             const h = i.timerHours || 0;
             const m = i.timerMinutes || 0;
             const s = i.timerSeconds || 0;
             const duration = (h * 3600) + (m * 60) + s;
             const finalDuration = duration > 0 ? duration : (44 * 60 + 10);
             return {
                ...i,
                timerDuration: finalDuration,
                timerEndTime: Date.now() + (finalDuration * 1000)
             };
         }
         return i;
      });
      const tickerData = { enabled, speed, items: itemsToSave };
      const formData = new FormData();
      formData.append('ticker', JSON.stringify(tickerData));
      
      await layoutAPI.update(formData);
      toast.success("Announcement Bar saved!");
    } catch {
      toast.error("Failed to save announcement bar");
    } finally {
      setSaving(false);
    }
  };

  // ── preview ───────────────────────────────────────────────────────────────
  const activeItems = items.filter(i => i.text.trim());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B5345]" />
      </div>
    );
  }

  return (
    <PageWrapper>
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 -left-10 w-72 h-72 bg-[#0E8A74]/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
      <div className="absolute top-40 -right-10 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-[#0B5345] to-[#0E8A74] bg-clip-text text-transparent flex items-center gap-3 tracking-tight">
            <Megaphone className="text-[#0B5345] w-8 h-8" />
            Announcement Bar
          </h1>
          <p className="text-sm text-[#5C756D] mt-2 font-medium">
            Configure the scrolling marquee to highlight key promotions
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0B5345] to-[#0a4538] text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      {/* Live Preview */}
      {/* Live Preview */}
      <AnimatePresence>
        {enabled && activeItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgb(11,83,69,0.15)] border border-white bg-white/50 backdrop-blur-xl"
          >
            {/* Mac OS Header Frame */}
            <div className="px-4 py-3 bg-[#f8f9fa] border-b border-black/5 flex items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="mx-auto text-[10px] font-black uppercase tracking-[0.2em] text-[#8BA699] bg-white px-4 py-1 rounded-full shadow-sm">
                Live Preview
              </div>
              <div className="w-12" /> {/* Spacer to balance flex */}
            </div>

            <div className="relative overflow-hidden bg-gradient-to-r from-[#0B5345] to-[#0a4538] py-2.5">
              <style>{`@keyframes preview-ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
              <div
                style={{ animation: `preview-ticker ${speed}s linear infinite` }}
                className="flex whitespace-nowrap w-max"
              >
                {[0, 1].map(copy => (
                  <span key={copy} className="inline-flex items-center gap-5 px-4 text-[11px] font-bold uppercase tracking-widest font-['Cinzel']">
                    {activeItems.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-5">
                        {item.showTimer ? (
                          <span className="inline-flex items-center gap-2 text-white">
                            {item.text}
                            <CountdownTimer item={item} />
                          </span>
                        ) : (
                          <span className={item.highlighted ? "text-[#D4AF37] font-black drop-shadow-md" : "text-white/90"}>
                            {item.text}
                          </span>
                        )}
                        <span className="text-white/30 text-[8px]">◆</span>
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Controls */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-8">
        <h2 className="text-xs font-black text-[#8BA699] uppercase tracking-[0.2em]">Global Settings</h2>
        
        {/* Enable / Disable */}
        <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-black/5 shadow-sm">
          <div>
            <p className="font-bold text-[#0B5345] text-lg">Announcement Bar Status</p>
            <p className="text-sm text-[#5C756D] mt-1">Control the visibility of the marquee across the storefront</p>
          </div>
          <button
            onClick={() => setEnabled(v => !v)}
            className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all overflow-hidden ${
              enabled
                ? "bg-gradient-to-r from-[#0B5345] to-[#0E8A74] text-white shadow-md hover:shadow-lg"
                : "bg-gray-100 text-[#5C756D] hover:bg-gray-200"
            }`}
          >
            {enabled && (
              <motion.div layoutId="active-bg" className="absolute inset-0 bg-white/10" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {enabled ? "Visible" : "Hidden"}
            </span>
          </button>
        </div>

        {/* Speed */}
        <div className="p-5 bg-white rounded-2xl border border-black/5 shadow-sm">
          <label className="block font-bold text-[#0B5345] mb-4 text-lg">
            Scroll Speed
            <span className="ml-3 text-xs font-medium text-[#8BA699] uppercase tracking-wider">(Seconds per loop)</span>
          </label>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-[#8BA699] uppercase">Fast</span>
            <input
              type="range" min={10} max={80} step={5}
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#0B5345]"
            />
            <span className="text-xs font-bold text-[#8BA699] uppercase">Slow</span>
            <motion.div 
              key={speed}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 text-center bg-gradient-to-r from-[#0B5345] to-[#0E8A74] text-white rounded-xl px-3 py-2 text-sm font-mono font-bold shadow-md"
            >
              {speed}s
            </motion.div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-[#8BA699] uppercase tracking-[0.2em]">
            Marquee Items <span className="font-medium">({items.length})</span>
          </h2>
          <button
            onClick={addItem}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0B5345] rounded-2xl font-bold text-sm hover:shadow-md transition-all border border-black/5"
          >
            <Plus className="w-4 h-4" /> Add New Item
          </button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-black/10">
            <Type className="w-10 h-10 mx-auto mb-4 text-[#8BA699] opacity-50" />
            <p className="text-[#5C756D] font-medium">No items yet. Add some announcements to get started.</p>
          </div>
        )}

        <div className="space-y-4">
          <AnimatePresence>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 items-start bg-white rounded-3xl border border-black/5 p-5 shadow-sm group hover:border-[#0B5345]/20 hover:shadow-md transition-all"
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1 pt-2 shrink-0">
                  <button
                    onClick={() => moveItem(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg hover:bg-[#F4F7F5] disabled:opacity-20 transition-colors text-[#5C756D]"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 1)}
                    disabled={idx === items.length - 1}
                    className="p-1.5 rounded-lg hover:bg-[#F4F7F5] disabled:opacity-20 transition-colors text-[#5C756D]"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Main content */}
                <div className="flex-1 space-y-4">
                  {/* Text input */}
                  <input
                    type="text"
                    value={item.text}
                    onChange={e => updateItem(item.id, { text: e.target.value })}
                    placeholder="Enter promotional text..."
                    className="w-full px-4 py-3 bg-[#F4F7F5] border-transparent rounded-xl text-sm text-[#0B5345] focus:bg-white border focus:border-[#0B5345]/20 focus:ring-4 focus:ring-[#0B5345]/10 font-['Cinzel'] uppercase tracking-wide placeholder:normal-case placeholder:font-sans placeholder:tracking-normal transition-all"
                  />

                  {/* Toggles row */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => updateItem(item.id, { highlighted: !item.highlighted })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        item.highlighted
                          ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 shadow-inner"
                          : "bg-white text-[#5C756D] border-black/5 hover:border-[#0B5345]/20"
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${item.highlighted ? "fill-[#D4AF37]" : ""}`} />
                      {item.highlighted ? "Highlight Active" : "Standard Text"}
                    </button>

                    <button
                      onClick={() => updateItem(item.id, { showTimer: !item.showTimer })}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        item.showTimer
                          ? "bg-[#0B5345]/10 text-[#0B5345] border-[#0B5345]/30 shadow-inner"
                          : "bg-white text-[#5C756D] border-black/5 hover:border-[#0B5345]/20"
                      }`}
                    >
                      <Timer className={`w-3.5 h-3.5 ${item.showTimer ? "fill-[#0B5345]" : ""}`} />
                      {item.showTimer ? "Timer Active" : "No Timer"}
                    </button>

                    {item.showTimer && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="w-full mt-1 p-4 rounded-2xl bg-gradient-to-br from-[#0a2018] to-[#061510] border border-[#D4AF37]/20 shadow-[0_0_30px_rgba(212,175,55,0.08)]"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                          <span className="text-[10px] font-black text-[#D4AF37]/70 uppercase tracking-[0.2em]">Set Countdown Duration</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          {/* Hours */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-[#D4AF37]/50 uppercase tracking-widest">HRS</span>
                            <input
                              type="number" min="0"
                              value={item.timerHours === undefined ? 0 : item.timerHours}
                              onChange={e => updateItem(item.id, { timerHours: parseInt(e.target.value)||0 })}
                              className="w-16 text-center text-2xl font-mono font-black text-[#D4AF37] bg-white/5 border border-[#D4AF37]/20 rounded-xl py-2 focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 outline-none transition-all placeholder:text-[#D4AF37]/20"
                            />
                          </div>
                          <span className="text-[#D4AF37]/50 text-3xl font-black pb-1 select-none">:</span>
                          {/* Minutes */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-[#D4AF37]/50 uppercase tracking-widest">MIN</span>
                            <input
                              type="number" min="0" max="59"
                              value={item.timerMinutes === undefined ? 0 : item.timerMinutes}
                              onChange={e => updateItem(item.id, { timerMinutes: Math.min(59, parseInt(e.target.value)||0) })}
                              className="w-16 text-center text-2xl font-mono font-black text-[#D4AF37] bg-white/5 border border-[#D4AF37]/20 rounded-xl py-2 focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 outline-none transition-all"
                            />
                          </div>
                          <span className="text-[#D4AF37]/50 text-3xl font-black pb-1 select-none">:</span>
                          {/* Seconds */}
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[9px] font-bold text-[#D4AF37]/50 uppercase tracking-widest">SEC</span>
                            <input
                              type="number" min="0" max="59"
                              value={item.timerSeconds === undefined ? 0 : item.timerSeconds}
                              onChange={e => updateItem(item.id, { timerSeconds: Math.min(59, parseInt(e.target.value)||0) })}
                              className="w-16 text-center text-2xl font-mono font-black text-[#D4AF37] bg-white/5 border border-[#D4AF37]/20 rounded-xl py-2 focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <p className="text-[9px] text-[#D4AF37]/30 text-center mt-3 font-medium">Timer will auto-reset when it reaches 00:00:00</p>
                      </motion.div>
                    )}

                    {/* Item preview swatch */}
                    <div className="ml-auto hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0B5345] to-[#0a4538] rounded-xl shadow-inner">
                      {item.showTimer ? (
                        <span className="text-white text-[10px] font-['Cinzel'] font-bold uppercase tracking-widest flex items-center gap-2">
                          {item.text || "…"}{" "}
                          <CountdownTimer item={item} small />
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] font-['Cinzel'] uppercase tracking-widest ${
                            item.highlighted ? "text-[#D4AF37] font-black drop-shadow-md" : "text-white/90 font-bold"
                          }`}
                        >
                          {item.text || "Preview"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-3 rounded-xl hover:bg-red-50 text-black/20 hover:text-red-500 transition-colors shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Save footer */}
      <div className="flex justify-end mt-10">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#0B5345] to-[#0E8A74] text-white rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Ticker Settings
        </button>
      </div>
    </div>
    </PageWrapper>
  );
}
