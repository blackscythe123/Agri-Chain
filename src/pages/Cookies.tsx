import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Cookie Policy</h1>
          <p className="text-muted-foreground max-w-2xl">We use minimal cookies to run the app and remember your preferences. No ad trackers.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">What cookies we use</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Session cookie: keeps you signed in and routes protected pages.</li>
              <li>Preference cookie: stores UI settings (like theme).</li>
              <li>No third‑party ads or cross‑site trackers.</li>
            </ul>
          </Card>
          <Card className="p-6 space-y-2">
            <h3 className="font-semibold">Your choices</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>You can clear cookies in your browser settings at any time.</li>
              <li>Signing out removes the session cookie from this device.</li>
              <li>Strictly necessary cookies are required for core features.</li>
            </ul>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Where cookies fit (visual)</h3>
          <pre className="text-xs md:text-sm bg-muted rounded p-3 overflow-auto leading-6">
{`[Browser]
  └─ session + preferences (first‑party cookies)
  └─ requests → [Server]

No ad networks. No third‑party analytics by default.`}
          </pre>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
