import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

export default function RetailerProfile() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-28 space-y-6">
        <h1 className="text-3xl font-bold">Retailer Profile</h1>
        <Card className="p-6 space-y-2">
          <div>Role: {user?.role ?? "-"}</div>
          <div>Email: {user?.email ?? "-"}</div>
          <div className="pt-2"><Link to="/retailers" className="underline">Go to Retailer Dashboard</Link></div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
