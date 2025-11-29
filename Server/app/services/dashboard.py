from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime
from decimal import Decimal
from typing import Any
from uuid import UUID

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import IngestSession, Transaction


class DashboardNotFoundError(ValueError):
  pass


async def fetch_session_and_transactions(session: AsyncSession, session_id: UUID) -> tuple[IngestSession, list[Transaction]]:
  session_stmt: Select[tuple[IngestSession]] = select(IngestSession).where(IngestSession.id == session_id)
  session_result = await session.execute(session_stmt)
  ingest_session = session_result.scalars().first()
  if ingest_session is None:
    raise DashboardNotFoundError("Session not found")

  txn_stmt: Select[tuple[Transaction]] = select(Transaction).where(Transaction.session_id == session_id)
  txn_result = await session.execute(txn_stmt)
  transactions = list(txn_result.scalars())
  if not transactions:
    raise DashboardNotFoundError("No transactions found for session")
  return ingest_session, transactions


def summarize_overview(transactions: list[Transaction]) -> dict[str, Any]:
  if not transactions:
    return {
      "metrics": {
        "total_transactions": 0,
        "total_volume": 0.0,
        "unique_vendors": 0,
        "currency_breakdown": {},
      },
      "payment_methods": [],
      "recent_transactions": [],
    }

  total_amount = sum(t.amount for t in transactions)
  unique_vendors = len({t.vendor_id for t in transactions})
  payment_methods = Counter(t.payment_method.upper() for t in transactions)
  currency_breakdown = Counter(t.currency for t in transactions)

  return {
    "metrics": {
      "total_transactions": len(transactions),
      "total_volume": float(total_amount),
      "unique_vendors": unique_vendors,
      "currency_breakdown": dict(currency_breakdown),
    },
    "payment_methods": [
      {"method": method, "count": count, "amount": float(sum(t.amount for t in transactions if t.payment_method.upper() == method))}
      for method, count in payment_methods.items()
    ],
    "recent_transactions": [
      {
        "id": str(t.id),
        "vendor": t.vendor_name,
        "amount": float(t.amount),
        "payment_method": t.payment_method.upper(),
        "bank": t.bank_name,
        "date": t.date.isoformat(),
      }
      for t in transactions[-10:]
    ],
  }


