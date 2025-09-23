import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Shield, Eye, QrCode } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";
import { useTranslation } from "react-i18next";

const HeroSection = () => {
  const { t } = useTranslation();
  return (
  <section id="about" className="relative min-h-[70vh] sm:min-h-screen flex items-center justify-center overflow-hidden scroll-mt-24">
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
      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                <Leaf className="w-4 h-4 mr-2" />
                {t("hero.badge")}
              </Badge>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {t("hero.title1")}
                </span>
                <br />
                <span className="text-foreground">{t("hero.title2")}</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {t("hero.description")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <a href="/#scanner">
                <Button variant="hero" size="lg" className="group">
                  <QrCode className="w-5 h-5 mr-2 group-hover:animate-float" />
                  {t("hero.scanButton")}
                </Button>
              </a>
              <a href="/how-it-works">
                <Button variant="outline" size="lg">
                  <Shield className="w-5 h-5 mr-2" />
                  {t("hero.learnMore")}
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full" />
                {t("hero.trust1")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full" />
                {t("hero.trust2")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full" />
                {t("hero.trust3")}
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
                  <h3 className="font-semibold mb-2">{t("hero.card1Title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("hero.card1Desc")}
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
                  <h3 className="font-semibold mb-2">{t("hero.card2Title")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("hero.card2Desc")}
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