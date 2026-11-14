'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  ExternalLink,
  Sparkles,
  Trophy,
  Loader2,
  Radio,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { TalentShowEdition } from '@/types';

export default function AdminEditionsPage() {
  const [editions, setEditions] = useState<TalentShowEdition[]>([]);
  const [activeEditionId, setActiveEditionId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Show Form State
  const [formName, setFormName] = useState('');
  const [formYear, setFormYear] = useState<number>(new Date().getFullYear() + 1);
  const [cloneFromId, setCloneFromId] = useState<string>('show_2026');
  const [shouldClone, setShouldClone] = useState(true);
  const [setActiveImmediately, setSetActiveImmediately] = useState(false);

  const loadEditions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/editions');
      const data = await res.json();
      if (data.success) {
        setEditions(data.editions || []);
        setActiveEditionId(data.activeEditionId || '');
        if (data.editions && data.editions.length > 0) {
          const nextYear = Math.max(...data.editions.map((e: any) => e.year)) + 1;
          setFormYear(nextYear);
          setFormName(`Annual Talent Showcase ${nextYear}`);
          setCloneFromId(data.activeEditionId || data.editions[0].id);
        }
      }
    } catch {
      showNotice('error', 'Failed to load show editions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEditions();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotice('error', 'Please provide a name for the new talent show.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/editions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          year: formYear,
          cloneFromEditionId: shouldClone ? cloneFromId : undefined,
          setActive: setActiveImmediately,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('success', data.message || 'New talent show edition created!');
        setIsModalOpen(false);
        loadEditions();
      } else {
        showNotice('error', data.error || 'Failed to create show edition');
      }
    } catch {
      showNotice('error', 'Network error creating show edition.');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/editions/${id}/activate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotice('success', `"${name}" is now the active live show for all viewers!`);
        loadEditions();
      } else {
        showNotice('error', data.error || 'Failed to activate edition');
      }
    } catch {
      showNotice('error', 'Error activating show edition');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? All its categories and results will be permanently removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/editions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('success', `"${name}" was deleted.`);
        loadEditions();
      } else {
        showNotice('error', data.error || 'Failed to delete edition');
      }
    } catch {
      showNotice('error', 'Error deleting edition');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold transition transform duration-300 ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <Calendar className="w-3.5 h-3.5" /> Yearly Editions & Show Archive
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Host New Talent Shows for Future Years
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
            Create independent talent show editions (e.g. 2027, 2028). You can clone all categories and church units from previous years with fresh, clean results, or switch which year is live on the public website.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Host Next Year&apos;s Show</span>
        </button>
      </div>

      {/* Editions List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Hosted Talent Shows</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              The currently active edition is the one public viewers see by default.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {editions.length} {editions.length === 1 ? 'Show Edition' : 'Show Editions'}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Loading show editions...</p>
          </div>
        ) : editions.length === 0 ? (
          <div className="p-16 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No show editions found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Host Next Year&apos;s Show&quot; to initialize a new competition.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {editions.map((edition) => {
              const isActive = edition.id === activeEditionId;
              return (
                <div
                  key={edition.id}
                  className={`p-6 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isActive ? 'bg-indigo-50/30' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-extrabold text-sm ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {edition.year}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900">
                          {edition.name}
                        </h3>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                            <span>LIVE FOR VIEWERS</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Year: <strong className="text-slate-700">{edition.year}</strong> • Created:{' '}
                        {new Date(edition.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 sm:ml-auto">
                    <Link
                      href={`/admin/items?edition=${edition.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm transition"
                    >
                      <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Manage Categories</span>
                    </Link>

                    <Link
                      href={`/?edition=${edition.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>

                    {!isActive && (
                      <button
                        onClick={() => handleActivate(edition.id, edition.name)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Make Live</span>
                      </button>
                    )}

                    {editions.length > 1 && (
                      <button
                        onClick={() => handleDelete(edition.id, edition.name)}
                        title="Delete this show edition"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create New Show Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                New Competition Year
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Host New Talent Show Edition
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Set up a clean competition for the upcoming year while keeping previous years intact.
              </p>
            </div>

            <form onSubmit={handleCreateEdition} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Talent Show Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Annual Talent Showcase 2027"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Competition Year *
                </label>
                <input
                  type="number"
                  required
                  value={formYear}
                  onChange={(e) => setFormYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Clone Categories Option */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldClone}
                    onChange={(e) => setShouldClone(e.target.checked)}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <strong className="block text-xs font-bold text-slate-900">
                      Copy Categories &amp; Church Units from Previous Year
                    </strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Copies all 34 competition categories with fresh &quot;Not announced&quot; slots and resets church points to 0, ready for the new competition.
                    </span>
                  </div>
                </label>

                {shouldClone && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Source Edition to Clone:
                    </label>
                    <select
                      value={cloneFromId}
                      onChange={(e) => setCloneFromId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                    >
                      {editions.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name} ({e.year})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Set Active Option */}
              <label className="flex items-start gap-2.5 cursor-pointer p-1">
                <input
                  type="checkbox"
                  checked={setActiveImmediately}
                  onChange={(e) => setSetActiveImmediately(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <strong className="block text-xs font-bold text-slate-900">
                    Set as Active Live Show Immediately
                  </strong>
                  <span className="text-[11px] text-slate-500 block">
                    Public viewers will see this new edition right away. (Leave unchecked to keep drafting privately).
                  </span>
                </div>
              </label>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating show...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize &amp; Host Show</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
