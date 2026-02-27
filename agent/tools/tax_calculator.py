"""Tax bracket computation for 2025 federal income tax."""

# 2025 Federal Tax Brackets
BRACKETS: dict[str, list[tuple[float, float, float]]] = {
    "single": [
        (0, 11925, 0.10),
        (11925, 48475, 0.12),
        (48475, 103350, 0.22),
        (103350, 197300, 0.24),
        (197300, 250525, 0.32),
        (250525, 626350, 0.35),
        (626350, float("inf"), 0.37),
    ],
    "married_filing_jointly": [
        (0, 23850, 0.10),
        (23850, 96950, 0.12),
        (96950, 206700, 0.22),
        (206700, 394600, 0.24),
        (394600, 501050, 0.32),
        (501050, 751600, 0.35),
        (751600, float("inf"), 0.37),
    ],
    "married_filing_separately": [
        (0, 11925, 0.10),
        (11925, 48475, 0.12),
        (48475, 103350, 0.22),
        (103350, 197300, 0.24),
        (197300, 250525, 0.32),
        (250525, 375800, 0.35),
        (375800, float("inf"), 0.37),
    ],
    "head_of_household": [
        (0, 17000, 0.10),
        (17000, 64850, 0.12),
        (64850, 103350, 0.22),
        (103350, 197300, 0.24),
        (197300, 250500, 0.32),
        (250500, 626350, 0.35),
        (626350, float("inf"), 0.37),
    ],
    "qualifying_widow": [
        (0, 23850, 0.10),
        (23850, 96950, 0.12),
        (96950, 206700, 0.22),
        (206700, 394600, 0.24),
        (394600, 501050, 0.32),
        (501050, 751600, 0.35),
        (751600, float("inf"), 0.37),
    ],
}


def calculate_federal_tax(taxable_income: float, filing_status: str = "single") -> float:
    """Calculate federal income tax using progressive brackets."""
    brackets = BRACKETS.get(filing_status, BRACKETS["single"])
    tax = 0.0

    for low, high, rate in brackets:
        if taxable_income <= low:
            break
        bracket_income = min(taxable_income, high) - low
        tax += bracket_income * rate

    return round(tax, 2)


def calculate_effective_rate(taxable_income: float, filing_status: str = "single") -> float:
    """Calculate effective tax rate."""
    if taxable_income <= 0:
        return 0.0
    tax = calculate_federal_tax(taxable_income, filing_status)
    return tax / taxable_income


def calculate_marginal_rate(taxable_income: float, filing_status: str = "single") -> float:
    """Get the marginal tax rate for the given income."""
    brackets = BRACKETS.get(filing_status, BRACKETS["single"])
    for low, high, rate in brackets:
        if taxable_income <= high:
            return rate
    return 0.37  # Top bracket
