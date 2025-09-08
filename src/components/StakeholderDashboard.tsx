import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sprout, 
  Truck, 
  Store, 
  Users, 
  Shield, 
  DollarSign, 
  CheckCircle, 
  Clock,
  BarChart3,
  Package
} from "lucide-react";

const StakeholderDashboard = () => {
  return (
    <section id="dashboard" className="py-20 bg-gradient-earth scroll-mt-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stakeholder Dashboards
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every participant in the supply chain has their own dedicated dashboard 
            to manage their role in the transparent agricultural ecosystem.
          </p>
        </div>

        <Tabs defaultValue="farmer" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto mb-12">
            <TabsTrigger value="farmer" className="flex items-center gap-2">
              <Sprout className="w-4 h-4" />
              <span className="hidden sm:inline">Farmer</span>
            </TabsTrigger>
            <TabsTrigger value="distributor" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Distributor</span>
            </TabsTrigger>
            <TabsTrigger value="retailer" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Retailer</span>
            </TabsTrigger>
            <TabsTrigger value="consumer" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Consumer</span>
            </TabsTrigger>
            {null}
          </TabsList>

          <TabsContent value="farmer" className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Register Produce</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Add new batches with crop type, quantity, and harvest date.
                </p>
                <a href="/farmers">
                  <Button variant="outline" size="sm" className="w-full">
                    Add New Batch
                  </Button>
                </a>
              </Card>

              {null}

              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Sales History</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Track your produce sales and earnings over time.
                </p>
                <a href="/farmers">
                  <Button variant="outline" size="sm" className="w-full">
                    View History
                  </Button>
                </a>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distributor" className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Browse Produce</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Find and purchase available produce batches from farmers.
                </p>
                <a href="/distributors">
                  <Button variant="outline" size="sm" className="w-full">
                    Browse Now
                  </Button>
                </a>
              </Card>

              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="font-semibold">Purchase & Transfer</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete purchases via Stripe; ownership is transferred on-chain by a verifier.
                </p>
                <a href="/distributors">
                  <Button variant="success" size="sm" className="w-full">
                    Manage Transfers
                  </Button>
                </a>
              </Card>

              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Transport Logs</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Record transport and storage details with document hashes.
                </p>
                <a href="/distributors">
                  <Button variant="outline" size="sm" className="w-full">
                    Update Logs
                  </Button>
                </a>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="retailer" className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">Confirm Delivery</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Verify and confirm deliveries from distributors.
                </p>
                <a href="/retailers">
                  <Button variant="outline" size="sm" className="w-full">
                    Pending Deliveries
                  </Button>
                </a>
              </Card>

              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="font-semibold">Set Consumer Price</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Update final pricing for consumers while maintaining transparency.
                </p>
                <a href="/retailers">
                  <Button variant="success" size="sm" className="w-full">
                    Update Pricing
                  </Button>
                </a>
              </Card>

              {null}
            </div>
          </TabsContent>

          <TabsContent value="consumer" className="space-y-6 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 shadow-medium">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Scan & Trace</h3>
                  <p className="text-muted-foreground">
                    Scan any QR code on product packaging to see the complete journey 
                    from farm to your table.
                  </p>
                  <a href="/#scanner">
                    <Button variant="hero" className="w-full">
                      Open Scanner
                    </Button>
                  </a>
                </div>
              </Card>

              <Card className="p-8 shadow-medium">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold">Fair Trade Verification</h3>
                  <p className="text-muted-foreground">
                    See transparent pricing and the complete breakdown of costs and margins.
                  </p>
                  <a href="/fair-trade">
                    <Button variant="success" className="w-full">
                      Check Fair Trade
                    </Button>
                  </a>
                </div>
              </Card>
            </div>
          </TabsContent>

          {null}
        </Tabs>
      </div>
    </section>
  );
};

export default function DeprecatedStakeholderDashboard(){ return null }