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
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.farmers"), href: "/farmers" },
    { label: t("nav.distributors"), href: "/distributors" },
    { label: t("nav.retailers"), href: "/retailers" },
    { label: t("nav.consumers"), href: "/consumers" },
    { label: t("nav.verifiers"), href: "/verifiers" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <h1 className="font-bold text-base sm:text-lg">AgriChain</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Transparency Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <Link to="/login">
              <Button variant="hero" size="sm">
                <Users className="w-4 h-4 mr-2" />
                {t("nav.login")}
              </Button>
            </Link>
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
          <div className="md:hidden py-3 space-y-3 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
                  <Link to="/join" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="hero" size="sm" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Join Platform
                    </Button>
                  </Link>
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