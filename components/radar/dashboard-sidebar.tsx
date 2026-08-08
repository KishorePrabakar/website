import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function DashboardSidebar() {
  const menuItems = [
    { icon: "🏠", label: "Dashboard", active: true },
    { icon: "🔥", label: "Hot Jobs", active: false },
    { icon: "📊", label: "Skills Analysis", active: false },
    { icon: "📈", label: "Market Trends", active: false },
    { icon: "📧", label: "Applications", active: false },
    { icon: "⚙️", label: "Settings", active: false },
  ]

  return (
    <Card className="bg-white/10 border-white/20 h-full">
      <div className="p-4">
        <h2 className="text-white font-bold text-lg mb-6">Job Radar</h2>
        <nav className="space-y-2">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start ${
                item.active
                  ? "bg-purple-600 text-white"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Button>
          ))}
        </nav>
      </div>
    </Card>
  )
}