"""
==============================================================================
AUDIT LEDGER - Hash-Chained Immutable Audit Trail
==============================================================================
Stores all AI decisions in a hash-chained log for ISO 14064 compliance.
Each record includes: AI suggestion, human decision, carbon outcome,
and a SHA-256 hash of the previous record for tamper detection.

Author : Core Engine Team
Version: 2.0.0
==============================================================================
"""

from __future__ import annotations

import hashlib
import json
import os
import time
from typing import Any, Dict, List, Optional


DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test-data")
LEDGER_FILE = os.path.join(DATA_DIR, "audit_ledger.json")

# ISO 14064 Emission Scope Classification
SCOPE_MAP = {
    "electricity": {"scope": 2, "category": "Purchased Electricity",
                    "description": "Indirect GHG from purchased electricity for manufacturing"},
    "natural_gas": {"scope": 1, "category": "Stationary Combustion",
                    "description": "Direct GHG from on-site natural gas combustion"},
    "renewable":   {"scope": 2, "category": "Purchased Renewable Energy",
                    "description": "Indirect GHG from purchased renewable electricity"},
}


def _compute_hash(record: Dict[str, Any], prev_hash: str) -> str:
    """Compute SHA-256 hash of a record chained to the previous hash."""
    payload = json.dumps({
        "prev_hash": prev_hash,
        "batch_id": record.get("batch_id", ""),
        "timestamp": record.get("timestamp", 0),
        "ai_suggestion": record.get("ai_suggestion", {}),
        "human_decision": record.get("human_decision", ""),
        "carbon_kg": record.get("carbon_kg", 0),
    }, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()


class AuditLedger:
    """Hash-chained immutable audit log for ISO 14064 compliance."""

    def __init__(self, filepath: Optional[str] = None) -> None:
        self.filepath = filepath or LEDGER_FILE
        self._records: List[Dict[str, Any]] = []
        self._load()

    def _load(self) -> None:
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    self._records = json.load(f)
            except (json.JSONDecodeError, IOError):
                self._records = []

    def _save(self) -> None:
        os.makedirs(os.path.dirname(self.filepath), exist_ok=True)
        with open(self.filepath, "w", encoding="utf-8") as f:
            json.dump(self._records, f, indent=2, default=str)

    def log_decision(
        self,
        batch_id: str,
        ai_suggestion: Dict[str, Any],
        human_decision: str,
        human_feedback: str,
        carbon_metrics: Dict[str, Any],
        quality_delta: float,
        qdrant_updated: bool,
        energy_source: str = "electricity",
    ) -> Dict[str, Any]:
        """Log a decision to the hash-chained audit ledger.

        Returns
        -------
        Dict[str, Any]
            The stored audit record with its hash.
        """
        prev_hash = self._records[-1]["record_hash"] if self._records else "GENESIS"

        # ISO 14064 scope classification
        scope_info = SCOPE_MAP.get(energy_source, SCOPE_MAP["electricity"])

        carbon_kg = carbon_metrics.get("carbon_kg", 0.0)
        energy_kwh = carbon_metrics.get("energy_kwh", 0.0)

        record = {
            "sequence_number": len(self._records) + 1,
            "batch_id": batch_id,
            "timestamp": time.time(),
            "timestamp_iso": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "ai_suggestion": ai_suggestion,
            "human_decision": human_decision,
            "human_feedback": human_feedback,
            "carbon_kg": round(carbon_kg, 4),
            "energy_kwh": round(energy_kwh, 2),
            "quality_delta": round(quality_delta, 6),
            "qdrant_updated": qdrant_updated,
            "iso_14064": {
                "scope": scope_info["scope"],
                "category": scope_info["category"],
                "description": scope_info["description"],
                "emission_factor": carbon_metrics.get("emission_factor", 0.82),
            },
            "prev_hash": prev_hash,
        }

        record["record_hash"] = _compute_hash(record, prev_hash)
        self._records.append(record)
        self._save()
        return record

    def get_all(self) -> List[Dict[str, Any]]:
        """Return all audit records, newest first."""
        return list(reversed(self._records))

    def verify_chain(self) -> Dict[str, Any]:
        """Verify the integrity of the entire hash chain.

        Returns
        -------
        Dict with 'valid', 'total_records', 'broken_at' keys.
        """
        if not self._records:
            return {"valid": True, "total_records": 0, "broken_at": None}

        for i, record in enumerate(self._records):
            expected_prev = self._records[i - 1]["record_hash"] if i > 0 else "GENESIS"
            if record.get("prev_hash") != expected_prev:
                return {"valid": False, "total_records": len(self._records), "broken_at": i}
            expected_hash = _compute_hash(record, expected_prev)
            if record.get("record_hash") != expected_hash:
                return {"valid": False, "total_records": len(self._records), "broken_at": i}

        return {"valid": True, "total_records": len(self._records), "broken_at": None}

    def get_iso_summary(self) -> Dict[str, Any]:
        """Get ISO 14064 compliance summary grouped by scope."""
        scope_totals: Dict[int, float] = {1: 0.0, 2: 0.0, 3: 0.0}
        for r in self._records:
            scope = r.get("iso_14064", {}).get("scope", 2)
            scope_totals[scope] += r.get("carbon_kg", 0.0)

        total = sum(scope_totals.values())
        return {
            "total_carbon_kg": round(total, 4),
            "scope_1_kg": round(scope_totals[1], 4),
            "scope_2_kg": round(scope_totals[2], 4),
            "scope_3_kg": round(scope_totals[3], 4),
            "total_records": len(self._records),
            "chain_integrity": self.verify_chain(),
        }

    def export_audit_text(self) -> str:
        """Generate a plaintext audit report (fallback if fpdf2 not available)."""
        lines = []
        lines.append("=" * 70)
        lines.append("ISO 14064 COMPLIANCE AUDIT REPORT")
        lines.append(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append("=" * 70)

        summary = self.get_iso_summary()
        lines.append(f"\nTotal Records: {summary['total_records']}")
        lines.append(f"Chain Integrity: {'VALID' if summary['chain_integrity']['valid'] else 'BROKEN'}")
        lines.append(f"\nTotal Carbon: {summary['total_carbon_kg']:.4f} kgCO₂")
        lines.append(f"  Scope 1 (Direct): {summary['scope_1_kg']:.4f} kgCO₂")
        lines.append(f"  Scope 2 (Electricity): {summary['scope_2_kg']:.4f} kgCO₂")
        lines.append(f"  Scope 3 (Indirect): {summary['scope_3_kg']:.4f} kgCO₂")

        lines.append(f"\n{'='*70}")
        lines.append("DECISION LOG")
        lines.append(f"{'='*70}\n")

        for r in self._records:
            lines.append(f"[#{r['sequence_number']}] Batch: {r['batch_id']}")
            lines.append(f"  Time: {r['timestamp_iso']}")
            lines.append(f"  Decision: {r['human_decision']}")
            lines.append(f"  Carbon: {r['carbon_kg']:.4f} kgCO₂ | Energy: {r['energy_kwh']:.2f} kWh")
            lines.append(f"  Quality Δ: {r['quality_delta']:+.6f}")
            lines.append(f"  Hash: {r['record_hash'][:16]}...")
            lines.append(f"  Prev:  {r['prev_hash'][:16]}...")
            lines.append("")

        return "\n".join(lines)
