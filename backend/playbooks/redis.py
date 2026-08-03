class TechnologyPlaybook:
    commands = [
        "redis-cli INFO memory",
        "redis-cli MEMORY STATS",
        "redis-cli CONFIG GET maxmemory",
        "redis-cli INFO stats"
    ]
    sandbox_steps = [
        {
            "title": "Inspect memory",
            "command": "redis-cli INFO memory",
            "output": "used_memory:8589934592\nmaxmemory:8589934592",
            "insight": "Redis is at maxmemory limit"
        },
        {
            "title": "Check maxmemory",
            "command": "redis-cli CONFIG GET maxmemory",
            "output": "1) maxmemory\n2) 8589934592",
            "insight": "Maxmemory configuration is strict"
        },
        {
            "title": "Review fragmentation",
            "command": "redis-cli MEMORY STATS",
            "output": "peak.allocated: 8.1G",
            "insight": "High memory allocation detected"
        },
        {
            "title": "Confirm OOM",
            "command": "redis-cli INFO stats",
            "output": "evicted_keys:4381",
            "insight": "Keys are being actively evicted due to OOM"
        }
    ]
    recommended_fixes = [
        "Increase maxmemory in redis.conf",
        "Enable volatile-lru eviction policy",
        "Check for large keys using --bigkeys",
        "Scale Redis cluster"
    ]
    monitoring_commands = ["redis-cli --stat", "redis-cli monitor"]
    prevention_steps = ["Set appropriate TTL on keys", "Monitor memory usage alerts"]
    code_templates = """# redis.conf\nmaxmemory 12gb\nmaxmemory-policy allkeys-lru"""
    knowledge_tags = ["cache", "redis", "in-memory"]

    resolution_steps = [{'title': 'Inspect memory', 'purpose': 'Check current memory usage', 'command': 'redis-cli INFO memory', 'expected_output': 'Memory stats displayed', 'success_criteria': 'Command executes', 'ai_explanation': 'Identifies if memory is near maxmemory limit.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Check allocations', 'purpose': 'Review peak allocations', 'command': 'redis-cli MEMORY STATS', 'expected_output': 'Allocation stats displayed', 'success_criteria': 'Stats returned', 'ai_explanation': 'Shows fragmentation and peak usage.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Check config', 'purpose': 'Verify maxmemory configuration', 'command': 'redis-cli CONFIG GET maxmemory', 'expected_output': '1) maxmemory', 'success_criteria': 'maxmemory is set', 'ai_explanation': 'Validates the current ceiling for memory.', 'estimated_duration': '15 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Increase limit', 'purpose': 'Provide immediate memory headroom', 'command': 'redis-cli CONFIG SET maxmemory 12gb', 'expected_output': 'OK', 'success_criteria': 'Returns OK', 'ai_explanation': 'Temporarily raises the memory limit to prevent OOM.', 'estimated_duration': '1 minute', 'risk_level': 'Medium', 'requires_restart': 'No'}, {'title': 'Restart Redis', 'purpose': 'Apply changes and clear fragmentation', 'command': 'systemctl restart redis', 'expected_output': 'redis.service active', 'success_criteria': 'Service starts successfully', 'ai_explanation': 'Reboots the process to flush volatile state.', 'estimated_duration': '2 minutes', 'risk_level': 'High', 'requires_restart': 'Yes'}]
    verification_steps = [{'check': 'Memory below threshold', 'expected_state': 'Used memory < 12gb', 'reason': 'Confirms the limit increase resolved the pressure.'}, {'check': 'OOM errors disappear', 'expected_state': 'No new OOM logs', 'reason': 'Verifies the root cause is mitigated.'}, {'check': 'Redis healthy', 'expected_state': 'PONG', 'reason': 'Ensures the service is responding to traffic.'}]
