import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Heart } from "lucide-react";
import { fetchTenders, type Tender } from "@/lib/supabase";

const SECTORS = [
  { id: "agri", label: "Agriculture", code: "AG", tone: "bg-groundnut/15 text-groundnut-dark" },
  { id: "energy", label: "Energy", code: "EN", tone: "bg-ochre/15 text-ochre-dark" },
  { id: "infra", label: "Infrastructure", code: "IN", tone: "bg-laterite/15 text-laterite" },
  { id: "ict", label: "ICT", code: "IT", tone: "bg-river/15 text-river" },
  { id: "health", label: "Health", code: "HE", tone: "bg-rose-100 text-rose-800" },
  { id: "edu", label: "Education", code: "ED", tone: "bg-sky-100 text-sky-800" },
  { id: "water", label: "Water", code: "WA", tone: "bg-cyan-100 text-cyan-800" },
];

const REGIONS = [
  "Greater Banjul",
  "West Coast Region",
  "Lower River Region",
  "Central River Region",
  "Upper River Region",
  "North Bank Region",
];

const TYPES = ["Works", "Goods", "Services", "Consultancy"];

const INSTITUTIONS = [
  "GPPA / GGC",
  "NAWEC",
  "NRA",
  "Min. of Information",
  "MRC Unit The Gambia",
];

