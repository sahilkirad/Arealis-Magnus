"use client"

import { useState } from "react"
import { 
  MessageSquare, 
  Send, 
  Lightbulb, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  Share2,
  Bookmark,
  Clock,
  Zap,
  Brain,
  HelpCircle,
  ChevronRight,
  Loader2
} from "lucide-react"
import { KPICard } from "@/components/dashboard/components/kpi-cards-row"

interface QueryResponse {
  id: string
  query: string
  response: {
    title: string
    summary: string
    details: {
      label: string
      value: string
      highlight?: boolean
    }[]
    reasoning?: string[]
    conclusion?: string
    confidence: number
    model: string
    latency: string
  }
  timestamp: string
}

const sampleQueries = [
  "Why did TRF_001 succeed?",
  "What blocked transaction TRF_045?",
  "Why was fraud risk 0.72 for TRF_789?",
  "Explain route selection for TRF_001",
  "How long did TRF_001 take to settle?",
]

const sampleResponses: QueryResponse[] = [
  {
    id: "1",
    query: "Why did transaction TRF_045 fail?",
    response: {
      title: "Transaction TRF_045 Analysis",
      summary: "Amount: ₹75,000 | Vendor: Vendor XYZ | Date: 2025-03-15 10:35 AM",
      details: [
        { label: "ROOT CAUSE", value: "Compliance Failure", highlight: true },
        { label: "Specific Issue", value: "GST Certificate Expired" },
        { label: "Expiry Date", value: "2025-02-28" },
        { label: "Current Date", value: "2025-03-15" },
        { label: "Days Past Expiry", value: "15 days", highlight: true },
      ],
      reasoning: [
        "Vendor's GST certificate expired on 2025-02-28",
        "This is the 3rd time this vendor's GST has expired",
        "Previous instances: Oct 2024, Dec 2024",
        "Pattern: Vendor consistently renews late"
      ],
      conclusion: "Contact Vendor XYZ immediately. Request updated GST certificate. Resubmit payment once received.",
      confidence: 100,
      model: "Compliance-Agent-v1",
      latency: "156ms"
    },
    timestamp: "10 mins ago"
  },
  {
    id: "2",
    query: "Why was transaction TRF_001 routed to IMPS instead of NEFT?",
    response: {
      title: "Transaction TRF_001 Routing Analysis",
      summary: "Amount: ₹50,000 | Vendor: Vendor ABC | Route Selected: IMPS",
      details: [
        { label: "Available Routes", value: "NEFT ✓ | IMPS ✓ | RTGS ✓" },
        { label: "Selected Route", value: "IMPS", highlight: true },
        { label: "NEFT Score", value: "0.235" },
        { label: "IMPS Score", value: "0.472 ⭐ HIGHEST", highlight: true },
        { label: "RTGS Score", value: "0.380" },
      ],
      reasoning: [
        "Step 1: All routes eligible (amount < ₹5L, domestic, no urgency constraint)",
        "Step 2: Real-time stats - NEFT: 78% success, IMPS: 92% success, RTGS: 98% success",
        "Step 3: Scoring - IMPS wins with best balance of success rate, cost, and speed",
        "IMPS: 92% success is sufficient + affordable (₹50) + fast (15 min)",
        "Saves ₹100 vs RTGS while being 225x faster than NEFT"
      ],
      conclusion: "IMPS selected because it offers the optimal balance of reliability (92%), cost (₹50), and speed (15 min) for this transaction amount.",
      confidence: 100,
      model: "Routing-Optimizer-v2.1",
      latency: "245ms"
    },
    timestamp: "5 mins ago"
  },
  {
    id: "3",
    query: "Why did transaction TRF_789 have fraud risk 0.72?",
    response: {
      title: "Transaction TRF_789 Fraud Risk Analysis",
      summary: "Amount: ₹1,50,000 | Vendor: Supplier New | Risk Score: 0.72",
      details: [
        { label: "Risk Level", value: "FLAGGED (Medium Risk)", highlight: true },
        { label: "Account Changed", value: "+40 points (High Signal)" },
        { label: "Large Amount", value: "+35 points (3x normal)", highlight: true },
        { label: "New Vendor", value: "+5 points (< 6 months)" },
        { label: "Total Points", value: "80 → Score 0.72/1.0" },
      ],
      reasoning: [
        "Bank account changed from 1234567890 to 9876543210",
        "This is vendor's 1st payment to the new account",
        "Current payment (₹1,50,000) is 3x the average (₹50,000)",
        "Combination of account change + large amount = suspicious pattern",
        "Could indicate: Account takeover OR legitimate business change"
      ],
      conclusion: "Contact vendor to verify: 'You requested payment to new account?' Approve/Reject based on vendor response. Add context for future similar payments.",
      confidence: 87,
      model: "Fraud-Detection-RF-v3.2",
      latency: "389ms"
    },
    timestamp: "2 mins ago"
  },
]

