import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  type Batch = {
    id: number | string;
    cropType?: string;
    quantityKg?: number | string;
    basePriceINR?: number | string;
    minPriceINR?: number | string;
    priceByDistributorINR?: number | string;
    priceByRetailerINR?: number | string;
    farmer?: string;
    distributor?: string;
    retailer?: string;
    consumer?: string;
    currentOwner?: string;
    harvestDate?: number | string;
    createdAt?: number | string;
    metadataCID?: string;
  boughtByDistributorAt?: number | string;
  boughtByRetailerAt?: number | string;
  boughtByConsumerAt?: number | string;
  };

  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const [selected, setSelected] = useState<Batch | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch("/api/batches");
        const data = await res.json();
        setAllBatches(Array.isArray(data?.batches) ? data.batches : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load batches");
      } finally { setLoading(false); }
    };
    fetchBatches();
  }, []);

  const sorted = useMemo(() => {
    const list = [...(allBatches || [])];
    return list.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  }, [allBatches]);

  const filtered = useMemo(() => {
    const s = (search || "").trim();
    if (!s) return sorted;
    // search by batch id (supports partial, e.g., "1")
    return sorted.filter(b => String(b.id).toLowerCase().includes(s.toLowerCase()));
  }, [sorted, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const ownerRole = (b: Batch) => {
    const owner = (b.currentOwner || "").toLowerCase();
    if (!owner) return "Unknown";
    if (owner === (b.consumer || "").toLowerCase()) return "Consumer";
    if (owner === (b.retailer || "").toLowerCase()) return "Retailer";
    if (owner === (b.distributor || "").toLowerCase()) return "Distributor";
    if (owner === (b.farmer || "").toLowerCase()) return "Farmer";
    return "Holder";
  };

  const openDetails = (b: Batch) => { setSelected(b); setOpen(true); };

  const toDate = (val?: number | string) => {
    if (!val) return null;
    const n = Number(val);
    if (!n) return null;
    const ms = n > 1e12 ? n : n * 1000;
    return new Date(ms);
  };

  const stages = ["Farmer", "Distributor", "Retailer", "Consumer"] as const;
  const stageIndex = (b: Batch) => {
    const role = ownerRole(b);
    switch (role) {
      case "Farmer": return 0;
      case "Distributor": return 1;
      case "Retailer": return 2;
      case "Consumer": return 3;
      default: return -1;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <section className="py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Recent Batches</h2>
              <p className="text-sm text-muted-foreground">Latest on-chain records with current holder and prices.</p>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Search by batch id (e.g. 1)" value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} className="w-64" />
              <Button variant="outline" onClick={()=>setPage(1)}>Search</Button>
            </div>
          </div>

          {loading && (
            <div className="relative">
              <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4 pl-12 md:pl-16 relative">
                    <div className="absolute left-4 md:left-6 top-6 -translate-y-1/2 w-3 h-3 rounded-full bg-muted ring-2 ring-background" />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-4 w-80" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="relative">
            {/* vertical linked list spine */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {pageItems.map((b, idx) => (
                <Card key={String(b.id)} className="p-4 pl-12 md:pl-16 relative hover:shadow-medium transition-shadow cursor-pointer" onClick={()=>openDetails(b)}>
                  {/* node */}
                  <div className="absolute left-4 md:left-6 top-6 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">Batch #{String(b.id)}</Badge>
                        <span className="text-muted-foreground">{b.cropType || "—"} • {b.quantityKg || 0}kg</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Farmer ₹{b.minPriceINR || b.basePriceINR || 0}
                        {b.priceByDistributorINR ? <> • Dist ₹{b.priceByDistributorINR}</> : null}
                        {b.priceByRetailerINR ? <> • Retail ₹{b.priceByRetailerINR}</> : null}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {stages.map((label, i) => (
                          <div key={label} className="flex items-center gap-2">
                            <span
                              className={
                                (i === stageIndex(b))
                                  ? "px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs"
                                  : "px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs"
                              }
                            >
                              {label}
                            </span>
                            {i < stages.length - 1 && <span className="text-muted-foreground">→</span>}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created {b.createdAt ? new Date(Number(b.createdAt) * (Number(b.createdAt) > 1e12 ? 1 : 1000)).toLocaleString() : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary" variant="secondary">{ownerRole(b)}</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
              {(!loading && pageItems.length === 0) && (
                <Card className="p-6 text-sm text-muted-foreground">No batches found.</Card>
              )}
            </div>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Prev</Button>
            {Array.from({ length: totalPages }).slice(0, 6).map((_, i) => {
              const n = i + 1;
              return (
                <Button key={n} variant={n===page?"default":"outline"} size="sm" onClick={()=>setPage(n)}>{n}</Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))}>Next</Button>
          </div>

          {/* details dialog */}
    <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Batch #{selected?.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">Crop</div><div>{selected?.cropType || "—"}</div>
                  <div className="text-muted-foreground">Quantity</div><div>{selected?.quantityKg || 0} kg</div>
                  <div className="text-muted-foreground">Farmer Price</div><div>₹{selected?.minPriceINR || selected?.basePriceINR || 0}</div>
                  <div className="text-muted-foreground">Distributor Price</div><div>₹{selected?.priceByDistributorINR || 0}</div>
                  <div className="text-muted-foreground">Retailer Price</div><div>₹{selected?.priceByRetailerINR || 0}</div>
                  <div className="text-muted-foreground">Current Holder</div><div>{selected ? ownerRole(selected) : "—"}</div>
      <div className="text-muted-foreground">Bought by Distributor</div>
      <div>{toDate(selected?.boughtByDistributorAt)?.toLocaleString?.() || "—"}</div>
      <div className="text-muted-foreground">Bought by Retailer</div>
      <div>{toDate(selected?.boughtByRetailerAt)?.toLocaleString?.() || "—"}</div>
      <div className="text-muted-foreground">Bought by Consumer</div>
      <div>{toDate(selected?.boughtByConsumerAt)?.toLocaleString?.() || "—"}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-muted-foreground">Farmer</div><div className="font-mono text-xs break-all">{selected?.farmer}</div>
                  <div className="text-muted-foreground">Distributor</div><div className="font-mono text-xs break-all">{selected?.distributor}</div>
                  <div className="text-muted-foreground">Retailer</div><div className="font-mono text-xs break-all">{selected?.retailer}</div>
                  <div className="text-muted-foreground">Consumer</div><div className="font-mono text-xs break-all">{selected?.consumer}</div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <a href={`/batch?id=${encodeURIComponent(String(selected?.id || ""))}`}>
                    <Button size="sm">Open Details</Button>
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
