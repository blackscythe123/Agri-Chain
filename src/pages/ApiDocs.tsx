import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import VerificationCenterDashboard from "@/components/VerificationCenterDashboard";
import ConsumerBatchInfo from "@/components/ConsumerBatchInfo";

const ApiDocs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground max-w-2xl">Use these endpoints to read batches and trigger flows like checkout sessions and price updates.</p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">REST Endpoints</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>GET <code>/api/batches</code> — List batches</li>
              <li>GET <code>/api/batch/:id</code> — Read a single batch</li>
              <li>POST <code>/api/register-batch</code> — Register a new batch</li>
              <li>POST <code>/create-checkout-session</code> — Create Stripe Checkout</li>
              <li>POST <code>/api/set-price-by-retailer</code> — Set consumer price (INR)</li>
              <li>GET <code>/api/farmers/search</code> — Search farmer</li>
              <li>POST <code>/api/farmers/register</code> — Register farmer</li>
              <li>POST <code>/api/verification/verify-batch</code> — Verify batch</li>
              <li>POST <code>/api/supply-chain/update-quantity</code> — Update quantities</li>
              <li>POST <code>/api/consumer/complaint</code> — Submit complaint</li>
              <li>POST <code>/api/consumer/rating</code> — Submit rating</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Sequence (simplified)</h3>
            <pre className="text-xs md:text-sm bg-muted rounded p-3 overflow-auto leading-6">
              {`[Client] → POST /create-checkout-session
  → [Stripe Checkout]
    → [Server Webhook] (payment success)
      → Contract.transferOwnershipByVerifier(batchId, to)
        (optional) setPriceByRetailerInr / setPriceByDistributorInr`}
            </pre>
          </Card>
          <Card className="p-6 col-span-2 space-y-6">
            <h3 className="font-semibold">Examples</h3>
            <VerificationCenterDashboard />
            <ConsumerBatchInfo batchId="1" />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApiDocs;
