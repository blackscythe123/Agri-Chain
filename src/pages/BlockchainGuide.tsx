import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Batch = {
  id: number | string;
  currentOwner?: string;
  farmer?: string; distributor?: string; retailer?: string; consumer?: string;
  basePriceINR?: number | string; minPriceINR?: number | string; priceByDistributorINR?: number | string; priceByRetailerINR?: number | string;
  createdAt?: number | string; boughtByDistributorAt?: number | string; boughtByRetailerAt?: number | string; boughtByConsumerAt?: number | string;
};

const BlockchainGuide = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { try { setLoading(true); const r = await fetch('/api/batches'); const d = await r.json(); setBatches(d?.batches || []);} catch {} finally { setLoading(false); } })(); }, []);
  const sample = useMemo(() => (batches || [])[0], [batches]);

  const fmt = (v?: number | string) => {
    if (!v) return '—'; const n = Number(v); if (!n) return '—'; const d = new Date((n>1e12?n:n*1000)); return d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold">Blockchain Guide</h1>
        <p className="text-muted-foreground max-w-2xl">This platform uses a smart contract to store each batch’s owner and INR prices. When a purchase is confirmed via Stripe, a verifier account executes the ownership transfer on-chain. This gives an immutable provenance trail.</p>

        <Card className="p-6">
          <h2 className="font-semibold mb-3">Blocks and state (visual)</h2>
          <pre className="text-xs md:text-sm bg-muted rounded p-3 overflow-auto leading-6">
{`[Block n-2] ─ state: batch #… owner=Farmer
[Block n-1] ─ tx: transferOwnershipByVerifier(to=Distributor)
[Block n  ] ─ state: batch #… owner=Distributor

Prices stored in state (INR): farmer, dist, retail`}
          </pre>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">What we store</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Owner address and role links (farmer, distributor, retailer, consumer).</li>
              <li>INR prices: farmer, distributor, retailer.</li>
              <li>Timestamps when ownership changed (where available).</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">Live sample (if any)</h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-4 w-80" />
              </div>
            ) : sample ? (
              <div className="text-sm text-muted-foreground">
                <div>Batch #{String(sample.id)} • owner: <span className="font-mono">{sample.currentOwner}</span></div>
                <div>Prices → Farmer ₹{sample.minPriceINR||sample.basePriceINR||0} • Dist ₹{sample.priceByDistributorINR||0} • Retail ₹{sample.priceByRetailerINR||0}</div>
                <div>Bought: Dist {fmt(sample.boughtByDistributorAt)} • Retail {fmt(sample.boughtByRetailerAt)} • Cons {fmt(sample.boughtByConsumerAt)}</div>
              </div>
            ) : <div className="text-sm text-muted-foreground">No batches yet.</div>}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlockchainGuide;
