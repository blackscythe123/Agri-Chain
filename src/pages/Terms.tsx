import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground max-w-2xl">The ground rules for using FarmLedge. We keep this simple and clear.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">Your responsibilities</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Provide accurate batch information.</li>
              <li>Use role-based access according to your organization.</li>
              <li>Keep your account secure; don’t share credentials.</li>
              <li>Comply with applicable laws and regulations.</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">Acceptable use</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>No spam, abuse, or attempts to disrupt the service.</li>
              <li>No unauthorized access to other users’ data.</li>
              <li>No tampering with on-chain transactions or signatures.</li>
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Platform model (visual)</h3>
          <pre className="text-xs md:text-sm bg-muted rounded p-3 overflow-auto leading-6">
{`[Users]
  └─ Web App → [Server] → [Smart Contract]
  └─ Payments → [Provider] → Webhook → [Server] → Transfer

We provide the app “as is” and may update features for reliability and security.`}
          </pre>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
