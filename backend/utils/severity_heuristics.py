import re
from typing import Tuple, Dict, Any, List

# Heuristic keyword pattern mappings for incident severity classification
SEVERITY_PATTERNS = {
    "Critical": [
        r"oomkilled",
        r"out of memory",
        r"database unavailable",
        r"connection refused.*database",
        r"crashloopbackoff",
        r"disk full",
        r"no space left on device",
        r"kernel panic",
        r"fatal error",
        r"panic: runtime error",
        r"oom command not allowed",
        r"maxmemory.*exceeded",
        r"kafka.*timeout.*broker",
        r"data loss",
        r"corruption detected",
        r"segmentation fault",
        r"kill signal",
        r"oom_kill",
    ],
    "High": [
        r"memory leak",
        r"pod restart",
        r"container crash",
        r"authentication failure",
        r"permission denied.*root",
        r"http 500",
        r"500 internal server error",
        r"503 service unavailable",
        r"deadlock detected",
        r"timeout waiting for connection",
        r"imagepullbackoff",
        r"no such image",
        r"errimagepull",
        r"upstream timed out",
        r"502 bad gateway",
        r"consumer lag",
        r"redis.*timeout",
        r"connection pool exhausted",
        r"certificate.*expired",
        r"ssl.*handshake.*fail",
    ],
    "Medium": [
        r"http 502",
        r"http 504",
        r"network timeout",
        r"connection reset",
        r"retry attempts exhausted",
        r"nullpointerexception",
        r"typeerror",
        r"keyerror",
        r"unhandled promise rejection",
        r"deprecated api",
        r"connection refused",
        r"dns.*resolution.*fail",
        r"name.*resolution.*fail",
        r"kafka.*rebalance",
        r"slow query",
        r"high latency",
    ],
    "Low": [
        r"warning",
        r"info",
        r"debug",
        r"notice",
        r"rate limited",
        r"deprecated",
        r"skipping",
    ]
}

def detect_severity(raw_log: str) -> Tuple[str, float]:
    """
    Evaluates raw log text against DevOps heuristics rules.
    Returns a tuple of (severity_string, initial_confidence_bonus).
    """
    log_lower = raw_log.lower()

    for severity, patterns in SEVERITY_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, log_lower):
                return severity, 0.85 if severity in ["Critical", "High"] else 0.75

    return "Medium", 0.70

