import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold">Support Center</h1>
        <p className="text-muted-foreground max-w-2xl">Find answers, guides, and contact options.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">Getting Started</h3>
            <p className="text-sm text-muted-foreground">Learn the basics and see the platform flow.</p>
            <a href="/how-it-works"><Button size="sm" variant="outline">How It Works</Button></a>
          </Card>
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">Developers</h3>
            <p className="text-sm text-muted-foreground">Integrate your app or scripts using our API.</p>
            <a href="/api-docs"><Button size="sm" variant="outline">API Docs</Button></a>
          </Card>
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">Contact</h3>
            <p className="text-sm text-muted-foreground">Need help? Reach us via email.</p>
            <a href="mailto:contact@FarmLedge.com"><Button size="sm">Email Support</Button></a>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
