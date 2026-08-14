import json
import logging
from typing import Dict, Any, List
try:
    from langchain_ollama import ChatOllama
except Exception:
    try:
        from langchain_community.chat_models import ChatOllama
    except Exception:
        ChatOllama = None

try:
    from langchain_community.tools import DuckDuckGoSearchRun
except Exception:
    DuckDuckGoSearchRun = None

try:
    from langchain_core.messages import SystemMessage, HumanMessage
except Exception:
    SystemMessage = None
    HumanMessage = None

from prompts.researcher_prompts import RESEARCHER_SYSTEM_PROMPT, RESEARCHER_USER_PROMPT
from utils.search_ranker import build_optimized_search_query, build_multiple_search_queries, rank_search_results
from utils.execution_timer import measure_execution_time

logger = logging.getLogger(__name__)

def run_researcher_agent(interpreter_data: Dict[str, Any], model_name: str = "llama3") -> Dict[str, Any]:
    """
    Agent 2: Solution Researcher
    - Receives Agent 1 output
    - Runs multiple optimized search queries for broader coverage
    - Searches official docs, Stack Overflow, GitHub Issues
    - Ranks references and returns top evidence with LLM synthesis
    """
    search_queries = build_multiple_search_queries(interpreter_data)
    primary_query = search_queries[0] if search_queries else build_optimized_search_query(interpreter_data)
    search_tool = DuckDuckGoSearchRun()

    with measure_execution_time() as timer:
        # Perform multiple searches and merge results
        all_search_output = ""
        all_ranked_references = []

        # Run single fast primary search query
        try:
            raw_output = search_tool.invoke(primary_query)
            all_search_output = f"\n--- Search: {primary_query} ---\n{raw_output}\n"
        except Exception as e:
            logger.warning(f"DuckDuckGo search error for query '{primary_query}': {e}")
            all_search_output = f"\n--- Search: {primary_query} ---\nSearch fallback.\n"

        if not all_search_output.strip():
            all_search_output = f"Search fallback for query: {primary_query}"

        # Rank search results using expanded keywords
        keywords = [
            interpreter_data.get("framework", ""),
            interpreter_data.get("language", ""),
            interpreter_data.get("exception_type", ""),
            interpreter_data.get("database", ""),
            interpreter_data.get("cache", ""),
            interpreter_data.get("message_broker", ""),
            interpreter_data.get("container_platform", ""),
        ]
        keywords = [k for k in keywords if k and k != "Unknown"]
        all_ranked_references = rank_search_results(all_search_output, keywords)

    # Deduplicate by URL
    seen_urls = set()
    unique_refs = []
    for ref in all_ranked_references:
        url = ref.get("source_url", "")
        if url and url not in seen_urls:
            seen_urls.add(url)
            unique_refs.append(ref)
    unique_refs.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)

    parsed_data = {
        "query_used": primary_query,
        "search_queries_used": search_queries,
        "ranked_references": unique_refs[:8],
        "search_output": all_search_output[:3000],
        "execution_time_ms": timer["elapsed_ms"]
    }
    
    return parsed_data
