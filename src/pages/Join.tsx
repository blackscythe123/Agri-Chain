import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ConnectWallet } from "@/components/ConnectWallet";

const Join = () => {
  const [role, setRole] = useState("farmer");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const go = () => {
    const route =
      role === "farmer"
        ? "/farmers"
        : role === "distributor"
        ? "/distributors"
        : role === "retailer"
        ? "/retailers"
        : role === "consumer"
        ? "/consumers"
        : "/admin";
    login({ role: role as any, email: email || undefined });
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Join AgriChain</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl">
          Pick your role and continue. You’ll be asked to login on the next step.
        </p>

        <Card className="p-6">
          <Tabs defaultValue="farmer" onValueChange={setRole}>
            <TabsList className="grid grid-cols-5 max-w-2xl">
              <TabsTrigger value="farmer">Farmer</TabsTrigger>
              <TabsTrigger value="distributor">Distributor</TabsTrigger>
              <TabsTrigger value="retailer">Retailer</TabsTrigger>
              <TabsTrigger value="consumer">Consumer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="farmer" className="mt-6">
              <RoleForm email={email} setEmail={setEmail} otp={otp} setOtp={setOtp} onContinue={go} />
            </TabsContent>
            <TabsContent value="distributor" className="mt-6">
              <RoleForm email={email} setEmail={setEmail} otp={otp} setOtp={setOtp} onContinue={go} />
            </TabsContent>
            <TabsContent value="retailer" className="mt-6">
              <RoleForm email={email} setEmail={setEmail} otp={otp} setOtp={setOtp} onContinue={go} />
            </TabsContent>
            <TabsContent value="consumer" className="mt-6">
              <Card className="p-6">
                <p className="text-muted-foreground">No account required. Use the scanner to view product journeys.</p>
                <div className="mt-4">
                  <Button onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="admin" className="mt-6">
              <RoleForm email={email} setEmail={setEmail} otp={otp} setOtp={setOtp} onContinue={go} />
            </TabsContent>
          </Tabs>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

function RoleForm({
  email,
  setEmail,
  otp,
  setOtp,
  onContinue,
}: {
  email: string;
  setEmail: (v: string) => void;
  otp: string;
  setOtp: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Connect Wallet</h3>
        <p className="text-sm text-muted-foreground mb-4">Use MetaMask on Arbitrum Sepolia.</p>
        <ConnectWallet />
      </Card>
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Email + OTP</h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <Label>OTP</Label>
            <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" />
          </div>
          <div className="flex gap-2">
            <Button className={buttonVariants({ variant: "outline" })}>Send OTP</Button>
            <Button onClick={onContinue}>Continue</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Join;
