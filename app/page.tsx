import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen p-4 hidden lg:block">
          <DashboardSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Job Radar</h1>
            <p className="text-purple-200">AI-Powered Job Intelligence Dashboard</p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="flex gap-4">
              <Input
                placeholder="Search jobs, skills, companies..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button className="bg-purple-600 hover:bg-purple-700">Search</Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">1,234</CardTitle>
                <CardDescription className="text-purple-200">Total Jobs</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">56</CardTitle>
                <CardDescription className="text-purple-200">Hot Jobs</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">12</CardTitle>
                <CardDescription className="text-purple-200">Skills Gaps</CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">89</CardTitle>
                <CardDescription className="text-purple-200">Applications</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hot Jobs Section */}
            <div className="lg:col-span-2">
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">🔥 Hot Jobs</CardTitle>
                  <CardDescription className="text-purple-200">Trending opportunities based on market velocity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-white font-semibold">Senior Software Engineer</h3>
                          <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded">98% Match</span>
                        </div>
                        <p className="text-purple-200 text-sm mb-2">Tech Company • Remote • $120k-$150k</p>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Apply</Button>
                          <Button size="sm" variant="outline" className="border-white/20 text-white">Save</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills Gap Analysis */}
            <div>
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">📊 Skills Gap</CardTitle>
                  <CardDescription className="text-purple-200">Skills you need to acquire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['TypeScript', 'GraphQL', 'AWS', 'Docker', 'Kubernetes'].map((skill, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-white text-sm">{skill}</span>
                        <span className="text-purple-300 text-xs">+{20 + i * 5}% demand</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">View Analysis</Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 mt-4">
                <CardHeader>
                  <CardTitle className="text-white">📈 Market Trends</CardTitle>
                  <CardDescription className="text-purple-200">Current market insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">React</span>
                      <span className="text-green-400 text-xs">↑ 15%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Node.js</span>
                      <span className="text-green-400 text-xs">↑ 12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Python</span>
                      <span className="text-green-400 text-xs">↑ 18%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">TypeScript</span>
                      <span className="text-green-400 text-xs">↑ 22%</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">View Trends</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}