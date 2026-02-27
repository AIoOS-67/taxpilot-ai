"""Intake node — Collects personal information through conversation."""

import os
import httpx
from state import TaxPilotState
from prompts import INTAKE_PROMPT

INFERENCE_URL = os.environ.get(
    "GRADIENT_INFERENCE_URL",
    "https://inference.do-ai.run/v1/chat/completions"
)
MODEL = os.environ.get("GRADIENT_MODEL", "meta-llama/Llama-3.3-70B-Instruct")
API_KEY = os.environ.get("GRADIENT_API_KEY", "")


def intake_node(state: TaxPilotState) -> TaxPilotState:
    """Collect user info through conversational interview."""
    message = state.get("user_message", "")
    lower = message.lower()

    # Extract filing status from message
    filing_status = state.get("filing_status")
    if not filing_status:
        if "single" in lower:
            filing_status = "single"
        elif "married" in lower and "joint" in lower:
            filing_status = "married_filing_jointly"
        elif "married" in lower and "separate" in lower:
            filing_status = "married_filing_separately"
        elif "head" in lower and "household" in lower:
            filing_status = "head_of_household"
        elif "widow" in lower or "qualifying" in lower:
            filing_status = "qualifying_widow"

    # Extract name
    name = state.get("name")
    if not name and ("my name is" in lower or "i'm " in lower or "i am " in lower):
        # Simple extraction
        for prefix in ["my name is ", "i'm ", "i am "]:
            if prefix in lower:
                idx = lower.index(prefix) + len(prefix)
                rest = message[idx:].strip()
                name = rest.split(",")[0].split(".")[0].split(" and")[0].strip()
                break

    # Build prompt
    system_prompt = INTAKE_PROMPT.format(
        name=name or "Not provided",
        filing_status=filing_status or "Not provided",
        state=state.get("state") or "Not provided",
        dependents=state.get("dependents", 0),
        income_count=len(state.get("income_items", [])),
    )

    # Call inference
    try:
        response = httpx.post(
            INFERENCE_URL,
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                "temperature": 0.7,
                "max_tokens": 500,
            },
            timeout=30,
        )
        response.raise_for_status()
        reply = response.json()["choices"][0]["message"]["content"]
    except Exception:
        # Fallback response
        if not filing_status:
            reply = "Thanks! What is your filing status? (Single, Married Filing Jointly, Married Filing Separately, Head of Household, or Qualifying Widow/Widower)"
        elif not name:
            reply = f"Filing status set to {filing_status.replace('_', ' ').title()}. What's your name?"
        else:
            reply = f"Great, {name}! Now let's gather your income. Do you have a W-2 from an employer?"

    # Determine progress step
    step = 1
    if filing_status:
        step = 2

    cards = [{
        "type": "progress_card",
        "title": "Tax Return Progress",
        "data": {"step": step, "total": 5, "label": "Personal Information" if step == 1 else "Income Information"},
    }]

    return {
        **state,
        "name": name,
        "filing_status": filing_status,
        "current_node": "intake",
        "response": reply,
        "cards": cards,
    }
