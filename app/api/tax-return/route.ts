import { NextResponse } from 'next/server';

export async function GET() {
  // Demo mode: return pre-computed tax return
  const result = {
    filing_status: 'Single',
    gross_income: 75000,
    deductions: 15000,
    taxable_income: 60000,
    federal_tax: 8817,
    credits: 0,
    total_withheld: 12500,
    estimated_refund: 3683,
    confidence_score: 0.92,
    needs_review: true,
  };

  return NextResponse.json({ result });
}
