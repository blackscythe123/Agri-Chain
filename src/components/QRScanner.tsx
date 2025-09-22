import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Scan, 
  CheckCircle, 
  Sprout, 
  Truck, 
  Store,
  DollarSign,
  MapPin,
  Calendar,
  ShieldCheck
} from "lucide-react";

const QRScanner = () => {
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Mock scan result
  const mockScanResult = {
    productName: "Organic Tomatoes",
    batchId: "#105",
    qrCode: "AT105-2024-MH-001",
    farmer: {
      name: "Ravi Sharma",
      location: "Pune, Maharashtra",
      phone: "+91 98765 43210",
      earnings: "₹400 (57% of final price)"
    },
    distributor: {
      name: "FreshLink Distribution",
      transportDate: "2024-01-16",
      cost: "₹40 (transport & handling)"
    },
    retailer: {
      name: "Green Mart",
      location: "Mumbai, Maharashtra",
      margin: "₹260 (37% of final price)"
    },
    blockchain: {
      verified: true,
      transactionHash: "0x1a2b3c4d5e6f...",
      lastUpdated: "2024-01-20 14:30"
    },
    pricing: {
      farmerPrice: "₹20/kg",
      distributorPrice: "₹22/kg",
      retailPrice: "₹35/kg",
      fairTrade: true
    }
  };

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setScannedData(mockScanResult);
      setIsScanning(false);
    }, 2000);
  };

  if (scannedData) {
    return (
  <section id="scanner" className="py-20 bg-muted/30 scroll-mt-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Product Transparency Report</h2>
            <Badge className="bg-success/10 text-success border-success/20">
              <CheckCircle className="w-4 h-4 mr-2" />
              Verified on Blockchain
            </Badge>
          </div>

          <div className="space-y-6">
            {/* Product Header */}
            <Card className="p-6 shadow-medium">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">{scannedData.productName}</h3>
                  <p className="text-muted-foreground">Batch: {scannedData.batchId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">QR Code</p>
                  <p className="font-mono font-semibold">{scannedData.qrCode}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-success/5 rounded-lg">
                  <DollarSign className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="font-semibold text-success">{scannedData.pricing.retailPrice}</p>
                  <p className="text-sm text-muted-foreground">Final Price</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-primary">
                    {scannedData.pricing.fairTrade ? "Verified" : "Pending"}
                  </p>
                  <p className="text-sm text-muted-foreground">Fair Trade</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground">Transparent</p>
                </div>
              </div>
            </Card>

            {/* Supply Chain Journey */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Farmer Card */}
              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Sprout className="w-5 h-5 text-success" />
                  </div>
                  <h4 className="font-semibold">Farmer</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{scannedData.farmer.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {scannedData.farmer.location}
                    </p>
                  </div>
                  <div className="p-3 bg-success/5 rounded-lg">
                    <p className="text-sm font-medium text-success">Earnings</p>
                    <p className="text-lg font-bold text-success">{scannedData.farmer.earnings}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Farmer price: {scannedData.pricing.farmerPrice}
                  </p>
                </div>
              </Card>

              {/* Distributor Card */}
              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">Distributor</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{scannedData.distributor.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {scannedData.distributor.transportDate}
                    </p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium text-primary">Handling Cost</p>
                    <p className="text-lg font-bold text-primary">{scannedData.distributor.cost}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Purchase price: {scannedData.pricing.distributorPrice}
                  </p>
                </div>
              </Card>

              {/* Retailer Card */}
              <Card className="p-6 shadow-medium">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent/50 rounded-lg">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">Retailer</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{scannedData.retailer.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {scannedData.retailer.location}
                    </p>
                  </div>
                  <div className="p-3 bg-accent/30 rounded-lg">
                    <p className="text-sm font-medium text-primary">Retail Margin</p>
                    <p className="text-lg font-bold text-primary">{scannedData.retailer.margin}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Final price: {scannedData.pricing.retailPrice}
                  </p>
                </div>
              </Card>
            </div>

            {/* Blockchain Verification */}
            <Card className="p-6 shadow-medium bg-gradient-fresh border-success/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-success/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
                <h4 className="font-semibold">Blockchain Verification</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Transaction Hash</p>
                  <p className="font-mono text-sm bg-background/50 p-2 rounded">
                    {scannedData.blockchain.transactionHash}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm">{scannedData.blockchain.lastUpdated}</p>
                </div>
              </div>
            </Card>

            <div className="text-center space-y-4">
              <Button 
                variant="outline" 
                onClick={() => setScannedData(null)}
                className="mr-4"
              >
                Scan Another Product
              </Button>
              <a href="https://share.example.com" target="_blank" rel="noreferrer noopener">
                <Button variant="hero">
                  Share This Report
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
  <section id="scanner" className="py-20 bg-muted/30 scroll-mt-24">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="space-y-8 animate-fade-in">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              QR Code Scanner
            </h2>
            <p className="text-xl text-muted-foreground">
              Scan any product QR code to see its complete transparent journey 
              from farm to your table.
            </p>
          </div>

          <Card className="p-12 shadow-strong">
            <div className="space-y-8">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                {isScanning ? (
                  <div className="animate-spin">
                    <Scan className="w-16 h-16 text-primary" />
                  </div>
                ) : (
                  <QrCode className="w-16 h-16 text-primary" />
                )}
              </div>

              {isScanning ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Scanning...</h3>
                  <p className="text-muted-foreground">
                    Fetching blockchain data and verifying transparency...
                  </p>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-primary animate-pulse" style={{ width: "60%" }} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Ready to Scan</h3>
                  <p className="text-muted-foreground">
                    Click below to simulate scanning a product QR code and see 
                    the complete transparency report.
                  </p>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    onClick={handleScan}
                    className="w-full"
                  >
                    <Scan className="w-5 h-5 mr-2" />
                    Scan QR Code (Demo)
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm font-medium">Instant Verification</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Blockchain Secured</p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Fair Trade Verified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QRScanner;