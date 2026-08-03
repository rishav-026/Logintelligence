"""
Legacy import forwarder for backend/agents.py to backend/agents/ package.
"""
from agents.orchestrator import execute_log_analysis_pipeline as run_analysis_pipeline
from agents.interpreter import run_interpreter_agent
from agents.researcher import run_researcher_agent
from agents.solution import run_solution_agent

__all__ = [
    "run_analysis_pipeline",
    "run_interpreter_agent",
    "run_researcher_agent",
    "run_solution_agent"
]
