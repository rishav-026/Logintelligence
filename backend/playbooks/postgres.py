class TechnologyPlaybook:
    commands = [
        "pg_isready",
        "psql -c \"SELECT * FROM pg_stat_activity;\"",
        "tail -f /var/log/postgresql/postgresql.log"
    ]
    sandbox_steps = [
        {
            "title": "Check readiness",
            "command": "pg_isready",
            "output": "localhost:5432 - accepting connections",
            "insight": "Database is accepting connections"
        },
        {
            "title": "Check active queries",
            "command": "psql -c \"SELECT count(*) FROM pg_stat_activity;\"",
            "output": "count\n100",
            "insight": "Connection pool might be maxed out"
        }
    ]
    recommended_fixes = ["Increase max_connections", "Kill long running queries", "Use PgBouncer"]
    monitoring_commands = ["psql -c \"SELECT * FROM pg_locks;\""]
    prevention_steps = ["Implement connection pooling", "Index slow queries"]
    code_templates = """# postgresql.conf\nmax_connections = 200\nshared_buffers = 1GB"""
    knowledge_tags = ["database", "postgres", "sql"]

    resolution_steps = [{'title': 'Check Database Health', 'purpose': 'Verify DB is accepting connections', 'command': 'pg_isready', 'expected_output': 'accepting connections', 'success_criteria': 'Database responds successfully.', 'ai_explanation': 'This verifies that PostgreSQL is reachable before restarting services.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Analyze Active Queries', 'purpose': 'Identify locked or hung queries', 'command': 'SELECT * FROM pg_stat_activity;', 'expected_output': 'List of active processes', 'success_criteria': 'Query succeeds', 'ai_explanation': 'Reveals if a specific query is exhausting the connection pool.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Restart PostgreSQL', 'purpose': 'Clear zombie connections', 'command': 'systemctl restart postgresql', 'expected_output': 'postgresql.service active', 'success_criteria': 'Service restarts', 'ai_explanation': 'Forces all hung connections to drop and resets the pool.', 'estimated_duration': '2 minutes', 'risk_level': 'High', 'requires_restart': 'Yes'}, {'title': 'Increase connection pool', 'purpose': 'Provide more concurrent connections', 'command': 'ALTER SYSTEM SET max_connections = 500;', 'expected_output': 'ALTER SYSTEM', 'success_criteria': 'Config applied', 'ai_explanation': 'Allows more simultaneous application requests.', 'estimated_duration': '1 minute', 'risk_level': 'Medium', 'requires_restart': 'Yes'}, {'title': 'Verify HikariCP', 'purpose': 'Ensure application pool is connected', 'command': "grep -i 'HikariPool-1' app.log", 'expected_output': 'Connections active', 'success_criteria': 'No timeout errors', 'ai_explanation': 'Verifies the application successfully reconnected to the database.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}]
    verification_steps = [{'check': 'Connections healthy', 'expected_state': 'Active < Max', 'reason': 'Ensures the pool is not exhausted.'}, {'check': 'Latency normalized', 'expected_state': '< 100ms', 'reason': 'Confirms queries are executing quickly.'}, {'check': 'Application responding', 'expected_state': 'HTTP 200', 'reason': 'Verifies end-to-end functionality.'}]
