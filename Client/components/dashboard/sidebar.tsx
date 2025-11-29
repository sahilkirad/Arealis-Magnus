"use client"
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  Route,
  Banknote,
  CheckSquare,
  Building2,
  BookOpen,
  Lightbulb,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, category: "MAIN" },
  { id: "compliance", label: "Compliance", icon: Shield, category: "MAIN" },
  { id: "fraud", label: "Fraud", icon: AlertTriangle, category: "MAIN" },
  { id: "routing", label: "Routing", icon: Route, category: "MAIN" },
  { id: "settlement", label: "Settlement", icon: Banknote, category: "MAIN" },
  { id: "reconciliation", label: "Reconciliation", icon: CheckSquare, category: "MAIN" },
  { id: "multibanker", label: "Multi-Bank", icon: Building2, category: "MAIN" },
  { id: "audit-ledger", label: "Audit Ledger", icon: BookOpen, category: "MAIN" },
  { id: "explainability", label: "Explainability", icon: Lightbulb, category: "MAIN" },
  { id: "integrations", label: "Integrations", icon: Zap, category: "OTHERS" },
  { id: "settings", label: "Settings", icon: Settings, category: "OTHERS" },
]

export default function Sidebar({ activeSection, onSectionChange, isOpen, onToggle }: SidebarProps) {
  const categories = ["MAIN", "OTHERS"]

  return (
    <aside
      className={`flex flex-col transition-all duration-300 ease-out ${
        isOpen ? "w-64" : "w-20"
      } bg-sidebar border-r border-sidebar-border`}
    >
      {/* Logo / Branding */}
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
        <div className={`flex items-center gap-3 ${!isOpen && "justify-center w-full"}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-blue rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <div>
              <div className="font-bold text-sm text-foreground">Arealis</div>
              <div className="text-xs text-muted-foreground">Magnus</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        {categories.map((category) => (
          <div key={category}>
            {isOpen && (
              <div className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </div>
            )}
            <div className="space-y-1 px-2">
              {menuItems
                .filter((item) => item.category === category)
                .map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSectionChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 relative group ${
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/30"
                      }`}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan rounded-r-full glow-cyan" />
                      )}

                      <Icon className="w-5 h-5 flex-shrink-0" />

                      {isOpen && <span className="text-sm font-medium flex-1 text-left">{item.label}</span>}

                      {/* Hover glow effect */}
                      {isActive && isOpen && (
                        <div className="absolute inset-0 rounded-lg bg-neon-cyan opacity-0 group-hover:opacity-10 transition-opacity" />
                      )}
                    </button>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent/30 transition-colors text-sidebar-foreground"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  )
}
