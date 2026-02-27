"""TaxPilot AI — Multi-node LangGraph agent for tax filing.

Uses DigitalOcean Gradient ADK with Serverless Inference (Llama 3.3 70B).
Implements a 5-node pipeline: intake → classifier → deduction → form_builder → review
"""

import os
import json
from typing import Literal

from langgraph.graph import StateGraph, END
from state import TaxPilotState
from nodes.intake import intake_node
from nodes.classifier import classifier_node
from nodes.deduction import deduction_node
from nodes.form_builder import form_builder_node
from nodes.review import review_node


def should_continue(state: TaxPilotState) -> Literal["classifier", "intake"]:
    """Route after intake: proceed to classifier if we have enough info."""
    if state.get("filing_status") and state.get("total_income", 0) > 0:
        return "classifier"
    return "intake"


def after_review(state: TaxPilotState) -> Literal["end", "awaiting_review"]:
    """Route after review: complete or flag for human review."""
    if state.get("needs_review"):
        return "awaiting_review"
    return "end"


# Build the LangGraph StateGraph
graph = StateGraph(TaxPilotState)

# Add nodes
graph.add_node("intake", intake_node)
graph.add_node("classifier", classifier_node)
graph.add_node("deduction", deduction_node)
graph.add_node("form_builder", form_builder_node)
graph.add_node("review", review_node)

# Set entry point
graph.set_entry_point("intake")

# Add edges
graph.add_conditional_edges("intake", should_continue)
graph.add_edge("classifier", "deduction")
graph.add_edge("deduction", "form_builder")
graph.add_edge("form_builder", "review")
graph.add_conditional_edges("review", after_review, {
    "end": END,
    "awaiting_review": END,
})

# Compile
app = graph.compile()


# HTTP server for the agent
from http.server import HTTPServer, BaseHTTPRequestHandler

sessions: dict[str, TaxPilotState] = {}


class AgentHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/chat":
            content_length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(content_length))

            session_id = body.get("session_id", "default")
            message = body.get("message", "")

            # Get or create session state
            state = sessions.get(session_id, {
                "session_id": session_id,
                "user_message": message,
                "name": None,
                "filing_status": None,
                "state": None,
                "dependents": 0,
                "income_items": [],
                "total_income": 0,
                "deductions": [],
                "standard_deduction": 0,
                "itemized_total": 0,
                "use_standard": True,
                "taxable_income": 0,
                "federal_tax": 0,
                "credits": 0,
                "total_withheld": 0,
                "estimated_refund": 0,
                "confidence_score": 0,
                "review_flags": [],
                "needs_review": False,
                "current_node": "intake",
                "response": "",
                "cards": [],
                "completed": False,
            })

            state["user_message"] = message

            try:
                # Run the graph
                result = app.invoke(state)
                sessions[session_id] = result

                response = {
                    "message": result.get("response", "I'm processing your request..."),
                    "cards": result.get("cards", []),
                    "state": {
                        "current_node": result.get("current_node", "intake"),
                        "confidence_score": result.get("confidence_score", 0),
                        "needs_review": result.get("needs_review", False),
                    },
                }
            except Exception as e:
                response = {
                    "message": f"I encountered an issue: {str(e)}. Let me try a different approach.",
                    "cards": [],
                    "state": {"current_node": "intake", "confidence_score": 0, "needs_review": False},
                }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "agent": "taxpilot"}).encode())
        else:
            self.send_response(404)
            self.end_headers()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    server = HTTPServer(("0.0.0.0", port), AgentHandler)
    print(f"TaxPilot agent running on port {port}")
    server.serve_forever()
