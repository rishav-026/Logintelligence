from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AgentRunBase(BaseModel):
    id: Optional[int] = None
    agent_name: str
    step_name: Optional[str] = None
    status: str
    input_payload: Optional[str] = None
    output_payload: Optional[str] = None
    execution_time_ms: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SearchReferenceBase(BaseModel):
    id: Optional[int] = None
    source_title: str
    source_url: str
    relevance_score: Optional[float] = None
    relevance_note: Optional[str] = None

    class Config:
        from_attributes = True

class ProfessionalIncidentReport(BaseModel):
    incident_id: int
    incident_time: datetime
    severity: str
    confidence_score: float
    confidence_level: str
    manual_review_recommended: bool
    affected_service: Optional[str] = "Unknown Service"
    affected_component: Optional[str] = "Unknown Component"
    executive_summary: str
    issue_summary: str
    root_cause: List[str]
    evidence: str
    impact: str
    recommended_fixes: List[str]
    commands: List[str]
    example_code: Optional[str] = ""
    preventive_actions: List[str]
    next_steps: List[str]
    references: List[SearchReferenceBase] = []

    class Config:
        from_attributes = True

class AnalysisOutputBase(BaseModel):
    log_summary: str
    executive_summary: Optional[str] = ""
    probable_root_causes: List[str]
    evidence: str
    impact: Optional[str] = ""
    recommended_fixes: List[str]
    commands: Optional[List[str]] = []
    example_code: Optional[str] = ""
    preventive_actions: Optional[List[str]] = []
    next_steps: List[str]

    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    id: int
    title: Optional[str] = None
    source_type: str = "paste"
    status: str
    severity: Optional[str] = None
    confidence_score: Optional[float] = None
    confidence_level: Optional[str] = None
    manual_review_recommended: bool = False
    affected_service: Optional[str] = None
    affected_component: Optional[str] = None
    execution_time_seconds: Optional[float] = None
    created_at: datetime
    
    agent_runs: List[AgentRunBase] = []
    search_references: List[SearchReferenceBase] = []
    output: Optional[AnalysisOutputBase] = None
    report: Optional[ProfessionalIncidentReport] = None

    class Config:
        from_attributes = True

class AgentMetadataResponse(BaseModel):
    agent_name: str
    role: str
    description: str
    tools: List[str]
