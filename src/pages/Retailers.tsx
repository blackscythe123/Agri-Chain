import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import TestingAddresses from "@/components/TestingAddresses";
import { DEFAULT_ADDRESSES } from "@/lib/addresses";

const Retailers = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [priceInr, setPriceInr] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [consumerPriceInr, setConsumerPriceInr] = useState<string>("");
  const [paying, setPaying] = useState(false);
  const { user } = useAuth();

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchBatches(); }, []);

  const myInventory = useMemo(() => (batches || []).filter((b:any) => b.currentOwner?.toLowerCase?.() === (b.distributor||"").toLowerCase?.()), [batches]);

  const setRetailPrice = async () => {
    setMsg("");
    if (!user) { setMsg("Please login to continue"); return; }
    if (!selectedBatch) { setMsg("Select a batch"); return; }
    const inr = Number(priceInr || 0);
    if (!inr || Number.isNaN(inr)) { setMsg("Enter a valid price (₹)"); return; }
    try {
      setSaving(true);
      const res = await fetch('/api/set-price-by-retailer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: String(selectedBatch), priceINR: Math.round(inr) })
      });
      const data = await res.json();
      if (res.ok && data?.ok) { setMsg('Retail price updated'); await fetchBatches(); setPriceInr(""); }
      else setMsg(data?.error || 'Failed to set price');
    } catch (e:any) { setMsg(e?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const pay = async () => {
    setMsg("");
    if (!user) { setMsg('Please login to continue'); return; }
    if (!selectedBatch) { setMsg('Select a batch'); return; }
  const item = myInventory.find((b:any) => String(b.id) === String(selectedBatch));
  const amountInr = item?.priceByDistributorINR && item.priceByDistributorINR !== '0' ? Number(item.priceByDistributorINR) : Number(item.minPriceINR || item.basePriceINR || 0);
  if (!amountInr || Number.isNaN(amountInr)) { setMsg('Missing on-chain price'); return; }
  const consumerPriceINR = consumerPriceInr && !Number.isNaN(Number(consumerPriceInr)) ? Math.round(Number(consumerPriceInr)) : undefined;
    try {
      setPaying(true);
      const res = await fetch('/create-checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItems: [{ price_data: { currency: 'inr', product_data: { name: `Batch ${selectedBatch}` }, unit_amount: Math.round(amountInr * 100) }, quantity: 1 }],
          successUrl: `${window.location.origin}/batch?id=${encodeURIComponent(String(selectedBatch))}&paid=1&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.origin + '/retailers?canceled=1',
      // Use default retailer address for ownership transfer; allow setting consumer price during purchase
      metadata: { batchId: String(selectedBatch), role: 'retailer', payer: user.email || 'retailer', toAddress: DEFAULT_ADDRESSES.RETAILER, consumerPriceINR }
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url; else setMsg('Failed to start payment');
    } catch (e:any) { setMsg(e?.message || 'Failed'); }
    finally { setPaying(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl font-bold">Retailer Dashboard</h1>
        <TestingAddresses />
        <Card className="p-6 space-y-4">
          {!!msg && <div className="text-sm text-muted-foreground">{msg}</div>}
          <div className="grid md:grid-cols-3 gap-3">
            <select className="border rounded px-3 py-2" value={selectedBatch} onChange={(e)=>setSelectedBatch(e.target.value)}>
              <option value="">Select batch</option>
              {myInventory.map((b:any) => (
                <option key={b.id} value={b.id}>
                  {b.id} • {b.cropType || '—'} • {b.quantityKg}kg • amount ₹{b.priceByDistributorINR || b.minPriceINR || '0'}
                </option>
              ))}
            </select>
            <div className="space-y-2">
              <Label>Set Consumer Price (₹ total)</Label>
              <Input value={consumerPriceInr} onChange={(e)=>setConsumerPriceInr(e.target.value)} placeholder="e.g. 2000" />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={pay} disabled={paying || !selectedBatch}>{paying ? 'Starting…' : 'Pay Distributor (Stripe)'}</Button>
              <Button variant="ghost" onClick={fetchBatches}>Refresh</Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Retailers;
