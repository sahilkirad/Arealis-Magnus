"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  fetchDashboard,
  type DashboardResponse,
} from "@/lib/api/dashboard"

interface DashboardDataContextValue {
  data: DashboardResponse | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const DashboardDataContext = createContext<DashboardDataContextValue | undefined>(undefined)

interface ProviderProps {
  sessionId?: string | null
  children: ReactNode
}

export function DashboardDataProvider({ sessionId, children }: ProviderProps) {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(sessionId))
  const [error, setError] = useState<string | null>(null)
  const [requestIndex, setRequestIndex] = useState(0)

  useEffect(() => {
    if (!sessionId) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    fetchDashboard(sessionId, controller.signal)
      .then((payload) => {
        if (!isMounted) return
        setData(payload)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!isMounted || controller.signal.aborted) return
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
        setData(null)
        setLoading(false)
      })

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [sessionId, requestIndex])

  const refresh = useCallback(() => {
    setRequestIndex((prev) => prev + 1)
  }, [])

  const value = useMemo<DashboardDataContextValue>(
    () => ({
      data,
      loading,
      error,
      refresh,
    }),
    [data, loading, error, refresh],
  )

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>
}

export function useDashboardDataContext(): DashboardDataContextValue {
  const context = useContext(DashboardDataContext)
  if (!context) {
    throw new Error("useDashboardDataContext must be used within a DashboardDataProvider")
  }
  return context
}

