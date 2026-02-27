"""LangGraph state definition for TaxPilot agent."""

from typing import TypedDict, Optional, Literal
from pydantic import BaseModel


class IncomeItem(BaseModel):
    source: str
    type: Literal["w2", "1099", "self_employment", "investment", "rental", "other"]
    employer_name: Optional[str] = None
    amount: float
    federal_withheld: float = 0
    state_withheld: float = 0


class DeductionItem(BaseModel):
    category: str
    description: str
    amount: float
    confidence: float
    irs_reference: Optional[str] = None
    is_itemized: bool = False
    ai_suggested: bool = False


class ReviewFlag(BaseModel):
    field_name: str
    field_value: str
    reason: str
    confidence: float


class TaxPilotState(TypedDict):
    """State shared across all LangGraph nodes."""

    # Session
    session_id: str
    user_message: str

    # Personal info
    name: Optional[str]
    filing_status: Optional[str]
    state: Optional[str]
    dependents: int

    # Income
    income_items: list[IncomeItem]
    total_income: float

    # Deductions
    deductions: list[DeductionItem]
    standard_deduction: float
    itemized_total: float
    use_standard: bool

    # Tax calculation
    taxable_income: float
    federal_tax: float
    credits: float
    total_withheld: float
    estimated_refund: float

    # Review
    confidence_score: float
    review_flags: list[ReviewFlag]
    needs_review: bool

    # Flow control
    current_node: str
    response: str
    cards: list[dict]
    completed: bool
