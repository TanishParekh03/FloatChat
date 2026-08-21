import React, { useEffect, useState } from 'react';
import { MapPin, Waves, BarChart3, Bot, Thermometer, Droplets, Gauge, ArrowRight, Sparkles, Globe, Database } from 'lucide-react';

// Animated counter hook
function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCounter({ value, label, suffix = '' }) {
  const num = useCounter(value);
  return (
    <div className="stat-card text-center">
      <p className="text-2xl md:text-3xl font-bold text-gradient tracking-tight">
        {typeof value === 'string' ? value : num.toLocaleString()}{suffix}
      </p>
      <p className="text-xs md:text-sm text-white/50 mt-1 font-medium">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <div
      className="card p-6 group hover:border-[var(--border-strong)] transition-all duration-300 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-[var(--accent-muted)] text-[var(--accent)] group-hover:bg-[rgba(19,184,255,0.18)] transition-colors">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-white/55 leading-relaxed">{description}</p>
    </div>
  );
}

function StepItem({ number, title, description }) {
  return (
    <div className="flex-1 text-center px-4">
      <div className="w-10 h-10 rounded-full bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center mx-auto mb-3 text-sm font-bold border border-[var(--border)]">
        {number}
      </div>
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}

function QuickExploreCard({ icon, title, subtitle, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card p-5 text-left group hover:border-[var(--border-strong)] transition-all duration-300 w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <ArrowRight size={14} className="text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
      </div>
      <h4 className="text-sm font-semibold text-white mb-0.5">{title}</h4>
      <p className="text-xs text-white/45">{subtitle}</p>
    </button>
  );
}

export default function Home({ setActivePage, setChatOpen }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Hero Section */}
        <div className="text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent-muted)] border border-[var(--border)] text-xs text-[var(--accent)] font-medium mb-6">
            <Sparkles size={12} />
            AI-Powered Ocean Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-[1.1]">
            Explore the Depths<br />
            <span className="text-gradient">of Our Oceans</span>
          </h1>
          <p className="text-base md:text-lg text-white/55 mb-8 max-w-2xl mx-auto leading-relaxed">
            Interactive data visualization from thousands of autonomous ARGO floats.
            Analyze temperature, salinity, pressure, and depth across the globe.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setActivePage('Argo Floats')}
              className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-lg text-sm"
            >
              <MapPin size={16} />
              Explore Ocean Map
            </button>
            <button
              onClick={() => setChatOpen?.(true)}
              className="btn-outline inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm"
              aria-label="Open chatbot assistant"
            >
              <Bot size={16} />
              AI Assistant
            </button>
          </div>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14 animate-slide-up delay-100">
          <StatCounter value={3847} label="Active Floats" />
          <StatCounter value={12} label="Ocean Regions" />
          <StatCounter value="2.4M" label="Data Points" />
          <StatCounter value={147} label="Countries" />
        </div>

        {/* Feature Cards */}
        <div className="mb-14">
          <h2 className="text-lg font-semibold text-white mb-5 text-center">Platform Capabilities</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Waves size={20} />}
              title="Ocean Depth"
              description="Visualize ocean depth measurements across regions with color-coded markers for easy interpretation."
              delay={0}
            />
            <FeatureCard
              icon={<BarChart3 size={20} />}
              title="Data Analytics"
              description="Comprehensive analytics dashboard with real-time processing. Monitor trends in temperature, salinity, and pressure."
              delay={100}
            />
            <FeatureCard
              icon={<Globe size={20} />}
              title="Global Coverage"
              description="Explore oceanographic data from around the world. Comprehensive coverage of major ocean regions and water bodies."
              delay={200}
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="card p-8 mb-14 animate-slide-up delay-200">
          <h2 className="text-lg font-semibold text-white mb-6 text-center">How It Works</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0">
            <StepItem
              number="1"
              title="Select Region"
              description="Click on the map or enter coordinates to choose your area of interest."
            />
            <div className="hidden md:block">
              <ArrowRight size={16} className="text-white/20 mx-2" />
            </div>
            <StepItem
              number="2"
              title="Analyze Data"
              description="View depth profiles, temperature gradients, and salinity distributions."
            />
            <div className="hidden md:block">
              <ArrowRight size={16} className="text-white/20 mx-2" />
            </div>
            <StepItem
              number="3"
              title="AI Insights"
              description="Ask floatCHAT to summarize patterns, detect anomalies, or compare regions."
            />
          </div>
        </div>

        {/* Quick Explore */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-5 text-center">Quick Explore</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <QuickExploreCard
              icon={<Thermometer size={18} className="text-orange-400" />}
              title="Temperature Map"
              subtitle="Sea surface & depth temperature"
              color="bg-orange-500/10"
              onClick={() => setActivePage('Temperature')}
            />
            <QuickExploreCard
              icon={<Droplets size={18} className="text-purple-400" />}
              title="Salinity Map"
              subtitle="Ocean salinity distribution"
              color="bg-purple-500/10"
              onClick={() => setActivePage('Salinity')}
            />
            <QuickExploreCard
              icon={<Gauge size={18} className="text-emerald-400" />}
              title="Pressure Map"
              subtitle="Pressure at various depths"
              color="bg-emerald-500/10"
              onClick={() => setActivePage('Pressure')}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
