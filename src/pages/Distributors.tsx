import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import on-chain reads later
// import { createPublicClient } from 'viem'
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_ADDRESSES, ensureAddress, isHexAddress } from "@/lib/addresses";
import TestingAddresses from "@/components/TestingAddresses";

const Distributors = () => {
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [retailerPriceInr, setRetailerPriceInr] = useState<string>("");
  const [buyerAddress, setBuyerAddress] = useState<string>(DEFAULT_ADDRESSES.DISTRIBUTOR);
  const [addrError, setAddrError] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string>("");
  const [paying, setPaying] = useState(false);
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e) { console.error(e); }
  }
  useEffect(() => { fetchBatches(); }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('paid') === '1' || params.get('canceled') === '1') {
      fetchBatches()
    }
  }, []);
  const available = useMemo(() => {
    // Available = currently held by farmer (owner == farmer)
    return (batches || []).filter((b:any) => b.currentOwner && b.farmer && b.currentOwner.toLowerCase?.() === b.farmer.toLowerCase?.())
  }, [batches]);

  const validateAddress = (v: string) => {
    if (!v) { setAddrError("Buyer address is required"); return false; }
  if (!isHexAddress(v)) { setAddrError("Enter a valid EVM EOA address (starts with 0x and 40 hex chars)"); return false; }
    setAddrError("");
    return true;
  }

  const pay = async () => {
    setActionMsg("");
    if (!user) { setActionMsg("Please login to continue"); return; }
    if (!selectedBatch) { setActionMsg("Select a batch"); return; }
  const selected = available.find((b:any) => String(b.id) === String(selectedBatch))
  const minInr = selected?.minPriceINR ? Number(selected.minPriceINR) : (selected?.basePriceINR ? Number(selected.basePriceINR) : 0)
  if (!minInr || Number.isNaN(minInr)) { setActionMsg('Missing on-chain min price'); return; }
    const finalBuyer = buyerAddress?.trim() ? buyerAddress : DEFAULT_ADDRESSES.DISTRIBUTOR;
    if (!validateAddress(finalBuyer)) { return; }
    const distributorPriceINR = retailerPriceInr && !Number.isNaN(Number(retailerPriceInr)) ? Math.round(Number(retailerPriceInr)) : undefined;
    try {
      setPaying(true);
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: [{ price_data: { currency: "inr", product_data: { name: `Batch ${selectedBatch}` }, unit_amount: Math.round(minInr * 100) }, quantity: 1 }],
          successUrl: `${window.location.origin}/batch?id=${encodeURIComponent(String(selectedBatch))}&paid=1&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.origin + "/distributors?canceled=1",
          metadata: { batchId: String(selectedBatch), role: "distributor", payer: user.email || 'distributor', payee: selected?.farmer || '', toAddress: finalBuyer, distributorPriceINR }
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setActionMsg("Failed to start payment");
    } catch (e) { console.error(e); alert("Failed to start payment"); }
    finally { setPaying(false); }
  };

  // Manual transfer removed from distributor UI

  // Shipment fields removed; no longer used

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl font-bold">Distributor Dashboard</h1>

  <TestingAddresses />

  <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Browse Available Produce</h2>
          {!!actionMsg && (
            <div className="text-sm text-red-600">{actionMsg}</div>
          )}
          <div className="grid md:grid-cols-3 gap-3">
            <select className="border rounded px-3 py-2" value={selectedBatch} onChange={(e)=>setSelectedBatch(e.target.value)}>
              <option value="">Select batch</option>
              {available.map((b:any) => (
                <option key={b.id} value={b.id}>
                  {b.id} • {b.cropType || '—'} • {b.quantityKg}kg • farmer ₹{b.minPriceINR || '0'}
                </option>
              ))}
            </select>
            <div className="space-y-2">
              <Label>Set Retailer Price (₹ total)</Label>
              <Input value={retailerPriceInr} onChange={(e)=>setRetailerPriceInr(e.target.value)} placeholder="e.g. 1500" />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={pay} disabled={paying || !selectedBatch}>{paying ? 'Starting…' : 'Pay Farmer (Stripe)'}</Button>
              <Button variant="ghost" onClick={fetchBatches}>Refresh</Button>
            </div>
            {available.length === 0 && (
              <div className="md:col-span-3 text-sm text-muted-foreground">No farmer-held batches available. Ask farmers to register new batches.</div>
            )}
          </div>
        </Card>

        <Card className="p-6 grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Buyer Address (EOA)</Label>
            <Input placeholder="0x..." value={buyerAddress} onChange={(e)=>{ setBuyerAddress(e.target.value); if (addrError) validateAddress(e.target.value); }} />
            {!!addrError && <div className="text-xs text-red-600">{addrError}</div>}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Distributors;
