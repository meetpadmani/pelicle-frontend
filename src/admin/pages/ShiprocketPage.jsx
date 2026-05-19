import { useState } from "react";
import toast from "react-hot-toast";
import { Save, Loader2, Truck, Key, CheckCircle, XCircle, ExternalLink, RefreshCw, Package, MapPin, Clock } from "lucide-react";
import PageWrapper from "../components/PageWrapper";

const SR_DOCS = "https://developer.shiprocket.in/";

export default function ShiprocketPage() {
  const [creds, setCreds] = useState({ email: "", password: "", token: "" });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | "ok" | "fail"
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setCreds(c => ({ ...c, [k]: v }));

  async function testConnection() {
    if (!creds.email || !creds.password) { toast.error("Enter email and password first."); return; }
    setTesting(true); setTestResult(null);
    try {
      const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: creds.email, password: creds.password }),
      });
      const data = await res.json();
      if (data.token) {
        setCreds(c => ({ ...c, token: data.token }));
        setTestResult("ok");
        toast.success("Connected to Shiprocket!");
      } else {
        setTestResult("fail");
        toast.error(data.message || "Invalid credentials.");
      }
    } catch {
      setTestResult("fail");
      toast.error("Could not reach Shiprocket. Check your network.");
    } finally { setTesting(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Store in localStorage for now (no backend route for Shiprocket creds yet)
      localStorage.setItem("shiprocket_email", creds.email);
      localStorage.setItem("shiprocket_token", creds.token);
      toast.success("Shiprocket credentials saved!");
    } catch { toast.error("Failed to save credentials."); }
    finally { setSaving(false); }
  }

  const inp = "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-3 text-sm text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]";
  const lbl = "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-2";

  const features = [
    { icon: Package, title: "Auto-Create Shipments", desc: "Automatically generate Shiprocket orders when orders are placed." },
    { icon: MapPin, title: "Live Tracking", desc: "Provide customers with real-time tracking via AWB number." },
    { icon: Truck, title: "Multiple Couriers", desc: "Select the best courier partner based on price and delivery time." },
    { icon: Clock, title: "NDR Management", desc: "Handle non-delivery reports and reattempt deliveries." },
  ];

  return (
    <PageWrapper>
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-5xl py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0B5345] flex items-center gap-3"><Truck className="w-8 h-8 text-[#0E8A74]" />Shiprocket Integration</h1>
            <p className="text-[#5C756D] mt-1 text-sm">Connect your Shiprocket account to automate shipping for your orders.</p>
          </div>
          <a href={SR_DOCS} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 border border-[#E3E8E5] text-[#0B5345] text-sm font-bold rounded-xl hover:bg-[#0B5345] hover:text-white transition-all shrink-0">
            <ExternalLink className="w-4 h-4" />API Docs
          </a>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Credentials */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6">
              <h3 className="font-bold text-[#0B5345] text-base flex items-center gap-2 border-b border-[#F4F7F5] pb-4 mb-5">
                <Key className="w-5 h-5 text-[#0E8A74]" />API Credentials
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Shiprocket Email</label>
                  <input className={inp} type="email" value={creds.email} onChange={e => set("email", e.target.value)} placeholder="your@email.com" />
                </div>
                <div>
                  <label className={lbl}>Shiprocket Password</label>
                  <input className={inp} type="password" value={creds.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" />
                </div>

                {creds.token && (
                  <div>
                    <label className={lbl}>Auth Token (auto-generated)</label>
                    <div className="relative">
                      <input className={inp + " pr-10 font-mono text-xs"} value={creds.token} readOnly />
                      <button onClick={() => { navigator.clipboard.writeText(creds.token); toast.success("Token copied!"); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8BA699] hover:text-[#0B5345]">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {testResult && (
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${testResult === "ok" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                    {testResult === "ok" ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    <p className={`text-sm font-semibold ${testResult === "ok" ? "text-green-700" : "text-red-600"}`}>
                      {testResult === "ok" ? "Successfully connected to Shiprocket!" : "Connection failed. Check your credentials."}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={testConnection} disabled={testing} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border-2 border-[#0B5345] text-[#0B5345] font-bold text-sm rounded-xl hover:bg-[#0B5345] hover:text-white transition-all disabled:opacity-60">
                    {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}{testing ? "Testing…" : "Test Connection"}
                  </button>
                  <button onClick={handleSave} disabled={saving || !creds.token} className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#0B5345] text-white font-bold text-sm rounded-xl hover:bg-[#0E8A74] transition-all disabled:opacity-60 shadow-lg shadow-[#0B5345]/20">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? "Saving…" : "Save Credentials"}
                  </button>
                </div>
              </div>
            </div>

            {/* How to connect */}
            <div className="bg-white border border-[#E3E8E5] rounded-3xl p-6">
              <h3 className="font-bold text-[#0B5345] text-base mb-4">How to Connect</h3>
              <ol className="space-y-3">
                {[
                  "Sign up at shiprocket.in and verify your seller account.",
                  "Enter your Shiprocket login email and password above.",
                  'Click "Test Connection" — this fetches your auth token automatically.',
                  'Click "Save Credentials" to store the token for use in order shipping.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#0B5345] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-[#5C756D]">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Features */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-gradient-to-br from-[#0B5345] to-[#0E8A74] rounded-3xl p-6 text-white">
              <h3 className="font-bold text-lg mb-1">Shiprocket Features</h3>
              <p className="text-white/70 text-xs mb-5">What you unlock after connecting</p>
              <div className="space-y-4">
                {features.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 bg-white/10 rounded-2xl p-3">
                    <Icon className="w-5 h-5 text-white/80 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">{title}</p>
                      <p className="text-white/70 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#E3E8E5] rounded-3xl p-5">
              <h3 className="font-bold text-[#0B5345] text-sm mb-3">Connection Status</h3>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${creds.token ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                <div className={`w-3 h-3 rounded-full ${creds.token ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                <p className={`text-sm font-semibold ${creds.token ? "text-green-700" : "text-gray-500"}`}>
                  {creds.token ? "Connected" : "Not Connected"}
                </p>
              </div>
              {creds.email && <p className="text-xs text-[#8BA699] mt-2">Account: {creds.email}</p>}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
