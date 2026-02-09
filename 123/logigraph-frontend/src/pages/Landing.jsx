import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Navbar */}
      <header className="flex justify-between items-center px-10 py-6">
        <h1 className="text-2xl font-bold tracking-wide">
          LogiGraph
        </h1>

        <Link
          to="/login"
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <main className="px-10 mt-20 max-w-6xl mx-auto">
        <h2 className="text-5xl font-extrabold leading-tight">
          Real-Time Logistics  
          <span className="text-blue-500"> Optimization Platform</span>
        </h2>

        <p className="mt-6 text-lg text-slate-300 max-w-3xl">
          LogiGraph models logistics networks as graphs and applies
          Dijkstra’s Algorithm to compute optimal delivery paths.
          It enables intelligent routing, real-time vehicle tracking,
          and scalable supply chain operations.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-medium"
          >
            Launch Dashboard
          </Link>

          <a
            href="#features"
            className="px-6 py-3 rounded-lg border border-slate-500 hover:border-slate-300 transition"
          >
            Learn More
          </a>
        </div>
      </main>

      {/* Features */}
      <section
        id="features"
        className="mt-32 px-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        <FeatureCard
          title="Graph-Based Routing"
          desc="Warehouses are modeled as graph nodes and routes as weighted edges, enabling optimal path computation using Dijkstra’s Algorithm."
        />
        <FeatureCard
          title="Real-Time Tracking"
          desc="Vehicle locations and order status updates are streamed in real time using WebSockets and SignalR."
        />
        <FeatureCard
          title="Scalable Architecture"
          desc="Polyglot backend with Spring Boot, ASP.NET Core, MySQL, and MongoDB ensures high performance and scalability."
        />
      </section>

      {/* Footer */}
      <footer className="mt-32 py-10 text-center text-slate-400">
        © 2026 LogiGraph · Real-Time Logistics Optimization
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-600 transition">
      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>
      <p className="mt-3 text-slate-400 text-sm leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

export default Landing;
