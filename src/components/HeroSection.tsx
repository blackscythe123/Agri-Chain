import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Leaf, Shield, Eye, QrCode, Copy, Link as LinkIcon, Download } from "lucide-react";
import heroImage from "@/assets/hero-agriculture.jpg";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/components/ui/use-toast";

const HeroSection = () => {
  const { t } = useTranslation();

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);
  const [batchId, setBatchId] = useState("");
  const qrWrapRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Build destination using env-based site URL, fallback to current origin
  const SITE_URL = (import.meta.env.VITE_SITE_URL as string) ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const BASE_URL = `${SITE_URL.replace(/\/$/, "")}/batch?id=`;
  // Sanitize id (digits only) but keep user's input for display
  const sanitizedId = useMemo(() => batchId.replace(/\D/g, ""), [batchId]);
  const hasInput = batchId.trim().length > 0;
  const isValid = sanitizedId.length > 0;
  const targetUrl = isValid ? `${BASE_URL}${encodeURIComponent(sanitizedId)}` : "";

  const handleCopyUrl = async () => {
    try {
      if (!isValid) return;
      await navigator.clipboard.writeText(targetUrl);
      toast({ title: "Link copied", description: targetUrl, duration: 1800 });
    } catch {
      // no-op
    }
  };

  const handleDownload = () => {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `batch-${sanitizedId || "qr"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handleShare = async () => {
    try {
      if (!isValid || typeof navigator === "undefined" || !navigator.share) return;
      await navigator.share({ title: "AgriTruthChain Batch", text: `Batch #${sanitizedId}`, url: targetUrl });
    } catch {
      // user might cancel share; ignore
    }
  };
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
              <Button
                variant="hero"
                size="lg"
                className="group"
                onClick={() => {
                  setBatchId("");
                  setQrOpen(true);
                }}
              >
                <QrCode className="w-5 h-5 mr-2 group-hover:animate-float" />
                {t("hero.scanButton")}
              </Button>
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

  {/* QR Generator Modal */}
  {/* Redesigned: input+preview with validation and actions */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan or Generate Product QR</DialogTitle>
            <DialogDescription>
              Enter a batch ID and we’ll generate a scannable QR that opens the product’s details page.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="batchId">Batch ID</Label>
              <Input
                id="batchId"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="#105 or 105"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                aria-invalid={hasInput && !isValid}
              />
              <div className="text-xs text-muted-foreground">
                {hasInput && !isValid ? (
                  <span className="text-destructive">Enter digits only (e.g., 105)</span>
                ) : (
                  <span>We’ll use <span className="font-mono">{sanitizedId || "—"}</span> as the batch ID</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-lg bg-muted border min-h-[268px] min-w-[268px] flex items-center justify-center" ref={qrWrapRef}>
                {isValid ? (
                  <QRCodeCanvas value={targetUrl} size={220} level="M" includeMargin />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <QrCode className="w-12 h-12 mb-2" />
                    <span className="text-sm">Enter a valid batch ID to preview the QR</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground break-all text-center w-full">
                {isValid ? targetUrl : `${BASE_URL}<id>`}
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
            <div className="flex flex-wrap gap-2 order-2 sm:order-1">
              <Button variant="outline" size="sm" onClick={handleCopyUrl} disabled={!isValid}>
                <Copy className="w-4 h-4 mr-1" /> Copy URL
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={!isValid}>
                <Download className="w-4 h-4 mr-1" /> Download QR
              </Button>
              <a href={isValid ? targetUrl : undefined} target="_blank" rel="noreferrer noopener">
                <Button variant="ghost" size="sm" disabled={!isValid}>
                  <LinkIcon className="w-4 h-4 mr-1" /> Open Link
                </Button>
              </a>
              {typeof navigator !== "undefined" && (navigator as any).share ? (
                <Button variant="ghost" size="sm" onClick={handleShare} disabled={!isValid}>
                  <LinkIcon className="w-4 h-4 mr-1" /> Share
                </Button>
              ) : null}
            </div>
            <div className="order-1 sm:order-2">
              <Button onClick={() => setQrOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;