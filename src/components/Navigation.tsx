import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Menu,
  X,
  QrCode,
  Users,
  Shield,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/#dashboard" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">AgriChain</h1>
              <p className="text-xs text-muted-foreground">Transparency Platform</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/login">
              <Button variant="hero" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Login
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              <a href="/join" onClick={() => setIsMenuOpen(false)}>
                <Button variant="hero" size="sm" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Join Platform
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Trust Badge */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 hidden lg:block">
        <Badge className="bg-success/10 text-success border-success/20 shadow-soft">
          <Shield className="w-3 h-3 mr-1" />
          100% Blockchain Verified
        </Badge>
      </div>
    </nav>
  );
};

export default Navigation;