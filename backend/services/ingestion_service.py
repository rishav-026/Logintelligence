import json
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

def parse_log_input(raw_content: str, source_type: str = "paste") -> Tuple[str, str]:
    """
    Parses and sanitizes incoming log content across paste, .log, .txt, and .json formats.
    Returns a tuple of (sanitized_log_text, auto_detected_format).
    """
    if not raw_content or not raw_content.strip():
        raise ValueError("Log input content cannot be empty.")

    content = raw_content.strip()

    # JSON log format parsing
    if source_type == "json_file" or content.startswith("{") or content.startswith("["):
        try:
            parsed_json = json.loads(content)
            # Flatten JSON log format if dict
            if isinstance(parsed_json, dict):
                log_lines = []
                for k in ["message", "msg", "error", "exception", "stack_trace", "log", "detail"]:
                    if k in parsed_json:
                        log_lines.append(f"{k.upper()}: {parsed_json[k]}")
                if log_lines:
                    return "\n".join(log_lines), "json_file"
                return json.dumps(parsed_json, indent=2), "json_file"
        except Exception:
            pass  # Fall back to raw text if JSON parse fails

    return content, source_type if source_type else "paste"
