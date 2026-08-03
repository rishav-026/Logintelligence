class TechnologyPlaybook:
    commands = [
        "docker ps",
        "docker logs",
        "docker inspect",
        "docker restart"
    ]
    sandbox_steps = [
        {
            "title": "Check running containers",
            "command": "docker ps",
            "output": "CONTAINER ID   IMAGE     STATUS\n1a2b3c4d5e6f   app       Restarting (1)",
            "insight": "Container is in a crash loop"
        },
        {
            "title": "Inspect container logs",
            "command": "docker logs 1a2b3c4d5e6f",
            "output": "Error: Cannot find module",
            "insight": "Application failed to start due to missing dependency"
        }
    ]
    recommended_fixes = ["Rebuild Docker image", "Check volume mounts", "Verify environment variables"]
    monitoring_commands = ["docker stats", "docker events"]
    prevention_steps = ["Use multi-stage builds", "Implement healthchecks"]
    code_templates = """HEALTHCHECK --interval=30s --timeout=3s \n  CMD curl -f http://localhost/ || exit 1"""
    knowledge_tags = ["container", "docker"]

    resolution_steps = [{'title': 'Check Container Status', 'purpose': 'Verify if container exited', 'command': 'docker ps -a', 'expected_output': 'Container list', 'success_criteria': 'Command executes', 'ai_explanation': 'Reveals the exit code of the crashed container.', 'estimated_duration': '15 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Inspect Container', 'purpose': 'Check OOM status', 'command': 'docker inspect <container_id>', 'expected_output': 'JSON config', 'success_criteria': 'OOMKilled is visible', 'ai_explanation': 'Shows low-level daemon metadata about the crash.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'View Logs', 'purpose': 'Check application errors', 'command': 'docker logs <container_id>', 'expected_output': 'Application logs', 'success_criteria': 'Logs returned', 'ai_explanation': 'Shows the standard output of the crashed container.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Restart Container', 'purpose': 'Attempt recovery', 'command': 'docker restart <container_id>', 'expected_output': '<container_id>', 'success_criteria': 'Command succeeds', 'ai_explanation': 'Reboots the container process.', 'estimated_duration': '1 minute', 'risk_level': 'Medium', 'requires_restart': 'Yes'}]
    verification_steps = [{'check': 'Container Running', 'expected_state': 'Up', 'reason': 'Confirms the container started successfully.'}, {'check': 'Exit Code 0', 'expected_state': '0', 'reason': "Ensures the application isn't crashing."}, {'check': 'Ports Bound', 'expected_state': '0.0.0.0:80->80/tcp', 'reason': 'Validates the container is accepting traffic.'}]
