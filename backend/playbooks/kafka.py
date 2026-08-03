class TechnologyPlaybook:
    commands = [
        "kafka-topics.sh --describe",
        "kafka-consumer-groups.sh --describe",
        "kafka-broker-api-versions.sh"
    ]
    sandbox_steps = [
        {
            "title": "Inspect topics",
            "command": "kafka-topics.sh --describe",
            "output": "Topic: events  PartitionCount: 3",
            "insight": "Topic exists and is partitioned"
        },
        {
            "title": "Inspect consumer lag",
            "command": "kafka-consumer-groups.sh --describe",
            "output": "GROUP           TOPIC           PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG\nmy-group        events          0          100             500             400",
            "insight": "Consumer group is lagging significantly behind producers"
        },
        {
            "title": "Check broker",
            "command": "kafka-broker-api-versions.sh",
            "output": "id: 1, rack: null, endpoints: PLAINTEXT://kafka:9092",
            "insight": "Broker 1 is reachable via PLAINTEXT"
        }
    ]
    recommended_fixes = [
        "Increase consumer instances to match partitions",
        "Increase session.timeout.ms",
        "Check broker disk space",
        "Restart failed brokers"
    ]
    monitoring_commands = ["jmxterm", "kafka-log-dirs.sh"]
    prevention_steps = ["Set up consumer lag alerts", "Monitor broker CPU/Disk"]
    code_templates = """# consumer.properties\nsession.timeout.ms=45000\nmax.poll.interval.ms=300000"""
    knowledge_tags = ["message_broker", "kafka", "streaming"]

    resolution_steps = [{'title': 'Describe Consumer Group', 'purpose': 'Identify lagging consumers', 'command': 'kafka-consumer-groups.sh --describe', 'expected_output': 'Group details with LAG column', 'success_criteria': 'Command executes', 'ai_explanation': 'Reveals if consumers are failing to keep up with partitions.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Describe Topic', 'purpose': 'Check partition health', 'command': 'kafka-topics.sh --describe', 'expected_output': 'Topic details', 'success_criteria': 'All partitions have leaders', 'ai_explanation': 'Ensures the broker is successfully managing the topic.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Check Broker', 'purpose': 'Verify broker status', 'command': 'systemctl status kafka', 'expected_output': 'active (running)', 'success_criteria': 'Service is running', 'ai_explanation': 'Validates the Kafka daemon is alive.', 'estimated_duration': '30 seconds', 'risk_level': 'Low', 'requires_restart': 'No'}, {'title': 'Restart Consumer', 'purpose': 'Force rebalance', 'command': 'kubectl delete pod -l app=consumer', 'expected_output': 'pod deleted', 'success_criteria': 'New pod spawns', 'ai_explanation': 'Forces the consumer group to rebalance and reassign partitions.', 'estimated_duration': '2 minutes', 'risk_level': 'Medium', 'requires_restart': 'Yes'}, {'title': 'Verify Lag', 'purpose': 'Confirm recovery', 'command': 'kafka-consumer-groups.sh --describe', 'expected_output': 'Lag decreasing', 'success_criteria': 'Lag < 100', 'ai_explanation': 'Confirms the restarted consumer is processing the backlog.', 'estimated_duration': '1 minute', 'risk_level': 'Low', 'requires_restart': 'No'}]
    verification_steps = [{'check': 'Lag decreasing', 'expected_state': '< 100', 'reason': 'Consumers are processing messages normally.'}, {'check': 'Partitions assigned', 'expected_state': 'No unassigned partitions', 'reason': 'Ensures all data is being routed.'}, {'check': 'Consumers healthy', 'expected_state': 'Running', 'reason': 'Validates the application tier.'}]
