"""Review node — Confidence scoring and HITL flagging."""

from state import TaxPilotState, ReviewFlag


def review_node(state: TaxPilotState) -> TaxPilotState:
    """Analyze return for accuracy and flag items for human review."""
    filing_status = state.get("filing_status", "single")
    total_income = state.get("total_income", 0)
    estimated_refund = state.get("estimated_refund", 0)
    total_withheld = state.get("total_withheld", 0)

    review_flags: list[ReviewFlag] = []
    confidence_score = 0.85  # Base confidence

    # Check: filing status optimization
    dependents = state.get("dependents", 0)
    if filing_status == "single" and dependents > 0:
        review_flags.append(ReviewFlag(
            field_name="Filing Status Optimization",
            field_value=filing_status,
            reason="Filer has dependents but filed as Single. May qualify for Head of Household, saving ~$1,200+.",
            confidence=0.68,
        ))
        confidence_score -= 0.1

    # Check: withholding ratio
    if total_income > 0:
        withholding_rate = total_withheld / total_income
        if withholding_rate > 0.25:
            review_flags.append(ReviewFlag(
                field_name="High Withholding Rate",
                field_value=f"{withholding_rate:.1%}",
                reason="Withholding rate exceeds 25% of gross income. May want to adjust W-4.",
                confidence=0.75,
            ))
        elif withholding_rate < 0.10:
            review_flags.append(ReviewFlag(
                field_name="Low Withholding Rate",
                field_value=f"{withholding_rate:.1%}",
                reason="Withholding rate is below 10%. Filer may owe at tax time.",
                confidence=0.70,
            ))

    # Check: large refund
    if estimated_refund > 5000:
        review_flags.append(ReviewFlag(
            field_name="Large Refund Amount",
            field_value=f"${estimated_refund:,.0f}",
            reason="Refund exceeds $5,000. Verify all income sources and withholding amounts.",
            confidence=0.60,
        ))
        confidence_score -= 0.05

    needs_review = len(review_flags) > 0
    confidence_score = max(0, min(1, confidence_score))

    cards = []
    if review_flags:
        for flag in review_flags:
            cards.append({
                "type": "review_card",
                "title": "Flagged for Review",
                "data": {
                    "field": flag.field_name,
                    "reason": flag.reason,
                    "confidence": flag.confidence,
                },
            })

    pct = round(confidence_score * 100)
    response = state.get("response", "")
    if needs_review:
        response += (
            f"\n\nThis return has a **confidence score of {pct}%**. "
            f"I've flagged {len(review_flags)} item(s) for professional review by our licensed EA."
        )
    else:
        response += f"\n\nThis return has a **high confidence score ({pct}%)**. No items flagged for review."

    return {
        **state,
        "confidence_score": confidence_score,
        "review_flags": review_flags,
        "needs_review": needs_review,
        "current_node": "review",
        "response": response,
        "cards": state.get("cards", []) + cards,
        "completed": True,
    }
