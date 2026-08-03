class TechnologyPlaybook:
    commands = [
        "nginx -t",
        "systemctl status nginx",
        "tail -f /var/log/nginx/error.log"
    ]
    sandbox_steps = [
        {
            "title": "Test configuration",
            "command": "nginx -t",
            "output": "nginx: the configuration file /etc/nginx/nginx.conf syntax is ok\nnginx: configuration file /etc/nginx/nginx.conf test is successful",
            "insight": "Syntax is valid"
        },
        {
            "title": "Check error logs",
            "command": "tail -n 20 /var/log/nginx/error.log",
            "output": "upstream timed out (110: Connection timed out)",
            "insight": "Upstream backend is not responding in time"
        }
    ]
    recommended_fixes = ["Increase proxy_read_timeout", "Check upstream health", "Restart NGINX"]
    monitoring_commands = ["curl -I localhost"]
    prevention_steps = ["Configure upstream health checks", "Implement load balancing"]
    code_templates = """location /api/ {\n    proxy_read_timeout 60s;\n    proxy_connect_timeout 60s;\n}"""
    knowledge_tags = ["web_server", "nginx", "proxy"]

    resolution_steps = [{'title': 'Check Container Logs', 'purpose': 'Identify upstream errors', 'command': 'docker logs nginx', 'expected_output': 'Error logs', 'success_criteria': 'Command executes', 'ai_explanation': 'Reveals 502/504 errors pointing to backend failures.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Test Configuration', 'purpose': 'Verify syntax', 'command': 'nginx -t', 'expected_output': 'syntax is ok', 'success_criteria': 'test is successful', 'ai_explanation': "Ensures the config file isn't corrupted.", 'estimated_duration': '15 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Check Upstream', 'purpose': 'Verify backend health', 'command': 'curl -I http://backend-service', 'expected_output': 'HTTP 200', 'success_criteria': 'Returns 200 OK', 'ai_explanation': 'Tests if the backend application is actually alive.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Restart NGINX', 'purpose': 'Apply config or clear state', 'command': 'systemctl restart nginx', 'expected_output': 'nginx.service active', 'success_criteria': 'Service restarts', 'ai_explanation': 'Flushes the proxy cache and connection state.', 'estimated_duration': '1 minute', 'risk_level': 'Medium', 'requires_restart': 'Yes'}]
    verification_steps = [{'check': 'HTTP 200', 'expected_state': '200 OK', 'reason': 'Confirms the proxy is successfully routing traffic.'}, {'check': 'No upstream timeout', 'expected_state': '0 errors in log', 'reason': 'Ensures the backend is responding in time.'}, {'check': 'Gateway healthy', 'expected_state': 'Active', 'reason': 'Validates the ingress layer.'}]