const recentQueries = [
  { query: "Why was TXN-2024-8741 routed via IMPS?", timestamp: "2 min ago", model: "Routing-v2", latency: "245ms" },
  { query: "Explain fraud score for vendor-9824", timestamp: "8 min ago", model: "Fraud-RF-v3", latency: "389ms" },
  { query: "Why did settlement fail for STL-2024-2847?", timestamp: "15 min ago", model: "Settlement-v1", latency: "156ms" },
  { query: "What caused reconciliation exception?", timestamp: "32 min ago", model: "Recon-ML-v2", latency: "421ms" },
]

const savedExplanations = [
  { title: "Fraud Detection Model – Velocity Check Algorithm", savedAt: "3h ago", views: 12, usefulness: "95%" },
  { title: "Settlement Route Optimization Logic", savedAt: "1d ago", views: 28, usefulness: "87%" },
  { title: "3-Way Reconciliation Matching Rules", savedAt: "2d ago", views: 45, usefulness: "92%" },
]

export default function ExplainabilitySection() {
  const [inputQuery, setInputQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<QueryResponse | null>(sampleResponses[0])
  const [chatHistory, setChatHistory] = useState<QueryResponse[]>(sampleResponses)

  const handleSubmitQuery = () => {
    if (!inputQuery.trim()) return
    
    setIsLoading(true)
    
    // Simulate API response
    setTimeout(() => {
      const newResponse: QueryResponse = {
        id: Date.now().toString(),
        query: inputQuery,
        response: {
          title: `Analysis for: ${inputQuery}`,
          summary: "Processing your query with AI-powered explainability...",
          details: [
            { label: "Query Type", value: "Custom Analysis" },
            { label: "Status", value: "Analyzed", highlight: true },
          ],
          reasoning: [
            "Query received and processed by Gemini Pro",
            "Relevant context retrieved from transaction database",
            "Explanation generated based on system rules and ML models"
          ],
          conclusion: "This is a simulated response. In production, this would contain detailed explanations from the LangChain + Gemini Pro integration.",
          confidence: 94,
          model: "Gemini-Pro-v1",
          latency: "1.2s"
        },
        timestamp: "Just now"
      }
      
      setChatHistory([newResponse, ...chatHistory])
      setCurrentResponse(newResponse)
      setInputQuery("")
      setIsLoading(false)
    }, 2000)
  }

  const selectSampleQuery = (query: string) => {
    setInputQuery(query)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Explainability Agent</h1>
          <p className="text-muted-foreground mt-1">AI-powered reasoning & decision transparency</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00ffc8]/10 border border-[#00ffc8]/30">
          <div className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
          <span className="text-sm font-medium text-[#00ffc8]">Agent Active</span>
          <span className="text-xs text-muted-foreground">| Gemini Pro</span>
        </div>
      </div>

      {/* Agent Status */}
      <div
        className="rounded-lg border border-white/10 p-4"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00ffc8]" />
            <span className="text-muted-foreground">Status:</span>
            <span className="font-semibold text-[#00ffc8]">ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#33a5ff]" />
            <span className="text-muted-foreground">Model:</span>
            <span className="font-semibold text-foreground">Gemini Pro</span>
          </div>
          <div>
            <span className="text-muted-foreground">Integration:</span>
            <span className="ml-2 font-semibold text-foreground">LangChain + LangGraph</span>
          </div>
          <div>
            <span className="text-muted-foreground">Response Time:</span>
            <span className="ml-2 font-semibold text-foreground">1-3 seconds</span>
          </div>
          <div>
            <span className="text-muted-foreground">Accuracy:</span>
            <span className="ml-2 font-semibold text-[#00ffc8]">94%</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Models Tracked" value="8" trend="All active" trendPositive color="blue" />
        <KPICard title="Explainability Rate" value="92.4%" trend="+2.1%" trendPositive color="green" />
        <KPICard title="Queries Today" value="156" trend="+15%" trendPositive color="blue" />
        <KPICard title="Avg Latency" value="287ms" trend="-15% vs week" trendPositive color="green" />
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Input Panel */}
        <div
          className="rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#33a5ff]" />
            Ask the Agent
          </h3>
          
          {/* Input */}
          <div className="relative mb-4">
            <textarea
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question about any transaction..."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#33a5ff] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmitQuery()
                }
              }}
            />
            <button
              onClick={handleSubmitQuery}
              disabled={isLoading || !inputQuery.trim()}
              className={`absolute bottom-3 right-3 p-2 rounded-lg transition-all ${
                isLoading || !inputQuery.trim()
                  ? "bg-white/10 text-muted-foreground cursor-not-allowed"
                  : "bg-[#33a5ff] text-white hover:bg-[#33a5ff]/80"
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Sample Queries */}
          <p className="text-xs text-muted-foreground mb-2">Example queries:</p>
          <div className="space-y-2">
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => selectSampleQuery(q)}
                className="w-full text-left p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#33a5ff]/30 transition-all text-sm text-foreground flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4 text-[#33a5ff]" />
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Response Panel */}
        <div
          className="lg:col-span-2 rounded-lg border border-white/10 p-6"
          style={{
            background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 30px rgba(51, 165, 255, 0.1)",
          }}
        >
          {currentResponse ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Query:</p>
                  <p className="text-sm font-medium text-[#33a5ff]">"{currentResponse.query}"</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors" title="Copy">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors" title="Share">
                    <Share2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors" title="Save">
                    <Bookmark className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Title & Summary */}
                <div className="p-4 rounded-lg bg-[#33a5ff]/10 border border-[#33a5ff]/30">
                  <h4 className="font-semibold text-foreground mb-1">{currentResponse.response.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentResponse.response.summary}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {currentResponse.response.details.map((detail, idx) => (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-lg ${
                        detail.highlight 
                          ? "bg-[#00ffc8]/10 border border-[#00ffc8]/30" 
                          : "bg-white/5 border border-white/10"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">{detail.label}</p>
                      <p className={`text-sm font-medium ${detail.highlight ? "text-[#00ffc8]" : "text-foreground"}`}>
                        {detail.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Reasoning */}
                {currentResponse.response.reasoning && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Model Reasoning</p>
                    <div className="space-y-1">
                      {currentResponse.response.reasoning.map((reason, idx) => (
                        <p key={idx} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-[#33a5ff]">{idx + 1}.</span>
                          {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conclusion */}
                {currentResponse.response.conclusion && (
                  <div className="p-4 rounded-lg bg-[#00ffc8]/10 border border-[#00ffc8]/30">
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Conclusion & Recommendation</p>
                    <p className="text-sm text-foreground">{currentResponse.response.conclusion}</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Model: {currentResponse.response.model}</span>
                    <span>|</span>
                    <span>Confidence: {currentResponse.response.confidence}%</span>
                    <span>|</span>
                    <span>Latency: {currentResponse.response.latency}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Helpful?</span>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <ThumbsUp className="w-4 h-4 text-muted-foreground hover:text-[#00ffc8]" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                      <ThumbsDown className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Lightbulb className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Ask a question to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Queries */}
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#33a5ff]" />
          Recent Queries
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Query</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Model</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Latency</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentQueries.map((query, idx) => (
                <tr 
                  key={idx} 
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => {
                    const response = sampleResponses.find(r => r.query.includes(query.query.split(" ")[2]))
                    if (response) setCurrentResponse(response)
                  }}
                >
                  <td className="py-3 px-4 text-sm text-foreground">{query.query}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-[#33a5ff]/10 text-[#33a5ff]">
                      {query.model}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{query.latency}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">{query.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Saved Explanations */}
      <div
        className="rounded-lg border border-white/10 p-6"
        style={{
          background: "linear-gradient(135deg, rgba(20,30,60,0.4) 0%, rgba(20,20,40,0.2) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[#f59e0b]" />
          Saved Explanations
        </h3>
        <div className="space-y-3">
          {savedExplanations.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Views: {item.views} | Usefulness: {item.usefulness}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{item.savedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
