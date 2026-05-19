import { useEffect, useState } from "react";
import {
  Plus, Trash2, Edit2, X, Save, Loader2,
  CheckCircle2, XCircle, Bell
} from "lucide-react";
import { notificationRulesAPI } from "../../services/api";
import toast from "react-hot-toast";
import PageWrapper from "../components/PageWrapper";

// ── Style tokens ──────────────────────────────────────────────────────────────
const inputClass =
  "w-full bg-[#FAFBF9] border border-[#E3E8E5] rounded-xl px-4 py-2.5 text-sm text-[#0B5345] focus:outline-none focus:ring-2 focus:ring-[#0B5345]/20 focus:border-[#0B5345] transition-all placeholder:text-[#8BA699]";
const labelClass =
  "block text-xs font-bold uppercase tracking-wider text-[#5C756D] mb-1.5";

// ── Constants ─────────────────────────────────────────────────────────────────
const EVENT_TRIGGERS = [
  { value: "order_placed",     label: "Order Placed" },
  { value: "order_shipped",    label: "Order Shipped" },
  { value: "payment_failed",   label: "Payment Failed" },
  { value: "user_signup",      label: "User Signup" },
];

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "sms",   label: "SMS" },
  { value: "push",  label: "Push Notification" },
];

const EMPTY_FORM = {
  name: "",
  eventTrigger: "order_placed",
  channel: "email",
  active: true,
};

