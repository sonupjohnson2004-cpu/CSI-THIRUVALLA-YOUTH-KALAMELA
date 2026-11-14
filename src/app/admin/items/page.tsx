'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Trophy,
  Medal,
  PlusCircle,
  Edit3,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Radio,
  Clock,
  X,
  AlertCircle,
  Save,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ResultItem, ResultItemInput } from '@/types';

export default function AdminItemsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ResultItemInput>>({
    category: '',
    round: 'Finals',
    segment: '',
    description: '',
    display_order: 0,
    first_place_name: '',
    first_place_details: '',
    first_place_score: '',
    second_place_name: '',
    second_place_details: '',
    second_place_score: '',
    third_place_name: '',
    third_place_details: '',
    third_place_score: '',
    notes: '',
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/items');
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
      }
    } catch {
      showNotice('error', 'Failed to load items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  // Check query params to open modal directly (e.g. ?action=new or ?edit=item_123)
  useEffect(() => {
    const action = searchParams.get('action');
    const editId = searchParams.get('edit');

    if (action === 'new') {
      openCreateModal();
    } else if (editId && items.length > 0) {
      const found = items.find((i) => i.id === editId);
      if (found) {
        openEditModal(found);
      }
    }
  }, [searchParams, items]);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      category: '',
      round: 'Finals',
      segment: '',
      description: '',
      display_order: items.length + 1,
      first_place_name: '',
      first_place_details: '',
      first_place_score: '',
      second_place_name: '',
      second_place_details: '',
      second_place_score: '',
      third_place_name: '',
      third_place_details: '',
      third_place_score: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ResultItem) => {
    setModalMode('edit');
    setEditingId(item.id);
    setFormData({
      category: item.category,
      round: item.round,
      segment: item.segment || '',
      description: item.description || '',
      display_order: item.display_order,
      first_place_name: item.first_place_name || '',
      first_place_details: item.first_place_details || '',
      first_place_score: item.first_place_score || '',
      second_place_name: item.second_place_name || '',
      second_place_details: item.second_place_details || '',
      second_place_score: item.second_place_score || '',
      third_place_name: item.third_place_name || '',
      third_place_details: item.third_place_details || '',
      third_place_score: item.third_place_score || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.category.trim()) {
      showNotice('error', 'Category name is required.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/admin/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showNotice('success', 'New result item created and published!');
          setIsModalOpen(false);
          loadItems();
        } else {
          showNotice('error', data.error || 'Failed to create item');
        }
      } else if (modalMode === 'edit' && editingId) {
        const res = await fetch(`/api/admin/items/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          showNotice('success', 'Standings updated and published live!');
          setIsModalOpen(false);
          loadItems();
        } else {
          showNotice('error', data.error || 'Failed to update item');
        }
      }
    } catch {
      showNotice('error', 'A network error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/items/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showNotice('success', 'Result item removed.');
        setDeleteConfirmId(null);
        loadItems();
      } else {
        showNotice('error', data.error || 'Failed to delete item.');
      }
    } catch {
      showNotice('error', 'Error deleting item.');
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.category.toLowerCase().includes(q) ||
        item.round.toLowerCase().includes(q) ||
        (item.first_place_name && item.first_place_name.toLowerCase().includes(q)) ||
        (item.second_place_name && item.second_place_name.toLowerCase().includes(q)) ||
        (item.third_place_name && item.third_place_name.toLowerCase().includes(q));

      const matchesStatus =
        filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold transition transform duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
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

      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Manage Competition Results
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create categories, record 1st, 2nd, and 3rd place winners, and publish live standings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/api/admin/export"
            download
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95"
            title="Download full results and church point table in Excel format"
          >
            <Trophy className="w-4 h-4" />
            <span>Download Master Excel</span>
          </a>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Result Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by category, winner name, or round..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses ({items.length})</option>
            <option value="completed">Completed (All 3 Announced)</option>
            <option value="partially_announced">Partially Announced</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Loading items from database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center">
            <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No matching result items</h3>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Try adjusting your search query.' : 'Click "Add Result Item" to create one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Category & Round</th>
                  <th className="py-3.5 px-6">1st Place (Gold)</th>
                  <th className="py-3.5 px-6">2nd Place (Silver)</th>
                  <th className="py-3.5 px-6">3rd Place (Bronze)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{item.category}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-indigo-600">{item.round}</span>
                        {item.segment && <span>• {item.segment}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.first_place_name ? (
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{item.first_place_name}</span>
                          {item.first_place_score && (
                            <span className="text-[10px] text-slate-500 font-semibold">Score: {item.first_place_score}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not announced</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {item.second_place_name ? (
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{item.second_place_name}</span>
                          {item.second_place_score && (
                            <span className="text-[10px] text-slate-500 font-semibold">Score: {item.second_place_score}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not announced</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {item.third_place_name ? (
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{item.third_place_name}</span>
                          {item.third_place_score && (
                            <span className="text-[10px] text-slate-500 font-semibold">Score: {item.third_place_score}</span>
                          )}
                        </div>
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
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        title="Edit results"
                        className="p-1.5 rounded-lg text-indigo-700 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        title="Delete item"
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {modalMode === 'create' ? 'Add Competition Result Item' : 'Update Category & Results'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Positions with empty names will be displayed to viewers as “Not announced”.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Category Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solo Singing - Western Classical"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Round / Stage
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Finals, Round 2"
                    value={formData.round || 'Finals'}
                    onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Segment / Session (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Session - Main Auditorium"
                    value={formData.segment || ''}
                    onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order ?? 0}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Placements Section (1st, 2nd, 3rd) */}
              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Placements & Winners (1st, 2nd, 3rd Place)</span>
                </h3>

                {/* 1st Place */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 mb-4">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs uppercase tracking-wider mb-2.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>1st Place (Gold Medal)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Winner Name / Group Name (Leave empty if not announced)"
                        value={formData.first_place_name || ''}
                        onChange={(e) => setFormData({ ...formData, first_place_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300/80 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Score / Points (e.g. 98.5)"
                        value={formData.first_place_score || ''}
                        onChange={(e) => setFormData({ ...formData, first_place_score: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300/80 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Details: School, Team, Song Title, Performance details..."
                    value={formData.first_place_details || ''}
                    onChange={(e) => setFormData({ ...formData, first_place_details: e.target.value })}
                    className="w-full mt-2 px-3 py-2 rounded-xl border border-amber-300/80 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* 2nd Place */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                    <Medal className="w-4 h-4 text-slate-400" />
                    <span>2nd Place (Silver Medal)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Winner Name (Leave empty if not announced)"
                        value={formData.second_place_name || ''}
                        onChange={(e) => setFormData({ ...formData, second_place_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Score / Points (e.g. 96.0)"
                        value={formData.second_place_score || ''}
                        onChange={(e) => setFormData({ ...formData, second_place_score: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Details: School, Team, Song Title, Performance details..."
                    value={formData.second_place_details || ''}
                    onChange={(e) => setFormData({ ...formData, second_place_details: e.target.value })}
                    className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* 3rd Place */}
                <div className="bg-orange-50/40 p-4 rounded-2xl border border-orange-200/80 mb-4">
                  <div className="flex items-center gap-1.5 font-bold text-orange-950 text-xs uppercase tracking-wider mb-2.5">
                    <Medal className="w-4 h-4 text-orange-600" />
                    <span>3rd Place (Bronze Medal)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Winner Name (Leave empty if not announced)"
                        value={formData.third_place_name || ''}
                        onChange={(e) => setFormData({ ...formData, third_place_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-orange-300/80 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Score / Points (e.g. 94.0)"
                        value={formData.third_place_score || ''}
                        onChange={(e) => setFormData({ ...formData, third_place_score: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-orange-300/80 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Details: School, Team, Song Title, Performance details..."
                    value={formData.third_place_details || ''}
                    onChange={(e) => setFormData({ ...formData, third_place_details: e.target.value })}
                    className="w-full mt-2 px-3 py-2 rounded-xl border border-orange-300/80 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Judges Remarks / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Unanimous decision by judges panel"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Publish Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">Delete Result Item?</h3>
            <p className="text-xs text-slate-500 mt-1">
              This action cannot be undone. This category and its standings will be permanently removed.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/20 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
