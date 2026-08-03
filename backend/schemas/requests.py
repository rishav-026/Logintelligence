from pydantic import BaseModel, Field
from typing import Optional

class AnalyzeRequest(BaseModel):
    raw_log_text: str = Field(..., description="Raw log contents or stack trace")
    source_type: Optional[str] = Field("paste", description="Source format: paste, log_file, json_file")

class ReanalyzeRequest(BaseModel):
    custom_instructions: Optional[str] = Field(None, description="Optional extra instructions for re-analysis")
