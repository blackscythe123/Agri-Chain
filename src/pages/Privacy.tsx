import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";

type Batch = {
  id: number | string;
  cropType?: string;
  currentOwner?: string;
  createdAt?: number | string;
};

const Privacy = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const r = await fetch('/api/batches');
        const d = await r.json();
        setBatches(Array.isArray(d?.batches) ? d.batches : []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally { setLoading(false); }
    })();
  }, []);

  const latest = useMemo(() => (batches || [])[0], [batches]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-2xl">Learn how we collect, use, and protect your data. We keep on-chain records public by design and minimize off-chain personal data.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">What we collect</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Blockchain data: batch ids, owner addresses, INR prices.</li>
              <li>Operational data: timestamps of ownership changes.</li>
              <li>Account info you provide for login and roles.</li>
              <li>Payment metadata via our provider (no card numbers stored on our servers).</li>
            </ul>
          </Card>

          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">How we use data</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>To register and display batch provenance on-chain.</li>
              <li>To process purchases and transfer ownership via a verifier.</li>
              <li>To provide dashboards and role-based access.</li>
              <li>To improve reliability and detect abuse.</li>
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Data flow (visual)</h3>
          <pre className="text-xs md:text-sm bg-muted rounded p-3 overflow-auto leading-6">
{`[Client]
  └─ registers/reads → [Server]
                         └─ viem → [Smart Contract]
  └─ checkout → [Payment Provider]
                         └─ webhook → [Server] → transferOwnership

On-chain: batch ids, owner, INR prices
Off-chain: minimal account/session data`}
          </pre>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">On-chain vs. Off-chain</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>On-chain data is public and immutable.</li>
              <li>We store only what’s needed off-chain (sessions, role mapping).</li>
              <li>Payment details are handled by the provider; tokens only.</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold">Live transparency</h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <div>Total batches: <Badge variant="outline">{batches.length}</Badge></div>
                {latest && <div>Latest batch <Badge variant="outline">#{String(latest.id)}</Badge> • owner {String(latest.currentOwner||'—').slice(0,10)}…</div>}
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
