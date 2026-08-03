import json
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks, HTTPException

from database.models import Analysis, AnalysisOutput, AgentRun, SearchReference
from schemas.responses import (
    AnalysisResponse,
    AnalysisOutputBase,
    AgentRunBase,
    SearchReferenceBase,
    ProfessionalIncidentReport,
    AgentMetadataResponse
)
from services.ingestion_service import parse_log_input
from agents.orchestrator import execute_log_analysis_pipeline
import hashlib

def create_analysis_record(db: Session, raw_log_text: str, source_type: str, background_tasks: BackgroundTasks) -> AnalysisResponse:
    sanitized_text, format_type = parse_log_input(raw_log_text, source_type)

    # SHA-256 Hash for caching
    log_hash = hashlib.sha256(sanitized_text.encode('utf-8')).hexdigest()
    
    # Check if a completed analysis with this hash already exists
    existing_analysis = db.query(Analysis).filter(
        Analysis.log_hash == log_hash,
        Analysis.status == "completed"
    ).order_by(Analysis.created_at.desc()).first()
    
    if existing_analysis:
        return build_analysis_response(existing_analysis)

    title = f"Analysis {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"
    db_analysis = Analysis(
        raw_log_text=sanitized_text,
        log_hash=log_hash,
        source_type=format_type,
        status="pending",
        title=title
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    background_tasks.add_task(execute_log_analysis_pipeline, db_analysis.id)
    return build_analysis_response(db_analysis)

def get_analyses_history(db: Session) -> List[AnalysisResponse]:
    analyses = db.query(Analysis).order_by(Analysis.created_at.desc()).all()
    return [build_analysis_response(a) for a in analyses]

def get_analysis_details(db: Session, analysis_id: int) -> AnalysisResponse:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis with ID {analysis_id} not found.")
    return build_analysis_response(analysis)

def delete_analysis(db: Session, analysis_id: int) -> dict:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis with ID {analysis_id} not found.")
    db.delete(analysis)
    db.commit()
    return {"status": "success", "message": f"Report #{analysis_id} deleted successfully."}

def reanalyze_log(db: Session, analysis_id: int, background_tasks: BackgroundTasks) -> AnalysisResponse:
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail=f"Analysis with ID {analysis_id} not found.")

    # Reset existing run records and status
    db.query(AgentRun).filter(AgentRun.analysis_id == analysis_id).delete()
    db.query(SearchReference).filter(SearchReference.analysis_id == analysis_id).delete()
    if analysis.outputs:
        db.delete(analysis.outputs)

    analysis.status = "pending"
    analysis.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(analysis)

    background_tasks.add_task(execute_log_analysis_pipeline, analysis.id)
    return build_analysis_response(analysis)

def get_agents_metadata() -> List[AgentMetadataResponse]:
    return [
        AgentMetadataResponse(
            agent_name="DevOps Log Interpreter",
            role="Agent 1 - Log & Exception Diagnostics",
            description="Parses unstructured logs, extracts stack traces, detects language/framework, and classifies initial severity heuristics.",
            tools=["Stack Trace Extractor", "Severity Rule Engine", "Tech Stack Detector"]
        ),
        AgentMetadataResponse(
            agent_name="Solution Researcher",
            role="Agent 2 - Documentation & Search Specialist",
            description="Formulates contextual search queries (Language + Framework + Service + Error), searches Stack Overflow, GitHub Issues, and ranks top references.",
            tools=["DuckDuckGo Search API", "Contextual Query Optimizer", "Reference Relevance Ranker"]
        ),
        AgentMetadataResponse(
            agent_name="Incident Synthesizer",
            role="Agent 3 - SRE Incident Report Specialist",
            description="Performs SRE reasoning across Agent 1 & 2 findings to synthesize production-grade incident reports with CLI commands, code fixes, confidence scoring, and manual review warnings.",
            tools=["SRE Reasoning Engine", "Confidence Calculator", "Report Schema Synthesizer"]
        ),
        AgentMetadataResponse(
            agent_name="CrewAI Orchestrator",
            role="Workflow Coordinator",
            description="Coordinates agent tasks sequentially, updates granular progress steps, handles errors, and records execution audit trails in SQLite.",
            tools=["CrewAI Agent Task Manager", "Step Progress Tracker", "Audit Trail Recorder"]
        )
    ]

