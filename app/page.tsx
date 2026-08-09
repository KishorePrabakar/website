import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">Kishore Prabakar</h1>
          <p className="text-2xl text-purple-200 mb-8">Software Developer & Problem Solver</p>

          <div className="flex justify-center gap-4 mb-12">
            <Link href="/radar">
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition">
                Job Radar
              </button>
            </Link>
            <Link href="/projects">
              <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition">
                Projects
              </button>
            </Link>
            <Link href="/conquer">
              <button className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-lg transition">
                Conquer
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">🔥 Job Radar</h3>
              <p className="text-purple-200">AI-powered job intelligence with hot jobs detection, skills analysis, and automated applications</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">🚀 Projects</h3>
              <p className="text-purple-200">Explore my portfolio of software projects and experiments</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">⚡ Conquer</h3>
              <p className="text-purple-200">Track your impossible goals and achieve your dreams</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}