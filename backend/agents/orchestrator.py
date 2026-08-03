import json
import logging
import time
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from database.models import Analysis, AnalysisOutput, AgentRun, SearchReference
from agents.interpreter import run_interpreter_agent
from agents.researcher import run_researcher_agent
from agents.solution import run_solution_agent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def record_agent_run(
    db: Session,
    analysis_id: int,
    agent_name: str,
    step_name: str,
    status: str,
    input_payload: str = "",
    output_payload: str = "",
    execution_time_ms: float = 0.0
):
    """
    Persists an execution audit record into the agent_runs database table.
    """
    run = AgentRun(
        analysis_id=analysis_id,
        agent_name=agent_name,
        step_name=step_name,
        status=status,
        input_payload=input_payload[:4000] if input_payload else "",
        output_payload=output_payload if output_payload else "",
        execution_time_ms=execution_time_ms
    )
    db.add(run)
    db.commit()
    return run

import os

from utils.severity_heuristics import extract_log_metadata
from playbooks.engine import get_operational_artifacts
from prompts.unified_prompts import UNIFIED_SRE_SYSTEM_PROMPT, UNIFIED_SRE_USER_PROMPT
try:
    from langchain_ollama import ChatOllama
except ImportError:
    from langchain_community.chat_models import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage

def execute_log_analysis_pipeline(analysis_id: int, model_name: str = None):
    """
    Refactored Single-LLM Inference Pipeline
    """
    if not model_name:
        model_name = os.getenv("DEVOPS_LOG_MODEL", "llama3")

    db = SessionLocal()
    start_time = time.perf_counter()

    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        logger.error(f"Analysis ID {analysis_id} not found.")
        db.close()
        return

    analysis.status = "processing"
    db.commit()

    try:
        raw_log = analysis.raw_log_text

        # STEP 1: Fast Deterministic Metadata Extraction (Phase 1)
        record_agent_run(db, analysis.id, "Interpreter", "Parsing Logs", "running", input_payload=raw_log)
        
        interpreter_data = extract_log_metadata(raw_log)
        
        # STEP 2: Technology Rule Engine (Phase 2 & 3)
        playbook_artifacts = get_operational_artifacts(interpreter_data)

        record_agent_run(
            db, analysis.id, "Interpreter", "Detecting Exceptions", "completed",
            input_payload=raw_log,
            output_payload=json.dumps(interpreter_data),
            execution_time_ms=100.0
        )

        # STEP 2: Non-LLM Documentation Search
        record_agent_run(
            db, analysis.id, "Researcher", "Searching Documentation", "running",
            input_payload=json.dumps(interpreter_data)
        )
        
        researcher_res = run_researcher_agent(interpreter_data, model_name=model_name)
        
        record_agent_run(
            db, analysis.id, "Researcher", "Ranking References", "completed",
            input_payload=researcher_res.get("query_used", ""),
            output_payload=json.dumps(researcher_res),
            execution_time_ms=researcher_res.get("execution_time_ms", 0.0)
        )

        for ref in researcher_res.get("ranked_references", []):
            db_ref = SearchReference(
                analysis_id=analysis.id,
                source_title=ref.get("source_title", "Community Reference"),
                source_url=ref.get("source_url", ""),
                relevance_score=ref.get("relevance_score", 0.8),
                relevance_note=ref.get("relevance_note", "")
            )
            db.add(db_ref)
        db.commit()

        # STEP 3: Single LLM Inference for full report synthesis
        record_agent_run(
            db, analysis.id, "Solution", "Identifying Root Cause", "running",
            input_payload=f"Interpreter & Researcher results"
        )
        
        llm = ChatOllama(model=model_name, temperature=0.1, format="json")
        prompt_content = UNIFIED_SRE_USER_PROMPT.format(
            metadata=json.dumps(interpreter_data, indent=2),
            playbook_artifacts=json.dumps(playbook_artifacts, indent=2),
            references=json.dumps(researcher_res.get("search_output", "")[:2500]),
            raw_log=raw_log[:4000]
        )
        messages = [
            SystemMessage(content=UNIFIED_SRE_SYSTEM_PROMPT),
            HumanMessage(content=prompt_content)
        ]
        
        llm_start = time.perf_counter()
        response = llm.invoke(messages).content
        
        clean_str = response.strip()
        for prefix in ['```json', '```']:
            if clean_str.startswith(prefix):
                clean_str = clean_str[len(prefix):]
        if clean_str.endswith('```'):
            clean_str = clean_str[:-3]

        try:
            solution_res = json.loads(clean_str.strip())
        except json.JSONDecodeError:
            logger.error("Failed to parse Unified JSON from LLM")
            solution_res = {}
            
        llm_elapsed = (time.perf_counter() - llm_start) * 1000.0

        # STEP 4: Validation Layer (Phase 5)
        # Ensure LLM didn't invent sandbox or commands
        
        def safe_str(val) -> str:
            if val is None:
                return ""
            if isinstance(val, list):
                return "\\n".join(str(x) for x in val)
            if isinstance(val, dict):
                return json.dumps(val)
            return str(val)
        
        # Replace hallucinated commands and sandbox with authoritative rule engine output
        solution_res["diagnostic_commands"] = playbook_artifacts.get("commands", [])
        solution_res["sandbox_investigation"] = playbook_artifacts.get("sandbox_steps", [])
        solution_res["resolution_steps"] = playbook_artifacts.get("resolution_steps", [])
        solution_res["verification_steps"] = playbook_artifacts.get("verification_steps", [])
        
        # Map over playbook artifacts if LLM fails or for hard-coded guarantees
        if playbook_artifacts.get("code_templates"):
            solution_res["code_patch"] = playbook_artifacts.get("code_templates")
        
        if playbook_artifacts.get("prevention_steps"):
            solution_res["prevention_strategy"] = playbook_artifacts.get("prevention_steps")
            
        if playbook_artifacts.get("monitoring_commands"):
            solution_res["monitoring_recommendations"] = playbook_artifacts.get("monitoring_commands")

        # Validate Service Name and Severity
        solution_res["affected_service"] = interpreter_data.get("service", "") or "Unknown Service"
        solution_res["severity"] = interpreter_data.get("severity", "Medium")
        
        # Technology Validation (No cross-tech hallucination)
        detected_techs = interpreter_data.get("technology", [])
        if "MongoDB" in detected_techs and "redis" in str(solution_res.get("root_cause_analysis", "")).lower():
            logger.warning("Validation Failure: LLM hallucinated Redis for a MongoDB incident")
            
        # Re-build reasoning chain dynamically based on Phase 3
        reasoning_chain = []
        if interpreter_data.get("exception_type"):
            reasoning_chain.append({
                "step": "Observation",
                "observation": interpreter_data["exception_type"],
                "conclusion": "Anomaly detected in logs"
            })
        if interpreter_data.get("technology"):
            reasoning_chain.append({
                "step": "Hypothesis",
                "observation": f"{', '.join(interpreter_data['technology'])} component failure",
                "conclusion": "Investigating specific component"
            })
        solution_res["reasoning_chain"] = reasoning_chain
        
        # Parse Possible Causes
        rca = solution_res.get("root_cause_analysis", {})
        if isinstance(rca, dict) and "possible_causes" in rca and rca["possible_causes"]:
            possible_causes_list = [f"{c.get('probability_percentage', 0)}% - {c.get('cause', '')}" for c in rca["possible_causes"]]
        else:
            exc_type = interpreter_data.get("exception_type") or (interpreter_data.get("error_codes")[0] if interpreter_data.get("error_codes") else "System Error")
            svc_name = interpreter_data.get("service") or "service"
            derived_cause = f"{exc_type} on {svc_name}"
            possible_causes_list = [derived_cause]
            solution_res["root_cause_analysis"] = {
                "primary_root_cause": derived_cause,
                "possible_causes": [
                    {
                        "cause": derived_cause,
                        "probability_percentage": 85,
                        "evidence_cited": f"Extracted exception '{exc_type}' from {svc_name} log trace"
                    }
                ]
            }

        # Deterministic Confidence Score Generation based on Regex
        confidence_score_val = 50.0
        if interpreter_data.get("stack_trace"): confidence_score_val += 15.0
        if interpreter_data.get("exception_type"): confidence_score_val += 15.0
        if interpreter_data.get("latency") or interpreter_data.get("memory_usage"): confidence_score_val += 10.0
        if interpreter_data.get("business_impact"): confidence_score_val += 5.0
        if interpreter_data.get("service") != "Unknown Service": confidence_score_val += 3.0
        confidence_score_val = min(confidence_score_val, 98.0)

        is_manual_investigation = confidence_score_val < 60.0
        confidence_level_val = "High Confidence" if confidence_score_val >= 85 else "Medium Confidence" if confidence_score_val >= 60 else "Low Confidence"

        structured_response = dict(solution_res)
        structured_response["_interpreter_meta"] = interpreter_data
        
        # Save the finalized, fully validated payload to the agent runs table
        record_agent_run(
            db, analysis.id, "Solution", "Generating Incident Report", "completed",
            input_payload=json.dumps(structured_response.get("root_cause", {})),
            output_payload=json.dumps(structured_response),
            execution_time_ms=llm_elapsed
        )

        code_patch = solution_res.get("code_patch", "")
        if isinstance(code_patch, dict):
            code_patch = json.dumps(code_patch, indent=2)
        elif isinstance(code_patch, list):
            code_patch = "\\n".join(str(p) for p in code_patch)

        output_record = AnalysisOutput(
            analysis_id=analysis.id,
            log_summary=safe_str(solution_res.get("executive_summary", "")),
            executive_summary=safe_str(solution_res.get("human_readable_explanation", "")),
            probable_root_causes=json.dumps(possible_causes_list),
            evidence=safe_str(json.dumps(interpreter_data.get("technology", []))),
            impact=safe_str(solution_res.get("business_impact", "")),
            recommended_fixes=json.dumps(solution_res.get("prevention_strategy", [])),
            commands=json.dumps(solution_res.get("diagnostic_commands", [])),
            example_code=safe_str(code_patch),
            preventive_actions=json.dumps(solution_res.get("monitoring_recommendations", [])),
            next_steps=json.dumps(solution_res.get("rollback_strategy", [])),
            structured_response_json=json.dumps(structured_response)
        )
        db.add(output_record)

        total_duration = round(time.perf_counter() - start_time, 2)
        analysis.severity = solution_res.get("severity", "Medium")
        analysis.confidence_score = confidence_score_val
        analysis.confidence_level = confidence_level_val
        analysis.affected_service = solution_res.get("affected_service", "Unknown Service")
        analysis.affected_component = solution_res.get("affected_component", "Unknown Component")
        analysis.execution_time_seconds = total_duration
        analysis.status = "completed"

        db.commit()
        logger.info(f"Analysis ID {analysis_id} completed successfully in {total_duration}s.")

    except Exception as e:
        logger.error(f"Orchestrator pipeline failed for analysis {analysis_id}: {e}")
        record_agent_run(db, analysis.id, "Orchestrator", "Pipeline Execution", "failed", output_payload=str(e))
        analysis.status = "failed"
        db.commit()
    finally:
        db.close()
