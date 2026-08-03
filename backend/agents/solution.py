import json
import logging
from typing import Dict, Any
try:
    from langchain_ollama import ChatOllama
except ImportError:
    from langchain_community.chat_models import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage

from prompts.solution_prompts import SOLUTION_SYSTEM_PROMPT, SOLUTION_USER_PROMPT
from utils.execution_timer import measure_execution_time

logger = logging.getLogger(__name__)

def run_solution_agent(interpreter_data: Dict[str, Any], researcher_data: Dict[str, Any], model_name: str = "llama3") -> Dict[str, Any]:
    """
    Agent 3: Solution & Incident Report Synthesizer
    - Combines outputs from Agent 1 (Interpreter) and Agent 2 (Researcher)
    - Performs evidence-chain reasoning to generate SRE Incident Report
    - Generates dynamic sandbox investigation steps
    - Produces real code patches and technology-appropriate commands
    """
    with measure_execution_time() as timer:
        try:
            llm = ChatOllama(model=model_name, temperature=0.1, format="json")
            prompt_content = SOLUTION_USER_PROMPT.format(
                interpreter_output=json.dumps(interpreter_data),
                researcher_output=json.dumps(researcher_data)
            )
            messages = [
                SystemMessage(content=SOLUTION_SYSTEM_PROMPT),
                HumanMessage(content=prompt_content)
            ]
            response = llm.invoke(messages).content

            clean_str = response.strip()
            for prefix in ['```json', '```']:
                if clean_str.startswith(prefix):
                    clean_str = clean_str[len(prefix):]
            if clean_str.endswith('```'):
                clean_str = clean_str[:-3]

            parsed_data = json.loads(clean_str.strip())
        except Exception as e:
            logger.warning(f"Solution Agent LLM call fallback: {e}")
            # Build technology-aware fallback
            service = interpreter_data.get("affected_service", "Unknown Service")
            component = interpreter_data.get("affected_component", "Unknown Component")
            exception_type = interpreter_data.get("exception_type", "Error")
            cache = interpreter_data.get("cache", "Unknown")
            database = interpreter_data.get("database", "Unknown")
            container_platform = interpreter_data.get("container_platform", "Unknown")

            # Generate technology-appropriate commands
            fallback_commands = []
            if container_platform == "Kubernetes":
                fallback_commands = [f"kubectl get pods -n default", f"kubectl logs {service}", f"kubectl describe pod {service}", "kubectl get events --sort-by=.lastTimestamp"]
            elif cache == "Redis":
                fallback_commands = ["redis-cli INFO memory", "redis-cli CONFIG GET maxmemory", "redis-cli DBSIZE", "redis-cli CLIENT LIST"]
            elif database == "PostgreSQL":
                fallback_commands = ["pg_isready", "psql -c 'SELECT * FROM pg_stat_activity'", "systemctl status postgresql"]
            elif database == "MySQL":
                fallback_commands = ["mysqladmin status", "mysql -e 'SHOW PROCESSLIST'", "systemctl status mysql"]
            else:
                fallback_commands = ["systemctl status " + service, f"journalctl -u {service} -n 100", "free -m", "df -h"]

            parsed_data = {
                "executive_summary": f"Incident detected in {service} ({component}). {exception_type} identified. Root cause analysis compiled from log evidence.",
                "severity": interpreter_data.get("severity", "Medium"),
                "confidence_score": 65.0,
                "confidence_reason": "Fallback analysis - LLM synthesis unavailable. Manual investigation recommended.",
                "incident_category": interpreter_data.get("incident_type", "Unclassified Error"),
                "affected_service": service,
                "affected_component": component,
                "root_cause": {
                    "primary": f"{exception_type} in {component} - see evidence for details",
                    "secondary": researcher_data.get("possible_root_causes", [])
                },
                "reasoning_chain": [
                    {"step": "Observation", "observation": interpreter_data.get("error_signature", "Error detected"), "conclusion": "Anomaly identified in service logs"},
                    {"step": "Evidence", "observation": str(interpreter_data.get("evidence", [])[:2]), "conclusion": f"{exception_type} confirmed"}
                ],
                "investigation_timeline": interpreter_data.get("important_events", []),
                "evidence": interpreter_data.get("evidence", []),
                "operational_impact": f"Service {service} experiencing {exception_type}",
                "business_impact": interpreter_data.get("business_impact", "Service degradation detected"),
                "recommended_fixes": researcher_data.get("recommended_commands", [f"Inspect {service} logs for {exception_type}"]),
                "diagnostic_commands": fallback_commands,
                "code_patch": "",
                "verification_steps": [f"Verify {service} is running", "Check logs for error recurrence"],
                "rollback_strategy": f"Revert last deployment of {service}",
                "monitoring_recommendations": [f"Set alert for {exception_type} in {service}"],
                "risk_assessment": "Medium risk - verify in staging before production",
                "preventive_actions": ["Implement health check probes", "Set alert thresholds"],
                "official_references": [],
                "sandbox_investigation": []
            }

    # Ensure Confidence Score & Label normalization
    score = 75.0
    try:
        score = float(parsed_data.get("confidence_score", 75.0))
    except (ValueError, TypeError):
        pass
    score = max(0.0, min(100.0, score))
    parsed_data["confidence_score"] = score

    if score >= 85.0:
        parsed_data["confidence_level"] = "High Confidence"
    elif score >= 60.0:
        parsed_data["confidence_level"] = "Medium Confidence"
    else:
        parsed_data["confidence_level"] = "Low Confidence"

    parsed_data["manual_review_recommended"] = (score < 60.0)
    parsed_data["execution_time_ms"] = timer["elapsed_ms"]

    # Ensure sandbox_investigation is always a list
    if not isinstance(parsed_data.get("sandbox_investigation"), list):
        parsed_data["sandbox_investigation"] = []

    # Ensure reasoning_chain is always a list
    if not isinstance(parsed_data.get("reasoning_chain"), list):
        parsed_data["reasoning_chain"] = []
        
    # Ensure recommended_fixes is always populated, fallback to intelligent defaults if the LLM dropped it
    if not parsed_data.get("recommended_fixes") or not isinstance(parsed_data.get("recommended_fixes"), list) or len(parsed_data["recommended_fixes"]) == 0:
        service_name = interpreter_data.get("affected_service", "the service")
        parsed_data["recommended_fixes"] = [
            f"Check {service_name} health and metrics",
            "Inspect upstream dependencies and network logs",
            "Validate configuration parameters and timeouts",
            "Restart deployment or clear cache if necessary",
            "Verify HTTP 200 responses and normal operation"
        ]

    return parsed_data
