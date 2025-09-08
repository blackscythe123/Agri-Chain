import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sprout, 
  Truck, 
  Store, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle,
  Clock,
  DollarSign,
  MapPin
} from "lucide-react";

const ProduceJourney = () => {
  const journeySteps = [
    {
      id: 1,
      title: "Farm Registration",
      stakeholder: "Farmer",
      icon: Sprout,
      status: "completed",
      details: {
        product: "Organic Tomatoes",
        batch: "#105",
        quantity: "20kg",
        basePrice: "₹20/kg",
        date: "2024-01-15",
        location: "Maharashtra, India"
      },
      actions: ["Batch registered", "Quality certified", "Harvest completed"]
    },
    {
      id: 2,
      title: "Distribution Purchase",
      stakeholder: "Distributor",
      icon: Truck,
      status: "completed",
      details: {
        distributorPrice: "₹22/kg",
        transportCost: "₹2/kg",
        date: "2024-01-16"
      },
      actions: ["Purchase completed", "Farmer confirmed", "Transport started"]
    },
    {
      id: 3,
      title: "Retail Distribution",
      stakeholder: "Retailer",
      icon: Store,
      status: "completed",
      details: {
        deliveryDate: "2024-01-18",
        retailPrice: "₹35/kg",
        retailMargin: "₹13/kg",
        qualityCheck: "Passed"
      },
      actions: ["Delivery confirmed", "Quality verified", "Price updated"]
    },
    {
      id: 4,
      title: "Consumer Purchase",
      stakeholder: "Consumer",
      icon: ShoppingCart,
      status: "active",
      details: {
        scanDate: "2024-01-20",
        purchasePrice: "₹35/kg",
        farmerEarnings: "₹20/kg",
        fairTradeStatus: "Verified"
      },
      actions: ["QR scanned", "Journey verified", "Fair trade confirmed"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "active":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return null;
};

export default ProduceJourney;