'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Settings,
  Trophy,
  Loader2,
  Sparkles,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { ExcelColumnMapping, ImportPreviewItem, ImportValidationSummary } from '@/types';

type Step = 'upload' | 'mapping' | 'preview' | 'completed';

export default function AdminImportPage() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parsed workbook metadata
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<Record<string, string>[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);

  // Column Mapping
  const [mapping, setMapping] = useState<ExcelColumnMapping>({
    category: '',
    round: '',
    segment: '',
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

  // Validation Results
  const [validationSummary, setValidationSummary] = useState<ImportValidationSummary | null>(null);
  const [overwriteStrategy, setOverwriteStrategy] = useState<'fill_blank_only' | 'overwrite_all' | 'skip_existing'>('fill_blank_only');

  // Execution Result
  const [importResult, setImportResult] = useState<{
    insertedCount: number;
    updatedCount: number;
    skippedCount: number;
    message: string;
  } | null>(null);

  // Handle file selection and parsing
  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const res = await fetch('/api/admin/import/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to parse Excel file');
        setLoading(false);
        return;
      }

      setSheets(data.sheets || []);
      setSelectedSheet(data.selectedSheet || (data.sheets && data.sheets[0]) || '');
      setHeaders(data.headers || []);
      setTotalRows(data.totalRows || 0);
      setAllRows(data.allRows || []);

      // Pre-fill suggested mappings
      if (data.suggestedMapping) {
        setMapping({
          category: data.suggestedMapping.category || '',
          round: data.suggestedMapping.round || '',
          segment: data.suggestedMapping.segment || '',
          first_place_name: data.suggestedMapping.first_place_name || '',
          first_place_details: data.suggestedMapping.first_place_details || '',
          first_place_score: data.suggestedMapping.first_place_score || '',
          second_place_name: data.suggestedMapping.second_place_name || '',
          second_place_details: data.suggestedMapping.second_place_details || '',
          second_place_score: data.suggestedMapping.second_place_score || '',
          third_place_name: data.suggestedMapping.third_place_name || '',
          third_place_details: data.suggestedMapping.third_place_details || '',
          third_place_score: data.suggestedMapping.third_place_score || '',
          notes: data.suggestedMapping.notes || '',
        });
      }

      setCurrentStep('mapping');
    } catch {
      setError('An error occurred during file upload.');
    } finally {
      setLoading(false);
    }
  };

  // Run validation step
  const handleValidate = async () => {
    if (!mapping.category) {
      setError('Please select which column represents the Category / Event name.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/import/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: allRows,
          mapping,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Validation failed');
        setLoading(false);
        return;
      }

      setValidationSummary(data.summary);
      setCurrentStep('preview');
    } catch {
      setError('An error occurred during validation.');
    } finally {
      setLoading(false);
    }
  };

  // Execute import
  const handleExecuteImport = async () => {
    if (!validationSummary) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validationSummary.preview,
          overwriteStrategy,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Import execution failed');
        setLoading(false);
        return;
      }

      setImportResult({
        insertedCount: data.insertedCount,
        updatedCount: data.updatedCount,
        skippedCount: data.skippedCount,
        message: data.message,
      });

      setCurrentStep('completed');
    } catch {
      setError('Failed to apply import.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setCurrentStep('upload');
    setFile(null);
    setError(null);
    setHeaders([]);
    setAllRows([]);
    setValidationSummary(null);
    setImportResult(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Spreadsheet Import Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Import Results from Excel
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload an Excel file (.xlsx, .xls) or CSV, customize column mapping, preview validations, and publish standings securely.
          </p>
        </div>

        <a
          href="/admin/template"
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Download Sample Excel</span>
        </a>
      </div>

      {/* Wizard Progress Steps */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'upload', label: '1. Select File' },
            { id: 'mapping', label: '2. Map Columns' },
            { id: 'preview', label: '3. Preview & Validate' },
            { id: 'completed', label: '4. Results Published' },
          ].map((s, idx) => {
            const isCurrent = currentStep === s.id;
            const isDone =
              (s.id === 'upload' && currentStep !== 'upload') ||
              (s.id === 'mapping' && (currentStep === 'preview' || currentStep === 'completed')) ||
              (s.id === 'preview' && currentStep === 'completed');

            return (
              <div
                key={s.id}
                className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                {s.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold">Import Notice</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: Upload File */}
      {/* ============================================================== */}
      {currentStep === 'upload' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center">
          <div className="max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Choose your Excel results spreadsheet</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Upload any talent show results spreadsheet (.xlsx, .xls, .csv). You will be able to review column headers and configure mappings in the next step.
            </p>

            <label className="mt-8 block cursor-pointer">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                disabled={loading}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-3xl p-8 transition flex flex-col items-center">
                {loading ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                    <span className="text-sm font-bold text-indigo-900">Inspecting workbook & columns...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-10 h-10 text-indigo-500 mb-2" />
                    <span className="text-sm font-bold text-slate-800">
                      Click to browse or drag and drop spreadsheet here
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      Supports Excel Workbooks (.xlsx, .xls) and CSV
                    </span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: Configurable Column Mapping */}
      {/* ============================================================== */}
      {currentStep === 'mapping' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Configure Spreadsheet Column Mapping</h2>
              <p className="text-xs text-slate-500">
                File: <strong className="text-slate-800">{file?.name}</strong> • Found {totalRows} data rows across {headers.length} columns.
              </p>
            </div>
            <button
              onClick={resetAll}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
            >
              Choose different file
            </button>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Smart Column Detection:</span>
              We have automatically matched headers based on common names. Review each dropdown to ensure it maps correctly to your spreadsheet’s columns.
            </div>
          </div>

          {/* Mapping Grid */}
          <div className="space-y-6">
            {/* Category / General */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Event Identification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Name * (Required)
                  </label>
                  <select
                    value={mapping.category}
                    onChange={(e) => setMapping({ ...mapping, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Round / Stage (Optional)
                  </label>
                  <select
                    value={mapping.round || ''}
                    onChange={(e) => setMapping({ ...mapping, round: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Defaults to &quot;Finals&quot; --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Segment / Session (Optional)
                  </label>
                  <select
                    value={mapping.segment || ''}
                    onChange={(e) => setMapping({ ...mapping, segment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 1st Place Mapping */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 mb-3">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>1st Place Columns (Gold)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Winner Name</label>
                  <select
                    value={mapping.first_place_name || ''}
                    onChange={(e) => setMapping({ ...mapping, first_place_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None / Unannounced --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Details / Performance</label>
                  <select
                    value={mapping.first_place_details || ''}
                    onChange={(e) => setMapping({ ...mapping, first_place_details: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Score / Points</label>
                  <select
                    value={mapping.first_place_score || ''}
                    onChange={(e) => setMapping({ ...mapping, first_place_score: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2nd Place Mapping */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                <Trophy className="w-4 h-4 text-slate-400" />
                <span>2nd Place Columns (Silver)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Winner Name</label>
                  <select
                    value={mapping.second_place_name || ''}
                    onChange={(e) => setMapping({ ...mapping, second_place_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None / Unannounced --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Details / Performance</label>
                  <select
                    value={mapping.second_place_details || ''}
                    onChange={(e) => setMapping({ ...mapping, second_place_details: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Score / Points</label>
                  <select
                    value={mapping.second_place_score || ''}
                    onChange={(e) => setMapping({ ...mapping, second_place_score: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3rd Place Mapping */}
            <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-950 mb-3">
                <Trophy className="w-4 h-4 text-orange-600" />
                <span>3rd Place Columns (Bronze)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Winner Name</label>
                  <select
                    value={mapping.third_place_name || ''}
                    onChange={(e) => setMapping({ ...mapping, third_place_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None / Unannounced --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Details / Performance</label>
                  <select
                    value={mapping.third_place_details || ''}
                    onChange={(e) => setMapping({ ...mapping, third_place_details: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Score / Points</label>
                  <select
                    value={mapping.third_place_score || ''}
                    onChange={(e) => setMapping({ ...mapping, third_place_score: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="">-- None --</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Remarks / Notes Column (Optional)
              </label>
              <select
                value={mapping.notes || ''}
                onChange={(e) => setMapping({ ...mapping, notes: e.target.value })}
                className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50"
              >
                <option value="">-- None --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('upload')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleValidate}
              disabled={loading || !mapping.category}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating data...</span>
                </>
              ) : (
                <>
                  <span>Preview & Validate Import</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: Preview & Validation Step */}
      {/* ============================================================== */}
      {currentStep === 'preview' && validationSummary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Review Import Validation & Overwrite Protection
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Verify detected items below before changes are applied to the database.
            </p>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase">Total Rows</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{validationSummary.totalRows}</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-700 font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> New Items
              </span>
              <div className="text-2xl font-black text-emerald-800 mt-1">{validationSummary.validRows}</div>
            </div>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="text-xs text-amber-700 font-bold uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Existing Matches
              </span>
              <div className="text-2xl font-black text-amber-800 mt-1">{validationSummary.conflictRows}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-200">
              <span className="text-xs text-red-700 font-bold uppercase flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Error Rows
              </span>
              <div className="text-2xl font-black text-red-800 mt-1">{validationSummary.errorRows}</div>
            </div>
          </div>

          {/* Overwrite Protection Strategy */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Choose Overwrite Strategy for Existing Matches ({validationSummary.conflictRows})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label
                className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                  overwriteStrategy === 'fill_blank_only'
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  value="fill_blank_only"
                  checked={overwriteStrategy === 'fill_blank_only'}
                  onChange={() => setOverwriteStrategy('fill_blank_only')}
                  className="mt-0.5 text-indigo-600"
                />
                <div>
                  <strong className="block text-slate-900 font-bold">Fill Blanks Only (Recommended)</strong>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">
                    Safely retains any already announced winners and fills only empty places.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                  overwriteStrategy === 'overwrite_all'
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  value="overwrite_all"
                  checked={overwriteStrategy === 'overwrite_all'}
                  onChange={() => setOverwriteStrategy('overwrite_all')}
                  className="mt-0.5 text-indigo-600"
                />
                <div>
                  <strong className="block text-slate-900 font-bold">Overwrite All</strong>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">
                    Overwrites existing categories with the spreadsheet values.
                  </span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border text-xs cursor-pointer flex items-start gap-2.5 transition ${
                  overwriteStrategy === 'skip_existing'
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-sm'
                    : 'border-slate-200 bg-white/70 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="strategy"
                  value="skip_existing"
                  checked={overwriteStrategy === 'skip_existing'}
                  onChange={() => setOverwriteStrategy('skip_existing')}
                  className="mt-0.5 text-indigo-600"
                />
                <div>
                  <strong className="block text-slate-900 font-bold">Skip Existing</strong>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">
                    Do not touch any matching items; only import brand new categories.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Detailed Preview Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-slate-600 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">Row</th>
                    <th className="py-3 px-4">Category & Round</th>
                    <th className="py-3 px-4">1st Place</th>
                    <th className="py-3 px-4">2nd Place</th>
                    <th className="py-3 px-4">3rd Place</th>
                    <th className="py-3 px-4 text-right">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {validationSummary.preview.map((item) => (
                    <tr
                      key={item.rowNumber}
                      className={`hover:bg-slate-50 transition ${
                        item.status === 'error'
                          ? 'bg-red-50/40'
                          : item.status === 'existing_conflict'
                          ? 'bg-amber-50/30'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-400">#{item.rowNumber}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.category || '(Empty Category)'}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.round} {item.segment ? `• ${item.segment}` : ''}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.first_place_name ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{item.first_place_name}</span>
                            {item.first_place_score && (
                              <span className="text-[10px] text-slate-500">Score: {item.first_place_score}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not announced</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.second_place_name ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{item.second_place_name}</span>
                            {item.second_place_score && (
                              <span className="text-[10px] text-slate-500">Score: {item.second_place_score}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not announced</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {item.third_place_name ? (
                          <div>
                            <span className="font-bold text-slate-900 block">{item.third_place_name}</span>
                            {item.third_place_score && (
                              <span className="text-[10px] text-slate-500">Score: {item.third_place_score}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not announced</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === 'new' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            New Item
                          </span>
                        )}
                        {item.status === 'existing_conflict' && (
                          <span
                            title={item.warnings.join(' • ')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 cursor-help"
                          >
                            Existing Match
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span
                            title={item.errors.join(' • ')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 cursor-help"
                          >
                            Error
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep('mapping')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mapping</span>
            </button>
            <button
              onClick={handleExecuteImport}
              disabled={loading || validationSummary.validRows + validationSummary.conflictRows === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying changes to database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply Import & Publish Results</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: Completed State */}
      {/* ============================================================== */}
      {currentStep === 'completed' && importResult && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm text-center max-w-xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Import Completed Successfully!</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{importResult.message}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Inserted</span>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">{importResult.insertedCount}</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Updated</span>
              <div className="text-xl font-bold text-indigo-700 mt-0.5">{importResult.updatedCount}</div>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Skipped</span>
              <div className="text-xl font-bold text-slate-600 mt-0.5">{importResult.skippedCount}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>View Public Results Page</span>
            </Link>
            <button
              onClick={resetAll}
              className="inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Import Another File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
