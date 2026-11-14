export interface ResultItem {
  id: string;
  category: string;
  round: string;
  segment?: string | null;
  description?: string | null;
  display_order: number;
  status: 'pending' | 'partially_announced' | 'completed';
  first_place_name?: string | null;
  first_place_details?: string | null;
  first_place_score?: string | null;
  second_place_name?: string | null;
  second_place_details?: string | null;
  second_place_score?: string | null;
  third_place_name?: string | null;
  third_place_details?: string | null;
  third_place_score?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type ResultItemInput = Omit<ResultItem, 'id' | 'created_at' | 'updated_at'>;

export interface ExcelColumnMapping {
  category: string;
  round?: string;
  segment?: string;
  description?: string;
  first_place_name?: string;
  first_place_details?: string;
  first_place_score?: string;
  second_place_name?: string;
  second_place_details?: string;
  second_place_score?: string;
  third_place_name?: string;
  third_place_details?: string;
  third_place_score?: string;
  notes?: string;
}

export interface ImportPreviewItem {
  rowNumber: number;
  category: string;
  round: string;
  segment: string;
  first_place_name: string;
  first_place_details: string;
  first_place_score: string;
  second_place_name: string;
  second_place_details: string;
  second_place_score: string;
  third_place_name: string;
  third_place_details: string;
  third_place_score: string;
  notes: string;
  status: 'new' | 'existing_conflict' | 'error';
  existingItem?: ResultItem;
  errors: string[];
  warnings: string[];
}

export interface ImportValidationSummary {
  totalRows: number;
  validRows: number;
  conflictRows: number;
  errorRows: number;
  preview: ImportPreviewItem[];
}
