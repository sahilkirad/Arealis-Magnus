from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class OverviewMetrics(BaseModel):
  total_transactions: int
  total_volume: float
  unique_vendors: int
  currency_breakdown: Dict[str, int]


class OverviewPaymentMethod(BaseModel):
  method: str
  count: int
  amount: float


class OverviewRecentTransaction(BaseModel):
  id: str
  vendor: str
  amount: float
  payment_method: str
  bank: str
  date: str


class OverviewPayload(BaseModel):
  metrics: OverviewMetrics
  payment_methods: List[OverviewPaymentMethod]
  recent_transactions: List[OverviewRecentTransaction]


class RoutingMetrics(BaseModel):
  transactions_routed: int
  avg_fee_saved: float
  total_cost_optimized: float
  avg_success_probability: float


class RoutingDistributionItem(BaseModel):
  method: str
  count: int
  amount: float
  fee: float
  percentage: float


class RoutingRecommendation(BaseModel):
  transactionId: str
  amount: float
  selectedRoute: str
  successProb: float
  fee: float
  reason: str


class RoutingBankPerformanceItem(BaseModel):
  rail: str
  success_rate: float
  fee: str
  avg_time: str
  queue_length: int
  last_updated: str


class RoutingDecision(BaseModel):
  timestamp: str
  transaction: str
  decision: str
  status: str
  score: float


class RoutingPayload(BaseModel):
  metrics: RoutingMetrics
  distribution: List[RoutingDistributionItem]
  recommendations: List[RoutingRecommendation]
  bank_performance: List[RoutingBankPerformanceItem]
  decisions: List[RoutingDecision]


class ComplianceRuleSummary(BaseModel):
  rule: str
  checked: int
  failed: int


class ComplianceBlockedTransaction(BaseModel):
  id: str
  vendorId: str
  vendorName: str
  amount: float
  reason: str
  ruleViolated: str
  status: str


class ComplianceMetrics(BaseModel):
  total_checked: int
  approved: int
  blocked: int
  processing_time_seconds: float
  approval_rate: float


class ComplianceRecentAction(BaseModel):
  timestamp: str
  action: str
  vendor: str
  status: str


class ComplianceTrendPoint(BaseModel):
  name: str
  gst: int
  tds: int
  fema: int
  kyc: int


class CompliancePayload(BaseModel):
  metrics: ComplianceMetrics
  rules: List[ComplianceRuleSummary]
  blocked_transactions: List[ComplianceBlockedTransaction]
  trend: List[ComplianceTrendPoint]
  recent_actions: List[ComplianceRecentAction]


class FraudTransaction(BaseModel):
  id: str
  amount: float
  vendor: str
  vendorId: str
  riskScore: float
  anomalyType: str
  reason: str
  status: str
  details: Optional[Dict[str, Optional[str]]] = None


class FraudMetrics(BaseModel):
  transactions_analyzed: int
  clean_transactions: int
  flagged_medium_risk: int
  blocked_high_risk: int
  avg_risk_score: float


class FraudRiskSlice(BaseModel):
  bucket: str
  count: int
  percentage: float
  color: str


class FraudAnomalyBreakdown(BaseModel):
  type: str
  count: int
  severity: str
  description: str


class FraudEvent(BaseModel):
  timestamp: str
  event: str
  vendor: str
  vendorId: str
  severity: str


class FraudPayload(BaseModel):
  metrics: FraudMetrics
  risk_distribution: List[FraudRiskSlice]
  anomalies: List[FraudAnomalyBreakdown]
  high_risk: List[FraudTransaction]
  medium_risk: List[FraudTransaction]
  events: List[FraudEvent]


class SettlementTimelineItem(BaseModel):
  id: str
  amount: float
  vendor: str
  status: str


class SettlementPayload(BaseModel):
  counts: Dict[str, int]
  timeline: List[SettlementTimelineItem]


class ReconciliationMatch(BaseModel):
  transactionId: str
  amount: float
  overallStatus: str
  confidenceScore: float


class ReconciliationPayload(BaseModel):
  matches: List[ReconciliationMatch]


class BankSummary(BaseModel):
  bankName: str
  balance: float
  transactions: int


class MultibankPayload(BaseModel):
  banks: List[BankSummary]


class AuditEntry(BaseModel):
  transactionId: str
  vendor: str
  amount: float
  steps: List[Dict[str, str]]


class AuditPayload(BaseModel):
  entries: List[AuditEntry]


class ExplainabilityInsight(BaseModel):
  query: str
  response: str
  confidence: float


class ExplainabilityPayload(BaseModel):
  insights: List[ExplainabilityInsight]


class SessionMetadata(BaseModel):
  id: UUID
  source: str
  records_ingested: int
  created_at: datetime
  updated_at: datetime


class DashboardResponse(BaseModel):
  model_config = ConfigDict(from_attributes=True)

  sessionId: UUID
  generatedAt: datetime
  session: SessionMetadata
  overview: OverviewPayload
  routing: RoutingPayload
  compliance: CompliancePayload
  fraud: FraudPayload
  settlement: SettlementPayload
  reconciliation: ReconciliationPayload
  multibank: MultibankPayload
  audit: AuditPayload
  explainability: ExplainabilityPayload
