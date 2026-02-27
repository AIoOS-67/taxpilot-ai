export type FilingStatus = 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household' | 'qualifying_widow';

export type SessionStatus = 'intake' | 'classifying' | 'deductions' | 'form_building' | 'review' | 'awaiting_review' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'filer' | 'reviewer';
  created_at: string;
}

export interface TaxSession {
  id: string;
  user_id: string;
  tax_year: number;
  filing_status: FilingStatus;
  status: SessionStatus;
  confidence_score: number | null;
  total_income: number | null;
  total_deductions: number | null;
  total_credits: number | null;
  estimated_tax: number | null;
  estimated_refund: number | null;
  created_at: string;
  updated_at: string;
}

export interface IncomeItem {
  id: string;
  session_id: string;
  source: string;
  type: 'w2' | '1099' | 'self_employment' | 'investment' | 'rental' | 'other';
  employer_name: string | null;
  amount: number;
  federal_withheld: number;
  state_withheld: number;
  document_url: string | null;
  extracted_data: Record<string, unknown> | null;
  created_at: string;
}

export interface Deduction {
  id: string;
  session_id: string;
  category: string;
  description: string;
  amount: number;
  confidence: number;
  irs_reference: string | null;
  is_itemized: boolean;
  ai_suggested: boolean;
  verified: boolean;
}

export interface ReviewItem {
  id: string;
  session_id: string;
  field_name: string;
  field_value: string;
  reason: string;
  confidence: number;
  reviewer_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  reviewer_notes: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  cards: BridgeCard[] | null;
  created_at: string;
}

export interface BridgeCard {
  type: 'income_card' | 'deduction_card' | 'refund_card' | 'review_card' | 'progress_card';
  title: string;
  data: Record<string, unknown>;
}

export interface AgentState {
  session_id: string;
  current_node: string;
  filing_status: FilingStatus | null;
  income_items: IncomeItem[];
  deductions: Deduction[];
  messages: ChatMessage[];
  needs_review: boolean;
  confidence_score: number;
}

export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export const TAX_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  married_filing_jointly: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  married_filing_separately: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  qualifying_widow: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
};

export const STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 15000,
  married_filing_jointly: 30000,
  married_filing_separately: 15000,
  head_of_household: 22500,
  qualifying_widow: 30000,
};
