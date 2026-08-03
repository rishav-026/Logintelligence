from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database.connection import get_db
from schemas.requests import AnalyzeRequest, ReanalyzeRequest
from schemas.responses import AnalysisResponse, AgentMetadataResponse
from services.analysis_service import (
    create_analysis_record,
    get_analyses_history,
    get_analysis_details,
    delete_analysis,
    reanalyze_log,
    get_agents_metadata
)

router = APIRouter(prefix="/api", tags=["Log Intelligence API"])

@router.get("/health", summary="Service Health Check")
def health_check():
    return {"status": "ok", "service": "DevOps Log Intelligence System", "version": "2.0.0"}

@router.post("/analyze", response_model=AnalysisResponse, summary="Analyze Raw Log")
def analyze_log(request: AnalyzeRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    return create_analysis_record(db, request.raw_log_text, request.source_type or "paste", background_tasks)

@router.get("/history", response_model=List[AnalysisResponse], summary="Get Analysis History")
def get_history(db: Session = Depends(get_db)):
    return get_analyses_history(db)

@router.get("/report/{id}", response_model=AnalysisResponse, summary="Get Incident Report by ID")
def get_report(id: int, db: Session = Depends(get_db)):
    return get_analysis_details(db, id)

@router.delete("/report/{id}", summary="Delete Incident Report")
def delete_report(id: int, db: Session = Depends(get_db)):
    return delete_analysis(db, id)

@router.post("/reanalyze/{id}", response_model=AnalysisResponse, summary="Re-analyze Existing Log")
def reanalyze(id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    return reanalyze_log(db, id, background_tasks)

@router.get("/agents", response_model=List[AgentMetadataResponse], summary="List AI Agents Metadata")
def list_agents():
    return get_agents_metadata()

# --- BACKWARD-COMPATIBLE ALIASES FOR EXISTING FRONTEND CALLS ---
@router.get("/analyses", response_model=List[AnalysisResponse], include_in_schema=False)
def legacy_get_analyses(db: Session = Depends(get_db)):
    return get_analyses_history(db)

@router.get("/analyses/{id}", response_model=AnalysisResponse, include_in_schema=False)
def legacy_get_analysis(id: int, db: Session = Depends(get_db)):
    return get_analysis_details(db, id)
