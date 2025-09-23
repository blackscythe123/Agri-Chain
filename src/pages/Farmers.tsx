import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import TestingAddresses from "@/components/TestingAddresses";
import { DEFAULT_ADDRESSES, isHexAddress } from "@/lib/addresses";

const Farmers = () => {
  const [form, setForm] = useState<{ cropType: string; quantityKg: string; basePricePerKg: string; harvestDate: string; farmerAddress: string }>({ cropType: "", quantityKg: "", basePricePerKg: "", harvestDate: "", farmerAddress: DEFAULT_ADDRESSES.FARMER as string });
  const [batches, setBatches] = useState<any[]>([]); // TODO: load from chain
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();

  const register = async () => {
    try {
      setSubmitting(true)
      const quantityKg = Number(form.quantityKg || 0)
      const basePricePerKg = Number(form.basePricePerKg || 0)
    if (!form.cropType.trim()) { alert(t('farmers.errors.enterCrop')); return }
    if (!quantityKg || Number.isNaN(quantityKg)) { alert(t('farmers.errors.enterQty')); return }
  if (!basePricePerKg || Number.isNaN(basePricePerKg)) { alert(t('farmers.errors.enterPrice')); return }
    if (!form.harvestDate) { alert(t('farmers.errors.chooseHarvest')); return }
      const farmerAddress = form.farmerAddress?.trim() || DEFAULT_ADDRESSES.FARMER
    if (!isHexAddress(farmerAddress)) { alert(t('farmers.errors.enterEOA')); return }
      const basePriceINR = Math.round(basePricePerKg * quantityKg) // total ₹ for batch
      const minPriceINR = basePriceINR // simple default; can add UI later
      const harvestDateSec = Math.floor(new Date(form.harvestDate).getTime() / 1000)
      const res = await fetch('/api/register-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropType: form.cropType, quantityKg, basePriceINR, minPriceINR, harvestDate: harvestDateSec, metadataCID: '' , farmerAddress })
      })
  const data = await res.json()
  if (!res.ok) throw new Error(`${data?.error || 'failed'}${data?.message ? `: ${data.message}` : ''}`)
      if (!data.batchId || !/^[0-9]+$/.test(data.batchId)) {
        alert(t('farmers.errors.registeredNoId'))
      } else {
        const newItem = {
          batchId: data.batchId,
          cropType: form.cropType,
          quantityKg,
          basePricePerKg,
          harvestDate: form.harvestDate,
          farmer: 'you',
          owner: 'you',
        }
        setBatches(prev => [newItem, ...prev])
        // Navigate to details for immediate feedback
        nav(`/batch?id=${encodeURIComponent(newItem.batchId)}`)
      }
  setForm({ cropType: "", quantityKg: "", basePricePerKg: "", harvestDate: "", farmerAddress: DEFAULT_ADDRESSES.FARMER });
  } catch (e: any) { console.error(e); alert(`${t('farmers.errors.registerFailed')}${e?.message ? `: ${e.message}` : ''}`); }
    finally { setSubmitting(false) }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-8">
  <h1 className="text-2xl sm:text-3xl font-bold">{t('farmers.title')}</h1>
  <TestingAddresses />
  <Card className="p-6 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-2">
            <Label>{t('farmers.form.cropType')}</Label>
            <Input value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('farmers.form.quantityKg')}</Label>
            <Input value={form.quantityKg} onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('farmers.form.pricePerKg')}</Label>
            <Input value={form.basePricePerKg} onChange={(e) => setForm({ ...form, basePricePerKg: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>{t('farmers.form.harvestDate')}</Label>
            <Input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{t('farmers.form.farmerAddress')}</Label>
            <Input placeholder="0x..." value={form.farmerAddress} onChange={(e) => setForm({ ...form, farmerAddress: e.target.value })} />
          </div>
          <div className="md:col-span-4">
            <Button onClick={register} disabled={submitting}>{submitting ? t('farmers.actions.registering') : t('farmers.actions.register')}</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-4">{t('farmers.sections.myBatches')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {batches.filter(b => b.farmer === "0xFARMER").map(b => (
              <div key={b.batchId} className="border rounded p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-sm">{b.batchId}</div>
                  <div className="text-sm text-muted-foreground">{b.cropType} • {b.quantityKg}kg @ ₹{b.basePricePerKg}/kg</div>
                  <div className="text-xs mt-1">{t('farmers.sections.owner')} {b.owner}</div>
                </div>
                <Link to={`/batch?id=${encodeURIComponent(b.batchId)}`} className="text-primary hover:underline">{t('farmers.sections.view')}</Link>
              </div>
            ))}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Farmers;
