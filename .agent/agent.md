---
description: Project rules and conventions for the Intelli-Credit-Aveva industrial AI optimizer
---

# Project Rules & Conventions

## Architecture (V2.0)
- **Backend**: Python 3.11 + FastAPI + LangGraph + XGBoost + PyTorch + Qdrant (in-memory)
- **Frontend**: React + Vite + Vanilla CSS (no Tailwind)
- **3 Frontend Pages**: Dashboard, Decision Center, Compliance & Audit

## Code Rules

### Backend
- All API endpoints live in `backend/api_gateway.py` — do NOT create separate route files
- All orchestration graph nodes live in `backend/orchestration_layer.py`
- Feature modules are standalone files: `carbon_tracker.py`, `batch_history.py`, `energy_analyzer.py`, `decision_memory.py`, `audit_ledger.py`
- Use `_to_native()` for ALL values returned to LangGraph state (prevents numpy serialization crashes)
- Never use `np.trapz` — use `np.trapezoid` (NumPy 2.x)
- All test data lives in `backend/test-data/`
- Surrogate model = XGBoost (`offline_optimizer.py`). Proxy model = PyTorch (`model_layer.py`). Do NOT confuse them.

### Frontend
- All pages are in `frontend/src/pages/`
- Poll backend every 1.5s for graph state using `/api/graph_state?batch_id=LATEST_KNOWN`
- Never use `alert()` — use inline state-based feedback
- No hardcoded/mock data — everything must come from the backend API
- All API calls go to `http://127.0.0.1:8000`

### API Conventions
- POST endpoints use Pydantic `BaseModel` payloads
- GET endpoints use query params
- All responses are JSON
- Background tasks use FastAPI `BackgroundTasks` for non-blocking graph execution

## Running the Project

### Backend
// turbo
```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; pyenv local 3.11.9; python -X utf8 api_gateway.py
```
Run from: `backend/`

### Frontend
// turbo
```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; node node_modules/vite/bin/vite.js
```
Run from: `frontend/`

## Key Globals (orchestration_layer.py)
- `_vector_memory` — Qdrant vector DB
- `_proxy_model` — PyTorch optimization proxy
- `_surrogate_model` — XGBoost surrogate (for SHAP/feature importances)
- `_carbon_tracker` — Carbon emission tracker
- `_batch_history` — Batch history store (JSON)
- `_decision_memory` — HITL decision memory (JSON)
- `_audit_ledger` — Hash-chained audit log (JSON)
- `_current_priorities` — Frontend-controlled optimization priorities
- `_regulatory_targets` — Regulatory compliance thresholds

## Git
- Work on `develop` branch
- Remote: `origin` → `github.com/Schrodingerscat07/Intelli-Credit-Aveva`
