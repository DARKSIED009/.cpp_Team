"""
ShadowCredit FastAPI Backend
Behavioral credit scoring for gig economy workers.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from data import get_all_workers, get_worker_by_id
from scoring import calculate_score, simulate_score
from models import WorkerInput, SimulateRequest

app = FastAPI(
    title="ShadowCredit API",
    description="Behavioral credit scoring engine for gig economy workers",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "ShadowCredit API v1.0"}


@app.get("/workers")
def list_workers():
    """List all seeded gig worker profiles with their credit scores."""
    workers = get_all_workers()
    result = []
    for w in workers:
        score_data = calculate_score(w)
        result.append({
            "id": w["id"],
            "name": w["name"],
            "avatar": w["avatar"],
            "job_type": w["job_type"],
            "platform": w["platform"],
            "city": w["city"],
            "score": score_data["score"],
            "risk_band": score_data["risk_band"],
            "risk_color": score_data["risk_color"],
            "avg_monthly_income": score_data["avg_monthly_income"],
            "rating": w["rating"],
            "months_active": w["months_active"],
        })
    return result


@app.get("/worker/{worker_id}")
def get_worker(worker_id: int):
    """Get full worker profile and credit score breakdown."""
    worker = get_worker_by_id(worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail=f"Worker with id {worker_id} not found")
    score_data = calculate_score(worker)
    return {
        "profile": worker,
        "credit_report": score_data,
    }


@app.post("/score/calculate")
def calculate_worker_score(worker_input: WorkerInput):
    """Calculate credit score for a new worker from onboarding form."""
    worker_dict = worker_input.dict()
    # Set defaults
    if worker_dict.get("account_age_months") is None:
        worker_dict["account_age_months"] = worker_dict["months_active"]
    if worker_dict.get("active_months_last_year") is None:
        worker_dict["active_months_last_year"] = min(worker_dict["months_active"], 12)

    score_data = calculate_score(worker_dict)
    return {
        "profile": worker_dict,
        "credit_report": score_data,
    }


@app.post("/score/simulate")
def simulate_worker_score(sim_request: SimulateRequest):
    """Recalculate score with hypothetical improvement adjustments."""
    worker = get_worker_by_id(sim_request.worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail=f"Worker with id {sim_request.worker_id} not found")

    adjustments = {
        "rating_delta": sim_request.rating_delta,
        "cancellation_reduction_pct": sim_request.cancellation_reduction_pct,
        "volatility_reduction_pct": sim_request.volatility_reduction_pct,
    }

    original_score = calculate_score(worker)
    simulated_score = simulate_score(worker, adjustments)

    return {
        "worker_id": sim_request.worker_id,
        "worker_name": worker["name"],
        "original_score": original_score["score"],
        "simulated_score": simulated_score["score"],
        "original_risk_band": original_score["risk_band"],
        "simulated_risk_band": simulated_score["risk_band"],
        "score_delta": simulated_score["score"] - original_score["score"],
        "simulated_report": simulated_score,
        "adjustments": adjustments,
    }
