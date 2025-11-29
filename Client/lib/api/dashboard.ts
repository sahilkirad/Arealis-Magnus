"use client"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000/api/v1"

export interface OverviewMetrics {
  total_transactions: number
  total_volume: number
  unique_vendors: number
  currency_breakdown: Record<string, number>
}

export interface OverviewPaymentMethod {
  method: string
  count: number
  amount: number
}

export interface OverviewRecentTransaction {
  id: string
  vendor: string
  amount: number
  payment_method: string
  bank: string
  date: string
}

export interface OverviewPayload {
  metrics: OverviewMetrics
  payment_methods: OverviewPaymentMethod[]
  recent_transactions: OverviewRecentTransaction[]
}

export interface RoutingRecommendation {
  transactionId: string
  amount: number
  selectedRoute: string
  successProb: number
  fee: number
  reason: string
}

export interface RoutingPayload {
  metrics: {
    transactions_routed: number
    avg_fee_saved: number
    total_cost_optimized: number
    avg_success_probability: number
  }
  distribution: Array<{
    method: string
    count: number
    amount: number
    fee: number
    percentage: number
  }>
  recommendations: RoutingRecommendation[]
  bank_performance: Array<{
    rail: string
    success_rate: number
    fee: string
    avg_time: string
    queue_length: number
    last_updated: string
  }>
  decisions: Array<{
    timestamp: string
    transaction: string
    decision: string
    status: string
    score: number
  }>
}

export interface ComplianceRuleSummary {
  rule: string
  checked: number
  failed: number
}

export interface ComplianceBlockedTransaction {
  id: string
  vendorId: string
  vendorName: string
  amount: number
  reason: string
  ruleViolated: string
  status: string
}

export interface ComplianceRecentAction {
  timestamp: string
  action: string
  vendor: string
  status: string
}

export interface ComplianceTrendPoint {
  name: string
  gst: number
  tds: number
  fema: number
  kyc: number
}

export interface CompliancePayload {
  metrics: {
    total_checked: number
    approved: number
    blocked: number
    processing_time_seconds: number
    approval_rate: number
  }
  rules: ComplianceRuleSummary[]
  blocked_transactions: ComplianceBlockedTransaction[]
  trend: ComplianceTrendPoint[]
  recent_actions: ComplianceRecentAction[]
}

export interface FraudDistribution {
  low: number
  medium: number
  high: number
}

export interface FraudTransaction {
  id: string
  amount: number
  vendor: string
  vendorId: string
  riskScore: number
  anomalyType: string
  reason: string
  status: string
  details?: Record<string, string | undefined>
}

export interface FraudRiskSlice {
  bucket: string
  count: number
  percentage: number
  color: string
}

export interface FraudAnomalyBreakdown {
  type: string
  count: number
  severity: string
  description: string
}

export interface FraudEvent {
  timestamp: string
  event: string
  vendor: string
  vendorId: string
  severity: string
}

export interface FraudPayload {
  metrics: {
    transactions_analyzed: number
    clean_transactions: number
    flagged_medium_risk: number
    blocked_high_risk: number
    avg_risk_score: number
  }
  risk_distribution: FraudRiskSlice[]
  anomalies: FraudAnomalyBreakdown[]
  high_risk: FraudTransaction[]
  medium_risk: FraudTransaction[]
  events: FraudEvent[]
}

export interface SettlementTimelineItem {
  id: string
  amount: number
  vendor: string
  status: string
}

export interface SettlementPayload {
  counts: Record<string, number>
  timeline: SettlementTimelineItem[]
}

export interface ReconciliationMatch {
  transactionId: string
  amount: number
  overallStatus: string
  confidenceScore: number
}

export interface ReconciliationPayload {
  matches: ReconciliationMatch[]
}

export interface BankSummary {
  bankName: string
  balance: number
  transactions: number
}

export interface MultibankPayload {
  banks: BankSummary[]
}

export interface AuditEntryStep {
  action: string
  timestamp: string
}

export interface AuditEntry {
  transactionId: string
  vendor: string
  amount: number
  steps: AuditEntryStep[]
}

export interface AuditPayload {
  entries: AuditEntry[]
}

export interface ExplainabilityInsight {
  query: string
  response: string
  confidence: number
}

export interface ExplainabilityPayload {
  insights: ExplainabilityInsight[]
}

export interface SessionMetadata {
  id: string
  source: "csv" | "live" | string
  records_ingested: number
  created_at: string
  updated_at: string
}

export interface DashboardResponse {
  sessionId: string
  generatedAt: string
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
}

export async function fetchDashboard(
  sessionId: string,
  signal?: AbortSignal,
): Promise<DashboardResponse> {
  const endpoint = `${API_BASE_URL}/dashboard/${sessionId}`
  const response = await fetch(endpoint, {
    signal,
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Failed to load dashboard data (${response.status})`)
  }

  const payload = (await response.json()) as DashboardResponse
  return payload
}

