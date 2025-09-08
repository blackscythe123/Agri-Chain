import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  Mail, 
  Phone, 
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Shield
} from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const Footer = () => {
  return (
    <footer className="bg-gradient-earth border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">AgriChain</h3>
                <p className="text-sm text-muted-foreground">Transparency Platform</p>
              </div>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Revolutionizing agricultural supply chains with blockchain technology, 
              ensuring transparent pricing and complete traceability from farm to fork.
            </p>
            <Badge className="bg-success/10 text-success border-success/20">
              <Shield className="w-3 h-3 mr-1" />
              Blockchain Verified
            </Badge>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/farmers" className="hover:text-foreground transition-colors">For Farmers</a></li>
              <li><a href="/distributors" className="hover:text-foreground transition-colors">For Distributors</a></li>
              <li><a href="/retailers" className="hover:text-foreground transition-colors">For Retailers</a></li>
              <li><a href="/consumers" className="hover:text-foreground transition-colors">For Consumers</a></li>
              
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">End-to-end flow</div>
                      <p className="text-xs text-muted-foreground">See how a batch moves across roles and how ownership is transferred on-chain by a verifier.</p>
                      <div className="font-mono text-xs bg-muted rounded p-2">
                        [Farmer] → [Distributor] → [Retailer] → [Consumer]
                      </div>
                      <div className="text-xs text-muted-foreground">Each step records prices in INR and the current holder.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/blockchain-guide" className="hover:text-foreground transition-colors">Blockchain Guide</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Provenance on-chain</div>
                      <p className="text-xs text-muted-foreground">Understand blocks, immutability, and how ownership and price updates are attested.</p>
                      <div className="font-mono text-xs bg-muted rounded p-2">
                        [Block n-2] ─ [Block n-1] ─ [Block n]
                        {"\n"}                 \_ Ownership → Address
                      </div>
                      <div className="text-xs text-muted-foreground">Click through for simple concepts and visuals.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/fair-trade" className="hover:text-foreground transition-colors">Fair Trade Info</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Transparent pricing</div>
                      <p className="text-xs text-muted-foreground">See how prices are set and displayed at each stage.</p>
                      <div className="font-mono text-xs bg-muted rounded p-2">
                       ₹ Farmer → ₹ Dist → ₹ Retail
                      </div>
                      <div className="text-xs text-muted-foreground">Helps consumers verify margins and farmer earnings.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/api-docs" className="hover:text-foreground transition-colors">API Documentation</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Integrate with the platform</div>
                      <p className="text-xs text-muted-foreground">REST endpoints to read batches and trigger flows.</p>
                      <div className="font-mono text-xs bg-muted rounded p-2">
                        [Client] → GET /api/batches{"\n"}
                        [Server] → Contract (viem)
                      </div>
                      <div className="text-xs text-muted-foreground">Includes examples and response shapes.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <a href="/support" className="hover:text-foreground transition-colors">Support Center</a>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <div className="font-medium text-foreground">Get help fast</div>
                      <p className="text-xs text-muted-foreground">Browse FAQs, guides, or contact our team.</p>
                      <div className="font-mono text-xs bg-muted rounded p-2">
                        [?] → Docs / Guides → Email
                      </div>
                      <div className="text-xs text-muted-foreground">We’ll help you troubleshoot and onboard.</div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>contact@agrichain.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Linkedin className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 AgriChain Transparency Platform. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;