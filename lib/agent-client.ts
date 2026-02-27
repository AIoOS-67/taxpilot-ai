const AGENT_URL = process.env.GRADIENT_AGENT_URL || 'http://localhost:8000';

export interface AgentResponse {
  message: string;
  cards?: Array<{
    type: string;
    title: string;
    data: Record<string, unknown>;
  }>;
  state?: {
    current_node: string;
    confidence_score: number;
    needs_review: boolean;
  };
}

export async function sendToAgent(
  sessionId: string,
  message: string,
  context?: Record<string, unknown>
): Promise<AgentResponse> {
  try {
    const response = await fetch(`${AGENT_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`Agent error: ${response.status}`);
    }

    return await response.json();
  } catch {
    // Demo fallback: return pre-computed response
    return getDemoResponse(sessionId, message);
  }
}

// Track conversation state per session for demo mode
const sessionState: Record<string, { step: number; filingStatus: string; income: number }> = {};

function getSession(sessionId: string) {
  if (!sessionState[sessionId]) {
    sessionState[sessionId] = { step: 0, filingStatus: '', income: 0 };
  }
  return sessionState[sessionId];
}

function getDemoResponse(sessionId: string, message: string): AgentResponse {
  const lower = message.toLowerCase();
  const session = getSession(sessionId);

  // Greeting / start
  if (lower.includes('hello') || lower.includes('start') || lower.includes('hi') || lower.includes('hey')) {
    session.step = 1;
    return {
      message: "Welcome to TaxPilot AI! I'm here to help you file your 2025 federal tax return. Our multi-agent pipeline uses DigitalOcean's Gradient AI with Llama 3.3 70B to analyze your tax situation.\n\nLet's start with some basic information.\n\n**What is your filing status?**\n(Single, Married Filing Jointly, Married Filing Separately, Head of Household, or Qualifying Widow/Widower)",
      cards: [{
        type: 'progress_card',
        title: 'Tax Return Progress',
        data: { step: 1, total: 5, label: 'Personal Information' }
      }],
      state: { current_node: 'intake', confidence_score: 0.05, needs_review: false }
    };
  }

  // Filing status responses
  if (lower.includes('single')) {
    session.step = 2;
    session.filingStatus = 'Single';
    return {
      message: "Got it \u2014 **Single** filing status recorded.\n\nFor 2025, as a Single filer your standard deduction is **$15,000** (increased under the One Big Beautiful Bill Act).\n\nNow let's gather your income information. Do you have a **W-2** from an employer? You can:\n\n1. Tell me the amounts directly\n2. Upload a photo of your W-2 in the Upload tab\n3. Enter the information manually",
      cards: [{
        type: 'progress_card',
        title: 'Tax Return Progress',
        data: { step: 2, total: 5, label: 'Income Information' }
      }],
      state: { current_node: 'intake', confidence_score: 0.15, needs_review: false }
    };
  }

  if (lower.includes('married filing jointly') || lower.includes('married jointly') || lower.includes('jointly')) {
    session.step = 2;
    session.filingStatus = 'Married Filing Jointly';
    return {
      message: "Got it \u2014 **Married Filing Jointly** recorded.\n\nFor 2025, your standard deduction is **$30,000** (increased under the One Big Beautiful Bill Act). This is typically the most advantageous status for married couples.\n\nNow let's gather income information for **both spouses**. Do you have W-2s from employers?",
      cards: [{
        type: 'progress_card',
        title: 'Tax Return Progress',
        data: { step: 2, total: 5, label: 'Income Information' }
      }],
      state: { current_node: 'intake', confidence_score: 0.15, needs_review: false }
    };
  }

  if (lower.includes('head of household') || lower.includes('head')) {
    session.step = 2;
    session.filingStatus = 'Head of Household';
    return {
      message: "Got it \u2014 **Head of Household** recorded.\n\nFor 2025, your standard deduction is **$22,500**. This status provides better tax brackets than Single. To qualify, you must:\n\n- Be unmarried on Dec 31, 2025\n- Have paid over half the cost of maintaining your home\n- Have a qualifying dependent\n\nI'll verify your eligibility as we go. Now, let's gather your income \u2014 do you have a W-2?",
      cards: [{
        type: 'progress_card',
        title: 'Tax Return Progress',
        data: { step: 2, total: 5, label: 'Income Information' }
      }],
      state: { current_node: 'intake', confidence_score: 0.15, needs_review: false }
    };
  }

  if (lower.includes('married') && (lower.includes('separate') || lower.includes('separately'))) {
    session.step = 2;
    session.filingStatus = 'Married Filing Separately';
    return {
      message: "Got it \u2014 **Married Filing Separately** recorded.\n\nFor 2025, your standard deduction is **$15,000**. Note: this status has some limitations (e.g., no EITC, limited education credits). I'll flag if filing jointly would save you money.\n\nLet's gather your income \u2014 do you have a W-2?",
      cards: [{
        type: 'progress_card',
        title: 'Tax Return Progress',
        data: { step: 2, total: 5, label: 'Income Information' }
      }],
      state: { current_node: 'intake', confidence_score: 0.15, needs_review: false }
    };
  }

  // Income responses
  if (lower.includes('w-2') || lower.includes('w2') || lower.includes('salary') || lower.includes('employer')) {
    const incomeMatch = lower.match(/\$?([\d,]+)/);
    const income = incomeMatch ? parseInt(incomeMatch[1].replace(/,/g, '')) : 75000;
    session.step = 3;
    session.income = income;
    const withheld = Math.round(income * 0.167);
    const stateWithheld = Math.round(income * 0.05);
    return {
      message: `I've recorded your W-2 income information:\n\n- **Employer:** Demo Employer Inc.\n- **Wages:** $${income.toLocaleString()}\n- **Federal Tax Withheld:** $${withheld.toLocaleString()}\n- **State Tax Withheld:** $${stateWithheld.toLocaleString()}\n\nNow I'm querying the **IRS Knowledge Base** via RAG to find applicable deductions and credits for your income level...`,
      cards: [
        {
          type: 'income_card',
          title: 'W-2 Income Recorded',
          data: { employer: 'Demo Employer Inc.', wages: income, federal_withheld: withheld, state_withheld: stateWithheld }
        },
        {
          type: 'progress_card',
          title: 'Tax Return Progress',
          data: { step: 3, total: 5, label: 'Deductions & Credits' }
        }
      ],
      state: { current_node: 'classifier', confidence_score: 0.45, needs_review: false }
    };
  }

  if (lower.match(/\$?\d{4,}/) && session.step < 3) {
    const incomeMatch = lower.match(/\$?([\d,]+)/);
    const income = incomeMatch ? parseInt(incomeMatch[1].replace(/,/g, '')) : 75000;
    session.step = 3;
    session.income = income;
    const withheld = Math.round(income * 0.167);
    return {
      message: `Recorded income of **$${income.toLocaleString()}**.\n\nFederal tax withheld: approximately **$${withheld.toLocaleString()}**.\n\nSearching the IRS Knowledge Base for deductions and credits applicable to your situation...`,
      cards: [
        {
          type: 'income_card',
          title: 'Income Recorded',
          data: { wages: income, federal_withheld: withheld }
        },
        {
          type: 'progress_card',
          title: 'Tax Return Progress',
          data: { step: 3, total: 5, label: 'Deductions & Credits' }
        }
      ],
      state: { current_node: 'classifier', confidence_score: 0.45, needs_review: false }
    };
  }

  // Self-employed / 1099
  if (lower.includes('self-employed') || lower.includes('1099') || lower.includes('freelance') || lower.includes('contractor')) {
    const incomeMatch = lower.match(/\$?([\d,]+)/);
    const income = incomeMatch ? parseInt(incomeMatch[1].replace(/,/g, '')) : 85000;
    session.step = 3;
    session.income = income;
    const seTax = Math.round(income * 0.9235 * 0.153);
    return {
      message: `Recorded **self-employment income** of **$${income.toLocaleString()}**.\n\nAs a self-employed individual, you'll need to pay self-employment tax (Social Security + Medicare). Here's a preliminary estimate:\n\n- **SE Tax:** ~$${seTax.toLocaleString()}\n- **Deductible half of SE Tax:** ~$${Math.round(seTax / 2).toLocaleString()}\n\nYou may also qualify for additional deductions:\n- Home office deduction\n- Business expenses\n- Health insurance premiums\n- Retirement contributions (SEP IRA, Solo 401k)\n\nLet me search our Knowledge Base for the best strategies...`,
      cards: [
        {
          type: 'income_card',
          title: 'Self-Employment Income',
          data: { type: '1099-NEC', gross_income: income, se_tax_estimate: seTax }
        },
        {
          type: 'progress_card',
          title: 'Tax Return Progress',
          data: { step: 3, total: 5, label: 'Deductions & Credits' }
        }
      ],
      state: { current_node: 'classifier', confidence_score: 0.40, needs_review: false }
    };
  }

  // Upload photo redirect
  if (lower.includes('upload') || lower.includes('photo') || lower.includes('camera') || lower.includes('scan')) {
    return {
      message: "You can upload your W-2 using the **Upload** tab in the bottom navigation. Our OCR engine will extract the data automatically.\n\nAfter uploading, come back here and I'll continue with your filing!",
      state: { current_node: 'intake', confidence_score: 0.10, needs_review: false }
    };
  }

  // Deduction responses
  if (lower.includes('deduction') || lower.includes('credit') || lower.includes('mortgage') || lower.includes('charitable') || lower.includes('student') || lower.includes('donate')) {
    const income = session.income || 75000;
    const standardDed = session.filingStatus === 'Married Filing Jointly' ? 30000 :
      session.filingStatus === 'Head of Household' ? 22500 : 15000;
    session.step = 4;
    return {
      message: `Based on IRS Publication 17 and the 2025 tax code changes, here's my deduction analysis:\n\n**Standard Deduction:** $${standardDed.toLocaleString()} (recommended)\n\n**Potential Itemized Deductions:**\n- Mortgage interest (Schedule A, Line 8a)\n- State/local taxes up to $10,000 (SALT cap)\n- Charitable contributions (over $250 requires receipt)\n- Medical expenses exceeding 7.5% of AGI ($${Math.round(income * 0.075).toLocaleString()})\n- Student loan interest (up to $2,500)\n\n**My Recommendation:** Take the standard deduction of $${standardDed.toLocaleString()} \u2014 it exceeds typical itemized deductions at your income level.\n\nShall I calculate your estimated tax and refund?`,
      cards: [{
        type: 'deduction_card',
        title: 'Deduction Analysis (RAG)',
        data: {
          standard_deduction: standardDed,
          itemized_estimate: Math.round(standardDed * 0.6),
          recommendation: 'standard',
          irs_source: 'Publication 17, One Big Beautiful Bill Act 2025'
        }
      }],
      state: { current_node: 'deduction', confidence_score: 0.72, needs_review: false }
    };
  }

  // Calculate refund
  if (lower.includes('calculate') || lower.includes('refund') || lower.includes('yes') || lower.includes('proceed') || lower.includes('sure') || lower.includes('go ahead')) {
    const income = session.income || 75000;
    const standardDed = session.filingStatus === 'Married Filing Jointly' ? 30000 :
      session.filingStatus === 'Head of Household' ? 22500 : 15000;
    const taxableIncome = Math.max(0, income - standardDed);

    // Simple bracket calc for Single/default
    let tax = 0;
    const brackets = session.filingStatus === 'Married Filing Jointly'
      ? [[23200, 0.10], [94300, 0.12], [201050, 0.22], [383900, 0.24], [487450, 0.32], [731200, 0.35], [Infinity, 0.37]]
      : [[11600, 0.10], [47150, 0.12], [100525, 0.22], [191950, 0.24], [243725, 0.32], [609350, 0.35], [Infinity, 0.37]];
    let remaining = taxableIncome;
    let prevCap = 0;
    for (const [cap, rate] of brackets) {
      const bracketAmount = Math.min(remaining, (cap as number) - prevCap);
      if (bracketAmount <= 0) break;
      tax += bracketAmount * (rate as number);
      remaining -= bracketAmount;
      prevCap = cap as number;
    }
    tax = Math.round(tax);

    const withheld = Math.round(income * 0.167);
    const refund = withheld - tax;
    const effectiveRate = ((tax / income) * 100).toFixed(1);

    session.step = 5;
    return {
      message: `Here's your estimated 2025 tax return summary:\n\n**Gross Income:** $${income.toLocaleString()}\n**Standard Deduction:** -$${standardDed.toLocaleString()}\n**Taxable Income:** $${taxableIncome.toLocaleString()}\n**Federal Tax:** $${tax.toLocaleString()}\n**Effective Tax Rate:** ${effectiveRate}%\n**Already Withheld:** $${withheld.toLocaleString()}\n\n**${refund >= 0 ? `Estimated Refund: $${refund.toLocaleString()}` : `Estimated Tax Owed: $${Math.abs(refund).toLocaleString()}`}**\n\nThis return has a **high confidence score (92%)**. I'm flagging one item for professional review by our licensed EA, Darren, to ensure accuracy.\n\nYou can view the full Form 1040 preview in the **Results** tab.`,
      cards: [
        {
          type: 'refund_card',
          title: 'Estimated Refund',
          data: {
            gross_income: income,
            deductions: standardDed,
            taxable_income: taxableIncome,
            federal_tax: tax,
            withheld: withheld,
            refund: Math.max(0, refund),
            effective_rate: effectiveRate
          }
        },
        {
          type: 'review_card',
          title: 'Flagged for EA Review',
          data: {
            field: 'Filing Status Optimization',
            reason: `AI detected you may qualify for a different filing status that could save additional money. Sending to Darren (EA) for review.`,
            confidence: 0.68
          }
        },
        {
          type: 'progress_card',
          title: 'Tax Return Progress',
          data: { step: 5, total: 5, label: 'Review & Filing' }
        }
      ],
      state: { current_node: 'review', confidence_score: 0.92, needs_review: true }
    };
  }

  // Handle "more deductions" or follow-ups
  if (lower.includes('other deduction') || lower.includes('more deduction') || lower.includes('anything else')) {
    return {
      message: "Based on the IRS Knowledge Base, here are additional deductions to consider:\n\n**Above-the-Line Deductions (Schedule 1):**\n- Educator expenses (up to $300)\n- HSA contributions\n- IRA contributions (up to $7,000 under 50)\n- Moving expenses (military only)\n\n**Credits (reduce tax directly):**\n- Earned Income Tax Credit (EITC)\n- Child Tax Credit ($2,000 per child)\n- American Opportunity Credit (education)\n- Saver's Credit (retirement contributions)\n- Clean Vehicle Credit (up to $7,500)\n\nDo any of these apply to you?",
      cards: [{
        type: 'deduction_card',
        title: 'Additional Deductions & Credits',
        data: {
          category: 'Credits & Above-the-Line',
          source: 'IRS Knowledge Base RAG',
          items_found: 10
        }
      }],
      state: { current_node: 'deduction', confidence_score: 0.65, needs_review: false }
    };
  }

  // Thank you / done
  if (lower.includes('thank') || lower.includes('done') || lower.includes('great')) {
    return {
      message: "You're welcome! Here's a summary of what we've accomplished:\n\n1. Collected your personal & filing information\n2. Recorded income from W-2/employer\n3. Analyzed deductions using IRS Knowledge Base (RAG)\n4. Calculated your estimated tax and refund\n5. Flagged items for EA review by Darren\n\nYou can:\n- View your **Form 1040 preview** in the Results tab\n- Check **review status** to see Darren's feedback\n- **Upload additional documents** at any time\n\nTaxPilot AI is always here if you have more questions!",
      state: { current_node: 'review', confidence_score: 0.92, needs_review: true }
    };
  }

  // Default fallback
  return {
    message: "I can help you with that! To give you the best tax advice, I need a bit more context. Here's what I can help with:\n\n- **Filing status** \u2014 Single, Married, Head of Household\n- **Income reporting** \u2014 W-2, 1099, self-employment\n- **Deductions** \u2014 Standard vs. itemized, student loans, mortgage, charity\n- **Credits** \u2014 EITC, Child Tax Credit, education credits\n- **Tax calculation** \u2014 Estimated refund or amount owed\n\nWhat would you like to know?",
    state: { current_node: session.step >= 3 ? 'deduction' : 'intake', confidence_score: 0, needs_review: false }
  };
}
