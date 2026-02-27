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
    return getDemoResponse(message);
  }
}

function getDemoResponse(message: string): AgentResponse {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('start') || lower.includes('hi')) {
    return {
      message: "Welcome to TaxPilot AI! I'm here to help you file your 2025 federal tax return. Let's start with some basic information.\n\nWhat is your filing status? (Single, Married Filing Jointly, Married Filing Separately, Head of Household, or Qualifying Widow/Widower)",
      cards: [{
        type: 'progress_card',
        title: 'Tax Return Progress',
        data: { step: 1, total: 5, label: 'Personal Information' }
      }],
      state: { current_node: 'intake', confidence_score: 0, needs_review: false }
    };
  }

  if (lower.includes('single') || lower.includes('married') || lower.includes('head')) {
    return {
      message: "Got it! Now let's gather your income information.\n\nDo you have a W-2 from an employer? If so, you can upload a photo of it, or I can walk you through entering the information manually.",
      cards: [{
        type: 'progress_card',
        title: 'Tax Return Progress',
        data: { step: 2, total: 5, label: 'Income Information' }
      }],
      state: { current_node: 'intake', confidence_score: 0.15, needs_review: false }
    };
  }

  if (lower.includes('w-2') || lower.includes('w2') || lower.includes('income') || lower.includes('salary') || lower.match(/\$?\d{2,}/)) {
    return {
      message: "I've recorded your income information. Let me analyze potential deductions for you.\n\nBased on your income, I'm checking for applicable deductions and credits using the latest IRS guidelines...",
      cards: [
        {
          type: 'income_card',
          title: 'W-2 Income Recorded',
          data: { employer: 'Demo Employer Inc.', wages: 75000, federal_withheld: 12500, state_withheld: 3750 }
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

  if (lower.includes('deduction') || lower.includes('credit') || lower.includes('mortgage') || lower.includes('charitable') || lower.includes('student')) {
    return {
      message: "Great! I've identified several potential deductions. Based on the 2025 tax law (including the One Big Beautiful Bill changes), here's what I found:\n\n- **Standard Deduction:** $15,000 (recommended for your situation)\n- **Student Loan Interest:** Up to $2,500\n- **Charitable Contributions:** Report any donations over $250\n\nThe standard deduction of $15,000 exceeds your itemized deductions, so I recommend taking the standard deduction. Shall I proceed to calculate your estimated tax and refund?",
      cards: [{
        type: 'deduction_card',
        title: 'Deduction Analysis',
        data: {
          standard_deduction: 15000,
          itemized_total: 8500,
          recommendation: 'standard',
          savings: 6500
        }
      }],
      state: { current_node: 'deduction', confidence_score: 0.72, needs_review: false }
    };
  }

  if (lower.includes('calculate') || lower.includes('refund') || lower.includes('yes') || lower.includes('proceed')) {
    return {
      message: "Here's your estimated 2025 tax return summary:\n\n**Gross Income:** $75,000\n**Standard Deduction:** -$15,000\n**Taxable Income:** $60,000\n**Federal Tax:** $8,817\n**Already Withheld:** $12,500\n\n**Estimated Refund: $3,683**\n\nThis return has a **high confidence score (92%)**. However, I'm flagging one item for professional review by our licensed EA to ensure accuracy.",
      cards: [
        {
          type: 'refund_card',
          title: 'Estimated Refund',
          data: {
            gross_income: 75000,
            deductions: 15000,
            taxable_income: 60000,
            federal_tax: 8817,
            withheld: 12500,
            refund: 3683
          }
        },
        {
          type: 'review_card',
          title: 'Flagged for Review',
          data: {
            field: 'Filing Status Optimization',
            reason: 'You may qualify for Head of Household status which could save an additional $1,200',
            confidence: 0.68
          }
        }
      ],
      state: { current_node: 'review', confidence_score: 0.92, needs_review: true }
    };
  }

  return {
    message: "I can help you with that! To give you the best tax advice, could you tell me more about your specific situation? For example:\n\n- Your filing status\n- Types of income you received\n- Any major life changes in 2025\n- Deductions you're considering\n\nFeel free to ask me anything about your taxes!",
    state: { current_node: 'intake', confidence_score: 0, needs_review: false }
  };
}
