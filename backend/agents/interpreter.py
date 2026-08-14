import json
import logging
from typing import Dict, Any
try:
    from langchain_ollama import ChatOllama
except Exception:
    try:
        from langchain_community.chat_models import ChatOllama
    except Exception:
        ChatOllama = None

try:
    from langchain_core.messages import SystemMessage, HumanMessage
except Exception:
    SystemMessage = None
    HumanMessage = None

from prompts.interpreter_prompts import INTERPRETER_SYSTEM_PROMPT, INTERPRETER_USER_PROMPT
from utils.severity_heuristics import detect_severity, extract_tech_stack_keywords, extract_metrics_from_log, extract_error_codes, extract_infrastructure_metadata
from utils.execution_timer import measure_execution_time

logger = logging.getLogger(__name__)

def run_interpreter_agent(raw_log: str, model_name: str = "llama3") -> Dict[str, Any]:
    """
    Agent 1: DevOps Log Interpreter
    - Analyzes raw logs
    - Auto-detects full technology stack via heuristics
    - Extracts metrics, error codes, stack traces, and evidence
    - Returns comprehensive structured metadata
    """
    heuristics_severity, initial_confidence = detect_severity(raw_log)
    tech_keywords = extract_tech_stack_keywords(raw_log)
    extracted_metrics = extract_metrics_from_log(raw_log)
    error_codes = extract_error_codes(raw_log)
    infra_meta = extract_infrastructure_metadata(raw_log)
    
    extracted_facts = {
        "severity": heuristics_severity,
        "infrastructure": infra_meta,
        "technology_stack": tech_keywords,
        "metrics": extracted_metrics,
        "error_codes": error_codes
    }

    with measure_execution_time() as timer:
        try:
            llm = ChatOllama(model=model_name, temperature=0.1, format="json")
            prompt_content = INTERPRETER_USER_PROMPT.format(
                extracted_facts=json.dumps(extracted_facts, indent=2),
                raw_log=raw_log
            )
            messages = [
                SystemMessage(content=INTERPRETER_SYSTEM_PROMPT),
                HumanMessage(content=prompt_content)
            ]
            response = llm.invoke(messages).content

            # Clean JSON code blocks
            clean_str = response.strip()
            for prefix in ['```json', '```']:
                if clean_str.startswith(prefix):
                    clean_str = clean_str[len(prefix):]
            if clean_str.endswith('```'):
                clean_str = clean_str[:-3]

            parsed_data = json.loads(clean_str.strip())
        except Exception as e:
            logger.warning(f"Interpreter Agent LLM call failed/fallback: {e}")
            parsed_data = {
                "language": tech_keywords.get("language", "Unknown"),
                "framework": tech_keywords.get("framework", "General"),
                "cloud_provider": tech_keywords.get("cloud_provider", "Unknown"),
                "container_platform": tech_keywords.get("container_platform", "Unknown"),
                "container_runtime": "Unknown",
                "operating_system": "Unknown",
                "database": tech_keywords.get("database", "Unknown"),
                "cache": tech_keywords.get("cache", "Unknown"),
                "message_broker": tech_keywords.get("message_broker", "Unknown"),
                "web_server": tech_keywords.get("web_server", "Unknown"),
                "monitoring_tool": "Unknown",
                "application_name": "Unknown",
                "affected_service": "Unknown Service",
                "affected_component": "Unknown Component",
                "exception_type": error_codes[0] if error_codes else "Log Error Signature",
                "error_signature": raw_log.strip().split('\n')[0][:150] if raw_log else "",
                "error_codes": error_codes,
                "severity": heuristics_severity,
                "confidence": initial_confidence,
                "incident_type": "Unclassified Error",
                "business_impact": "Service degradation detected",
                "metrics": extracted_metrics,
                "infrastructure": {},
                "evidence": [line.strip() for line in raw_log.strip().split('\n') if any(kw in line.lower() for kw in ['error', 'fatal', 'exception', 'fail', 'timeout', 'refused', 'crash', 'oom', 'kill'])][:10],
                "important_events": [],
                "stack_trace_snippet": raw_log[:500],
                "recommended_search_queries": []
            }

    # Overlay heuristic-extracted data onto LLM output where LLM missed fields
    if not parsed_data.get("severity"):
        parsed_data["severity"] = heuristics_severity

    # Enforce strict infrastructure fields (Step 2: Never allow hardcoded fallbacks)
    if infra_meta.get("service") != "Unknown Service":
        parsed_data["affected_service"] = infra_meta["service"]
    
    if "infrastructure" not in parsed_data or not isinstance(parsed_data["infrastructure"], dict):
        parsed_data["infrastructure"] = {}
        
    for k in ["namespace", "cluster", "node", "pod"]:
        if infra_meta.get(k) != "Unknown":
            parsed_data["infrastructure"][k] = infra_meta[k]

    # Merge heuristic tech stack for any fields the LLM left as "Unknown"
    for field in ["language", "framework", "database", "cache", "message_broker", "web_server", "container_platform", "cloud_provider"]:
        llm_val = parsed_data.get(field, "").strip()
        heuristic_val = tech_keywords.get(field, "")
        if (not llm_val or llm_val == "Unknown" or llm_val == "General") and heuristic_val and heuristic_val != "Unknown":
            parsed_data[field] = heuristic_val

    # Merge heuristic-extracted metrics if LLM didn't provide them
    if not parsed_data.get("metrics") or not isinstance(parsed_data.get("metrics"), dict):
        parsed_data["metrics"] = extracted_metrics
    else:
        for k, v in extracted_metrics.items():
            if k not in parsed_data["metrics"] or not parsed_data["metrics"][k]:
                parsed_data["metrics"][k] = v

    # Merge heuristic error codes
    llm_codes = parsed_data.get("error_codes", [])
    if not isinstance(llm_codes, list):
        llm_codes = []
    merged_codes = list(set(llm_codes + error_codes))[:20]
    parsed_data["error_codes"] = merged_codes

    parsed_data["execution_time_ms"] = timer["elapsed_ms"]
    return parsed_data
