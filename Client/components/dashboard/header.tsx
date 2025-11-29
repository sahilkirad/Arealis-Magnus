"use client"

import { useState, useEffect } from "react"
import { 
  Menu, 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  ChevronDown, 
  Calendar, 
  RefreshCw, 
  Download, 
  Settings,
  Database,
  Wifi,
  Upload as UploadIcon
} from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
  sessionType?: "csv" | "live" | null
  transactionCount?: number
  lastUpdated?: Date
}

export default function Header({ 
  onMenuClick, 
  sessionType = "csv",
  transactionCount = 1000,
  lastUpdated = new Date()
}: HeaderProps) {
  const [theme, setTheme] = useState("dark")
  const [environment, setEnvironment] = useState("sandbox")
  const [dateRange, setDateRange] = useState("today")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(lastUpdated)

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setCurrentTime(new Date())
    }, 1500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-4 gap-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-accent/20 rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {/* Platform Switcher */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="text-sm font-semibold text-foreground">Arealis Magnus</div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Session Info Badge */}
          {sessionType && (
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              sessionType === "live" 
                ? "bg-[#00ffc8]/10 border-[#00ffc8]/30" 
                : "bg-[#33a5ff]/10 border-[#33a5ff]/30"
            }`}>
              {sessionType === "live" ? (
                <>
                  <Wifi className="w-4 h-4 text-[#00ffc8]" />
                  <span className="text-xs font-medium text-[#00ffc8]">Live API Connected</span>
                  <span className="w-2 h-2 rounded-full bg-[#00ffc8] animate-pulse" />
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4 text-[#33a5ff]" />
                  <span className="text-xs font-medium text-[#33a5ff]">CSV Upload</span>
                </>
              )}
            </div>
          )}

          {/* Data Source Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{transactionCount.toLocaleString()}</span> transactions loaded
            </span>
          </div>

          {/* Environment Tags */}
          <div className="hidden xl:flex gap-2">
            {["Sandbox", "Production"].map((env) => (
              <button
                key={env}
                onClick={() => setEnvironment(env.toLowerCase())}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  environment === env.toLowerCase()
                    ? "bg-neon-blue/30 border border-neon-blue text-neon-cyan"
                    : "bg-accent/20 border border-accent text-muted-foreground hover:bg-accent/30"
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Section - Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Trace ID, UTR, Amount..."
              className="w-full bg-accent/20 border border-accent rounded-lg pl-9 pr-4 py-2 text-sm placeholder-muted-foreground text-foreground focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Last Updated */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span>Last Updated:</span>
            <span className="font-medium text-foreground">{formatTime(currentTime)}</span>
          </div>

          {/* Date Filter */}
          <div className="hidden md:flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-accent/20 border border-accent rounded-lg px-3 py-1.5 text-sm text-foreground cursor-pointer focus:outline-none focus:border-neon-blue transition-all"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-accent/20 rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Export */}
            <button
              className="p-2 hover:bg-accent/20 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Export Data"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* Settings */}
            <button
              className="p-2 hover:bg-accent/20 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1" />

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:bg-accent/20 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-accent/20 rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
          </button>

          {/* User Avatar */}
          <button className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center text-foreground font-semibold text-sm hover:shadow-lg transition-all glow-cyan">
            RM
          </button>
        </div>
      </div>
    </header>
  )
}
