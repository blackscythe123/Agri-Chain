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
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t } = useTranslation();
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
  verification?: { status: 'unverified' | 'pending' | 'verified'; by?: string | null; timestamp?: number | null };
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

  const ownerRoleKey = (b: Batch) => {
    const owner = (b.currentOwner || "").toLowerCase();
    if (!owner) return "unknown" as const;
    if (owner === (b.consumer || "").toLowerCase()) return "consumer" as const;
    if (owner === (b.retailer || "").toLowerCase()) return "retailer" as const;
    if (owner === (b.distributor || "").toLowerCase()) return "distributor" as const;
    if (owner === (b.farmer || "").toLowerCase()) return "farmer" as const;
    return "holder" as const;
  };

  const openDetails = (b: Batch) => { setSelected(b); setOpen(true); };

  const toDate = (val?: number | string) => {
    if (!val) return null;
    const n = Number(val);
    if (!n) return null;
    const ms = n > 1e12 ? n : n * 1000;
    return new Date(ms);
  };

  const stages = ["farmer", "distributor", "retailer", "consumer"] as const;
  const stageIndex = (b: Batch) => {
    const role = ownerRoleKey(b);
    switch (role) {
      case "farmer": return 0;
      case "distributor": return 1;
      case "retailer": return 2;
      case "consumer": return 3;
      default: return -1;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <section className="py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">{t("index.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("index.subtitle")}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Input placeholder={t("index.search")} value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1); }} className="w-full sm:w-64" />
              <Button variant="outline" onClick={()=>setPage(1)}>{t("common.submit")}</Button>
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
                <Card key={String(b.id)} className="p-4 sm:p-5 pl-12 md:pl-16 relative hover:shadow-medium transition-shadow cursor-pointer" onClick={()=>openDetails(b)}>
                  {/* node */}
                  <div className="absolute left-4 md:left-6 top-6 -translate-y-1/2 w-3 h-3 rounded-full bg-primary ring-2 ring-background" />
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{t("index.batch")} #{String(b.id)}</Badge>
                        <span className="text-muted-foreground break-words">{b.cropType || "—"} • {b.quantityKg || 0}kg</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t("index.farmer")} ₹{b.minPriceINR || b.basePriceINR || 0}
                        {b.priceByDistributorINR ? <> • {t("index.distributor")} ₹{b.priceByDistributorINR}</> : null}
                        {b.priceByRetailerINR ? <> • {t("index.retailer")} ₹{b.priceByRetailerINR}</> : null}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        {stages.map((key, i) => (
                          <div key={key} className="flex items-center gap-2">
                            <span
                              className={
                                (i === stageIndex(b))
                                  ? "px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs"
                                  : "px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs"
                              }
                            >
                              {t(`index.${key}`)}
                            </span>
                            {i < stages.length - 1 && <span className="text-muted-foreground">→</span>}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t("index.created")} {b.createdAt ? new Date(Number(b.createdAt) * (Number(b.createdAt) > 1e12 ? 1 : 1000)).toLocaleString() : "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0">
                      <Badge className="bg-primary/10 text-primary" variant="secondary">{t(`index.${ownerRoleKey(b)}`)}</Badge>
                      {b?.verification?.status === 'verified' ? (
                        <Badge className="bg-success/10 text-success border-success/20" variant="secondary">{t('index.verified')}</Badge>
                      ) : b?.verification?.status === 'pending' ? (
                        <Badge className="bg-warning/10 text-warning border-warning/20" variant="secondary">{t('index.pending')}</Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground" variant="secondary">{t('index.unverified')}</Badge>
                      )}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              ))}
              {(!loading && pageItems.length === 0) && (
                <Card className="p-6 text-sm text-muted-foreground">{t("index.noResults")}</Card>
              )}
            </div>
          </div>

          {/* pagination */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>{t("index.prev")}</Button>
            {Array.from({ length: totalPages }).slice(0, 6).map((_, i) => {
              const n = i + 1;
              return (
                <Button key={n} variant={n===page?"default":"outline"} size="sm" onClick={()=>setPage(n)}>{n}</Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))}>{t("index.next")}</Button>
          </div>

          {/* details dialog */}
    <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("index.batch")} #{selected?.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-muted-foreground">{t("index.crop")}</div><div>{selected?.cropType || "—"}</div>
                  <div className="text-muted-foreground">{t("index.quantity")}</div><div>{selected?.quantityKg || 0} kg</div>
                  <div className="text-muted-foreground">{t("index.farmerPrice")}</div><div>₹{selected?.minPriceINR || selected?.basePriceINR || 0}</div>
                  <div className="text-muted-foreground">{t("index.distributorPrice")}</div><div>₹{selected?.priceByDistributorINR || 0}</div>
                  <div className="text-muted-foreground">{t("index.retailerPrice")}</div><div>₹{selected?.priceByRetailerINR || 0}</div>
                  <div className="text-muted-foreground">{t("index.owner")}</div><div>{selected ? t(`index.${ownerRoleKey(selected)}`) : "—"}</div>
      <div className="text-muted-foreground">{t("index.boughtBy")} {t("index.distributor")}</div>
      <div>{toDate(selected?.boughtByDistributorAt)?.toLocaleString?.() || "—"}</div>
      <div className="text-muted-foreground">{t("index.boughtBy")} {t("index.retailer")}</div>
      <div>{toDate(selected?.boughtByRetailerAt)?.toLocaleString?.() || "—"}</div>
      <div className="text-muted-foreground">{t("index.boughtBy")} {t("index.consumer")}</div>
      <div>{toDate(selected?.boughtByConsumerAt)?.toLocaleString?.() || "—"}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-muted-foreground">{t("index.farmer")}</div><div className="font-mono text-xs break-all">{selected?.farmer}</div>
                  <div className="text-muted-foreground">{t("index.distributor")}</div><div className="font-mono text-xs break-all">{selected?.distributor}</div>
                  <div className="text-muted-foreground">{t("index.retailer")}</div><div className="font-mono text-xs break-all">{selected?.retailer}</div>
                  <div className="text-muted-foreground">{t("index.consumer")}</div><div className="font-mono text-xs break-all">{selected?.consumer}</div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Link to={`/batch?id=${encodeURIComponent(String(selected?.id || ""))}`}>
                    <Button size="sm">{t("index.details")}</Button>
                  </Link>
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
