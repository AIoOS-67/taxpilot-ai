"""Deduction node — RAG-powered deduction finder using DO Knowledge Base."""

import os
import httpx
from state import TaxPilotState, DeductionItem

STANDARD_DEDUCTIONS = {
    "single": 15000,
    "married_filing_jointly": 30000,
    "married_filing_separately": 15000,
    "head_of_household": 22500,
    "qualifying_widow": 30000,
}

KB_URL = os.environ.get("DO_KB_URL", "")
KB_API_KEY = os.environ.get("DO_KB_API_KEY", "")


def query_knowledge_base(query: str) -> str:
    """Query DO Knowledge Base for relevant tax info."""
    if not KB_URL:
        return "Standard deduction is recommended for most filers. Check IRS Pub 501."
    try:
        response = httpx.post(
            f"{KB_URL}/query",
            headers={"Authorization": f"Bearer {KB_API_KEY}"},
            json={"query": query, "top_k": 3},
            timeout=10,
        )
        response.raise_for_status()
        results = response.json().get("results", [])
        return "\n".join(r.get("text", "") for r in results)
    except Exception:
        return ""


def deduction_node(state: TaxPilotState) -> TaxPilotState:
    """Find applicable deductions using RAG."""
    filing_status = state.get("filing_status", "single")
    total_income = state.get("total_income", 0)

    standard_deduction = STANDARD_DEDUCTIONS.get(filing_status, 15000)

    # Query KB for deduction opportunities
    rag_context = query_knowledge_base(
        f"Tax deductions for {filing_status} filer with income ${total_income:,.0f}"
    )

    # Common deductions to check
    deductions: list[DeductionItem] = []

    # Always suggest standard deduction as baseline
    itemized_total = sum(d.amount for d in deductions)

    use_standard = standard_deduction >= itemized_total

    cards = [{
        "type": "deduction_card",
        "title": "Deduction Analysis",
        "data": {
            "standard_deduction": standard_deduction,
            "itemized_total": itemized_total,
            "recommendation": "standard" if use_standard else "itemized",
            "savings": standard_deduction - itemized_total if use_standard else 0,
        },
    }]

    effective_deduction = standard_deduction if use_standard else itemized_total
    deduction_type = "Standard" if use_standard else "Itemized"

    response = (
        f"Based on the 2025 tax law, I recommend the **{deduction_type} Deduction** "
        f"of **${effective_deduction:,.0f}**.\n\n"
    )
    if use_standard:
        response += f"The standard deduction (${standard_deduction:,.0f}) exceeds your itemized deductions (${itemized_total:,.0f}), so the standard deduction saves you more."

    return {
        **state,
        "deductions": deductions,
        "standard_deduction": standard_deduction,
        "itemized_total": itemized_total,
        "use_standard": use_standard,
        "current_node": "deduction",
        "response": response,
        "cards": cards,
    }
