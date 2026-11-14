'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Award,
  Clock,
  Search,
  RefreshCw,
  Sparkles,
  Radio,
  Filter,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  ShieldCheck,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { ResultItem } from '@/types';

export default function ViewerHomePage() {
  const [items, setItems] = useState<ResultItem[]>([]);
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partially_announced' | 'pending'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [mainTab, setMainTab] = useState<'events' | 'church_points'>('events');
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [newUpdateAlert, setNewUpdateAlert] = useState<string | null>(null);

  // Fetch results and church points
  const fetchResults = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [resResults, resChurches] = await Promise.all([
        fetch('/api/results', { cache: 'no-store' }),
        fetch('/api/church-points', { cache: 'no-store' }),
      ]);

      const dataResults = await resResults.json();
      const dataChurches = await resChurches.json();

      if (dataResults.success) {
        setItems(dataResults.items || []);
        if (lastUpdated && dataResults.lastUpdated !== lastUpdated) {
          setNewUpdateAlert('New results were just published!');
          setTimeout(() => setNewUpdateAlert(null), 5000);
        }
        setLastUpdated(dataResults.lastUpdated);
      }

      if (dataChurches.success) {
        setChurches(dataChurches.churches || []);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Real-time SSE listener + fallback polling
  useEffect(() => {
    fetchResults();

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };

      eventSource.addEventListener('connected', () => {
        setIsLiveConnected(true);
      });

      eventSource.addEventListener('update', () => {
        setIsLiveConnected(true);
        fetchResults(true);
        setNewUpdateAlert('Live update: Results refreshed!');
        setTimeout(() => setNewUpdateAlert(null), 4000);
      });

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch {
      setIsLiveConnected(false);
    }

    // Polling fallback every 8 seconds
    const interval = setInterval(() => {
      fetchResults(true);
    }, 8000);

    return () => {
      clearInterval(interval);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Filter and search events
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.category.toLowerCase().includes(q) ||
        (item.round && item.round.toLowerCase().includes(q)) ||
        (item.segment && item.segment.toLowerCase().includes(q)) ||
        (item.first_place_name && item.first_place_name.toLowerCase().includes(q)) ||
        (item.second_place_name && item.second_place_name.toLowerCase().includes(q)) ||
        (item.third_place_name && item.third_place_name.toLowerCase().includes(q)) ||
        (item.first_place_details && item.first_place_details.toLowerCase().includes(q)) ||
        (item.second_place_details && item.second_place_details.toLowerCase().includes(q)) ||
        (item.third_place_details && item.third_place_details.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'all' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter((i) => i.status === 'completed').length;
    const partial = items.filter((i) => i.status === 'partially_announced').length;
    const pending = items.filter((i) => i.status === 'pending').length;
    return { total, completed, partial, pending };
  }, [items]);

  // Top 3 Churches for Championship Podium
  const topChurches = useMemo(() => {
    return churches.slice(0, 3);
  }, [churches]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Notification Banner for Live Updates */}
      {newUpdateAlert && (
        <div className="fixed top-4 right-4 z-50 bg-amber-500 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-100" />
          <span className="font-semibold text-sm">{newUpdateAlert}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Official Standings Board
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-amber-200">
                CSI Thiruvalla Youth Kalamela 2026
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
                Zimrah 2026 • Real-time leaderboard & verified competition results across 34 events and 23 church units. Synchronized live as judges finalize evaluations.
              </p>
            </div>

            {/* Live Status Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isLiveConnected ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isLiveConnected ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                    {isLiveConnected ? 'Live Connection Active' : 'Auto-Sync Mode'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : 'Connecting...'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => fetchResults(false)}
                title="Refresh results manually"
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-medium text-white transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="text-xs font-medium text-slate-400 uppercase">Total Categories</div>
              <div className="text-2xl sm:text-3xl font-bold text-white mt-1">{stats.total}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="text-xs font-medium text-emerald-400 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-300 mt-1">{stats.completed}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="text-xs font-medium text-amber-400 uppercase flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" /> In Progress
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-300 mt-1">{stats.partial}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
              <div className="text-xs font-medium text-slate-400 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Pending
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-300 mt-1">{stats.pending}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Main Section Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 mb-8 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMainTab('events')}
              className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                mainTab === 'events'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Competition Results ({items.length} Events)</span>
            </button>
            <button
              onClick={() => setMainTab('church_points')}
              className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                mainTab === 'church_points'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Church Points Table ({churches.length} Units)</span>
            </button>
          </div>

          <a
            href="/api/export"
            download
            className="inline-flex items-center gap-1.5 px-4 py-2 mb-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-sm transition active:scale-95"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download Master Excel</span>
          </a>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: COMPETITION EVENTS VIEW */}
        {/* ============================================================== */}
        {mainTab === 'events' && (
          <>
            {/* Search, Filter & View Controls */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 mb-8">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search category, winner name, school, round, or segment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded-full"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      statusFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({stats.total})
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      statusFilter === 'completed'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Completed ({stats.completed})
                  </button>
                  <button
                    onClick={() => setStatusFilter('partially_announced')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      statusFilter === 'partially_announced'
                        ? 'bg-white text-amber-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    In Progress ({stats.partial})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      statusFilter === 'pending'
                        ? 'bg-white text-slate-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Pending ({stats.pending})
                  </button>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center gap-1 border border-slate-200 p-1 rounded-xl bg-slate-100">
                  <button
                    onClick={() => setViewMode('cards')}
                    title="Podium Cards View"
                    className={`p-1.5 rounded-lg text-xs transition ${
                      viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    title="Leaderboard Table View"
                    className={`p-1.5 rounded-lg text-xs transition ${
                      viewMode === 'table' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results List / Grid */}
            {loading && items.length === 0 ? (
              <div className="py-24 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-800">Loading talent show results...</h3>
                <p className="text-sm text-slate-500 mt-1">Connecting to live database stream</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">No competition results found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? `No categories or participants matched "${searchQuery}". Try a different keyword.`
                    : 'No result items have been added to this filter yet.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    Reset search
                  </button>
                )}
              </div>
            ) : viewMode === 'cards' ? (
              /* Cards View with Podium Display */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredItems.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              /* Table View */
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <tr>
                        <th className="py-4 px-5">Category & Round</th>
                        <th className="py-4 px-5">1st Place (Gold)</th>
                        <th className="py-4 px-5">2nd Place (Silver)</th>
                        <th className="py-4 px-5">3rd Place (Bronze)</th>
                        <th className="py-4 px-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">{item.category}</div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                                {item.round || 'Finals'}
                              </span>
                              {item.segment && <span>{item.segment}</span>}
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <PositionTableCell
                              position="1st"
                              name={item.first_place_name}
                              details={item.first_place_details}
                              score={item.first_place_score}
                            />
                          </td>
                          <td className="py-4 px-5">
                            <PositionTableCell
                              position="2nd"
                              name={item.second_place_name}
                              details={item.second_place_details}
                              score={item.second_place_score}
                            />
                          </td>
                          <td className="py-4 px-5">
                            <PositionTableCell
                              position="3rd"
                              name={item.third_place_name}
                              details={item.third_place_details}
                              score={item.third_place_score}
                            />
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <StatusBadge status={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 2: CHURCH POINTS CHAMPIONSHIP VIEW */}
        {/* ============================================================== */}
        {mainTab === 'church_points' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Championship Podium Top 3 Units */}
            {topChurches.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 2nd Place */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center order-2 md:order-1">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-3 border border-slate-200">
                    <Medal className="w-6 h-6 text-slate-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2nd Place • Runner-Up
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {topChurches[1].unit_name}
                  </h3>
                  <div className="text-3xl font-extrabold text-slate-700 mt-2">
                    {topChurches[1].total_points}{' '}
                    <span className="text-xs font-bold text-slate-400">pts</span>
                  </div>
                </div>

                {/* 1st Place Champion */}
                <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 border-2 border-amber-300 shadow-md flex flex-col items-center text-center order-1 md:order-2 scale-105">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center text-white mb-3 shadow-lg shadow-amber-500/30">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Champion
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">
                    {topChurches[0].unit_name}
                  </h3>
                  <div className="text-4xl font-black text-amber-600 mt-2">
                    {topChurches[0].total_points}{' '}
                    <span className="text-xs font-bold text-slate-400">pts</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center order-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-3 border border-orange-200">
                    <Medal className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                    3rd Place • Bronze
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {topChurches[2].unit_name}
                  </h3>
                  <div className="text-3xl font-extrabold text-orange-800 mt-2">
                    {topChurches[2].total_points}{' '}
                    <span className="text-xs font-bold text-slate-400">pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Church Leaderboard Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Official Church Point Table</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aggregated scores across all completed competition events.
                  </p>
                </div>
                <a
                  href="/api/export"
                  download
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Download Excel Table</span>
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-3.5 px-6">Rank</th>
                      <th className="py-3.5 px-6">Church Unit</th>
                      <th className="py-3.5 px-6">Section</th>
                      <th className="py-3.5 px-6">Scoring Breakdown</th>
                      <th className="py-3.5 px-6 text-right">Total Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {churches.map((church, idx) => (
                      <tr
                        key={church.id}
                        className={`hover:bg-slate-50/70 transition ${
                          idx === 0 ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {idx === 0 && <span className="text-amber-500 font-extrabold text-base">#1 🏆</span>}
                          {idx === 1 && <span className="text-slate-500 font-bold">#2 🥈</span>}
                          {idx === 2 && <span className="text-orange-600 font-bold">#3 🥉</span>}
                          {idx > 2 && <span className="text-slate-500 font-mono">#{idx + 1}</span>}
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 text-base">
                          {church.unit_name}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                          Section {church.section}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-lg">
                            {church.event_scores && Object.keys(church.event_scores).length > 0 ? (
                              Object.entries(church.event_scores).map(([ev, pts]) => (
                                <span
                                  key={ev}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {ev}: <strong className="text-indigo-600">{String(pts)} pts</strong>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No points yet</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-xl font-black text-indigo-700">
                            {church.total_points}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 ml-1">pts</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Viewer Notice & Admin Portal Link */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Public Read-Only Viewer Portal • Official 2026 Talent Showcase</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="/api/export"
              download
              className="text-slate-500 hover:text-emerald-700 font-semibold transition flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Master Excel</span>
            </a>
            <span className="text-slate-300">•</span>
            <Link
              href="/admin"
              className="text-slate-500 hover:text-indigo-600 font-medium transition flex items-center gap-1.5"
            >
              <span>Administrator Portal</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// -------------------------------------------------------------
// Component: ResultCard (Dedicated Podium Card)
// -------------------------------------------------------------
function ResultCard({ item }: { item: ResultItem }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {item.round || 'Finals'}
            </span>
            {item.segment && (
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <span>•</span> {item.segment}
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            {item.category}
          </h2>
          {item.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.description}</p>
          )}
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* Positions / Podium Grid */}
      <div className="p-5 flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/30">
        {/* 1st Place (Gold) */}
        <PodiumSlot
          place="1st"
          medalColor="gold"
          name={item.first_place_name}
          details={item.first_place_details}
          score={item.first_place_score}
        />

        {/* 2nd Place (Silver) */}
        <PodiumSlot
          place="2nd"
          medalColor="silver"
          name={item.second_place_name}
          details={item.second_place_details}
          score={item.second_place_score}
        />

        {/* 3rd Place (Bronze) */}
        <PodiumSlot
          place="3rd"
          medalColor="bronze"
          name={item.third_place_name}
          details={item.third_place_details}
          score={item.third_place_score}
        />
      </div>

      {/* Card Footer (Notes if available) */}
      {item.notes && (
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 italic">
          <span className="font-semibold text-slate-600 not-italic">Notes: </span>
          {item.notes}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Component: PodiumSlot (Individual 1st, 2nd, or 3rd Place Box)
// -------------------------------------------------------------
interface PodiumSlotProps {
  place: '1st' | '2nd' | '3rd';
  medalColor: 'gold' | 'silver' | 'bronze';
  name?: string | null;
  details?: string | null;
  score?: string | null;
}

function PodiumSlot({ place, medalColor, name, details, score }: PodiumSlotProps) {
  const isAnnounced = Boolean(name && name.trim());

  const styling = {
    gold: {
      border: isAnnounced ? 'border-amber-300/80 bg-amber-50/50' : 'border-slate-200 bg-white',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      iconColor: 'text-amber-500',
      title: '1st Place',
    },
    silver: {
      border: isAnnounced ? 'border-slate-300 bg-slate-50/60' : 'border-slate-200 bg-white',
      badgeBg: 'bg-slate-200/80 text-slate-800 border-slate-300',
      iconColor: 'text-slate-500',
      title: '2nd Place',
    },
    bronze: {
      border: isAnnounced ? 'border-orange-300/70 bg-orange-50/40' : 'border-slate-200 bg-white',
      badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
      iconColor: 'text-orange-600',
      title: '3rd Place',
    },
  }[medalColor];

  return (
    <div
      className={`rounded-xl p-3.5 border flex flex-col justify-between transition ${styling.border}`}
    >
      {/* Top Header of Position */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          {place === '1st' ? (
            <Trophy className={`w-4 h-4 ${styling.iconColor}`} />
          ) : (
            <Medal className={`w-4 h-4 ${styling.iconColor}`} />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {styling.title}
          </span>
        </div>
        {score && isAnnounced && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            {score} pts
          </span>
        )}
      </div>

      {/* Main Content: Name or "Not announced" */}
      <div className="my-auto py-1">
        {isAnnounced ? (
          <div>
            <div className="font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-2">
              {name}
            </div>
            {details && (
              <div className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {details}
              </div>
            )}
          </div>
        ) : (
          <div className="py-2.5 px-2 rounded-lg border border-dashed border-slate-200 bg-slate-100/50 text-center flex flex-col items-center justify-center">
            <Clock className="w-4 h-4 text-slate-400 mb-1" />
            <span className="text-xs font-semibold text-slate-500">Not announced</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Awaiting judging</span>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Component: PositionTableCell (for Table View)
// -------------------------------------------------------------
function PositionTableCell({
  position,
  name,
  details,
  score,
}: {
  position: '1st' | '2nd' | '3rd';
  name?: string | null;
  details?: string | null;
  score?: string | null;
}) {
  if (!name || !name.trim()) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-400 italic">
        <Clock className="w-3 h-3" /> Not announced
      </span>
    );
  }

  return (
    <div>
      <div className="font-bold text-slate-900 flex items-center gap-1.5">
        <span>{name}</span>
        {score && (
          <span className="text-[10px] font-semibold px-1 rounded bg-slate-100 text-slate-600">
            {score}
          </span>
        )}
      </div>
      {details && <div className="text-xs text-slate-500 truncate max-w-xs">{details}</div>}
    </div>
  );
}

// -------------------------------------------------------------
// Component: StatusBadge
// -------------------------------------------------------------
function StatusBadge({ status }: { status: 'completed' | 'partially_announced' | 'pending' }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Completed</span>
      </span>
    );
  }
  if (status === 'partially_announced') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Radio className="w-3.5 h-3.5 text-amber-600" />
        <span>In Progress</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
      <Clock className="w-3.5 h-3.5 text-slate-500" />
      <span>Pending</span>
    </span>
  );
}
