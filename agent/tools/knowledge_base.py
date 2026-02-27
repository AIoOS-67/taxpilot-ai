"""DigitalOcean Knowledge Base RAG retrieval tool."""

import os
import httpx

KB_URL = os.environ.get("DO_KB_URL", "")
KB_API_KEY = os.environ.get("DO_KB_API_KEY", "")


def search_knowledge_base(query: str, top_k: int = 3) -> list[dict]:
    """Search the DO Knowledge Base for relevant tax documents.

    Returns list of {text, score, metadata} dicts.
    """
    if not KB_URL:
        return [{"text": "Knowledge base not configured. Using built-in tax data.", "score": 0, "metadata": {}}]

    try:
        response = httpx.post(
            f"{KB_URL}/query",
            headers={
                "Authorization": f"Bearer {KB_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "query": query,
                "top_k": top_k,
            },
            timeout=10,
        )
        response.raise_for_status()
        return response.json().get("results", [])
    except Exception as e:
        return [{"text": f"KB query failed: {str(e)}", "score": 0, "metadata": {}}]


def get_deduction_info(category: str) -> str:
    """Get detailed info about a specific deduction category."""
    results = search_knowledge_base(f"IRS deduction {category} eligibility requirements limits")
    return "\n".join(r.get("text", "") for r in results[:2])


def get_credit_info(credit_name: str) -> str:
    """Get detailed info about a specific tax credit."""
    results = search_knowledge_base(f"IRS tax credit {credit_name} eligibility amount phase-out")
    return "\n".join(r.get("text", "") for r in results[:2])