def extract_tech_stack_keywords(raw_log: str) -> Dict[str, str]:
    """
    Scans log contents to auto-detect language, framework, database, cache,
    message broker, web server, container platform, and cloud provider.
    """
    log_lower = raw_log.lower()
    
    # Language detection
    language = "Unknown"
    if any(k in log_lower for k in ["traceback (most recent call last)", ".py:", "site-packages", "django", "flask", "fastapi"]):
        language = "Python"
    elif any(k in log_lower for k in ["java.lang.", ".java:", "spring", "maven", "gradle", "hibernat", "at com.", "at org."]):
        language = "Java"
    elif any(k in log_lower for k in ["node_modules", "at async", ".js:", ".ts:", "express", "next.js", "react"]):
        language = "Node.js/TypeScript"
    elif any(k in log_lower for k in ["goroutine", ".go:", "go/src", "panic:"]):
        language = "Go"
    elif any(k in log_lower for k in ["kubectl", "k8s", "etcd", "kubelet"]):
        language = "Kubernetes/Go"

    # Framework detection
    framework = "General"
    if "spring" in log_lower:
        framework = "Spring Boot"
    elif "fastapi" in log_lower:
        framework = "FastAPI"
    elif "django" in log_lower:
        framework = "Django"
    elif "express" in log_lower:
        framework = "Express.js"
    elif "next.js" in log_lower or "nextjs" in log_lower:
        framework = "Next.js"
    elif any(k in log_lower for k in ["kubernetes", "k8s", "crashloopbackoff", "kubectl"]):
        framework = "Kubernetes"
    elif any(k in log_lower for k in ["docker", "containerd", "dockerd"]):
        framework = "Docker"
    elif "nginx" in log_lower:
        framework = "NGINX"
    elif "flask" in log_lower:
        framework = "Flask"
    elif "rails" in log_lower or "ruby" in log_lower:
        framework = "Ruby on Rails"

    # Database detection
    database = "Unknown"
    if any(k in log_lower for k in ["postgresql", "postgres", "psql", "pg_", "psycopg", "5432"]):
        database = "PostgreSQL"
    elif any(k in log_lower for k in ["mysql", "mariadb", "3306"]):
        database = "MySQL"
    elif any(k in log_lower for k in ["mongodb", "mongo", "27017"]):
        database = "MongoDB"
    elif any(k in log_lower for k in ["sqlserver", "mssql", "1433"]):
        database = "SQL Server"

    # Cache detection
    cache = "Unknown"
    if any(k in log_lower for k in ["redis", "6379", "redis-cli", "lettuce", "jedis"]):
        cache = "Redis"
    elif any(k in log_lower for k in ["memcached", "11211"]):
        cache = "Memcached"

    # Message broker detection
    message_broker = "Unknown"
    if any(k in log_lower for k in ["kafka", "9092", "consumer-group", "kafka-topics"]):
        message_broker = "Kafka"
    elif any(k in log_lower for k in ["rabbitmq", "amqp", "5672"]):
        message_broker = "RabbitMQ"
    elif any(k in log_lower for k in ["sqs", "sns"]):
        message_broker = "AWS SQS/SNS"

    # Web server detection
    web_server = "Unknown"
    if "nginx" in log_lower:
        web_server = "NGINX"
    elif "apache" in log_lower or "httpd" in log_lower:
        web_server = "Apache"
    elif "traefik" in log_lower:
        web_server = "Traefik"
    elif "envoy" in log_lower:
        web_server = "Envoy"

    # Container platform detection
    container_platform = "Unknown"
    if any(k in log_lower for k in ["kubernetes", "k8s", "kubectl", "kubelet", "pod", "crashloopbackoff"]):
        container_platform = "Kubernetes"
    elif any(k in log_lower for k in ["ecs", "fargate"]):
        container_platform = "AWS ECS"
    elif any(k in log_lower for k in ["openshift"]):
        container_platform = "OpenShift"
    elif any(k in log_lower for k in ["docker compose", "docker-compose", "docker swarm"]):
        container_platform = "Docker Compose"
    elif any(k in log_lower for k in ["docker", "containerd"]):
        container_platform = "Docker"

    # Cloud provider detection
    cloud_provider = "Unknown"
    if any(k in log_lower for k in ["aws", "ec2", "s3", "lambda", "arn:", "amazonaws"]):
        cloud_provider = "AWS"
    elif any(k in log_lower for k in ["gcp", "google cloud", "gke", "gcs"]):
        cloud_provider = "GCP"
    elif any(k in log_lower for k in ["azure", "microsoft", "aks"]):
        cloud_provider = "Azure"

    return {
        "language": language,
        "framework": framework,
        "database": database,
        "cache": cache,
        "message_broker": message_broker,
        "web_server": web_server,
        "container_platform": container_platform,
        "cloud_provider": cloud_provider,
    }


def extract_metrics_from_log(raw_log: str) -> Dict[str, Any]:
    """
    Regex-extracts numeric metrics from log text: memory sizes, ports,
    timeout values, exit codes, HTTP status codes, and resource usage.
    """
    metrics: Dict[str, Any] = {}

    # Memory values (e.g., used_memory:7980000000, maxmemory=8GB, 512Mi)
    mem_patterns = [
        (r"used_memory[:\s=]+(\d[\d.]*\s*(?:GB|MB|KB|bytes?)?)", "used_memory"),
        (r"maxmemory[:\s=]+(\d[\d.]*\s*(?:GB|MB|KB|bytes?)?)", "maxmemory"),
        (r"memory[_\s]?usage[:\s=]+(\d[\d.]*\s*%?)", "memory_usage"),
        (r"heap[_\s]?size[:\s=]+(\d[\d.]*\s*(?:GB|MB|KB)?)", "heap_size"),
    ]
    for pattern, key in mem_patterns:
        match = re.search(pattern, raw_log, re.IGNORECASE)
        if match:
            metrics[key] = match.group(1).strip()

    # CPU usage
    cpu_match = re.search(r"cpu[_\s]?usage[:\s=]+(\d[\d.]*\s*%?)", raw_log, re.IGNORECASE)
    if cpu_match:
        metrics["cpu_usage"] = cpu_match.group(1).strip()

    # Disk usage
    disk_match = re.search(r"disk[_\s]?usage[:\s=]+(\d[\d.]*\s*%?)", raw_log, re.IGNORECASE)
    if disk_match:
        metrics["disk_usage"] = disk_match.group(1).strip()

    # HTTP status codes
    http_codes = list(set(re.findall(r"\b([1-5]\d{2})\b", raw_log)))
    valid_http = [c for c in http_codes if c.startswith(('4', '5'))]
    if valid_http:
        metrics["http_error_codes"] = valid_http

    # Exit codes
    exit_matches = re.findall(r"exit[\s_]?code[:\s=]+(\d+)", raw_log, re.IGNORECASE)
    if exit_matches:
        metrics["exit_codes"] = list(set(exit_matches))

    # Timeout values
    timeout_matches = re.findall(r"timeout[:\s=]+(\d+\s*(?:ms|s|seconds|milliseconds)?)", raw_log, re.IGNORECASE)
    if timeout_matches:
        metrics["timeout_values"] = list(set(timeout_matches))

    # Port numbers mentioned in errors
    port_matches = re.findall(r"port[:\s=]+(\d{2,5})", raw_log, re.IGNORECASE)
    if port_matches:
        metrics["ports"] = list(set(port_matches))

    # Restart counts
    restart_match = re.search(r"restarts?[:\s=]+(\d+)", raw_log, re.IGNORECASE)
    if restart_match:
        metrics["restart_count"] = restart_match.group(1)

    return metrics


