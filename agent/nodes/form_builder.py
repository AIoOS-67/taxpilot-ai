"""Form builder node — Calculates Form 1040 fields."""

from state import TaxPilotState
from tools.tax_calculator import calculate_federal_tax


def form_builder_node(state: TaxPilotState) -> TaxPilotState:
    """Build Form 1040 data from collected information."""
    filing_status = state.get("filing_status", "single")
    total_income = state.get("total_income", 0)
    standard_deduction = state.get("standard_deduction", 15000)
    itemized_total = state.get("itemized_total", 0)
    use_standard = state.get("use_standard", True)
    total_withheld = state.get("total_withheld", 0)
    credits = state.get("credits", 0)

    # Calculate
    deductions = standard_deduction if use_standard else itemized_total
    taxable_income = max(0, total_income - deductions)
    federal_tax = calculate_federal_tax(taxable_income, filing_status)
    tax_after_credits = max(0, federal_tax - credits)
    estimated_refund = total_withheld - tax_after_credits

    cards = [{
        "type": "refund_card",
        "title": "Estimated Refund",
        "data": {
            "gross_income": total_income,
            "deductions": deductions,
            "taxable_income": taxable_income,
            "federal_tax": federal_tax,
            "withheld": total_withheld,
            "refund": estimated_refund,
        },
    }]

    if estimated_refund >= 0:
        response = (
            f"Here's your estimated 2025 tax return:\n\n"
            f"**Gross Income:** ${total_income:,.0f}\n"
            f"**Deductions:** -${deductions:,.0f}\n"
            f"**Taxable Income:** ${taxable_income:,.0f}\n"
            f"**Federal Tax:** ${federal_tax:,.0f}\n"
            f"**Already Withheld:** ${total_withheld:,.0f}\n\n"
            f"**Estimated Refund: ${estimated_refund:,.0f}**"
        )
    else:
        owed = abs(estimated_refund)
        response = (
            f"Based on your information, you may owe **${owed:,.0f}** in additional taxes.\n\n"
            f"**Gross Income:** ${total_income:,.0f}\n"
            f"**Taxable Income:** ${taxable_income:,.0f}\n"
            f"**Federal Tax:** ${federal_tax:,.0f}\n"
            f"**Already Withheld:** ${total_withheld:,.0f}"
        )

    return {
        **state,
        "taxable_income": taxable_income,
        "federal_tax": federal_tax,
        "estimated_refund": estimated_refund,
        "current_node": "form_builder",
        "response": response,
        "cards": cards,
    }