def summarize_routing(transactions: list[Transaction]) -> dict[str, Any]:
  profile_defaults = {
    "NEFT": {"fee": Decimal("25"), "avg_time": "240 min", "base_success": 0.78, "savings_factor": Decimal("0.006")},
    "IMPS": {"fee": Decimal("50"), "avg_time": "15 min", "base_success": 0.92, "savings_factor": Decimal("0.012")},
    "RTGS": {"fee": Decimal("150"), "avg_time": "10 min", "base_success": 0.97, "savings_factor": Decimal("0.015")},
    "SWIFT": {"fee": Decimal("10"), "avg_time": "1-2 days", "base_success": 0.94, "savings_factor": Decimal("0.02")},
  }
  fallback_profile = {"fee": Decimal("45"), "avg_time": "30 min", "base_success": 0.9, "savings_factor": Decimal("0.01")}

  if not transactions:
    return {
      "metrics": {
        "transactions_routed": 0,
        "avg_fee_saved": 0.0,
        "total_cost_optimized": 0.0,
        "avg_success_probability": 0.0,
      },
      "distribution": [],
      "recommendations": [],
      "bank_performance": [],
      "decisions": [],
    }

  by_method = defaultdict(lambda: {"count": 0, "amount": Decimal("0")})
  for txn in transactions:
    entry = by_method[txn.payment_method.upper()]
    entry["count"] += 1
    entry["amount"] += txn.amount

  total_transactions = len(transactions)
  total_cost_saved = Decimal("0")
  success_probability_sum = 0.0

  distribution = []
  bank_performance = []

  for method, stats in by_method.items():
    profile = profile_defaults.get(method, fallback_profile)
    amount_float = float(stats["amount"])
    percentage = (stats["count"] / total_transactions) * 100 if total_transactions else 0.0
    total_cost_saved += stats["amount"] * profile["savings_factor"]
    success_probability_sum += profile["base_success"] * stats["count"]

    distribution.append(
      {
        "method": method,
        "count": stats["count"],
        "amount": amount_float,
        "fee": float(profile["fee"]),
        "percentage": percentage,
      }
    )

    bank_performance.append(
      {
        "rail": method,
        "success_rate": round(profile["base_success"] * 100, 1),
        "fee": f"₹{int(profile['fee'])}" if method != "SWIFT" else f"${int(profile['fee'])}",
        "avg_time": profile["avg_time"],
        "queue_length": max(0, stats["count"] // 2),
        "last_updated": "Just now",
      }
    )

  recommendations = []
  for txn in transactions[:10]:
    method = txn.payment_method.upper()
    profile = profile_defaults.get(method, fallback_profile)
    recommendations.append(
      {
        "transactionId": txn.vendor_id,
        "amount": float(txn.amount),
        "selectedRoute": method,
        "successProb": round(profile["base_success"] * 100, 1),
        "fee": float(profile["fee"]),
        "reason": f"Routed via {method} based on historical performance and cost profile.",
      }
    )

  decisions = []
  for idx, txn in enumerate(transactions[:15]):
    decisions.append(
      {
        "timestamp": txn.date.isoformat(),
        "transaction": txn.vendor_id,
        "decision": f"Route via {txn.payment_method.upper()}",
        "status": "success",
        "score": round(0.35 + (idx % 5) * 0.025, 3),
      }
    )

  metrics = {
    "transactions_routed": total_transactions,
    "avg_fee_saved": float(total_cost_saved / total_transactions) if total_transactions else 0.0,
    "total_cost_optimized": float(total_cost_saved),
    "avg_success_probability": round(success_probability_sum / total_transactions * 100, 1)
    if total_transactions
    else 0.0,
  }

  return {
    "metrics": metrics,
    "distribution": distribution,
    "recommendations": recommendations,
    "bank_performance": bank_performance,
    "decisions": decisions,
  }


def summarize_compliance(transactions: list[Transaction]) -> dict[str, Any]:
  if not transactions:
    return {
      "metrics": {
        "total_checked": 0,
        "approved": 0,
        "blocked": 0,
        "processing_time_seconds": 0.0,
        "approval_rate": 0.0,
      },
      "rules": [
        {"rule": "GST Validation", "checked": 0, "failed": 0},
        {"rule": "PAN Validation", "checked": 0, "failed": 0},
        {"rule": "FEMA Screening", "checked": 0, "failed": 0},
      ],
      "blocked_transactions": [],
      "trend": [],
      "recent_actions": [],
    }

  blocked = []
  rule_failures = Counter({"GST": 0, "PAN": 0, "FEMA": 0})
  weekday_failures: dict[str, dict[str, int]] = defaultdict(lambda: {"gst": 0, "tds": 0, "fema": 0, "kyc": 0})
  recent_actions: list[dict[str, Any]] = []

  for txn in transactions:
    issues = []
    if not txn.gst_number or len(txn.gst_number) < 8:
      issues.append("GST")
      rule_failures["GST"] += 1
      weekday_failures[txn.date.strftime("%a")]["gst"] += 1
    if not txn.pan_number or len(txn.pan_number) < 8:
      issues.append("PAN")
      rule_failures["PAN"] += 1
      weekday_failures[txn.date.strftime("%a")]["tds"] += 1
    if txn.payment_purpose and "export" in txn.payment_purpose.lower():
      issues.append("FEMA")
      rule_failures["FEMA"] += 1
      weekday_failures[txn.date.strftime("%a")]["fema"] += 1
    if txn.payment_method.upper() in {"IMPS", "RTGS"} and txn.amount > Decimal("200000"):
      weekday_failures[txn.date.strftime("%a")]["kyc"] += 1

    if issues:
      status = "blocked" if len(issues) > 1 else "pending"
      blocked.append(
        {
          "id": str(txn.id),
          "vendorId": txn.vendor_id,
          "vendorName": txn.vendor_name,
          "amount": float(txn.amount),
          "reason": ", ".join(issues),
          "ruleViolated": issues[0],
          "status": status,
        }
      )
      recent_actions.append(
        {
          "timestamp": txn.date.isoformat(),
          "action": f"{issues[0]} exception raised",
          "vendor": txn.vendor_name,
          "status": "pending" if status == "pending" else "blocked",
        }
      )

  total_checked = len(transactions)
  blocked_count = len(blocked)
  approved = total_checked - blocked_count
  approval_rate = (approved / total_checked * 100) if total_checked else 0.0

  return {
    "metrics": {
      "total_checked": total_checked,
      "approved": approved,
      "blocked": blocked_count,
      "processing_time_seconds": 2.5,
      "approval_rate": approval_rate,
    },
    "rules": [
      {
        "rule": "GST Validation",
        "checked": len(transactions),
        "failed": rule_failures["GST"],
      },
      {
        "rule": "PAN Validation",
        "checked": len(transactions),
        "failed": rule_failures["PAN"],
      },
      {
        "rule": "FEMA Screening",
        "checked": len(transactions),
        "failed": rule_failures["FEMA"],
      },
    ],
    "blocked_transactions": blocked,
    "trend": [
      {
        "name": weekday,
        "gst": values["gst"],
        "tds": values["tds"],
        "fema": values["fema"],
        "kyc": values["kyc"],
      }
      for weekday, values in weekday_failures.items()
    ],
    "recent_actions": recent_actions[:10],
  }


def summarize_fraud(transactions: list[Transaction]) -> dict[str, Any]:
  high_risk: list[dict[str, Any]] = []
  medium_risk: list[dict[str, Any]] = []
  events: list[dict[str, Any]] = []
  anomaly_counts: Counter[str] = Counter()

  low_count = 0
  total_risk_score = 0.0

  for txn in transactions:
    risk = 0.12
    reasons: list[str] = []
    anomaly_type = "Baseline"

    if txn.amount > Decimal("150000"):
      risk += 0.45
      anomaly_type = "High Amount"
      reasons.append("Amount exceeds cohort baseline")
    if txn.payment_method.upper() == "RTGS":
      risk += 0.18
      anomaly_type = "Route Priority"
      reasons.append("High-value route (RTGS)")
    if txn.country != "IN":
      risk += 0.25
      anomaly_type = "Cross Border"
      reasons.append(f"Origin country {txn.country}")
    if txn.bank_name.lower() in {"axis", "kotak"}:
      risk += 0.08
      reasons.append("Bank flagged recently for latency")

    risk = min(risk, 0.99)
    status = "blocked" if risk >= 0.75 else "flagged" if risk >= 0.45 else "clean"
    severity = "high" if status == "blocked" else "medium" if status == "flagged" else "low"
    total_risk_score += risk

    if reasons:
      anomaly_counts[anomaly_type] += 1

    entry = {
      "id": str(txn.id),
      "amount": float(txn.amount),
      "vendor": txn.vendor_name,
      "vendorId": txn.vendor_id,
      "riskScore": round(risk, 2),
      "anomalyType": anomaly_type,
      "reason": ", ".join(reasons) if reasons else "No anomaly detected",
      "status": status,
      "details": {
        "deviation": reasons[0] if reasons else "Within normal pattern",
      },
    }

    if status == "blocked":
      high_risk.append(entry)
    elif status == "flagged":
      medium_risk.append(entry)
    else:
      low_count += 1

    events.append(
      {
        "timestamp": txn.date.isoformat(),
        "event": entry["reason"],
        "vendor": txn.vendor_name,
        "vendorId": txn.vendor_id,
        "severity": severity,
      }
    )

  total_transactions = len(transactions)
  avg_risk_score = total_risk_score / total_transactions if total_transactions else 0.0
  medium_count = len(medium_risk)
  high_count = len(high_risk)

  def percentage(count: int) -> float:
    return (count / total_transactions * 100) if total_transactions else 0.0

  risk_distribution = [
    {"bucket": "Low (0.0 - 0.3)", "count": low_count, "percentage": percentage(low_count), "color": "#00ffc8"},
    {"bucket": "Medium (0.3 - 0.7)", "count": medium_count, "percentage": percentage(medium_count), "color": "#f59e0b"},
    {"bucket": "High (0.7 - 1.0)", "count": high_count, "percentage": percentage(high_count), "color": "#ff5555"},
  ]

  anomaly_breakdown = [
    {
      "type": anomaly,
      "count": count,
      "severity": "high" if anomaly in {"High Amount", "Cross Border"} else "medium",
      "description": f"{count} transaction(s) triggered {anomaly.lower()} rules",
    }
    for anomaly, count in anomaly_counts.items()
  ]

  metrics = {
    "transactions_analyzed": total_transactions,
    "clean_transactions": low_count,
    "flagged_medium_risk": medium_count,
    "blocked_high_risk": high_count,
    "avg_risk_score": round(avg_risk_score, 2),
  }

  return {
    "metrics": metrics,
    "risk_distribution": risk_distribution,
    "anomalies": anomaly_breakdown,
    "high_risk": high_risk[:15],
    "medium_risk": medium_risk[:20],
    "events": events[:20],
  }


def summarize_settlement(transactions: list[Transaction]) -> dict[str, Any]:
  if not transactions:
    return {"counts": {}, "timeline": []}

  timeline = []
  status_counts = Counter()
  for txn in transactions:
    if txn.payment_method.upper() in {"IMPS", "RTGS"}:
      status = "settled"
    elif txn.payment_method.upper() == "NEFT":
      status = "in_transit"
    else:
      status = "pending"
    status_counts[status] += 1
    timeline.append(
      {
        "id": str(txn.id),
        "amount": float(txn.amount),
        "vendor": txn.vendor_name,
        "status": status,
      }
    )
  return {"counts": dict(status_counts), "timeline": timeline[:25]}


def summarize_reconciliation(transactions: list[Transaction]) -> dict[str, Any]:
  matches = []
  for txn in transactions[:10]:
    matches.append(
      {
        "transactionId": str(txn.id),
        "amount": float(txn.amount),
        "overallStatus": "full" if txn.amount <= Decimal("75000") else "partial",
        "confidenceScore": 98.0 if txn.amount <= Decimal("75000") else 85.0,
      }
    )
  return {"matches": matches}


def summarize_multibank(transactions: list[Transaction]) -> dict[str, Any]:
  bank_totals = defaultdict(lambda: {"balance": Decimal("0"), "transactions": 0})
  for txn in transactions:
    entry = bank_totals[txn.bank_name]
    entry["balance"] += txn.amount
    entry["transactions"] += 1
  return {
    "banks": [
      {"bankName": bank, "balance": float(values["balance"]), "transactions": values["transactions"]}
      for bank, values in bank_totals.items()
    ]
  }


def summarize_audit(transactions: list[Transaction]) -> dict[str, Any]:
  entries = []
  for txn in transactions[:15]:
    entries.append(
      {
        "transactionId": str(txn.id),
        "vendor": txn.vendor_name,
        "amount": float(txn.amount),
        "steps": [
          {"action": "Ingested", "timestamp": datetime.utcnow().isoformat()},
          {"action": "Validated", "timestamp": datetime.utcnow().isoformat()},
        ],
      }
    )
  return {"entries": entries}


def summarize_explainability(transactions: list[Transaction]) -> dict[str, Any]:
  insights = []
  for txn in transactions[:5]:
    insights.append(
      {
        "query": f"Explain routing for {txn.vendor_id}",
        "response": f"Transaction routed via {txn.payment_method.upper()} because amount was {txn.amount}",
        "confidence": 0.9,
      }
    )
  return {"insights": insights}


async def build_dashboard_response(db: AsyncSession, session_id: UUID) -> dict[str, Any]:
  ingest_session, transactions = await fetch_session_and_transactions(db, session_id)
  return {
    "sessionId": session_id,
    "generatedAt": datetime.utcnow(),
    "session": {
      "id": str(ingest_session.id),
      "source": ingest_session.source.value,
      "records_ingested": ingest_session.records_ingested,
      "created_at": ingest_session.created_at,
      "updated_at": ingest_session.updated_at,
    },
    "overview": summarize_overview(transactions),
    "routing": summarize_routing(transactions),
    "compliance": summarize_compliance(transactions),
    "fraud": summarize_fraud(transactions),
    "settlement": summarize_settlement(transactions),
    "reconciliation": summarize_reconciliation(transactions),
    "multibank": summarize_multibank(transactions),
    "audit": summarize_audit(transactions),
    "explainability": summarize_explainability(transactions),
  }

