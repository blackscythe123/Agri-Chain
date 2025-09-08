import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Batch = {
  id: number | string; cropType?: string; quantityKg?: number | string;
  basePriceINR?: number | string; minPriceINR?: number | string; priceByDistributorINR?: number | string; priceByRetailerINR?: number | string;
};

const FairTrade = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async ()=>{ try { setLoading(true); const r=await fetch('/api/batches'); const d=await r.json(); setBatches(d?.batches||[]);} catch{} finally { setLoading(false); } })(); }, []);
  const latest = useMemo(()=> (batches||[])[0], [batches]);

  const n = (v?: number|string) => Number(v||0);
  const mk = (b?: Batch) => {
    if (!b) return null;
  const min = n(b.minPriceINR || b.basePriceINR), dist = n(b.priceByDistributorINR), retail = n(b.priceByRetailerINR);
  return { min, dist, retail, marginDist: Math.max(0, dist - min), marginRetail: Math.max(0, retail - dist) };
  };
  const calc = mk(latest);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold">Fair Trade Info</h1>
        <p className="text-muted-foreground max-w-2xl">We expose INR prices at every stage so consumers can see how value is shared. Below is a simple breakdown; exact numbers depend on each batch.</p>

        <Card className="p-6">
          <h2 className="font-semibold mb-3">Price flow</h2>
          <pre className="text-xs md:text-sm bg-muted rounded p-3 overflow-auto leading-6">
{`Farmer ₹ (baseline)
  → Dist ₹ (distributor sets)
    → Retail ₹ (retailer sets)

Margins (example): Dist = Dist₹ - Farmer₹, Retail = Retail₹ - Dist₹`}
          </pre>
        </Card>

        <Card className="p-6 space-y-2">
          <h3 className="font-semibold">Live example</h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : calc ? (
            <div className="text-sm">
              <div>Batch <Badge variant="outline">#{String(latest?.id)}</Badge></div>
              <div className="text-muted-foreground">Farmer ₹{calc.min} • Dist ₹{calc.dist} • Retail ₹{calc.retail}</div>
              <div className="text-muted-foreground">Margins → Distributor ₹{calc.marginDist} • Retailer ₹{calc.marginRetail}</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No data yet.</div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default FairTrade;
