"""
test_all_features.py - Smoke test for all new hackathon endpoints.

Requires: Backend running on http://127.0.0.1:8000
Run with: python -X utf8 test_all_features.py
"""
import time
import json
import requests

BASE = "http://127.0.0.1:8000"
PASS = 0
FAIL = 0

def test(name, method, url, json_body=None, expect_key=None):
    global PASS, FAIL
    try:
        if method == "GET":
            r = requests.get(url, timeout=10)
        else:
            r = requests.post(url, json=json_body, timeout=10)
        
        ok = r.status_code == 200
        data = r.json()
        
        if expect_key and expect_key not in data:
            ok = False
            
        status = "✅ PASS" if ok else f"❌ FAIL ({r.status_code})"
        if ok:
            PASS += 1
        else:
            FAIL += 1
        print(f"  {status} - {name}")
        return data
    except Exception as e:
        FAIL += 1
        print(f"  ❌ FAIL - {name}: {e}")
        return None

print("=" * 60)
print("HACKATHON FEATURE SMOKE TESTS")
print("=" * 60)

# 1. Carbon metrics
print("\n[1] Carbon Emission Tracking")
test("GET /api/carbon_metrics", "GET", f"{BASE}/api/carbon_metrics", expect_key="emission_factor")

# 2. Batch history
print("\n[2] Batch History")
test("GET /api/batch_history", "GET", f"{BASE}/api/batch_history", expect_key="records")
test("GET /api/batch_summary", "GET", f"{BASE}/api/batch_summary")

# 3. Feature importance
print("\n[3] Feature Importance (SHAP)")
test("GET /api/feature_importance", "GET", f"{BASE}/api/feature_importance", expect_key="features")

# 4. Energy anomalies
print("\n[4] Energy Anomaly Detection")
test("GET /api/energy_anomalies", "GET", f"{BASE}/api/energy_anomalies")

# 5. Decision history
print("\n[5] Decision Memory")
test("GET /api/decision_history", "GET", f"{BASE}/api/decision_history", expect_key="decisions")

# 6. Regulatory targets
print("\n[6] Regulatory Target Configuration")
test("GET /api/regulatory_targets", "GET", f"{BASE}/api/regulatory_targets", expect_key="max_carbon_per_batch_kg")
test("POST /api/regulatory_targets", "POST", f"{BASE}/api/regulatory_targets", 
     json_body={"max_carbon_per_batch_kg": 30.0, "emission_factor_name": "eu_grid"},
     expect_key="status")

# 7. Priority update (multi-target)
print("\n[7] Multi-Target Selector & Priority Update")
test("POST /api/update_priorities", "POST", f"{BASE}/api/update_priorities",
     json_body={"priority_value": 70, "priority_type": "yield_vs_energy",
                "objective_primary": "Hardness", "objective_secondary": "Tablet_Weight"},
     expect_key="priorities")

# 8. Trigger a batch and test full flow
print("\n[8] Full Batch Flow")
result = test("POST /api/new_batch", "POST", f"{BASE}/api/new_batch", expect_key="batch_id")

if result and "batch_id" in result:
    batch_id = result["batch_id"]
    print(f"     Waiting 5s for graph to reach HITL gate...")
    time.sleep(5)
    
    state = test("GET /api/graph_state (poll)", "GET", f"{BASE}/api/graph_state?batch_id={batch_id}", expect_key="batch_id")
    
    if state and state.get("paused_for_hitl"):
        # Check new fields exist in state
        new_fields = ["energy_anomalies", "asset_health_score", "energy_recommendations", "past_decision_warnings"]
        for field in new_fields:
            if field in state:
                PASS += 1
                print(f"  ✅ PASS - State contains '{field}'")
            else:
                FAIL += 1
                print(f"  ❌ FAIL - State missing '{field}'")
        
        # Approve and execute
        test("POST /api/execute_decision (approve)", "POST", f"{BASE}/api/execute_decision",
             json_body={"batch_id": batch_id, "approved": True, "feedback": "Smoke test approval"},
             expect_key="status")
        
        time.sleep(2)
        
        final = test("GET /api/graph_state (post-exec)", "GET", f"{BASE}/api/graph_state?batch_id={batch_id}", expect_key="batch_id")
        if final:
            if final.get("carbon_metrics"):
                PASS += 1
                print(f"  ✅ PASS - Carbon metrics present in final state")
            else:
                FAIL += 1
                print(f"  ❌ FAIL - Carbon metrics missing in final state")

# Summary
print("\n" + "=" * 60)
print(f"RESULTS: {PASS} passed, {FAIL} failed, {PASS + FAIL} total")
print("=" * 60)
