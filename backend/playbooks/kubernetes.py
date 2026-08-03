class TechnologyPlaybook:
    commands = [
        "kubectl get pods",
        "kubectl describe pod",
        "kubectl logs",
        "kubectl get events"
    ]
    sandbox_steps = [
        {
            "title": "Check pod status",
            "command": "kubectl get pods",
            "output": "NAME          READY   STATUS             RESTARTS\napi-gateway   0/1     CrashLoopBackOff   12",
            "insight": "Pod is failing to start repeatedly"
        },
        {
            "title": "Describe pod events",
            "command": "kubectl describe pod api-gateway",
            "output": "Warning  BackOff  kubelet  Back-off restarting failed container",
            "insight": "Kubelet is backing off due to crash"
        },
        {
            "title": "Inspect logs",
            "command": "kubectl logs api-gateway",
            "output": "OOMKilled",
            "insight": "Container exceeded memory limits"
        }
    ]
    recommended_fixes = ["Increase resource limits", "Check readiness probe", "Check for node pressure"]
    monitoring_commands = ["kubectl top pods", "kubectl top nodes"]
    prevention_steps = ["Set correct requests/limits", "Use HPA"]
    code_templates = 'resources:\n  requests:\n    memory: "512Mi"\n  limits:\n    memory: "1Gi"'
    knowledge_tags = ["orchestrator", "kubernetes", "k8s"]

    resolution_steps = [{'title': 'Describe Pod', 'purpose': 'Identify scheduling or lifecycle errors', 'command': 'kubectl describe pod', 'expected_output': 'Events list', 'success_criteria': 'Events displayed', 'ai_explanation': 'Reveals OOMKilled, ImagePullBackOff, or Liveness probe failures.', 'estimated_duration': '45 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'View Logs', 'purpose': 'Check application errors', 'command': 'kubectl logs', 'expected_output': 'Application logs', 'success_criteria': 'Logs returned', 'ai_explanation': 'Shows the standard output of the crashed container.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Get Cluster Events', 'purpose': 'Check for node or network issues', 'command': 'kubectl get events --sort-by=.lastTimestamp', 'expected_output': 'Recent events', 'success_criteria': 'Events listed', 'ai_explanation': 'Provides cluster-wide context for the failure.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Rollout Restart', 'purpose': 'Force recreation of pods', 'command': 'kubectl rollout restart deployment', 'expected_output': 'deployment restarted', 'success_criteria': 'Command succeeds', 'ai_explanation': 'Evicts the failing pods and schedules fresh ones.', 'estimated_duration': '2 minutes', 'risk_level': 'Medium', 'requires_restart': 'Yes'}]
    verification_steps = [{'check': 'Pod Ready', 'expected_state': '1/1 Running', 'reason': 'Confirms the container started successfully.'}, {'check': 'No CrashLoopBackOff', 'expected_state': 'Restarts = 0', 'reason': "Ensures the application isn't immediately crashing."}, {'check': 'Readiness Probe Passed', 'expected_state': 'Ready = True', 'reason': 'Validates the pod is accepting traffic.'}]
