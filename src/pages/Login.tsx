import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const roleFromQuery = query.get("role") as import("@/context/AuthContext").Role | null;
  const roleFromState = (location.state as any)?.roleRequired as import("@/context/AuthContext").Role | undefined;
  const lastRole = (typeof window !== 'undefined' ? localStorage.getItem('lastRole') : null) as import("@/context/AuthContext").Role | null;
  const initialRole = (roleFromState || roleFromQuery || lastRole || "consumer") as import("@/context/AuthContext").Role;
  const [role, setRole] = useState<import("@/context/AuthContext").Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    // When navigated with state/query, sync role accordingly
    const nextRole = (roleFromState || roleFromQuery) as import("@/context/AuthContext").Role | undefined;
    if (nextRole && nextRole !== role) setRole(nextRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFromState, roleFromQuery]);

  useEffect(() => {
    // Persist last selected role for convenience
    try { localStorage.setItem('lastRole', role); } catch {}
  }, [role]);

  const go = () => {
    if (!email || !password) return;
    const dest = role === "farmer"
      ? "/farmers"
      : role === "distributor"
      ? "/distributors"
      : role === "retailer"
      ? "/retailers"
      : role === "verifier"
      ? "/verifiers"
      : "/consumers";
    // For testing, accept any email/password; no OTP and no wallet required
    login({ role, email });
    nav(dest);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{t("login.title")}</h1>
        <p className="text-muted-foreground">{t("login.description")}</p>

        <Card className="p-6">
          <Tabs value={role} onValueChange={(v)=>setRole(v as any)}>
            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-w-full sm:max-w-2xl">
              <TabsTrigger value="farmer">{t("nav.farmers")}</TabsTrigger>
              <TabsTrigger value="distributor">{t("nav.distributors")}</TabsTrigger>
              <TabsTrigger value="retailer">{t("nav.retailers")}</TabsTrigger>
              <TabsTrigger value="consumer">{t("nav.consumers")}</TabsTrigger>
              <TabsTrigger value="verifier">{t("nav.verifiers")}</TabsTrigger>
            </TabsList>

            {(["farmer","distributor","retailer","consumer","verifier"] as const).map((r) => (
              <TabsContent value={r} key={r} className="mt-6">
                <div className="max-w-md w-full">
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
