import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BatchDetails() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) { setError("missing id"); setLoading(false); return; }
      try {
        setLoading(true)
        const paid = new URLSearchParams(window.location.search).get('paid')
        const sessionId = new URLSearchParams(window.location.search).get('session_id')
        if (paid === '1' && sessionId) {
          try {
            await fetch('/api/confirm-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, batchId: id })
            })
          } catch {}
        }
        const res = await fetch(`/api/batch/${encodeURIComponent(id)}`)
        const text = await res.text()
        let json: any = null
        try { json = JSON.parse(text) } catch {
          throw new Error('Non-JSON response (server offline or proxy misconfig)')
        }
        if (!res.ok) throw new Error(json?.error || 'failed')
        setData(json)
      } catch (e: any) {
        setError(e.message || 'failed')
      } finally { setLoading(false) }
    }
    run()
  }, [id])
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-6">
        <h1 className="text-3xl font-bold">Batch Details</h1>
        <Card className="p-6 space-y-4">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {!loading && error && (
            <p className="text-sm text-destructive">Error: {error}</p>
          )}
          {!loading && data && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground font-mono">Batch #{data.batch.id}</div>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">Crop:</span> {data.batch.cropType}</div>
                <div><span className="font-semibold">Quantity:</span> {data.batch.quantityKg} kg</div>
                <div><span className="font-semibold">Farmer:</span> {data.batch.farmer}</div>
                <div><span className="font-semibold">Owner:</span> {data.batch.currentOwner}</div>
                <div><span className="font-semibold">Owner Role:</span> {data.batch.currentHolderRole || '—'}</div>
                <div><span className="font-semibold">Farmer Price (₹):</span> {data.batch.minPriceINR || data.batch.basePriceINR || '0'}</div>
                <div><span className="font-semibold">Harvest:</span> {new Date(data.batch.harvestDate * 1000).toLocaleDateString()}</div>
                <div><span className="font-semibold">Created:</span> {new Date(data.batch.createdAt * 1000).toLocaleString()}</div>
                {!!data.batch?.priceByDistributorINR && (
                  <div><span className="font-semibold">Distributor Price (₹):</span> {data.batch.priceByDistributorINR}</div>
                )}
                {!!data.batch?.priceByRetailerINR && (
                  <div><span className="font-semibold">Retailer Price (₹):</span> {data.batch.priceByRetailerINR}</div>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>Farmer → Distributor: {data.batch.dates?.boughtByDistributor ? new Date(data.batch.dates.boughtByDistributor * 1000).toLocaleString() : '—'}</div>
                <div>Distributor → Retailer: {data.batch.dates?.boughtByRetailer ? new Date(data.batch.dates.boughtByRetailer * 1000).toLocaleString() : '—'}</div>
                <div>Retailer → Consumer: {data.batch.dates?.boughtByConsumer ? new Date(data.batch.dates.boughtByConsumer * 1000).toLocaleString() : '—'}</div>
              </div>
              
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}
