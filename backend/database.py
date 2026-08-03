import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./devops_log.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=True)
    raw_log_text = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    severity = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    outputs = relationship("AnalysisOutput", back_populates="analysis", uselist=False)
    agent_runs = relationship("AgentRun", back_populates="analysis")
    search_references = relationship("SearchReference", back_populates="analysis")

class AnalysisOutput(Base):
    __tablename__ = "analysis_outputs"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    log_summary = Column(Text)
    probable_root_causes = Column(Text) # JSON string
    evidence = Column(Text)
    recommended_fixes = Column(Text) # JSON string
    next_steps = Column(Text) # JSON string
    structured_response_json = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="outputs")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    agent_name = Column(String)
    input_payload = Column(Text)
    output_payload = Column(Text)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="agent_runs")

class SearchReference(Base):
    __tablename__ = "search_references"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"))
    source_title = Column(String)
    source_url = Column(String)
    relevance_note = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    analysis = relationship("Analysis", back_populates="search_references")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
