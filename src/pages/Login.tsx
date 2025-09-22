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
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const [role, setRole] = useState<import("@/context/AuthContext").Role>("consumer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  const go = () => {
    if (!email || !password) return;
    const dest = role === "farmer" ? "/farmers" : role === "distributor" ? "/distributors" : role === "retailer" ? "/retailers" : "/consumers";
    // For testing, accept any email/password; no OTP and no wallet required
    login({ role, email });
    nav(dest);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-6">
        <h1 className="text-3xl font-bold">{t("login.title")}</h1>
        <p className="text-muted-foreground">{t("login.description")}</p>

        <Card className="p-6">
          <Tabs defaultValue="consumer" onValueChange={(v)=>setRole(v as any)}>
            <TabsList className="grid grid-cols-4 max-w-xl">
              <TabsTrigger value="farmer">{t("nav.farmers")}</TabsTrigger>
              <TabsTrigger value="distributor">{t("nav.distributors")}</TabsTrigger>
              <TabsTrigger value="retailer">{t("nav.retailers")}</TabsTrigger>
              <TabsTrigger value="consumer">{t("nav.consumers")}</TabsTrigger>
            </TabsList>

            {(["farmer","distributor","retailer","consumer"] as const).map(r => (
              <TabsContent value={r} key={r} className="mt-6">
                <div className="max-w-md">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">{t("login.emailPassword")}</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>{t("login.email")}</Label>
                        <Input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@gmail.com" />
                      </div>
                      <div className="space-y-1">
                        <Label>{t("login.password")}</Label>
                        <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={go}>{t("login.continue")}</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{t("login.testNote")}</p>
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
