"use client"
import { Settings, Users, Lock, Bell, Palette, Database } from "lucide-react"

export default function SettingsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Platform configuration & user management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: "User Management", icon: <Users className="w-5 h-5" />, desc: "Manage team members and roles" },
          { title: "Security", icon: <Lock className="w-5 h-5" />, desc: "API keys, encryption, and access control" },
          { title: "Notifications", icon: <Bell className="w-5 h-5" />, desc: "Alert preferences and channels" },
          { title: "Appearance", icon: <Palette className="w-5 h-5" />, desc: "Theme and UI preferences" },
          { title: "Data & Privacy", icon: <Database className="w-5 h-5" />, desc: "Data retention and compliance" },
          { title: "General Settings", icon: <Settings className="w-5 h-5" />, desc: "Platform configuration" },
        ].map((setting, i) => (
          <div key={i} className="glass-card p-6 hover:border-neon-blue/50 transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="text-neon-cyan mt-1">{setting.icon}</div>
              <div>
                <h3 className="font-semibold text-foreground">{setting.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{setting.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
