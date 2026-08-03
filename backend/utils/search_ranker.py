import re
from typing import List, Dict, Any

def build_optimized_search_query(agent1_data: Dict[str, Any]) -> str:
    """
    Constructs an optimized, contextual search query from interpreter output.
    Uses technology stack, exception types, and error codes for precision.
    """
    parts = []

    # Technology context (most specific first)
    framework = agent1_data.get("framework", "").strip()
    language = agent1_data.get("language", "").strip()
    database = agent1_data.get("database", "").strip()
    cache = agent1_data.get("cache", "").strip()
    message_broker = agent1_data.get("message_broker", "").strip()
    container_platform = agent1_data.get("container_platform", "").strip()

    # Add the most specific technology identifier
    if framework and framework not in ("General", "Unknown"):
        parts.append(framework)
    elif language and language not in ("Unknown",):
        parts.append(language)

    # Add infrastructure context
    if database and database != "Unknown":
        parts.append(database)
    elif cache and cache != "Unknown":
        parts.append(cache)
    elif message_broker and message_broker != "Unknown":
        parts.append(message_broker)

    # Add exception type
    exception = agent1_data.get("exception_type", "").strip()
    if exception and exception not in ("Unknown Exception", "Log Error Signature", ""):
        parts.append(exception)

    # Add error signature for specificity
    error_sig = agent1_data.get("error_signature", "").strip()
    if error_sig and len(error_sig) < 80:
        parts.append(error_sig)

    # Add container platform if relevant
    if container_platform and container_platform != "Unknown" and container_platform not in parts:
        parts.append(container_platform)

    # Fallback: use incident type or business impact
    if not parts:
        incident_type = agent1_data.get("incident_type", "").strip()
        if incident_type:
            parts.append(incident_type)
        else:
            business_impact = agent1_data.get("business_impact", "").strip()
            if business_impact:
                cleaned = re.sub(r'[^\w\s]', '', business_impact)
                parts.append(cleaned[:80])

    parts.append("root cause fix")
    return " ".join(parts)


def build_multiple_search_queries(agent1_data: Dict[str, Any]) -> List[str]:
    """
    Generates up to 3 diverse search queries from interpreter output
    to maximize coverage across official docs, GitHub Issues, and StackOverflow.
    """
    queries = []

    # Query 1: Primary technology + exception
    primary = build_optimized_search_query(agent1_data)
    if primary:
        queries.append(primary)

    # Query 2: Use recommended_search_queries from interpreter if available
    recommended = agent1_data.get("recommended_search_queries", [])
    if isinstance(recommended, list):
        for q in recommended[:2]:
            if isinstance(q, str) and q.strip() and q.strip() not in queries:
                queries.append(q.strip())

    # Query 3: Exception + affected service + "official documentation"
    exception = agent1_data.get("exception_type", "").strip()
    service = agent1_data.get("affected_service", "").strip()
    if exception and exception not in ("Unknown Exception", ""):
        doc_query = f"{exception} {service} official documentation troubleshoot"
        if doc_query not in queries:
            queries.append(doc_query)

    return queries[:3]


def rank_search_results(search_output: str, keywords: List[str]) -> List[Dict[str, Any]]:
    """
    Parses and ranks search results based on keyword overlap and source quality.
    Prioritizes official documentation sources.
    """
    if not search_output or "Search failed" in search_output:
        return []

    lines = [line.strip() for line in search_output.split('\n') if line.strip()]
    ranked_results = []
    
    # Official documentation domains get a quality bonus
    OFFICIAL_DOMAINS = [
        "kubernetes.io", "docs.docker.com", "postgresql.org", "redis.io",
        "spring.io", "docs.aws.amazon.com", "learn.microsoft.com",
        "nginx.org", "kafka.apache.org", "docs.mongodb.com",
        "github.com", "stackoverflow.com", "cloud.google.com",
        "docs.python.org", "nodejs.org", "docs.oracle.com",
    ]

    current_title = "Community Reference / Documentation"
    current_snippet = ""

    for line in lines:
        if line.startswith("http://") or line.startswith("https://"):
            url = line.split()[0]
            # Compute relevance score based on keyword matches
            score = 0.55  # Base relevance score
            combined_text = f"{current_title} {current_snippet}".lower()
            for kw in keywords:
                if kw and kw.lower() in combined_text:
                    score += 0.08

            # Bonus for official documentation
            for domain in OFFICIAL_DOMAINS:
                if domain in url.lower():
                    score += 0.15
                    break

            score = min(score, 0.98)

            ranked_results.append({
                "source_title": current_title[:100],
                "source_url": url,
                "relevance_score": round(score, 2),
                "relevance_note": current_snippet[:200] if current_snippet else "Relevant documentation reference."
            })
            current_snippet = ""
        else:
            if len(line) > 20 and not current_snippet:
                current_snippet = line
            else:
                current_title = line[:100]

    # Sort descending by relevance score
    ranked_results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return ranked_results[:8]  # Top 8 best references
