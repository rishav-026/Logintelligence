from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from database.connection import Base

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=True)
    raw_log_text = Column(Text, nullable=False)
    log_hash = Column(String, index=True, nullable=True) # SHA-256 hash for caching
    source_type = Column(String, default="paste")  # paste, log_file, json_file
    status = Column(String, default="pending")     # pending, processing, completed, failed
    severity = Column(String, nullable=True)       # Critical, High, Medium, Low
    confidence_score = Column(Float, nullable=True)# 0 - 100
    confidence_level = Column(String, nullable=True)# High Confidence, Medium Confidence, Low Confidence
    affected_service = Column(String, nullable=True)
    affected_component = Column(String, nullable=True)
    execution_time_seconds = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    outputs = relationship("AnalysisOutput", back_populates="analysis", uselist=False, cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="analysis", cascade="all, delete-orphan", order_by="AgentRun.created_at.asc()")
    search_references = relationship("SearchReference", back_populates="analysis", cascade="all, delete-orphan")

class AnalysisOutput(Base):
    __tablename__ = "analysis_outputs"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    log_summary = Column(Text, nullable=True)
    executive_summary = Column(Text, nullable=True)
    probable_root_causes = Column(Text, nullable=True) # JSON list
    evidence = Column(Text, nullable=True)
    impact = Column(Text, nullable=True)
    recommended_fixes = Column(Text, nullable=True)    # JSON list
    commands = Column(Text, nullable=True)             # JSON list
    example_code = Column(Text, nullable=True)
    preventive_actions = Column(Text, nullable=True)   # JSON list
    next_steps = Column(Text, nullable=True)           # JSON list
    structured_response_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="outputs")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    agent_name = Column(String)  # Interpreter, Researcher, Solution, Orchestrator
    step_name = Column(String, nullable=True) # Parsing Logs, Searching Documentation, etc.
    input_payload = Column(Text, nullable=True)
    output_payload = Column(Text, nullable=True)
    status = Column(String, default="running") # running, completed, failed
    execution_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="agent_runs")

class SearchReference(Base):
    __tablename__ = "search_references"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    source_title = Column(String)
    source_url = Column(String)
    relevance_score = Column(Float, nullable=True)
    relevance_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="search_references")
