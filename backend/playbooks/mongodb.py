class TechnologyPlaybook:
    commands = [
        "docker ps",
        "docker logs mongodb",
        "docker inspect mongodb",
        "mongosh",
        "db.adminCommand({ ping:1 })"
    ]
    sandbox_steps = [
        {
            "title": "Check MongoDB Container",
            "command": "docker ps",
            "output": "mongodb Up 2h",
            "insight": "MongoDB container is running"
        },
        {
            "title": "Inspect MongoDB Logs",
            "command": "docker logs mongodb",
            "output": "MongoServerSelectionError",
            "insight": "Database rejected connections"
        },
        {
            "title": "Ping MongoDB",
            "command": "mongosh",
            "output": "Connection Timeout",
            "insight": "Database unreachable"
        }
    ]
    recommended_fixes = [
        "Check Docker network",
        "Verify MONGO_URI",
        "Increase timeout",
        "Check Mongo logs",
        "Restart unhealthy container"
    ]
    monitoring_commands = ["mongostat", "mongotop"]
    prevention_steps = ["Implement connection pooling", "Increase serverSelectionTimeoutMS"]
    code_templates = """mongoose.connect(process.env.MONGO_URI,{\nserverSelectionTimeoutMS:10000,\nsocketTimeoutMS:45000\n});"""
    knowledge_tags = ["database", "mongodb", "nosql"]

    resolution_steps = [{'title': 'Check Container', 'purpose': 'Ensure MongoDB container is running', 'command': 'docker ps | grep mongo', 'expected_output': 'Up X minutes', 'success_criteria': 'Container is Up', 'ai_explanation': "Validates the container engine hasn't killed the process.", 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Inspect Logs', 'purpose': 'Check for startup errors', 'command': 'docker logs mongodb', 'expected_output': 'Logs displayed', 'success_criteria': 'Command executes', 'ai_explanation': 'Reveals if the engine failed to mount volumes or bind ports.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Access Shell', 'purpose': 'Connect to DB directly', 'command': 'mongosh', 'expected_output': 'MongoDB shell version', 'success_criteria': 'Shell prompt appears', 'ai_explanation': 'Bypasses the application to test native connectivity.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Ping Database', 'purpose': 'Verify internal health', 'command': 'db.adminCommand("ping")', 'expected_output': '{ ok: 1 }', 'success_criteria': 'Returns ok: 1', 'ai_explanation': 'Confirms the database engine is responsive to admin commands.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}]
    verification_steps = [{'check': 'Ping successful', 'expected_state': 'ok: 1', 'reason': 'Confirms internal engine health.'}, {'check': 'Replica healthy', 'expected_state': 'PRIMARY', 'reason': 'Ensures the replica set elected a leader.'}, {'check': 'Connections restored', 'expected_state': 'Active connections > 0', 'reason': 'Verifies the app successfully reconnected.'}]
