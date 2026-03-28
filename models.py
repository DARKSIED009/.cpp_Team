from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class WorkerInput(BaseModel):
    name: str
    job_type: str
    platform: str
    city: str
    monthly_incomes: List[float] = Field(..., min_items=3, description="Monthly income figures (last 3-12 months)")
    completed_jobs: int
    cancellations: int
    rating: float = Field(..., ge=1.0, le=5.0)
    months_active: int
    account_age_months: Optional[int] = None
    active_months_last_year: Optional[int] = None
    income_sources: Optional[int] = 1


class SimulateRequest(BaseModel):
    worker_id: int
    rating_delta: Optional[float] = 0.0
    cancellation_reduction_pct: Optional[float] = 0.0
    volatility_reduction_pct: Optional[float] = 0.0


# --- AI Models ---

class AIExplainRequest(BaseModel):
    worker_data: Dict[str, Any]

class AICritiqueRequest(BaseModel):
    worker_data: Dict[str, Any]

class AILenderSummaryRequest(BaseModel):
    worker_data: Dict[str, Any]

class AICoachRequest(BaseModel):
    worker_data: Dict[str, Any]

class AIAnomalyRequest(BaseModel):
    worker_data: Dict[str, Any]

class AILenderNarrativeRequest(BaseModel):
    worker_data: Dict[str, Any]

class AISimulateAdviceRequest(BaseModel):
    old_score: int
    new_score: int
    adjustments: Dict[str, float]

class AIChatMessage(BaseModel):
    role: str
    text: str

class AIChatRequest(BaseModel):
    worker_data: Dict[str, Any]
    history: List[AIChatMessage] = []
    message: str
