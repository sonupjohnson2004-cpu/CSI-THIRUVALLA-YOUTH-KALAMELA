'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Radio,
  Download,
  ExternalLink,
  Edit3,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ResultItem } from '@/types';

export default function AdminDashboardPage() {
  const [items, setItems] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/items');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const total = items.length;
  const completed = items.filter((i) => i.status === 'completed').length;
  const partial = items.filter((i) => i.status === 'partially_announced').length;
  const pending = items.filter((i) => i.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Administrator Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Talent Showcase Results Management
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
            Control category listings, enter or edit 1st, 2nd, and 3rd place results, and import spreadsheet results. All updates reflect instantly on the public viewer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/items?action=new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Result Item</span>
          </Link>
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import Excel</span>
          </Link>
          <a
            href="/admin/template"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Sample Excel</span>
          </a>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Categories</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{total}</div>
          <div className="text-xs text-slate-400 mt-1">Configured items</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Fully Announced
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{completed}</div>
          <div className="text-xs text-slate-400 mt-1">All 3 places filled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
            <Radio className="w-4 h-4" /> Partially Announced
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{partial}</div>
          <div className="text-xs text-slate-400 mt-1">1 or 2 places filled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Awaiting Results
          </div>
          <div className="text-3xl font-extrabold text-slate-700 mt-2">{pending}</div>
          <div className="text-xs text-slate-400 mt-1">Pending announcement</div>
        </div>
      </div>

      {/* Recent Result Items */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Competition Standings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and quick-edit 1st, 2nd, and 3rd place standings.
            </p>
          </div>
          <Link
            href="/admin/items"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            Manage All ({total}) &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading result items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No result items yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by adding your first talent show category or importing from an Excel file.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                href="/admin/items?action=new"
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Add Category
              </Link>
              <Link
                href="/admin/import"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
              >
                Import Excel
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Category & Round</th>
                  <th className="py-3.5 px-6">1st Place</th>
                  <th className="py-3.5 px-6">2nd Place</th>
                  <th className="py-3.5 px-6">3rd Place</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.slice(0, 8).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div>{item.category}</div>
                      <div className="text-xs font-normal text-slate-500">
                        {item.round} {item.segment ? `• ${item.segment}` : ''}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.first_place_name ? (
                        <div className="font-semibold text-slate-900 text-xs">{item.first_place_name}</div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not announced</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {item.second_place_name ? (
                        <div className="font-semibold text-slate-900 text-xs">{item.second_place_name}</div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not announced</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {item.third_place_name ? (
                        <div className="font-semibold text-slate-900 text-xs">{item.third_place_name}</div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not announced</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Completed
                        </span>
                      )}
                      {item.status === 'partially_announced' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          In Progress
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/items?edit=${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