def build_analysis_response(db_analysis: Analysis) -> AnalysisResponse:
    output_base = None
    report = None

    if db_analysis.outputs:
        try:
            root_causes = json.loads(db_analysis.outputs.probable_root_causes or "[]")
            recommended_fixes = json.loads(db_analysis.outputs.recommended_fixes or "[]")
            commands = json.loads(db_analysis.outputs.commands or "[]")
            preventive_actions = json.loads(db_analysis.outputs.preventive_actions or "[]")
            next_steps = json.loads(db_analysis.outputs.next_steps or "[]")

            output_base = AnalysisOutputBase(
                log_summary=db_analysis.outputs.log_summary or "",
                executive_summary=db_analysis.outputs.executive_summary or "",
                probable_root_causes=root_causes,
                evidence=db_analysis.outputs.evidence or "",
                impact=db_analysis.outputs.impact or "",
                recommended_fixes=recommended_fixes,
                commands=commands,
                example_code=db_analysis.outputs.example_code or "",
                preventive_actions=preventive_actions,
                next_steps=next_steps
            )

            refs = [
                SearchReferenceBase(
                    id=r.id,
                    source_title=r.source_title,
                    source_url=r.source_url,
                    relevance_score=r.relevance_score,
                    relevance_note=r.relevance_note
                ) for r in db_analysis.search_references
            ]

            score = db_analysis.confidence_score or 75.0
            confidence_level = db_analysis.confidence_level or ("High Confidence" if score >= 85 else "Medium Confidence" if score >= 60 else "Low Confidence")

            report = ProfessionalIncidentReport(
                incident_id=db_analysis.id,
                incident_time=db_analysis.created_at,
                severity=db_analysis.severity or "Medium",
                confidence_score=score,
                confidence_level=confidence_level,
                manual_review_recommended=(score < 60.0),
                affected_service=db_analysis.affected_service or "Unknown Service",
                affected_component=db_analysis.affected_component or "Unknown Component",
                executive_summary=db_analysis.outputs.executive_summary or db_analysis.outputs.log_summary or "",
                issue_summary=db_analysis.outputs.log_summary or "",
                root_cause=root_causes,
                evidence=db_analysis.outputs.evidence or "",
                impact=db_analysis.outputs.impact or "",
                recommended_fixes=recommended_fixes,
                commands=commands,
                example_code=db_analysis.outputs.example_code or "",
                preventive_actions=preventive_actions,
                next_steps=next_steps,
                references=refs
            )
        except Exception:
            output_base = None
            report = None

    agent_runs = [
        AgentRunBase(
            id=r.id,
            agent_name=r.agent_name,
            step_name=r.step_name,
            status=r.status,
            input_payload=r.input_payload,
            output_payload=r.output_payload,
            execution_time_ms=r.execution_time_ms,
            created_at=r.created_at
        ) for r in db_analysis.agent_runs
    ]

    references = [
        SearchReferenceBase(
            id=r.id,
            source_title=r.source_title,
            source_url=r.source_url,
            relevance_score=r.relevance_score,
            relevance_note=r.relevance_note
        ) for r in db_analysis.search_references
    ]

    score = db_analysis.confidence_score or 75.0
    return AnalysisResponse(
        id=db_analysis.id,
        title=db_analysis.title,
        source_type=db_analysis.source_type or "paste",
        status=db_analysis.status,
        severity=db_analysis.severity,
        confidence_score=score,
        confidence_level=db_analysis.confidence_level or ("High Confidence" if score >= 85 else "Medium Confidence" if score >= 60 else "Low Confidence"),
        manual_review_recommended=(score < 60.0),
        affected_service=db_analysis.affected_service,
        affected_component=db_analysis.affected_component,
        execution_time_seconds=db_analysis.execution_time_seconds,
        created_at=db_analysis.created_at,
        agent_runs=agent_runs,
        search_references=references,
        output=output_base,
        report=report
    )
