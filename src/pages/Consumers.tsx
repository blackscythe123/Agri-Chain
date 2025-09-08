import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import TestingAddresses from "@/components/TestingAddresses";
import { DEFAULT_ADDRESSES } from "@/lib/addresses";

const Consumers = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  // Buyer address not needed; use default consumer EOA
  const [msg, setMsg] = useState("");
  const [paying, setPaying] = useState(false);
  const { user } = useAuth();

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    fetchBatches();
  }, []);

  const available = useMemo(
    () => (batches || []).filter((b: any) => b.currentOwner?.toLowerCase?.() === (b.retailer || "").toLowerCase?.()),
    [batches]
  );

  const validate = () => {
    if (!user) { setMsg("Please login to continue"); return false; }
    if (!selectedBatch) { setMsg("Select a batch"); return false; }
    setMsg(""); return true;
  };

  const pay = async () => {
    if (!validate()) return;
  const item = available.find((b: any) => String(b.id) === String(selectedBatch));
  const amountInr = item?.priceByRetailerINR && item.priceByRetailerINR !== "0" ? Number(item.priceByRetailerINR) : Number(item.minPriceINR || item.basePriceINR || 0);
  if (!amountInr || Number.isNaN(amountInr)) {
      setMsg("Missing on-chain price");
      return;
    }
    try {
      setPaying(true);
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: [
            {
              price_data: {
                currency: "inr",
                product_data: { name: `Batch ${selectedBatch}` },
                unit_amount: Math.round(amountInr * 100),
              },
              quantity: 1,
            },
          ],
          successUrl: `${window.location.origin}/batch?id=${encodeURIComponent(String(selectedBatch))}&paid=1&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.origin + "/consumers?canceled=1",
          // Always use default consumer address for transfer
          metadata: { batchId: String(selectedBatch), role: "consumer", payer: user.email || "consumer", toAddress: DEFAULT_ADDRESSES.CONSUMER },
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setMsg("Failed to start payment");
    } catch (e) {
      console.error(e);
      setMsg("Failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl font-bold">Consumer Portal</h1>
        <TestingAddresses />
        <Card className="p-6 space-y-4">
          {!!msg && <div className="text-sm text-muted-foreground">{msg}</div>}
          <div className="grid md:grid-cols-3 gap-3">
            <select className="border rounded px-3 py-2" value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}>
              <option value="">Select batch</option>
              {available.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.id} • {b.cropType || "—"} • {b.quantityKg}kg • amount: ₹{b.priceByRetailerINR || b.minPriceINR || "0"}
                </option>
              ))}
            </select>
            {/* Buyer address input removed; default consumer EOA is used */}
            <div className="flex items-end gap-2">
              <Button onClick={pay} disabled={paying || !selectedBatch}>
                {paying ? "Starting…" : "Pay Retailer (Stripe)"}
              </Button>
              <Button variant="ghost" onClick={fetchBatches}>
                Refresh
              </Button>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Consumers;
