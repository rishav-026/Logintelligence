# DevOps Log Intelligence & Incident Diagnostic Platform

[![System Version](https://img.shields.io/badge/System%20Version-2.0.0-blue.svg)](https://github.com/rishav-026/LogIntel)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Framework](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.11-009688.svg)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20TypeScript-000000.svg)](https://nextjs.org/)
[![UI Style](https://img.shields.io/badge/Design-Enterprise%20Datadog%2FGrafana%20Dark-3B82F6.svg)](https://tailwindcss.com/)
[![AI Engine](https://img.shields.io/badge/AI-Ollama%20%7C%20LLaMA3-FF6F00.svg)](https://ollama.ai/)

An enterprise-grade, multi-agent automated Site Reliability Engineering (SRE) diagnostic system. It transforms raw, unstructured, multi-line production logs (spanning microservices, cloud platforms, databases, message queues, containers, and orchestrators) into deterministic, structured incident reports and step-by-step interactive investigation runbooks.

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Project Goals](#4-project-goals)
5. [System Architecture](#5-system-architecture)
6. [Overall Workflow](#6-overall-workflow)
7. [Enterprise Root Cause Analysis Engine](#7-enterprise-root-cause-analysis-engine)
8. [Interactive SRE Investigation Workspace](#8-interactive-sre-investigation-workspace)
9. [Technology Stack](#9-technology-stack)
10. [Folder Structure](#10-folder-structure)
11. [Regex Parser & Rule Engine](#11-regex-parser--rule-engine)
12. [Technology Playbooks](#12-technology-playbooks)
13. [Validation & Anti-Hallucination Layer](#13-validation--anti-hallucination-layer)
14. [Installation & Setup Guide](#14-installation--setup-guide)
15. [API Documentation](#15-api-documentation)
16. [Database Schema](#16-database-schema)
17. [Conclusion](#17-conclusion)

---

## 1. Project Overview

### 1.1 What This Project Is
The **DevOps Log Intelligence & Incident Diagnostic Platform** is a hybrid deterministic-agentic SRE automation system. Unlike generic AI log tools or standard LLM wrapper applications, this platform combines high-speed regular expression metadata extractors, a Technology Detection Engine, a Technology Rule Engine backed by domain-specific SRE playbooks, web-search documentation retrieval, and a local LLM reasoning core.

Crucially, all operational artifacts—including diagnostic terminal commands, expected command outputs, step-by-step investigation stages, verification checks, and configuration patches—are generated **100% deterministically** by technology playbooks, guaranteeing zero AI command hallucinations during production incident remediation.

### 1.2 Why It Was Created
Modern distributed cloud systems generate gigabytes of log telemetry every minute. When a critical incident occurs (such as a `CrashLoopBackOff`, `OOMKilled` pod, MongoDB `$group` memory cap breach, Redis cache exhaustion, or Kafka consumer group rebalance), SREs and DevOps engineers face high Mean Time to Detect (MTTD) and Mean Time to Resolve (MTTR).

Generic Large Language Models (LLMs) used directly for log analysis frequently suffer from catastrophic failure modes in production:
1. **Hallucinated Diagnostic Commands:** Generating non-existent flags or dangerous commands (`rm -rf` equivalents).
2. **Context Fragmentation:** Failing to correlate infrastructure metrics (CPU %, memory limits) with container lifecycle events.
3. **Inconsistent RCA Reports:** Producing arbitrary text formats that cannot be ingested into automated ticketing systems (Jira, ServiceNow, PagerDuty).

This platform was built to bridge the gap between telemetry visualization and automated incident resolution by establishing a strict contract where AI performs contextual narrative synthesis while hard-coded SRE playbooks dictate precise operational steps.

### 1.3 Key Capabilities
- **Multi-Agent Pipeline:** Interpreter Agent, Researcher Agent, Solution Synthesizer Agent, and Pipeline Orchestrator.
- **Automated Technology Detection:** Identifies Docker, Kubernetes, MongoDB, Redis, PostgreSQL, Kafka, RabbitMQ, NGINX, Spring Boot, Python, FastAPI, Node.js, and Java automatically.
- **Rule Engine & Technology Playbooks:** Pre-compiled operational runbooks for key infrastructure technologies.
- **Single-Active SRE Investigation Workspace:** Step-by-step state machine guiding engineers through incident validation with simulated shell execution.
- **Deterministic Confidence Scoring:** Algorithmic calculation of report confidence (50.0% to 98.0%) based on verified log facts.
- **Enterprise Dark Aesthetics:** Styled after Datadog Incident Management and Grafana On-Call (`#0B1220` Primary Background, `#111827` Secondary Background, `#1E293B` Card Background, `#3B82F6` Primary Blue, `#06B6D4` Cyan).

---

## 2. Problem Statement

### 2.1 The Crisis of Enterprise Log Telemetry
In contemporary microservice architectures running on Kubernetes, Docker, and hybrid clouds, a single request failure can trigger cascade errors across dozens of downstream services. Production environments routinely encounter:
- **Alert Fatigue:** Engineers flooded with metric spikes and wall-of-text log outputs during Sev-1/Sev-2 outages.
- **Cognitive Overload:** High stress increases human operational error when executing CLI commands under pressure.
- **Dependency on Tribal Knowledge:** Knowledge of tech stack quirks (e.g., Redis `maxmemory` settings, Kafka rebalance triggers) resides with senior SREs, causing resolution bottlenecks.
- **Existing Observability Tools Lack Actionable Remediation:** Tools like Datadog or Grafana display metrics charts and log lists, but do not automatically execute root cause analysis or generate step-by-step diagnostic verification runbooks.
- **Risks of Unconstrained AI in Operations:** Using unconstrained LLMs carries risks of hallucinating database parameters or unsafe restart procedures.

---
![image](https://github.com/rishav-026/LogIntel/blob/main/LogIntelligence%20Workflow%20Diagram%20-%20visual%20selection%20(1).png)

## 3. Proposed Solution

The platform resolves these enterprise challenges through a **Unified Hybrid Execution Pipeline**:

```
+-----------------------------------------------------------------------------------+
|                                  LOG UPLOAD                                       |
|             (Raw Unstructured Text / Log File / Multi-Service Dump)              |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                              REGEX PARSER ENGINE                                  |
|         (Extracts Exception Type, Stack Traces, CPU/RAM Metrics, Events)          |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         TECHNOLOGY DETECTION ENGINE                               |
|        (Auto-Detects DB, Cache, Broker, Web Server, Container, Orchestrator)      |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                                 RULE ENGINE                                       |
|           (Maps Detected Tech Stack -> Selects Technology Playbook)              |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                            TECHNOLOGY PLAYBOOKS                                   |
|   (Provides Hard-Coded Diagnostic Commands, Sandbox Stages, Code Patches)         |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                             LLM SYNTHESIS LAYER                                   |
|       (Generates Executive Summary, Root Cause Hypothesis, Impact Narrative)      |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        VALIDATION & ANTI-HALLUCINATION                            |
|       (Overrides AI Output with Playbook Rules; Computes Confidence Score)        |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                         STRUCTURED JSON RESPONSE CONTRACT                         |
|           (Strict Backend JSON Schema Persisted in SQLite / Database)            |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           FRONTEND RENDERING LAYER                                |
|        (Pure Presentation Layer; Renders Deterministic JSON directly)             |
+-----------------------------------------------------------------------------------+
                        /                           \
                       /                             \
                      v                               v
+------------------------------------+   +------------------------------------+
|  INTERACTIVE INVESTIGATION WORKSPACE |   |    14-SECTION INCIDENT REPORT      |
|  (Step-by-step stage execution)    |   |    (Executive & Technical view)    |
+------------------------------------+   +------------------------------------+
```

---

## 4. Project Goals

### 4.1 Functional Goals
- Parse any standard Linux, Kubernetes, Docker, Java, Python, Node.js, Go, or database log format without prior manual schema configuration.
- Construct an interactive SRE Investigation Workspace containing stage-by-stage command execution cards.
- Generate structured post-incident report data including Root Cause Analysis, Evidence Correlation, Business Impact, and Prevention Strategies.

### 4.2 Technical Goals
- Zero LLM command hallucinations via hard-coded Playbook overrides.
- Fast execution throughput (pipeline completes in < 3 seconds when using optimized local models or deterministic fallbacks).
- Clean separation of concerns: Backend owns data logic and parsing; Frontend owns pure UI presentation.
- 100% type safety and strict schema compliance using Pydantic on the backend and TypeScript interfaces on the frontend.

---

## 5. System Architecture

The platform architecture follows a modular, decoupled micro-architecture layout split cleanly between a Python FastAPI backend and a Next.js (React 18) frontend:

```
+-----------------------------------------------------------------------------------+
|                                 NEXT.JS FRONTEND                                  |
|                                                                                   |
|   +-----------------------+   +-----------------------+   +-------------------+   |
|   |  Home / Upload Page   |   |   Incident History    |   |  Report Dashboard |   |
|   |   (app/page.tsx)      |   | (app/history/page.tsx)|   | (app/report/[id]) |   |
|   +-----------------------+   +-----------------------+   +-------------------+   |
|                                                                     |             |
|                                                           +-------------------+   |
|                                                           | SRE Workspace Page|   |
|                                                           | (.../workspace)   |   |
|                                                           +-------------------+   |
+-----------------------------------------------------------------------------------+
                                         |  HTTP / REST API (JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                                 FASTAPI BACKEND                                   |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                           API Router (api/routes.py)                      |   |
|   +---------------------------------------------------------------------------+   |
|                                         |                                         |
|                                         v                                         |
|   +---------------------------------------------------------------------------+   |
|   |                    Orchestrator Pipeline (agents/orchestrator.py)          |   |
|   +---------------------------------------------------------------------------+   |
|             /                           |                           \             |
|            v                            v                            v            |
|   +------------------+        +------------------+        +-------------------+   |
|   | Heuristics Engine|        |  Rule Engine &   |        | Multi-Agent LLM   |   |
|   | (utils/severity) |        |    Playbooks     |        | (Interpreter,     |   |
|   +------------------+        | (playbooks/*)    |        |  Researcher, Sol) |   |
|                               +------------------+        +-------------------+   |
|                                         |                                         |
|                                         v                                         |
|   +---------------------------------------------------------------------------+   |
|   |                      Validation Layer (Post-Processing)                   |   |
|   +---------------------------------------------------------------------------+   |
|                                         |                                         |
|                                         v                                         |
|   +---------------------------------------------------------------------------+   |
|   |                   Database Persistence (SQLAlchemy / SQLite)             |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 6. Overall Workflow

Every log submission undergoes a 5-stage processing lifecycle:

| Stage | Name | Processing | Output |
| :--- | :--- | :--- | :--- |
| **Stage 1** | **Ingestion & Hashing** | Computes SHA-256 hash; checks DB cache for existing identical log. | `Analysis` record (`status=pending`) |
| **Stage 2** | **Regex & Tech Detection** | Extracts severity, metrics (CPU, RAM, latency), infrastructure tags (namespace, pod, node), and technology keywords. | `interpreter_data` JSON dict |
| **Stage 3** | **Rule Engine & Playbooks** | Matches detected tech stack against pre-compiled playbooks (`mongodb.py`, `redis.py`, `kubernetes.py`, etc.). | `playbook_artifacts` JSON dict |
| **Stage 4** | **Researcher & LLM Synthesis** | Executes DuckDuckGo search queries for doc references; prompts local LLM for narrative synthesis. | `solution_res` JSON dict |
| **Stage 5** | **Validation & Persistence** | Overwrites any AI commands/sandbox steps with `playbook_artifacts`; computes deterministic confidence score; persists to SQLite. | Final JSON returned to UI |

---
![image](https://github.com/rishav-026/LogIntel/blob/main/LogIntelligence%20Workflow%20Diagram%20-%20visual%20selection.png)

## 7. Enterprise Root Cause Analysis Engine

The **Root Cause Analysis (RCA)** panel models modern enterprise observability platforms (Datadog Incident Management, Splunk, Dynatrace, Grafana Incident):

```
+-----------------------------------------------------------------------------------+
| 1. ROOT CAUSE CONCLUSION: Engineering summary explaining WHY the incident occurred |
+-----------------------------------------------------------------------------------+
| 2. WHY THIS HAPPENED: Deterministic telemetry explanation derived from log facts  |
+-----------------------------------------------------------------------------------+
| 3. EVIDENCE CHAIN: Memory Usage: 8.4GB -> RedisCommandTimeoutException -> Exit Code 137 -> HTTP 503 |
+-----------------------------------------------------------------------------------+
| 4. INCIDENT TIMELINE: Stage 1 -> Stage 2 -> Stage 3 chronological event sequence   |
+-----------------------------------------------------------------------------------+
| 5. CONTRIBUTING FACTORS: Bulleted supporting evidence items                       |
+-----------------------------------------------------------------------------------+
| 6. CLASSIFICATION: Category | Subcategory | Technology | Environment | Severity    |
+-----------------------------------------------------------------------------------+
| 7. CONFIDENCE BREAKDOWN: 83% Confidence | Verified Evidence | Missing Streams    |
+-----------------------------------------------------------------------------------+
| 8. REJECTED HYPOTHESES: Alternative causes considered and disproved           |
+-----------------------------------------------------------------------------------+
```

### Strict Data Integrity Rules:
- **No AI Wording In CLI Commands:** All diagnostic commands originate from hard-coded playbooks.
- **Null Hiding:** Subsections (e.g. Rejected Hypotheses, Contributing Factors) are completely hidden if backend data is absent.
- **Enterprise Palette:** Rendered using `#111827` background, `#1E293B` cards, `#3B82F6` primary blue, and `#06B6D4` cyan.

---

## 8. Interactive SRE Investigation Workspace

The **Investigation Workspace** (`/report/[id]/workspace`) is a guided incident investigation terminal interface:
- **WARP-SHELL-V2 Terminal Window:** Simulates real CLI execution for active diagnostic steps.
- **Stage Stepper Bar:** Visual progress tracking across all diagnostic checks.
- **Active Stage Spec:** Displays executing CLI commands with one-click copy, purpose, and AI conclusions.
- **Collected Evidence Board:** Dynamic table tracking verified service properties and command outputs.
- **AI Reasoning Pipeline:** Displays active hypotheses, anomaly descriptions, confidence scores, and next SRE checks.
- **Dependency Graph:** Visual target service and root cause relationship diagram.

---

## 9. Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | High-performance React 18 framework with TypeScript |
| **Styling System** | Tailwind CSS | Enterprise Datadog/Grafana dark theme design system |
| **Icons & Micro-animations** | Lucide React & Framer Motion | Smooth 200ms UI transitions and SRE iconography |
| **Backend API Server** | FastAPI (Python 3.11) | High-performance async ASGI REST API |
| **Database & ORM** | SQLAlchemy & SQLite | Relational persistence for incident analyses and agent logs |
| **AI Orchestration** | LangChain & Ollama (LLaMA3) | Privacy-preserving local LLM narrative synthesis |
| **Search Integration** | DuckDuckGo Search API | Live official documentation reference retrieval |

---

## 10. Folder Structure

```
Devops_log_Analyzer/
├── README.md                             # Main System Documentation
├── DOCUMENTATION.md                      # Comprehensive Engineering Standard
├── devops_log.db                         # SQLite Database File
├── backend/                              # Python FastAPI Backend
│   ├── main.py                           # Application Entrypoint & CORS Config
│   ├── database.py / connection.py       # Database Connection Setup
│   ├── agents/                           # Multi-Agent Framework
│   │   ├── interpreter.py                # Agent 1: Regex & Heuristics Fact Parser
│   │   ├── researcher.py                 # Agent 2: Doc Search & Ranking
│   │   ├── solution.py                   # Agent 3: Solution Synthesizer
│   │   └── orchestrator.py               # Master Pipeline Execution Engine
│   ├── api/                              # REST API Router
│   │   └── routes.py                     # API Endpoints (/analyze, /report, /history)
│   ├── playbooks/                        # SRE Technology Playbooks & Rule Engine
│   │   ├── engine.py                     # Playbook Matcher & Artifact Merger
│   │   ├── docker.py / kubernetes.py     # Container & Orchestrator Playbooks
│   │   ├── mongodb.py / redis.py / postgres.py # Database Playbooks
│   │   └── kafka.py / rabbitmq.py / nginx.py   # Messaging & Proxy Playbooks
│   ├── prompts/                          # SRE System Prompts
│   ├── schemas/                          # Pydantic Request & Response Schemas
│   └── utils/                            # Regex & Severity Heuristics
└── frontend/                             # Next.js 14 Frontend Application
    ├── app/                              # Next.js App Router Pages
    │   ├── page.tsx                      # Home Log Upload Page
    │   ├── analyze/page.tsx              # AI Diagnostics Workspace
    │   ├── history/page.tsx              # Incident Timeline Audit History
    │   └── report/[id]/                  # Master 14-Section Incident Report
    │       ├── page.tsx                  # Incident Report View
    │       └── workspace/page.tsx        # Guided SRE Investigation Workspace
    └── components/                       # Modular React UI Components
        └── report/                       # 14 Incident Report Section Components
```

---

![image](https://github.com/rishav-026/LogIntel/blob/main/ChatGPT%20Image%20Aug%204%2C%202026%2C%2011_22_21%20AM.png)

## 11. Regex Parser & Rule Engine

The backend Regex Parser (`backend/utils/severity_heuristics.py`) extracts critical operational telemetry in under **10 milliseconds**:

```python
# Severity & Exception Pattern Matching
SEVERITY_PATTERNS = {
    'Critical': [r'FATAL', r'CRITICAL', r'OOMKilled', r'CrashLoopBackOff', r'OutOfMemoryError'],
    'High':     [r'ERROR', r'EXCEPTION', r'TimeoutException', r'ConnectionRefused'],
    'Medium':   [r'WARN', r'WARNING', r'Deprecated'],
    'Low':      [r'INFO', r'DEBUG', r'TRACE']
}

METRIC_PATTERNS = {
    'cpu_usage':    r'(\d+%\s*CPU|\d+\.\d+%\s*cpu_usage)',
    'memory_usage': r'(\d+\.?\d*\s*(?:MB|GB|GiB|MiB)\s*(?:used|memory|RAM)?)',
    'latency':      r'(\d+\s*ms|\d+\.\d+\s*seconds)'
}
```

---

## 12. Technology Playbooks

Technology playbooks provide pre-compiled, verified diagnostic runbooks for key infrastructure components:

| Technology Playbook | Common Failures Handled | Generated Diagnostic Commands |
| :--- | :--- | :--- |
| **Kubernetes (`kubernetes.py`)** | `CrashLoopBackOff`, `OOMKilled`, `ImagePullBackOff` | `kubectl describe pod`, `kubectl logs --previous`, `kubectl top pod` |
| **Docker (`docker.py`)** | Container exit code 137, socket permission errors | `docker stats`, `docker inspect`, `docker logs --tail 100` |
| **MongoDB (`mongodb.py`)** | `$group` 100MB RAM cap, WiredTiger lock contention | `db.currentOp()`, `db.serverStatus().wiredTiger`, `db.stats()` |
| **Redis (`redis.py`)** | `maxmemory` limit, eviction policy failure | `redis-cli INFO memory`, `redis-cli MEMORY STATS`, `redis-cli CLIENT LIST` |
| **PostgreSQL (`postgres.py`)** | `max_connections` exhausted, lock deadlock | `SELECT * FROM pg_stat_activity`, `SELECT * FROM pg_locks` |
| **Kafka (`kafka.py`)** | Consumer group rebalance, broker connection timeout | `kafka-consumer-groups.sh --describe`, `kafka-topics.sh --describe` |

---

## 13. Validation & Anti-Hallucination Layer

To guarantee 100% operational safety in production, the validation engine (`backend/agents/orchestrator.py`) enforces strict post-processing overrides:

```python
# Deterministic Override over LLM Command Artifacts
if playbook_artifacts:
    solution_res["commands"] = playbook_artifacts.get("commands", [])
    solution_res["sandbox_investigation"] = playbook_artifacts.get("sandbox_investigation", [])
    solution_res["recommended_fixes"] = playbook_artifacts.get("recommended_fixes", [])
    solution_res["code_patch"] = playbook_artifacts.get("code_patch", "")
```

---

## 14. Installation & Setup Guide

### Prerequisites
- **Python 3.11+** installed
- **Node.js 18+ & npm** installed
- **Ollama** installed (optional for local LLM inference; fallback deterministic rules run automatically if Ollama is absent)

### Step 1: Clone Repository
```bash
git clone https://github.com/rishav-026/LogIntel.git
cd LogIntel
```

### Step 2: Set Up Python Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy pydantic primp requests

# Start Backend Server
python main.py
```
*Backend server will start on `http://localhost:8000`.*

### Step 3: Set Up Next.js Frontend
```bash
# Open a new terminal tab/window
cd frontend

# Install npm dependencies
npm install

# Start Frontend Dev Server
npm run dev
```
*Frontend web application will start on `http://localhost:3000`.*

---

## 15. API Documentation

### 1. Ingest & Analyze Log
- **Endpoint:** `POST /api/analyze`
- **Request Body:**
  ```json
  {
    "raw_log_text": "2026-08-03 ERROR [session-service] RedisCommandTimeoutException: Command timed out after 5000ms. OOMKilled exit code 137.",
    "source_type": "paste"
  }
  ```
- **Response:**
  ```json
  {
    "id": 15,
    "status": "completed",
    "created_at": "2026-08-03T18:45:00Z"
  }
  ```

### 2. Fetch Master Incident Report
- **Endpoint:** `GET /api/report/{id}`
- **Response:** Returns complete 14-section JSON object containing executive summaries, evidence boards, and playbook runbooks.

### 3. List Incident Audit History
- **Endpoint:** `GET /api/history`
- **Response:** Array of historical incident reports with severity, confidence score, and service tags.

### 4. Re-run AI Analysis Loop
- **Endpoint:** `POST /api/reanalyze/{id}`

### 5. Purge Report
- **Endpoint:** `DELETE /api/report/{id}`

---

## 16. Database Schema

The SQLite database (`devops_log.db`) contains 3 core tables:

1. **`analyses`:** Stores incident metadata, raw log text SHA-256 hash, service tags, severity, and processing status.
2. **`agent_runs`:** Stores step-by-step logs for individual agent executions (Interpreter, Researcher, Solution).
3. **`analysis_outputs`:** Stores the finalized validated JSON payloads rendered by the frontend.

---

## 17. Conclusion

The **DevOps Log Intelligence & Incident Diagnostic Platform** establishes an enterprise SRE standard by unifying deterministic rule engine playbooks with AI narrative synthesis. By eliminating command hallucinations, enforcing strict schema validation, and providing guided SRE runbook workspaces, the system enables DevOps teams to dramatically compress incident MTTR while maintaining 100% operational safety in production environments.

---
*Created by [Rishav](https://github.com/rishav-026/LogIntel) • Powered by Local SRE AI Agents & Technology Rule Engines.*