def extract_infrastructure_metadata(raw_log: str) -> Dict[str, str]:
    """
    Extracts explicitly stated infrastructure metadata from structured log headers or bodies.
    """
    meta = {
        "service": "Unknown Service",
        "pod": "Unknown",
        "namespace": "Unknown",
        "cluster": "Unknown",
        "node": "Unknown",
        "environment": "Unknown"
    }

    # Match key-value pairs like "Service: recommendation-service"
    service_match = re.search(r"(?:service|app|application)[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if service_match:
        meta["service"] = service_match.group(1).strip()
        
    pod_match = re.search(r"pod[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if pod_match:
        meta["pod"] = pod_match.group(1).strip()
        
    namespace_match = re.search(r"namespace[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if namespace_match:
        meta["namespace"] = namespace_match.group(1).strip()
        
    cluster_match = re.search(r"cluster[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if cluster_match:
        meta["cluster"] = cluster_match.group(1).strip()
        
    node_match = re.search(r"(?:node|hostname|host)[\s_]*[:=]\s*([a-zA-Z0-9_.-]+)", raw_log, re.IGNORECASE)
    if node_match:
        meta["node"] = node_match.group(1).strip()
        
    env_match = re.search(r"(?:env|environment)[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if env_match:
        meta["environment"] = env_match.group(1).strip()

    return meta


def extract_error_codes(raw_log: str) -> List[str]:
    """
    Extracts all error codes, exception class names, and signal names from log text.
    """
    codes = []

    # Java-style exceptions
    java_exceptions = re.findall(r"\b([A-Z][a-zA-Z]*(?:Exception|Error|Fault|Failure))\b", raw_log)
    codes.extend(java_exceptions)

    # Python-style exceptions
    python_exceptions = re.findall(r"\b([A-Z][a-zA-Z]*(?:Error|Exception|Warning))\b", raw_log)
    codes.extend(python_exceptions)

    # Kubernetes statuses
    k8s_statuses = re.findall(r"\b(CrashLoopBackOff|ImagePullBackOff|ErrImagePull|Pending|OOMKilled|Evicted|ContainerCreating|RunContainerError)\b", raw_log)
    codes.extend(k8s_statuses)

    # HTTP codes
    http_codes = re.findall(r"\b(HTTP\s*[1-5]\d{2}|[45]\d{2}\s+(?:Internal Server Error|Not Found|Bad Gateway|Service Unavailable|Gateway Timeout))\b", raw_log, re.IGNORECASE)
    codes.extend(http_codes)

    # Exit codes
    exit_codes = re.findall(r"(exit[\s_]?code[:\s=]+\d+)", raw_log, re.IGNORECASE)
    codes.extend(exit_codes)

    # Signal names
    signals = re.findall(r"\b(SIGKILL|SIGTERM|SIGSEGV|SIGABRT|SIGHUP)\b", raw_log)
    codes.extend(signals)

    return list(set(codes))[:20]  # Cap at 20 unique codes


def extract_log_metadata(raw_log: str) -> Dict[str, Any]:
    """
    Phase 1: Deterministic Evidence-Driven Parser
    Extracts structured metadata from logs using regex and keyword matching.
    """
    log_lower = raw_log.lower()

    meta: Dict[str, Any] = {
        "service": "",
        "component": "",
        "environment": "",
        "cluster": "",
        "namespace": "",
        "node": "",
        "hostname": "",
        "technology": [],
        "framework": "",
        "runtime": "",
        "database": "",
        "cache": "",
        "message_broker": "",
        "web_server": "",
        "container_platform": "",
        "orchestrator": "",
        "exception_type": "",
        "error_codes": [],
        "http_status": [],
        "stack_trace": [],
        "port_numbers": [],
        "cpu_usage": "",
        "memory_usage": "",
        "disk_usage": "",
        "latency": "",
        "restart_count": "",
        "business_impact": "",
        "severity": ""
    }

    # 1. Detect Infrastructure / Identity
    service_match = re.search(r"Service:\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if service_match: 
        meta["service"] = service_match.group(1).strip()
    else:
        alt_match = re.search(r"(?:^|\s)(?:service|app|application)[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
        if alt_match: meta["service"] = alt_match.group(1).strip()
    
    env_match = re.search(r"(?:^|\s)(?:env|environment)[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if env_match: meta["environment"] = env_match.group(1).strip()
    
    cluster_match = re.search(r"cluster[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if cluster_match: meta["cluster"] = cluster_match.group(1).strip()
    
    ns_match = re.search(r"namespace[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if ns_match: meta["namespace"] = ns_match.group(1).strip()
    
    node_match = re.search(r"(?:node)[\s_]*[:=]\s*([a-zA-Z0-9_.-]+)", raw_log, re.IGNORECASE)
    if node_match: meta["node"] = node_match.group(1).strip()

    host_match = re.search(r"(?:hostname|host)[\s_]*[:=]\s*([a-zA-Z0-9_.-]+)", raw_log, re.IGNORECASE)
    if host_match: meta["hostname"] = host_match.group(1).strip()
    
    comp_match = re.search(r"(?:component|module)[\s_]*[:=]\s*([a-zA-Z0-9_-]+)", raw_log, re.IGNORECASE)
    if comp_match: meta["component"] = comp_match.group(1).strip()

    # 2. Detect Technology
    # Database
    if any(k in log_lower for k in ["mongodb", "mongonetworktimeouterror", "mongodb://", "mongosh", "mongoclient", "mongoserverselectionerror"]):
        meta["database"] = "MongoDB"
        meta["technology"].append("MongoDB")
    elif any(k in log_lower for k in ["postgresql", "postgres", "psql"]):
        meta["database"] = "PostgreSQL"
        meta["technology"].append("PostgreSQL")
    elif any(k in log_lower for k in ["mysql", "mariadb"]):
        meta["database"] = "MySQL"
        meta["technology"].append("MySQL")

    # Cache
    if any(k in log_lower for k in ["redis", "rediscommandtimeoutexception", "redis-cli", "oom command not allowed", "maxmemory"]):
        meta["cache"] = "Redis"
        meta["technology"].append("Redis")
    elif "memcached" in log_lower:
        meta["cache"] = "Memcached"
        meta["technology"].append("Memcached")

    # Message Broker
    if any(k in log_lower for k in ["kafka", "kafkaconsumer", "consumer lag", "kafka-topics", "kafkarebalance"]):
        meta["message_broker"] = "Kafka"
        meta["technology"].append("Kafka")
    elif "rabbitmq" in log_lower:
        meta["message_broker"] = "RabbitMQ"
        meta["technology"].append("RabbitMQ")

    # Container Platform
    if any(k in log_lower for k in ["docker", "docker ps", "container", "image", "docker-compose", "containerd"]):
        meta["container_platform"] = "Docker"
        meta["technology"].append("Docker")

    # Orchestrator
    if any(k in log_lower for k in ["kubernetes", "kubectl", "pod", "crashloopbackoff", "imagepullbackoff", "namespace"]):
        meta["orchestrator"] = "Kubernetes"
        meta["technology"].append("Kubernetes")

    # Web Server
    if any(k in log_lower for k in ["nginx", "upstream timed out", "502 bad gateway"]):
        meta["web_server"] = "NGINX"
        meta["technology"].append("NGINX")
    elif "apache" in log_lower:
        meta["web_server"] = "Apache"
        meta["technology"].append("Apache")

    # Framework
    if "org.springframework" in log_lower or "spring boot" in log_lower:
        meta["framework"] = "Spring Boot"
        meta["technology"].append("Spring Boot")
    elif "express" in log_lower:
        meta["framework"] = "Express"
        meta["technology"].append("Express")
    elif "django" in log_lower:
        meta["framework"] = "Django"
        meta["technology"].append("Django")
    elif "flask" in log_lower:
        meta["framework"] = "Flask"
        meta["technology"].append("Flask")

    # Runtime
    if "node_modules" in log_lower or "processtimers" in log_lower or ".js" in log_lower or "npm" in log_lower:
        meta["runtime"] = "Node.js"
        meta["technology"].append("Node.js")
    elif "java." in log_lower or "java/lang" in log_lower or ".java" in log_lower:
        meta["runtime"] = "Java"
        meta["technology"].append("Java")
    elif "traceback" in log_lower or ".py" in log_lower:
        meta["runtime"] = "Python"
        meta["technology"].append("Python")
    elif ".go" in log_lower or "goroutine" in log_lower:
        meta["runtime"] = "Go"
        meta["technology"].append("Go")

    meta["technology"] = list(set(meta["technology"]))

    # 3. Detect Exceptions & Errors
    exceptions = re.findall(r"\b([A-Z][a-zA-Z]*(?:Exception|Error|Fault|Failure|Timeout))\b", raw_log)
    if exceptions:
        meta["exception_type"] = exceptions[0]
    
    error_codes = re.findall(r"(exit[\s_]?code[:\s=]+\d+)|(SIG[A-Z]+)|(CrashLoopBackOff|OOMKilled)", raw_log, re.IGNORECASE)
    flat_codes = [item for sublist in error_codes for item in sublist if item]
    meta["error_codes"] = list(set(flat_codes))
    
    http_statuses = re.findall(r"\b([45]\d{2})\b", raw_log)
    meta["http_status"] = list(set(http_statuses))

    port_matches = re.findall(r"port[:\s=]+(\d{2,5})", raw_log, re.IGNORECASE)
    if port_matches: meta["port_numbers"] = list(set(port_matches))

    # Simple stack trace extraction (lines starting with 'at ' or containing filepath)
    stack_lines = []
    for line in raw_log.split('\n'):
        if re.search(r"^\s*at\s+[\w\.]+\(", line) or re.search(r"File \".+\", line \d+", line):
            stack_lines.append(line.strip())
    meta["stack_trace"] = stack_lines[:5]  # Take top 5 lines

    # 4. Metrics
    cpu_match = re.search(r"cpu[_\s]?(?:usage)?[:\s=]+(\d[\d.]*\s*%?)", raw_log, re.IGNORECASE)
    if cpu_match: meta["cpu_usage"] = cpu_match.group(1).strip()
    
    mem_match = re.search(r"(?:memory|mem)[_\s]?(?:usage)?[:\s=]+(\d[\d.]*\s*(?:GB|MB|KB)?)", raw_log, re.IGNORECASE)
    if mem_match: meta["memory_usage"] = mem_match.group(1).strip()

    disk_match = re.search(r"disk[_\s]?(?:usage)?[:\s=]+(\d[\d.]*\s*%?)", raw_log, re.IGNORECASE)
    if disk_match: meta["disk_usage"] = disk_match.group(1).strip()

    lat_match = re.search(r"(?:latency|response time|time)[\s_]*[:=]\s*(\d+[\d.]*\s*(?:ms|s))", raw_log, re.IGNORECASE)
    if lat_match: meta["latency"] = lat_match.group(1).strip()
    
    restart_match = re.search(r"(?:restart|restarts|retry|retries)[\s_]*[:=]\s*(\d+)", raw_log, re.IGNORECASE)
    if restart_match: meta["restart_count"] = restart_match.group(1).strip()

    # 5. Business Impact & Severity
    biz_match = re.search(r"impact[\s_]*[:=]\s*(.+)", raw_log, re.IGNORECASE)
    if biz_match: meta["business_impact"] = biz_match.group(1).strip()
    
    severity_match, _ = detect_severity(raw_log)
    meta["severity"] = severity_match

    return meta
