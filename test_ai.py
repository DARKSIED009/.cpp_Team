import sys
import os
import json

# Add project root to path
sys.path.insert(0, r"c:\Users\Arush Kaushik\OneDrive\Desktop\shadow credit")

try:
    from ai_service import get_simulate_advice
    result = get_simulate_advice(
        old_score=750,
        new_score=800,
        adjustments={"rating_delta": 0.5, "cancellation_reduction_pct": 5, "volatility_reduction_pct": 0}
    )
    print("RESULT:", result)
except Exception as e:
    import traceback
    traceback.print_exc()
