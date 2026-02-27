-- TaxPilot AI — PostgreSQL Schema
-- Run: psql $DATABASE_URL < sql/schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (filers and reviewers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'filer' CHECK (role IN ('filer', 'reviewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tax filing sessions
CREATE TABLE IF NOT EXISTS tax_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  tax_year INTEGER NOT NULL DEFAULT 2025,
  filing_status VARCHAR(30) CHECK (filing_status IN (
    'single', 'married_filing_jointly', 'married_filing_separately',
    'head_of_household', 'qualifying_widow'
  )),
  status VARCHAR(20) NOT NULL DEFAULT 'intake' CHECK (status IN (
    'intake', 'classifying', 'deductions', 'form_building',
    'review', 'awaiting_review', 'completed'
  )),
  confidence_score DECIMAL(5,4),
  total_income DECIMAL(12,2),
  total_deductions DECIMAL(12,2),
  total_credits DECIMAL(12,2),
  estimated_tax DECIMAL(12,2),
  estimated_refund DECIMAL(12,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Income items (W-2, 1099, etc.)
CREATE TABLE IF NOT EXISTS income_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES tax_sessions(id) ON DELETE CASCADE,
  source VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN (
    'w2', '1099', 'self_employment', 'investment', 'rental', 'other'
  )),
  employer_name VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  federal_withheld DECIMAL(12,2) DEFAULT 0,
  state_withheld DECIMAL(12,2) DEFAULT 0,
  document_url TEXT,
  extracted_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deductions
CREATE TABLE IF NOT EXISTS deductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES tax_sessions(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  confidence DECIMAL(5,4) NOT NULL DEFAULT 0,
  irs_reference VARCHAR(100),
  is_itemized BOOLEAN NOT NULL DEFAULT false,
  ai_suggested BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Review items (Human-in-the-Loop)
CREATE TABLE IF NOT EXISTS review_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES tax_sessions(id) ON DELETE CASCADE,
  field_name VARCHAR(255) NOT NULL,
  field_value TEXT,
  reason TEXT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL DEFAULT 0,
  reviewer_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'rejected', 'modified'
  )),
  reviewer_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES tax_sessions(id) ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  cards JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES tax_sessions(id),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_sessions_user ON tax_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_income_items_session ON income_items(session_id);
CREATE INDEX IF NOT EXISTS idx_deductions_session ON deductions(session_id);
CREATE INDEX IF NOT EXISTS idx_review_items_session ON review_items(session_id);
CREATE INDEX IF NOT EXISTS idx_review_items_status ON review_items(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_session ON audit_log(session_id);
