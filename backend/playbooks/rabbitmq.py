class TechnologyPlaybook:
    commands = [
        "rabbitmqctl cluster_status",
        "rabbitmqctl list_queues",
        "rabbitmq-diagnostics status"
    ]
    sandbox_steps = [
        {
            "title": "Check cluster status",
            "command": "rabbitmqctl cluster_status",
            "output": "Disk free limit set to 50MB",
            "insight": "Cluster is running but disk space might be low"
        },
        {
            "title": "List queues",
            "command": "rabbitmqctl list_queues",
            "output": "Timeout on queue 'tasks'",
            "insight": "Queue is unresponsive"
        }
    ]
    recommended_fixes = ["Purge backed up queues", "Check disk space alarms", "Increase memory watermark"]
    monitoring_commands = ["rabbitmqadmin list connections"]
    prevention_steps = ["Set TTL on messages", "Use lazy queues"]
    code_templates = """# rabbitmq.conf\ndisk_free_limit.absolute = 2GB\nvm_memory_high_watermark.relative = 0.6"""
    knowledge_tags = ["message_broker", "rabbitmq", "amqp"]

    resolution_steps = [{'title': 'Check Cluster Status', 'purpose': 'Verify nodes are running', 'command': 'rabbitmqctl cluster_status', 'expected_output': 'Cluster status', 'success_criteria': 'Nodes running', 'ai_explanation': 'Ensures the RabbitMQ cluster has quorum.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'List Queues', 'purpose': 'Identify message buildup', 'command': 'rabbitmqctl list_queues name messages', 'expected_output': 'Queue list', 'success_criteria': 'Queues listed', 'ai_explanation': 'Reveals if consumers are failing to process messages.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Check Connections', 'purpose': 'Verify client connections', 'command': 'rabbitmqctl list_connections', 'expected_output': 'Connection list', 'success_criteria': 'Connections active', 'ai_explanation': 'Ensures the application is connected to the broker.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Restart RabbitMQ', 'purpose': 'Clear stuck state', 'command': 'systemctl restart rabbitmq-server', 'expected_output': 'rabbitmq-server active', 'success_criteria': 'Service restarts', 'ai_explanation': 'Reboots the broker to flush memory and reset connections.', 'estimated_duration': '2 minutes', 'risk_level': 'High', 'requires_restart': 'Yes'}]
    verification_steps = [{'check': 'Queue Depth Decreasing', 'expected_state': 'Messages < 100', 'reason': 'Consumers are processing the backlog.'}, {'check': 'Cluster Healthy', 'expected_state': 'Running nodes = Total nodes', 'reason': 'Ensures high availability is restored.'}, {'check': 'Connections Active', 'expected_state': 'Count > 0', 'reason': 'Validates the application tier reconnected.'}]
