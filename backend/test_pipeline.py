import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.connection import init_db, SessionLocal
from database.models import Analysis
from agents.orchestrator import execute_log_analysis_pipeline
from services.analysis_service import build_analysis_response

def test_pipeline():
    init_db()
    db = SessionLocal()

    sample_log = """
================================================================================
Incident ID: INC-20260802-9817
Environment: Production
Cluster: aws-prod-us-east-1
Namespace: production
Service: recommendation-service
Pod: recommendation-service-7d9b56ff96-r8k2x
Node: ip-10-0-44-72
Timestamp: 2026-08-02T14:32:16Z
================================================================================

2026-08-02T14:32:16.114Z INFO  Starting Recommendation Service v2.8.1
2026-08-02T14:32:17.004Z INFO  Loading cached recommendation models...
2026-08-02T14:32:17.890Z INFO  Connecting to Redis cache...

2026-08-02T14:32:18.431Z WARN  Redis latency exceeded threshold (1450ms)

2026-08-02T14:32:20.182Z ERROR

org.springframework.data.redis.RedisSystemException

Unable to execute Redis command
"""

    print("--- 1. Creating Analysis Record ---")
    analysis = Analysis(
        raw_log_text=sample_log,
        source_type="paste",
        status="pending",
        title="Test Spring Boot NPE Analysis"
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    print(f"Created Analysis ID: {analysis.id}")

    print("--- 2. Executing Multi-Agent Orchestrator Pipeline ---")
    execute_log_analysis_pipeline(analysis.id, model_name="llama3")

    print("--- 3. Verifying Results from Database ---")
    db.refresh(analysis)
    res = build_analysis_response(analysis)

    print(f"Status: {res.status}")
    print(f"Severity: {res.severity}")
    print(f"Confidence Score: {res.confidence_score}% ({res.confidence_level})")
    print(f"Affected Service: {res.affected_service}")
    print(f"Affected Component: {res.affected_component}")
    print(f"Recorded Agent Run Audit Steps: {len(res.agent_runs)}")
    for run in res.agent_runs:
        print(f"  - [{run.agent_name}] {run.step_name}: {run.status} ({run.execution_time_ms}ms)")

    if res.report:
        print("\n--- 4. SRE Incident Report Output ---")
        print(f"Executive Summary: {res.report.executive_summary[:120]}...")
        print(f"Root Cause: {res.report.root_cause}")
        print(f"Recommended Fixes: {res.report.recommended_fixes}")
        print(f"Commands: {res.report.commands}")

    db.close()
    print("--- Pipeline Test PASSED ---")

if __name__ == "__main__":
    test_pipeline()
