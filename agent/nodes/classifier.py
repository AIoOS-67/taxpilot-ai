"""Classifier node — Categorizes income sources."""

import re
from state import TaxPilotState, IncomeItem


def classifier_node(state: TaxPilotState) -> TaxPilotState:
    """Categorize and organize income items."""
    message = state.get("user_message", "")
    income_items = list(state.get("income_items", []))

    # Try to extract dollar amounts from the message
    amounts = re.findall(r'\$?([\d,]+(?:\.\d{2})?)', message)
    amounts = [float(a.replace(',', '')) for a in amounts if float(a.replace(',', '')) > 100]

    if amounts:
        # Assume largest amount is wages
        wages = max(amounts)
        item = IncomeItem(
            source="W-2 Employment",
            type="w2",
            employer_name="Employer (from W-2)",
            amount=wages,
            federal_withheld=wages * 0.167,  # ~16.7% average withholding
            state_withheld=wages * 0.05,     # ~5% state estimate
        )
        income_items.append(item)

    total_income = sum(item.amount for item in income_items)
    total_withheld = sum(item.federal_withheld for item in income_items)

    cards = []
    if income_items:
        latest = income_items[-1]
        cards.append({
            "type": "income_card",
            "title": f"{latest.type.upper()} Income Recorded",
            "data": {
                "employer": latest.employer_name or "N/A",
                "wages": latest.amount,
                "federal_withheld": latest.federal_withheld,
                "state_withheld": latest.state_withheld,
            },
        })

    cards.append({
        "type": "progress_card",
        "title": "Tax Return Progress",
        "data": {"step": 3, "total": 5, "label": "Deductions & Credits"},
    })

    response = f"I've recorded your income of ${total_income:,.2f}. Let me analyze potential deductions for you..."

    return {
        **state,
        "income_items": income_items,
        "total_income": total_income,
        "total_withheld": total_withheld,
        "current_node": "classifier",
        "response": response,
        "cards": cards,
    }
