from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AnalyzeRequest(BaseModel):
    raw_log_text: str

class AgentRunBase(BaseModel):
    agent_name: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class AnalysisOutputBase(BaseModel):
    log_summary: str
    probable_root_causes: List[str]
    evidence: str
    recommended_fixes: List[str]
    next_steps: List[str]

    class Config:
        orm_mode = True

class AnalysisResponse(BaseModel):
    id: int
    title: Optional[str] = None
    status: str
    severity: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    
    agent_runs: List[AgentRunBase] = []
    output: Optional[AnalysisOutputBase] = None

    class Config:
        orm_mode = True