export default function Home() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDeadline, setSelectedDeadline] = useState<string>("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { isAuthenticated, isAdmin, signOut, profile } = useAuth();
  const [, navigate] = useLocation();

  // Fetch tenders from Supabase on mount and when filters change
  useEffect(() => {
    const loadTenders = async () => {
      setLoading(true);
      const data = await fetchTenders({
        regions: selectedRegions.length > 0 ? selectedRegions : undefined,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
        deadline: selectedDeadline as 'all' | 'urgent' | 'week',
        searchTerm: searchTerm || undefined,
        sortBy: sortBy as 'deadline' | 'newest' | 'value',
      });
      setTenders(data);
      setLoading(false);
    };

    loadTenders();
  }, [selectedRegions, selectedTypes, selectedDeadline, sortBy, searchTerm]);

  // Filter tenders based on search (client-side for real-time search)
  const filteredTenders = useMemo(() => {
    if (!searchTerm) return tenders;

    const term = searchTerm.toLowerCase();
    return tenders.filter(
      (t) =>
        t.title.toLowerCase().includes(term) ||
        t.code.toLowerCase().includes(term) ||
        t.org.toLowerCase().includes(term)
    );
  }, [tenders, searchTerm]);

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRegions([]);
    setSelectedTypes([]);
    setSelectedDeadline("all");
    setSortBy("deadline");
  };

  const sectorLabel = (sectorId: string) => {
    const sector = SECTORS.find((s) => s.id === sectorId);
    return sector ? sector.label : sectorId;
  };

  const humanDeadline = (deadline: number) => {
    if (deadline > 365) return "Closes soon";
    if (deadline <= 0) return "Closed";
    if (deadline === 1) return "1 day left";
    return `${deadline} days left`;
  };

  const humanPosted = (posted: number) => {
    if (posted > 365) return "Posted recently";
    if (posted <= 0) return "Posted today";
    return `Posted ${posted} day${posted !== 1 ? "s" : ""} ago`;
  };

  const stampClass = (deadline: number) => {
    return deadline <= 7 || deadline > 365 ? "urgent" : "ok";
  };

  const urgentCount = tenders.filter((t) => t.deadline <= 7).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ink border-b-4 border-laterite">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-laterite to-ochre p-0.5 shadow-sm">
              <img src="/manus-storage/gambids-gb-mark_a2b45b37.png" alt="" className="h-full w-full rounded-[0.65rem] object-cover" />
            </div>
            <div>
              <div className="font-bold text-lg text-paper font-serif">GAM-BIDS</div>
              <div className="text-xs text-ochre font-semibold tracking-widest uppercase">
                Gambia Tender Search
              </div>
            </div>
          </div>
          <nav className="hidden md:flex gap-8 text-paper text-sm font-medium items-center">
            <a href="#sectors" className="hover:text-ochre transition">
              Sectors
            </a>
            <a href="#tenders" className="hover:text-ochre transition">
              Tenders
            </a>
            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <Button onClick={() => navigate('/admin')} className="bg-laterite hover:bg-laterite-dark text-white">
                    Admin Panel
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/dashboard')} className="bg-river hover:bg-river-dark text-white">
                    My Dashboard
                  </Button>
                )}
                <Button onClick={() => signOut()} variant="outline" className="border-paper text-paper hover:bg-white/10">
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} className="bg-laterite hover:bg-laterite-dark text-white">
                Sign In
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-paper border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-laterite/10 border border-laterite/25 rounded-full mb-6">
              <span className="text-lg">●</span>
              <span className="text-xs font-semibold tracking-widest text-laterite uppercase">
                Live — {tenders.length} open tenders
              </span>
            </div>
            <h1 className="text-5xl font-bold font-serif leading-tight mb-6">
              Every Gambian tender,
              <br />
              <em className="text-river not-italic">in one place.</em>
            </h1>
            <p className="text-lg text-muted max-w-xl mb-8 leading-relaxed">
              GAM-BIDS tracks public and private procurement from GPPA, NAWEC, NRA, the
              National Assembly, local councils, NGOs and private companies operating in The
              Gambia — so you never miss a bid.
            </p>

            {/* Search Box */}
            <div className="flex gap-2 mb-6 bg-white border border-line rounded-xl p-2 shadow-lg">
              <Input
                type="text"
                placeholder="Search tenders — e.g. groundnut evacuation, solar, road works..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus:ring-0 text-base"
              />
              <Button className="bg-river hover:bg-river-dark text-white font-semibold">
                Search
              </Button>
            </div>

            {/* Quick Tags */}
            <div className="flex gap-3 flex-wrap">
              <span className="text-sm text-muted font-medium">Popular:</span>
              {["Groundnut Evacuation", "Solar & Energy", "Road Works", "Consultancy", "ICT"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag.toLowerCase())}
                    className="text-sm px-3 py-1.5 border border-line rounded-full hover:border-river hover:text-river transition"
                  >
                    {tag}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: tenders.length, label: "Open tenders nationwide", color: "c1" },
              { num: INSTITUTIONS.length, label: "Registered institutions", color: "c2" },
              { num: 6, label: "Regions covered (LRR–URR)", color: "c3" },
              { num: urgentCount, label: "Closing within 7 days", color: "c4" },
            ].map((stat, i) => (
              <div
                key={i}
                className={`bg-white border border-line rounded-xl p-5 border-l-4 ${
                  stat.color === "c1"
                    ? "border-l-laterite"
                    : stat.color === "c2"
                      ? "border-l-river"
                      : stat.color === "c3"
                        ? "border-l-groundnut"
                        : "border-l-ochre"
                }`}
              >
                <div className="text-3xl font-bold font-serif">{stat.num}</div>
                <div className="text-xs text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section id="sectors" className="bg-background py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-serif">Browse by sector</h2>
            <a href="#tenders" className="text-sm font-semibold text-river hover:underline">
              View all tenders →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {SECTORS.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setSearchTerm(sector.label)}
                className="bg-white border border-line rounded-xl p-4 text-center hover:border-river hover:shadow-md hover:-translate-y-0.5 transition flex flex-col items-center gap-2"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-mono font-bold tracking-wide ${sector.tone}`}>
                  {sector.code}
                </span>
                <span className="text-sm font-semibold">{sector.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* River Divider */}
      <div className="h-8 bg-river overflow-hidden">
        <svg viewBox="0 0 1200 24" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,12 C150,24 350,0 600,12 C850,24 1050,0 1200,12 L1200,24 L0,24 Z" fill="#F3EEE2" />
        </svg>
      </div>

      {/* Main Content */}
      <main className="bg-background py-12 px-6" id="tenders">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-line rounded-xl p-6 sticky top-24 h-fit">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted mb-6">
                Filter Results
              </h3>

              {/* Region Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold mb-4">Region</h4>
                <div className="space-y-3">
                  {REGIONS.map((region) => (
                    <label key={region} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedRegions.includes(region)}
                        onCheckedChange={() => toggleRegion(region)}
                      />
                      <span className="text-sm">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold mb-4">Tender Type</h4>
                <div className="space-y-3">
                  {TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => toggleType(type)}
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deadline Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-bold mb-4">Deadline</h4>
                <div className="space-y-3">
                  {[
                    { value: "all", label: "All deadlines" },
                    { value: "urgent", label: "Closing within 7 days" },
                    { value: "week", label: "Closing within 14 days" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="deadline"
                        value={option.value}
                        checked={selectedDeadline === option.value}
                        onChange={(e) => setSelectedDeadline(e.target.value)}
                        className="accent-river"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={resetFilters}
              >
                Reset all filters
              </Button>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="text-sm text-muted">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" /> Loading tenders...
                  </span>
                ) : (
                  `Showing ${filteredTenders.length} tender${filteredTenders.length !== 1 ? "s" : ""}`
                )}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <option value="deadline">Sort: Closing soonest</option>
                <option value="newest">Sort: Newest posted</option>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <Spinner className="w-8 h-8 mx-auto mb-4" />
                <p className="text-muted">Loading tenders from Supabase...</p>
              </div>
            ) : filteredTenders.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-bold mb-2">No tenders match your filters</h3>
                <p className="text-muted">Try clearing a filter or searching a broader term.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="bg-white border border-line rounded-xl p-6 hover:border-river hover:shadow-lg transition"
                  >
                    <div className="flex justify-between gap-6">
                      <div className="flex-1">
                        <div className="text-xs text-muted font-mono mb-2">{tender.code}</div>
                        <h3 className="text-lg font-semibold mb-3 leading-snug">{tender.title}</h3>
                        <div className="flex gap-4 text-sm text-muted mb-4">
                          <span>📍 {tender.region}</span>
                          <span>🏛️ {tender.org}</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-xs px-2.5 py-1 bg-river/10 text-river rounded-full font-semibold">
                            {sectorLabel(tender.sector)}
                          </span>
                          <span className="text-xs px-2.5 py-1 bg-groundnut/10 text-groundnut rounded-full font-semibold">
                            {tender.region}
                          </span>
                          <span className="text-xs px-2.5 py-1 bg-ochre/10 text-ochre-dark rounded-full font-semibold">
                            {tender.type}
                          </span>
                        </div>
                      </div>

                      {/* Deadline Stamp */}
                      <div
                        className={`flex-shrink-0 w-24 h-24 border-2 rounded-full flex flex-col items-center justify-center -rotate-6 font-mono text-center ${
                          stampClass(tender.deadline) === "urgent"
                            ? "border-laterite text-laterite"
                            : "border-river text-river"
                        }`}
                      >
                        <div className="text-sm font-bold leading-tight">{humanDeadline(tender.deadline)}</div>
                        <div className="text-[10px] font-semibold tracking-wider uppercase opacity-70">
                          deadline
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-line mt-4 pt-4 flex justify-between items-center">
                      <div className="text-sm text-muted">{humanPosted(tender.posted)}</div>
                      <Button onClick={() => navigate(`/tender/${tender.id}`)} className="bg-ink hover:bg-river text-white">
                        View Tender →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Institutions Strip */}
      <section className="bg-river text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold font-serif mb-2">Procuring institutions</h2>
          <p className="text-white/70 mb-8">
            We track tenders from {INSTITUTIONS.length}+ public and private organizations
          </p>
          <div className="flex gap-3 flex-wrap">
            {INSTITUTIONS.map((inst) => (
              <div
                key={inst}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-semibold"
              >
                {inst}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-paper/65 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          <div>
            <div className="font-bold text-lg text-paper font-serif mb-4">GAM-BIDS</div>
            <p className="text-sm max-w-xs">
              The transparent, efficient gateway to every procurement opportunity in The Gambia.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-paper mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#tenders" className="hover:text-paper transition">
                  Browse Tenders
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-paper transition">
                  Post a Tender
                </a>
              </li>
              <li>
                <a href="mailto:partnerships@gam-bids.gm" className="hover:text-paper transition">
                  API Access
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-paper mb-4">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#tenders" className="hover:text-paper transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#sectors" className="hover:text-paper transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="mailto:hello@gam-bids.gm" className="hover:text-paper transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-paper mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/404" className="hover:text-paper transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/404" className="hover:text-paper transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 flex justify-between text-xs">
          <div>© 2026 GAM-BIDS. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="https://x.com" target="_blank" rel="noreferrer" className="hover:text-paper transition">
              Twitter
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="hover:text-paper transition">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
