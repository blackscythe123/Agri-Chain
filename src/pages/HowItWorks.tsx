import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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
  createdAt?: number | string;
  boughtByDistributorAt?: number | string;
  boughtByRetailerAt?: number | string;
  boughtByConsumerAt?: number | string;
};

const stages = ["Farmer", "Distributor", "Retailer", "Consumer"] as const;

function ownerRole(b: Batch) {
  const owner = (b.currentOwner || "").toLowerCase();
  if (!owner) return "Unknown";
  if (owner === (b.consumer || "").toLowerCase()) return "Consumer";
  if (owner === (b.retailer || "").toLowerCase()) return "Retailer";
  if (owner === (b.distributor || "").toLowerCase()) return "Distributor";
  if (owner === (b.farmer || "").toLowerCase()) return "Farmer";
  return "Holder";
}

const HowItWorks = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    try {
      setLoading(true);
      const r = await fetch('/api/batches');
      const d = await r.json();
      setBatches(d?.batches || []);
    } catch {}
    finally { setLoading(false); }
  })(); }, []);
  const latest = useMemo(() => (batches || []).slice().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0))[0], [batches]);

  const stageIndex = (b: Batch) => {
    switch (ownerRole(b)) {
      case "Farmer": return 0; case "Distributor": return 1; case "Retailer": return 2; case "Consumer": return 3; default: return -1;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold">How It Works</h1>
        <p className="text-muted-foreground max-w-2xl">
          The platform records produce batches on-chain with INR pricing. Purchases happen via Stripe, and a verifier
          performs the on-chain ownership transfer. Every stage exposes transparent prices.
        </p>

        <Card className="p-6">
          <h2 className="font-semibold mb-3">Flow at a glance</h2>
          <pre className="text-xs md:text-sm bg-muted rounded p-3 overflow-auto leading-6">
{`[Farmer]
  └─ registers batch (crop, quantity, ₹ farmer)
[Distributor]
   └─ pays via Stripe → verifier transfers ownership on-chain
[Retailer]
   └─ pays via Stripe → verifier transfers ownership on-chain
[Consumer]
   └─ pays via Stripe → verifier transfers ownership on-chain

Pricing: ₹ Farmer → ₹ Dist → ₹ Retail`}
          </pre>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold">On-chain contract (high level)</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Batch stores owner, role addresses, crop, quantity, pricing (INR only).</li>
              <li>Verifier (server relayer) can transfer ownership after payment confirmation.</li>
              <li>Retail pricing is set via dedicated INR setter functions.</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold">Live snapshot (latest batch)</h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-72" />
                <div className="flex items-center gap-2 pt-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16 rounded" />
                      {i < 3 && <span className="text-muted-foreground">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : latest ? (
              <div className="space-y-2 text-sm">
                <div>Batch <Badge variant="outline">#{String(latest.id)}</Badge> • {latest.cropType || '—'} • {latest.quantityKg || 0}kg</div>
                <div className="text-muted-foreground">Prices: Farmer ₹{latest.minPriceINR || latest.basePriceINR || 0} • Dist ₹{latest.priceByDistributorINR || 0} • Retail ₹{latest.priceByRetailerINR || 0}</div>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {stages.map((label, i) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className={i===stageIndex(latest)?"px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-xs":"px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs"}>{label}</span>
                      {i<stages.length-1 && <span className="text-muted-foreground">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No batches found yet.</div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
