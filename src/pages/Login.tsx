import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [role, setRole] = useState<import("@/context/AuthContext").Role>("consumer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const go = () => {
    if (!email || !password) return;
    const dest = role === "farmer"
      ? "/farmers"
      : role === "distributor"
        ? "/distributors"
        : role === "retailer"
          ? "/retailers"
          : role === "verifier"
            ? "/verification-center"
            : "/consumers";
    // For testing, accept any email/password; no OTP and no wallet required
    login({ role, email });
    nav(dest);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-6">
        <h1 className="text-3xl font-bold">Login</h1>
        <p className="text-muted-foreground">Choose your role and sign in with email + password (test-only, no OTP).</p>

        <Card className="p-6">
          <Tabs defaultValue="consumer" onValueChange={(v) => setRole(v as any)}>
            <TabsList className="grid grid-cols-5 max-w-xl">
              <TabsTrigger value="farmer">Farmer</TabsTrigger>
              <TabsTrigger value="distributor">Distributor</TabsTrigger>
              <TabsTrigger value="retailer">Retailer</TabsTrigger>
              <TabsTrigger value="consumer">Consumer</TabsTrigger>
              <TabsTrigger value="verifier">Verifier</TabsTrigger>
            </TabsList>

            {(["farmer", "distributor", "retailer", "consumer", "verifier"] as const).map(r => (
              <TabsContent value={r} key={r} className="mt-6">
                <div className="max-w-md">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Email + Password</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" />
                      </div>
                      <div className="space-y-1">
                        <Label>Password</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={go}>Continue</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Test-only: accepts any email/password. You’ll need to logout to switch roles.</p>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
