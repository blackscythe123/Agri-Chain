import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEFAULT_ADDRESSES } from "@/lib/addresses";

export default function TestingAddresses() {
  return (
    <Card className="p-4 space-y-3">
      <div className="font-semibold">Testing EOA Addresses (defaults)</div>
      <div className="grid md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label>Farmer</Label>
          <Input readOnly value={DEFAULT_ADDRESSES.FARMER} />
        </div>
        <div className="space-y-1">
          <Label>Distributor</Label>
          <Input readOnly value={DEFAULT_ADDRESSES.DISTRIBUTOR} />
        </div>
        <div className="space-y-1">
          <Label>Retailer</Label>
          <Input readOnly value={DEFAULT_ADDRESSES.RETAILER} />
        </div>
        <div className="space-y-1">
          <Label>Consumer</Label>
          <Input readOnly value={DEFAULT_ADDRESSES.CONSUMER} />
        </div>
      </div>
    </Card>
  );
}
