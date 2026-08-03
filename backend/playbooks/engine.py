from typing import Dict, Any, List

def get_playbook(tech_name: str):
    """Dynamically loads and returns the playbook class for a given technology."""
    tech_lower = tech_name.lower()
    
    # Map raw extracted tech names to our playbook modules
    mapping = {
        "mongodb": "mongodb",
        "redis": "redis",
        "kafka": "kafka",
        "docker": "docker",
        "kubernetes": "kubernetes",
        "nginx": "nginx",
        "postgresql": "postgres",
        "rabbitmq": "rabbitmq"
    }
    
    module_name = mapping.get(tech_lower)
    if not module_name:
        return None
        
    try:
        module = __import__(f"playbooks.{module_name}", fromlist=["TechnologyPlaybook"])
        return getattr(module, "TechnologyPlaybook", None)
    except ImportError:
        return None
        
def get_operational_artifacts(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Consumes parser metadata and generates all deterministic artifacts from the rule engine.
    """
    artifacts = {
        "commands": [],
        "sandbox_steps": [],
        "recommended_fixes": [],
        "monitoring_commands": [],
        "prevention_steps": [],
        "code_templates": [],
        "knowledge_tags": [],
        "resolution_steps": [],
        "verification_steps": []
    }
    
    # Look through all detected technologies in the metadata
    detected_techs = metadata.get("technology", [])
    if metadata.get("database"): detected_techs.append(metadata.get("database"))
    if metadata.get("cache"): detected_techs.append(metadata.get("cache"))
    if metadata.get("message_broker"): detected_techs.append(metadata.get("message_broker"))
    if metadata.get("web_server"): detected_techs.append(metadata.get("web_server"))
    if metadata.get("container_platform"): detected_techs.append(metadata.get("container_platform"))
    if metadata.get("orchestrator"): detected_techs.append(metadata.get("orchestrator"))
    
    detected_techs = list(set([t for t in detected_techs if t]))
    
    for tech in detected_techs:
        pb = get_playbook(tech)
        if pb:
            artifacts["commands"].extend(getattr(pb, "commands", []))
            artifacts["sandbox_steps"].extend(getattr(pb, "sandbox_steps", []))
            artifacts["recommended_fixes"].extend(getattr(pb, "recommended_fixes", []))
            artifacts["monitoring_commands"].extend(getattr(pb, "monitoring_commands", []))
            artifacts["prevention_steps"].extend(getattr(pb, "prevention_steps", []))
            artifacts["code_templates"].append(getattr(pb, "code_templates", ""))
            artifacts["knowledge_tags"].extend(getattr(pb, "knowledge_tags", []))
            artifacts["resolution_steps"].extend(getattr(pb, "resolution_steps", []))
            artifacts["verification_steps"].extend(getattr(pb, "verification_steps", []))
            
    # Deduplicate arrays preserving order where possible
    for key in ["commands", "recommended_fixes", "monitoring_commands", "prevention_steps", "knowledge_tags"]:
        artifacts[key] = list(dict.fromkeys(artifacts[key]))
        
    # Format and deduplicate sandbox steps by title
    seen_titles = set()
    unique_sandbox = []
    for step in artifacts["sandbox_steps"]:
        # Standardize keys to Phase 3 requirements
        title = step.get("title") or step.get("stage_title", "")
        if title not in seen_titles:
            seen_titles.add(title)
            formatted_step = {
                "title": title,
                "command": step.get("command", ""),
                "expected_output": step.get("output") or step.get("expected_output", ""),
                "ai_hint": step.get("insight") or step.get("ai_insight", ""),
                "root_cause_progress": step.get("insight") or step.get("ai_insight", "")
            }
            unique_sandbox.append(formatted_step)
            
    artifacts["sandbox_steps"] = unique_sandbox
    
    # Format and deduplicate resolution steps by title
    seen_res_titles = set()
    unique_resolution = []
    for step in artifacts["resolution_steps"]:
        title = step.get("title", "")
        if title not in seen_res_titles:
            seen_res_titles.add(title)
            unique_resolution.append(step)
    artifacts["resolution_steps"] = unique_resolution
    
    # Format and deduplicate verification steps by check
    seen_checks = set()
    unique_verification = []
    for step in artifacts["verification_steps"]:
        check = step.get("check", "")
        if check not in seen_checks:
            seen_checks.add(check)
            unique_verification.append(step)
    artifacts["verification_steps"] = unique_verification

    return artifacts
