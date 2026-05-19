import React, { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, Cloud, CreditCard, Image, CheckCircle, XCircle, AlertCircle, Loader2, Save, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../services/api';
import PageWrapper from '../components/PageWrapper';

/* ════════════════════════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════════════════════════ */

const StatusBadge = ({ enabled, hasSecret }) => {
  if (!enabled)     return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500"><XCircle size={11}/> Disabled</span>;
  if (!hasSecret)   return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200"><AlertCircle size={11}/> Not configured</span>;
  return             <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200"><CheckCircle size={11}/> Connected</span>;
};

const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent cursor-pointer
      transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6B7A4D]/30
      ${checked ? 'bg-[#6B7A4D]' : 'bg-gray-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    aria-checked={checked}
    role="switch"
  >
    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0
      transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>
);

const SecretInput = ({ id, label, value, onChange, placeholder, required }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder || '••••••••'}
          className="w-full px-3 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-gray-50
            focus:outline-none focus:border-[#6B7A4D] focus:ring-2 focus:ring-[#6B7A4D]/15 focus:bg-white transition"
        />
        <button type="button" tabIndex={-1}
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition">
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
};

const Field = ({ id, label, value, onChange, placeholder, required, hint }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input
      id={id}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50
        focus:outline-none focus:border-[#6B7A4D] focus:ring-2 focus:ring-[#6B7A4D]/15 focus:bg-white transition"
    />
    {hint && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
  </div>
);

const InfoBox = ({ children }) => (
  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-[12px] text-blue-700 leading-relaxed space-y-1">
    {children}
  </div>
);

const TestResultBanner = ({ result }) => {
  if (!result) return null;
  return (
    <div className={`flex items-start gap-2 rounded-xl p-3 text-sm font-medium mt-3
      ${result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
      {result.success ? <CheckCircle size={16} className="mt-0.5 shrink-0"/> : <XCircle size={16} className="mt-0.5 shrink-0"/>}
      <span>{result.message}</span>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   Default state shapes
   ════════════════════════════════════════════════════════════════ */
const defaultCfg = {
  r2: {
    enabled: false,
    accountId: '', bucketName: '', accessKeyId: '',
    secretAccessKey: '', publicUrl: '',
  },
  razorpay: {
    enabled: false, mode: 'test',
    keyId: '', keySecret: '', webhookSecret: '',
  },
  cloudinary: {
    enabled: false,
    cloudName: '', apiKey: '', apiSecret: '',
  },
};

/* ════════════════════════════════════════════════════════════════
   TABS CONFIG
   ════════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'r2',        label: 'Cloudflare R2',  Icon: Cloud,       color: 'text-orange-500', bg: 'bg-orange-50'  },
  { id: 'razorpay',  label: 'Razorpay',        Icon: CreditCard,  color: 'text-blue-600',   bg: 'bg-blue-50'    },
  { id: 'cloudinary',label: 'Cloudinary',      Icon: Image,       color: 'text-purple-600', bg: 'bg-purple-50'  },
];

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
const AdminIntegrations = () => {
  const [activeTab,    setActiveTab]    = useState('r2');
  const [cfg,          setCfg]          = useState(defaultCfg);
  const [saving,       setSaving]       = useState(false);
  const [testLoading,  setTestLoading]  = useState({});
  const [testResults,  setTestResults]  = useState({});
  const [dirty,        setDirty]        = useState(false);

  /* ── Load settings ── */
  useEffect(() => {
    document.title = 'Integrations — Pelicle Admin';
    API.get('/admin/settings/integrations')
      .then(res => {
        const data = res.data?.integrations || {};
        setCfg({
          r2:        { ...defaultCfg.r2,        ...(data.r2        || {}) },
          razorpay:  { ...defaultCfg.razorpay,  ...(data.razorpay  || {}) },
          cloudinary:{ ...defaultCfg.cloudinary, ...(data.cloudinary|| {}) },
        });
      })
      .catch(() => {}); // silently fail if endpoint not yet implemented
  }, []);

  /* ── Patch helper ── */
  const patch = useCallback((service, field, value) => {
    setCfg(prev => ({ ...prev, [service]: { ...prev[service], [field]: value } }));
    setDirty(true);
  }, []);

  /* ── Save all ── */
  const saveAll = async () => {
    setSaving(true);
    try {
      await API.put('/admin/settings/integrations', { integrations: cfg });
      // Re-fetch to confirm saved state
      const res = await API.get('/admin/settings/integrations');
      const data = res.data?.integrations || {};
      setCfg({
        r2:         { ...defaultCfg.r2,         ...(data.r2         || {}) },
        razorpay:   { ...defaultCfg.razorpay,   ...(data.razorpay   || {}) },
        cloudinary: { ...defaultCfg.cloudinary, ...(data.cloudinary || {}) },
      });
      setDirty(false);
      toast.success('Integration settings saved successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Test connection ── */
  const testConnection = async (service) => {
    const endpoint = service === 'r2' ? '/admin/settings/integrations/test-r2'
      : service === 'razorpay' ? '/admin/settings/integrations/test-razorpay'
      : null;
    if (!endpoint) return;

    setTestLoading(p => ({ ...p, [service]: true }));
    setTestResults(p => ({ ...p, [service]: null }));
    try {
      const res = await API.post(endpoint, cfg[service]);
      setTestResults(p => ({ ...p, [service]: { success: true, message: res.data?.message || 'Connection successful!' } }));
      toast.success('Connection test passed!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Connection failed. Check your credentials.';
      setTestResults(p => ({ ...p, [service]: { success: false, message: msg } }));
      toast.error(msg);
    } finally {
      setTestLoading(p => ({ ...p, [service]: false }));
    }
  };

  /* ── Render R2 panel ── */
  const renderR2 = () => (
    <div className="space-y-5">
      <InfoBox>
        <p className="font-bold">How to get Cloudflare R2 credentials:</p>
        <p>1. Go to <strong>Cloudflare Dashboard → R2 Object Storage</strong></p>
        <p>2. Create a bucket and note its name.</p>
        <p>3. Under <strong>Manage R2 API Tokens</strong>, create a token with Read &amp; Write permissions.</p>
        <p>4. Copy the <strong>Account ID</strong> from the R2 overview page (right sidebar).</p>
        <p>5. Set a <strong>Custom Domain</strong> or use the public URL from bucket settings.</p>
      </InfoBox>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="r2-account" label="Account ID" required value={cfg.r2.accountId}
          onChange={v => patch('r2','accountId',v)} placeholder="abc123def456..." />
        <Field id="r2-bucket" label="Bucket Name" required value={cfg.r2.bucketName}
          onChange={v => patch('r2','bucketName',v)} placeholder="my-pelicle-assets" />
        <Field id="r2-keyid" label="Access Key ID" required value={cfg.r2.accessKeyId}
          onChange={v => patch('r2','accessKeyId',v)} placeholder="Ax1Bx2Cx3Dx4..." />
        <SecretInput id="r2-secret" label="Secret Access Key" required value={cfg.r2.secretAccessKey}
          onChange={v => patch('r2','secretAccessKey',v)} />
        <div className="sm:col-span-2">
          <Field id="r2-url" label="Public URL (Optional)" value={cfg.r2.publicUrl}
            onChange={v => patch('r2','publicUrl',v)} placeholder="https://cdn.yourdomain.com"
            hint="Custom domain or the default R2.dev public URL" />
        </div>
      </div>

      <button
        onClick={() => testConnection('r2')}
        disabled={testLoading.r2 || !cfg.r2.accountId || !cfg.r2.secretAccessKey}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
          border-2 border-[#6B7A4D] text-[#6B7A4D] hover:bg-[#6B7A4D] hover:text-white
          transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {testLoading.r2 ? <Loader2 size={15} className="animate-spin"/> : <Zap size={15}/>}
        Test Connection
      </button>
      <TestResultBanner result={testResults.r2} />
    </div>
  );

  /* ── Render Razorpay panel ── */
  const renderRazorpay = () => (
    <div className="space-y-5">
      {/* Mode toggle banner */}
      <div className={`flex items-center justify-between rounded-xl p-4 border ${
        cfg.razorpay.mode === 'live'
          ? 'bg-green-50 border-green-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div>
          <p className={`text-sm font-bold ${cfg.razorpay.mode === 'live' ? 'text-green-700' : 'text-amber-700'}`}>
            {cfg.razorpay.mode === 'live' ? '🟢 Live Mode' : '🟡 Test Mode'}
          </p>
          <p className={`text-xs ${cfg.razorpay.mode === 'live' ? 'text-green-600' : 'text-amber-600'}`}>
            {cfg.razorpay.mode === 'live' ? 'Real payments will be processed.' : 'No real money — safe for testing.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-600">Test</span>
          <Toggle
            checked={cfg.razorpay.mode === 'live'}
            onChange={v => patch('razorpay','mode', v ? 'live' : 'test')}
          />
          <span className="text-xs font-semibold text-gray-600">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="rp-keyid" label="Key ID" required value={cfg.razorpay.keyId}
          onChange={v => patch('razorpay','keyId',v)}
          placeholder={cfg.razorpay.mode === 'live' ? 'rzp_live_...' : 'rzp_test_...'} />
        <SecretInput id="rp-secret" label="Key Secret" required value={cfg.razorpay.keySecret}
          onChange={v => patch('razorpay','keySecret',v)} />
        <div className="sm:col-span-2">
          <SecretInput id="rp-webhook" label="Webhook Secret (Optional)" value={cfg.razorpay.webhookSecret}
            onChange={v => patch('razorpay','webhookSecret',v)}
            placeholder="Webhook secret from Razorpay dashboard" />
        </div>
      </div>

      <button
        onClick={() => testConnection('razorpay')}
        disabled={testLoading.razorpay || !cfg.razorpay.keyId || !cfg.razorpay.keySecret}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
          border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white
          transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {testLoading.razorpay ? <Loader2 size={15} className="animate-spin"/> : <Zap size={15}/>}
        Test Connection
      </button>
      <TestResultBanner result={testResults.razorpay} />
    </div>
  );

  /* ── Render Cloudinary panel ── */
  const renderCloudinary = () => (
    <div className="space-y-5">
      <InfoBox>
        <p className="font-bold">How to get Cloudinary credentials:</p>
        <p>1. Sign in at <strong>cloudinary.com</strong> and open your Dashboard.</p>
        <p>2. Your <strong>Cloud Name</strong>, <strong>API Key</strong>, and <strong>API Secret</strong> are displayed on the dashboard homepage.</p>
      </InfoBox>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="cl-name" label="Cloud Name" required value={cfg.cloudinary.cloudName}
          onChange={v => patch('cloudinary','cloudName',v)} placeholder="my-cloud-name" />
        <Field id="cl-key" label="API Key" required value={cfg.cloudinary.apiKey}
          onChange={v => patch('cloudinary','apiKey',v)} placeholder="123456789012345" />
        <div className="sm:col-span-2">
          <SecretInput id="cl-secret" label="API Secret" required value={cfg.cloudinary.apiSecret}
            onChange={v => patch('cloudinary','apiSecret',v)} />
        </div>
      </div>
    </div>
  );

  const panels = { r2: renderR2, razorpay: renderRazorpay, cloudinary: renderCloudinary };
  const activeTabMeta = TABS.find(t => t.id === activeTab);

  /* ── SAVE BUTTON ── */
  const SaveBtn = ({ variant = 'primary' }) => (
    <button
      onClick={saveAll}
      disabled={saving}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
        variant === 'primary'
          ? 'bg-[#0F1F17] hover:bg-[#1a3020] text-white shadow-md disabled:opacity-60'
          : 'border-2 border-[#0F1F17] text-[#0F1F17] hover:bg-[#0F1F17] hover:text-white disabled:opacity-60'
      }`}
    >
      {saving ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
      {saving ? 'Saving…' : dirty ? 'Save All *' : 'Save All'}
    </button>
  );

  return (
    <PageWrapper>
    <div className="animate-fade-in font-body max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0F1F17]">Integrations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage third-party service connections</p>
        </div>
        <SaveBtn />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(({ id, label, Icon, color, bg }) => {
          const s = cfg[id];
          const hasSecret = id === 'r2' ? !!s.secretAccessKey
            : id === 'razorpay' ? !!s.keySecret
            : !!s.apiSecret;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold whitespace-nowrap
                border-2 transition-all flex-shrink-0 ${
                activeTab === id
                  ? `${bg} border-current ${color}`
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              <Icon size={15}/>
              {label}
              <span className={`w-2 h-2 rounded-full ${
                !s.enabled ? 'bg-gray-300'
                : !hasSecret ? 'bg-amber-400'
                : 'bg-emerald-500'
              }`}/>
            </button>
          );
        })}
      </div>

      {/* ── Active Service Card ── */}
      {activeTabMeta && (() => {
        const { id, label, Icon, color, bg } = activeTabMeta;
        const s = cfg[id];
        const hasSecret = id === 'r2' ? !!s.secretAccessKey
          : id === 'razorpay' ? !!s.keySecret
          : !!s.apiSecret;
        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={18} className={color}/>
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0F1F17]">{label}</h2>
                  <p className="text-xs text-gray-500">
                    {id === 'r2' && 'S3-compatible object storage for files & media'}
                    {id === 'razorpay' && 'Payment gateway for Indian e-commerce'}
                    {id === 'cloudinary' && 'Cloud-based image optimization & CDN'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge enabled={s.enabled} hasSecret={hasSecret}/>
                <Toggle
                  checked={s.enabled}
                  onChange={v => patch(id, 'enabled', v)}
                />
              </div>
            </div>

            {/* Card body */}
            <div className={`p-5 transition-all duration-200 ${!s.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
              {panels[id]?.()}
            </div>
          </div>
        );
      })()}

      {/* ── Bottom Save ── */}
      <div className="flex justify-end mt-6">
        <SaveBtn variant="primary"/>
      </div>

      {/* Dirty indicator */}
      {dirty && (
        <p className="text-center text-xs text-amber-600 mt-3 font-medium">
          ⚠ You have unsaved changes
        </p>
      )}
    </div>
    </PageWrapper>
  );
};

export default AdminIntegrations;
