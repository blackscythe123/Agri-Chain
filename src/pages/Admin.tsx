import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { mockChain } from "@/lib/mockChain";

const Admin = () => {
  const batches = mockChain.listBatches();
  const avgFarmer = batches.length
    ? (batches.reduce((s, b) => s + b.basePricePerKg, 0) / batches.length).toFixed(2)
    : "0";
  const avgRetail = batches.filter(b => !!b.retailPricePerKg).length
    ? (
        batches.filter(b => !!b.retailPricePerKg).reduce((s, b) => s + (b.retailPricePerKg || 0), 0) /
        batches.filter(b => !!b.retailPricePerKg).length
      ).toFixed(2)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
    <Card className="p-6 grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Avg Farmer Price / kg</div>
            <div className="text-2xl font-bold">₹{avgFarmer}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Avg Retail Price / kg</div>
            <div className="text-2xl font-bold">₹{avgRetail}</div>
          </Card>
          <Card className="p-4">
      <div className="text-sm text-muted-foreground">Total Batches</div>
      <div className="text-2xl font-bold">{batches.length}</div>
          </Card>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