// ── Component ─────────────────────────────────────────────────────────────────
const AdminNotificationRules = () => {
  const [list, setList]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [editing, setEditing]         = useState(null);   // null | rule obj (with or without _id)
  const [deleteConfirm, setDeleteConfirm] = useState(null); // null | rule obj
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  // ── Data loading ────────────────────────────────────────────────────────────
  async function load() {
    setLoading(true);
    try {
      const res = await notificationRulesAPI.list();
      setList(res.data?.rules ?? res.data ?? []);
    } catch {
      toast.error("Failed to load notification rules.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // ── Save (create or update) ─────────────────────────────────────────────────
  async function save() {
    if (!editing?.name?.trim()) {
      toast.error("Rule name is required.");
      return;
    }
    setSaving(true);
    try {
      if (editing._id) {
        await notificationRulesAPI.update(editing._id, editing);
        toast.success("Rule updated successfully.");
      } else {
        await notificationRulesAPI.create(editing);
        toast.success("Rule created successfully.");
      }
      setEditing(null);
      await load();
    } catch {
      toast.error("Failed to save rule. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await notificationRulesAPI.delete(deleteConfirm._id);
      toast.success("Rule deleted.");
      setDeleteConfirm(null);
      await load();
    } catch {
      toast.error("Failed to delete rule.");
    } finally {
      setDeleting(false);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const triggerLabel  = (val) => EVENT_TRIGGERS.find(e => e.value === val)?.label ?? val;
  const channelLabel  = (val) => CHANNELS.find(c => c.value === val)?.label ?? val;

  return (
    <PageWrapper>
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 2xl:px-12 max-w-7xl 2xl:max-w-[1800px] py-8">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0B5345] tracking-tight">
            Notification Rules
          </h1>
          <p className="text-[#5C756D] text-sm mt-1">
            Manage automated notification triggers across email, SMS, and push channels.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY_FORM })}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B5345] text-white font-bold text-sm hover:bg-[#0E8A74] transition-all shadow-md active:scale-95"
        >
          <Plus size={16} />
          Add Rule
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-[#E3E8E5] rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#FAFBF9] border-b border-[#E3E8E5]">
            <tr>
              {["Rule Name", "Event Trigger", "Channel", "Status", "Actions"].map(h => (
                <th
                  key={h}
                  className="px-6 py-4 text-[#5C756D] font-bold uppercase text-xs tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F4F7F5]">
            {/* Loading state */}
            {loading && (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0B5345] mx-auto" />
                  <p className="text-[#8BA699] text-sm mt-3">Loading rules…</p>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!loading && list.length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Bell className="w-12 h-12 mx-auto text-[#0B5345] opacity-20 mb-3" />
                  <p className="text-[#5C756D] font-semibold">No notification rules yet</p>
                  <p className="text-[#8BA699] text-xs mt-1">
                    Click "Add Rule" to create your first notification rule.
                  </p>
                </td>
              </tr>
            )}

            {/* Data rows */}
            {!loading && list.map(rule => (
              <tr
                key={rule._id}
                className="group hover:bg-[#FAFBF9] transition-colors"
              >
                {/* Name */}
                <td className="px-6 py-4 font-semibold text-[#0B5345]">
                  {rule.name}
                </td>

                {/* Event Trigger */}
                <td className="px-6 py-4 text-[#5C756D]">
                  {triggerLabel(rule.eventTrigger)}
                </td>

                {/* Channel */}
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAFBF9] border border-[#E3E8E5] text-[#0B5345] capitalize">
                    {channelLabel(rule.channel)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {rule.active ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#0B5345] border border-[#C8E6C9]">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-100">
                      <XCircle size={12} /> Inactive
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditing({ ...rule })}
                      className="p-2 rounded-lg border border-[#E3E8E5] text-[#5C756D] hover:bg-[#0B5345] hover:text-white hover:border-[#0B5345] transition-all"
                      title="Edit rule"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(rule)}
                      className="p-2 rounded-lg border border-red-100 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                      title="Delete rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Create / Edit Modal ── */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#F4F7F5] flex items-center justify-between bg-[#FAFBF9]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B5345] flex items-center justify-center">
                  <Bell size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0B5345]">
                    {editing._id ? "Edit Rule" : "Create Rule"}
                  </h2>
                  <p className="text-xs text-[#8BA699]">
                    {editing._id ? "Update notification rule details" : "Set up a new notification trigger"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg text-[#8BA699] hover:bg-[#E3E8E5] hover:text-[#0B5345] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

              {/* Rule Name */}
              <div>
                <label className={labelClass}>Rule Name</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="e.g. Order Confirmation Email"
                  value={editing.name}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                />
              </div>

              {/* Event Trigger */}
              <div>
                <label className={labelClass}>Event Trigger</label>
                <select
                  className={inputClass}
                  value={editing.eventTrigger}
                  onChange={e => setEditing({ ...editing, eventTrigger: e.target.value })}
                >
                  {EVENT_TRIGGERS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Channel */}
              <div>
                <label className={labelClass}>Target Channel</label>
                <select
                  className={inputClass}
                  value={editing.channel}
                  onChange={e => setEditing({ ...editing, channel: e.target.value })}
                >
                  {CHANNELS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div>
                <label className={labelClass}>Status</label>
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, active: !editing.active })}
                  className={`relative inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all w-full
                    ${editing.active
                      ? "bg-[#E8F5E9] border-[#C8E6C9] text-[#0B5345]"
                      : "bg-red-50 border-red-100 text-red-500"
                    }`}
                >
                  {/* Toggle pill */}
                  <span className={`w-11 h-6 flex items-center rounded-full transition-colors duration-200 flex-shrink-0
                    ${editing.active ? "bg-[#0B5345]" : "bg-red-300"}`}
                  >
                    <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ml-0.5
                      ${editing.active ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </span>
                  {editing.active ? (
                    <span className="flex items-center gap-1.5"><CheckCircle2 size={14} /> Active — rule is enabled</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><XCircle size={14} /> Inactive — rule is disabled</span>
                  )}
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#F4F7F5] flex items-center justify-end gap-3 bg-[#FAFBF9]">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-[#E3E8E5] text-[#5C756D] font-bold text-sm hover:bg-white hover:text-[#0B5345] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B5345] text-white font-bold text-sm hover:bg-[#0E8A74] transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Save size={15} />
                }
                {saving ? "Saving…" : "Save Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

            <div className="px-6 py-5 border-b border-[#F4F7F5] flex items-center justify-between bg-[#FAFBF9]">
              <h2 className="text-base font-bold text-[#0B5345]">Delete Rule</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="p-2 rounded-lg text-[#8BA699] hover:bg-[#E3E8E5] hover:text-[#0B5345] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-[#5C756D]">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[#0B5345]">"{deleteConfirm.name}"</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-[#F4F7F5] flex items-center justify-end gap-3 bg-[#FAFBF9]">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-[#E3E8E5] text-[#5C756D] font-bold text-sm hover:bg-white hover:text-[#0B5345] transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </PageWrapper>
  );
};

export default AdminNotificationRules;
