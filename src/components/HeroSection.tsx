import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Shield, Eye, QrCode } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";

const HeroSection = () => {
  return (
  <section id="about" className="relative min-h-screen flex items-center justify-center overflow-hidden scroll-mt-24">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Agricultural transparency from farm to consumer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Leaf className="w-4 h-4 mr-2" />
                Blockchain Transparency
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Farm to Fork
                </span>
                <br />
                <span className="text-foreground">Transparency</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Track every step of your food's journey. From the farmer's field to your plate, 
                see transparent pricing, quality standards, and provenance in the agricultural supply chain.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="/#scanner">
                <Button variant="hero" size="lg" className="group">
                  <QrCode className="w-5 h-5 mr-2 group-hover:animate-float" />
                  Scan Product
                </Button>
              </a>
              <a href="/how-it-works">
                <Button variant="outline" size="lg">
                  <Shield className="w-5 h-5 mr-2" />
                  Learn More
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full" />
                100% Transparent
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full" />
                Fair Trade Verified
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full" />
                Blockchain Secured
              </div>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="space-y-6 animate-slide-up">
            <Card className="p-6 bg-gradient-fresh border-primary/20 shadow-medium">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Complete Transparency</h3>
                  <p className="text-sm text-muted-foreground">
                    See exactly how much farmers earn, distributor costs, and retailer margins for every product.
                  </p>
                </div>
              </div>
            </Card>

            {null}

            <Card className="p-6 bg-card border-primary/20 shadow-medium">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Easy Scanning</h3>
                  <p className="text-sm text-muted-foreground">
                    Simply scan any QR code to trace the complete journey of your food from farm to table.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;