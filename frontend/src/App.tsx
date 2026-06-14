import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  BarChart3, 
  Image as ImageIcon, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  ArrowRight,
  BookOpen,
  Info
} from 'lucide-react';

interface Fact {
  id: number;
  sourceName: string;
  value: string;
  year: number;
  reliability: 'High' | 'Medium' | 'Low';
  url: string;
  details: string;
}

interface TimelineEntry {
  year: number;
  value: number;
}

interface Source {
  name: string;
  description: string;
}

interface ResearchReport {
  query: string;
  keyAnswer: string;
  confidenceScore: number;
  status: 'Verified' | 'Estimated' | 'Conflicting sources' | 'Insufficient public data';
  summary: string;
  facts: Fact[];
  timeline: TimelineEntry[] | null;
  images: { title: string; url: string }[];
  sources: Source[];
  warnings: string[];
}

const EXAMPLE_CHIPS = [
  { text: "How many AirPods got sold this year?", label: "AirPods sales" },
  { text: "Tesla deliveries this year", label: "Tesla deliveries" },
  { text: "AI chip market size 2026", label: "AI chip market" },
  { text: "Nike revenue by product line", label: "Nike revenue" }
];

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFactTab, setActiveFactTab] = useState<number | null>(null);

  const loadingSteps = [
    "Searching web sources via Context.dev...",
    "Extracting facts and numerical indicators...",
    "Validating source credibility and ranking...",
    "Synthesizing final research report..."
  ];

  // Animate through loading steps
  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleResearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setActiveFactTab(null);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchQuery })
      });

      if (!response.ok) {
        throw new Error(`Server returned error code ${response.status}`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete research process.');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    'Verified': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'Estimated': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    'Conflicting sources': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Insufficient public data': 'bg-rose-500/10 text-rose-400 border-rose-500/30'
  };

  const reliabilityBadge = (reliability: 'High' | 'Medium' | 'Low') => {
    const styles = {
      High: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      Low: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[reliability]}`}>
        {reliability} Reliability
      </span>
    );
  };

  // Custom SVG line chart renderer
  const renderSVGChart = (timeline: TimelineEntry[]) => {
    if (!timeline || timeline.length === 0) return null;
    
    const width = 500;
    const height = 180;
    const padding = 30;
    
    const years = timeline.map(d => d.year);
    const values = timeline.map(d => d.value);
    
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const minValue = Math.min(...values) * 0.9;
    const maxValue = Math.max(...values) * 1.1;

    const getX = (year: number) => padding + ((year - minYear) / (maxYear - minYear || 1)) * (width - 2 * padding);
    const getY = (val: number) => height - padding - ((val - minValue) / (maxValue - minValue || 1)) * (height - 2 * padding);

    // Build path coordinates
    const points = timeline.map(d => `${getX(d.year)},${getY(d.value)}`).join(' L ');
    const linePath = `M ${points}`;
    
    // Path for gradient fill under the line
    const areaPath = `${linePath} L ${getX(timeline[timeline.length - 1].year)},${height - padding} L ${getX(timeline[0].year)},${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
        
        {/* Y Axis line helper */}
        {timeline.map((d, i) => (
          <line 
            key={i} 
            x1={getX(d.year)} 
            y1={padding} 
            x2={getX(d.year)} 
            y2={height - padding} 
            stroke="rgba(255,255,255,0.03)" 
            strokeDasharray="4 4" 
          />
        ))}

        {/* Gradient fill */}
        <path d={areaPath} fill="url(#chartGradient)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {timeline.map((d, i) => (
          <g key={i} className="group cursor-pointer">
            <circle 
              cx={getX(d.year)} 
              cy={getY(d.value)} 
              r="5" 
              fill="#0f172a" 
              stroke="#22d3ee" 
              strokeWidth="2.5" 
              className="transition-all duration-200 group-hover:r-7 group-hover:stroke-pink-400"
            />
            {/* Tooltip text */}
            <text 
              x={getX(d.year)} 
              y={getY(d.value) - 12} 
              textAnchor="middle" 
              fill="#e2e8f0" 
              fontSize="10" 
              fontWeight="bold"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900"
            >
              {d.value}
            </text>
            <text 
              x={getX(d.year)} 
              y={height - 10} 
              textAnchor="middle" 
              fill="#94a3b8" 
              fontSize="9"
            >
              {d.year}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Renders graphic representation of files if not locally found
  const renderVisualMock = (img: { title: string; url: string }) => {
    if (img.url.startsWith('http')) {
      return (
        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-950 flex items-center justify-center p-4">
          <img src={img.url} alt={img.title} className="max-h-full max-w-full object-contain" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950/80 to-transparent">
            <p className="text-xs font-semibold text-slate-300">{img.title}</p>
          </div>
        </div>
      );
    }
    
    // Abstract gradients representing reports/charts
    const gradients = [
      'from-purple-500/20 to-pink-500/25',
      'from-cyan-500/20 to-indigo-500/25',
      'from-fuchsia-500/20 to-blue-500/25',
      'from-emerald-500/20 to-teal-500/25'
    ];
    const gradIndex = Math.abs(img.title.charCodeAt(0)) % gradients.length;

    return (
      <div className={`relative aspect-video rounded-2xl border border-white/10 bg-gradient-to-br ${gradients[gradIndex]} flex flex-col justify-between p-4 overflow-hidden group hover:border-white/20 transition-colors`}>
        <div className="flex justify-between items-start">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">Report Graph</span>
        </div>
        <div className="space-y-1">
          <div className="w-2/3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="w-4/5 h-full bg-cyan-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs font-bold text-slate-200 truncate">{img.title}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030712] via-[#0f172a] to-[#0b0f19] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl neon-glow-cyan">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Research<span className="text-slate-100 font-medium font-sans">Radar</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-400 backdrop-blur">
              Powered by Context.dev APIs
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        {/* Title */}
        <section className="text-center max-w-2xl mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-none">
            Deep Web Research. <br />
            <span className="text-gradient">Verified Answers.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Enter a research query. We will scan reliable web sources, extract concrete facts, compare conflicting figures, and generate a validated report.
          </p>
        </section>

        {/* Search Section */}
        <section className="w-full max-w-3xl mb-12">
          <div className="glass-panel rounded-3xl p-4 shadow-2xl relative overflow-hidden neon-glow-pink">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 pointer-events-none"></div>
            <div className="flex items-center space-x-3 bg-slate-950/80 rounded-2xl p-3 border border-white/5">
              <Search className="w-6 h-6 text-slate-500 ml-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResearch(query)}
                placeholder="Ask any research question... e.g. How many AirPods sold this year?"
                className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-lg py-2"
                disabled={loading}
              />
              <button
                onClick={() => handleResearch(query)}
                disabled={loading || !query.trim()}
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-pink-500/10 active:scale-95"
              >
                <span>Research</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {EXAMPLE_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(chip.text);
                    handleResearch(chip.text);
                  }}
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 text-slate-300 hover:text-white text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Loader State */}
        <AnimatePresence>
          {loading && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl bg-slate-900/60 border border-white/5 rounded-3xl p-8 backdrop-blur shadow-xl mb-12 text-center"
            >
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-purple-500 border-r-cyan-400 rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Analyzing Web Ecosystem</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
                Running automated fact extraction and checking credibility metrics...
              </p>

              {/* Progress Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-left">
                {loadingSteps.map((step, idx) => {
                  const isActive = loadingStep === idx;
                  const isCompleted = loadingStep > idx;
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        isActive 
                          ? 'border-purple-500/40 bg-purple-500/5 text-purple-200' 
                          : isCompleted 
                            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' 
                            : 'border-white/5 bg-slate-950/20 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-purple-400 animate-ping' : 'bg-slate-700'}`}></div>
                        )}
                        <span className="text-xs uppercase font-extrabold tracking-wider">Step {idx + 1}</span>
                      </div>
                      <p className="text-xs font-medium leading-tight">{step.split(' ')[0]}...</p>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Error Notice */}
        {error && (
          <div className="w-full max-w-2xl bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 flex items-start space-x-4 mb-12">
            <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-300 mb-1">Research Extraction Interrupted</h4>
              <p className="text-rose-400/80 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Report Content */}
        {report && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left Column (Main answers, data table, details) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Hero Answer Card */}
              <div className="glass-panel rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-extrabold uppercase tracking-widest rounded-full border ${statusColors[report.status]}`}>
                      {report.status}
                    </span>
                    <span className="text-slate-500 text-xs">•</span>
                    <span className="text-xs text-slate-400 font-semibold">
                      Confidence Score: <strong className="text-purple-400">{report.confidenceScore}%</strong>
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Based on {report.facts.length} extracted references</span>
                  </div>
                </div>

                <h2 className="text-slate-400 text-xs uppercase font-extrabold tracking-widest mb-1">Synthesized Key Answer</h2>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                  {report.keyAnswer}
                </div>

                {/* Summary text */}
                <div className="text-slate-300 leading-relaxed border-t border-white/5 pt-6 text-[15px]">
                  {report.summary}
                </div>
              </div>

              {/* Warning card for conflicts */}
              {report.warnings && report.warnings.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-start space-x-4">
                  <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-300 mb-1">Conflicting Telemetry Found</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {report.warnings.map((warn, i) => (
                        <li key={i} className="text-amber-400/80 text-sm">{warn}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Fact Table */}
              <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
                <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-lg text-slate-200">Extracted Key Data</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Click rows to view full source excerpt</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-slate-950/30 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-6">Source Domain</th>
                        <th className="py-4 px-6">Identified Metric</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-right">Reliability Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.facts.map((fact) => {
                        const isExpanded = activeFactTab === fact.id;
                        return (
                          <>
                            <tr 
                              key={fact.id}
                              onClick={() => setActiveFactTab(isExpanded ? null : fact.id)}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150 cursor-pointer"
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                  <span className="font-bold text-slate-200 truncate max-w-[150px]">{fact.sourceName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-cyan-300 font-extrabold">{fact.value}</td>
                              <td className="py-4 px-6 text-slate-400">{fact.year}</td>
                              <td className="py-4 px-6 text-right">
                                {reliabilityBadge(fact.reliability)}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-950/45">
                                <td colSpan={4} className="py-4 px-6 text-sm text-slate-300 border-b border-white/5">
                                  <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-3">
                                    <p className="italic text-slate-400 font-serif">"{fact.details}"</p>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                      <span className="text-xs text-slate-500">Source: {fact.sourceName} ({fact.year})</span>
                                      <a 
                                        href={fact.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1 font-bold"
                                      >
                                        <span>Visit source document</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (Visualizations & Citations) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Timeline Chart Card */}
              {report.timeline && (
                <div className="glass-panel rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center space-x-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-slate-200">Historical Trendline</h3>
                  </div>
                  <div className="p-2 bg-slate-950/40 rounded-2xl border border-white/5">
                    {renderSVGChart(report.timeline)}
                  </div>
                </div>
              )}

              {/* Visual Evidence (Images) */}
              <div className="glass-panel rounded-3xl p-6 shadow-xl">
                <div className="flex items-center space-x-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-pink-400" />
                  <h3 className="font-bold text-slate-200">Visual Context</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {report.images.map((img, i) => (
                    <div key={i}>
                      {renderVisualMock(img)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reputable Sources Citations */}
              <div className="glass-panel rounded-3xl p-6 shadow-xl">
                <div className="flex items-center space-x-2 mb-4">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-slate-200">Core References</h3>
                </div>
                <div className="space-y-4">
                  {report.sources.map((src, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 hover:bg-slate-950 transition-colors">
                      <h4 className="font-extrabold text-sm text-slate-200 flex items-center justify-between">
                        <span>{src.name}</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{src.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Empty State / Initial screen */}
        {!report && !loading && (
          <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="glass-panel rounded-3xl p-6 text-center space-y-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl w-fit mx-auto text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-200">Unified Web Extraction</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects to Context.dev APIs to crawl documents, clean scraping noise, and parse structures like lists and markdown tables.
              </p>
            </div>
            <div className="glass-panel rounded-3xl p-6 text-center space-y-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl w-fit mx-auto text-cyan-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-200">Fact and Numeric Synthesis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically matches numbers, currencies, and years. Flags conflicting statistics, reporting them as range variables.
              </p>
            </div>
            <div className="glass-panel rounded-3xl p-6 text-center space-y-3">
              <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl w-fit mx-auto text-pink-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-200">Credibility Ranking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scores source credibility based on domains. Prioritizes SEC filings, investor relation sites, and top research institutions.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Research Radar. Built with Context.dev, React & Tailwind CSS.</p>
      </footer>
    </div>
  );
}
