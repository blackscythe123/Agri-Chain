import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";

type VerificationStatus = "unverified" | "pending" | "verified";

export default function Verifiers() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [batches, setBatches] = useState<any[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifierSecret, setVerifierSecret] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<VerificationStatus | null>(null);
  const [pendingId, setPendingId] = useState<string | number | null>(null);
  const [query, setQuery] = useState("");
  const [sortOption, setSortOption] = useState<
    "id-asc" | "id-desc" | "qty-asc" | "qty-desc" | "crop-asc" | "crop-desc"
  >("id-desc");

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e: any) {
  setError(e?.message || t('verifier.errors.loadFailed'));
    }
  };
  useEffect(() => { fetchBatches(); }, []);

  const filteredSorted = useMemo(() => {
    // hide verified as per rules
    const visible = (batches || []).filter(
      (b: any) => (b?.verification?.status || "unverified") !== "verified"
    );
    const q = query.trim().toLowerCase();
    const searched = q
      ? visible.filter((b: any) => {
          const idStr = String(b?.id ?? "");
          const crop = String(b?.cropType ?? "").toLowerCase();
          const holder = String(b?.holder ?? "").toLowerCase();
          return (
            idStr.includes(q) || crop.includes(q) || holder.includes(q)
          );
        })
      : visible;
    const sorted = [...searched].sort((a: any, b: any) => {
      const aid = Number(a?.id ?? 0);
      const bid = Number(b?.id ?? 0);
      const aq = Number(a?.quantityKg ?? 0);
      const bq = Number(b?.quantityKg ?? 0);
      const ac = String(a?.cropType ?? "").toLowerCase();
      const bc = String(b?.cropType ?? "").toLowerCase();
      switch (sortOption) {
        case "id-asc":
          return aid - bid;
        case "id-desc":
          return bid - aid;
        case "qty-asc":
          return aq - bq;
        case "qty-desc":
          return bq - aq;
        case "crop-asc":
          return ac.localeCompare(bc);
        case "crop-desc":
          return bc.localeCompare(ac);
        default:
          return 0;
      }
    });
    return sorted;
  }, [batches, query, sortOption]);

  const saveStatus = async (
    id: number | string,
    status: VerificationStatus,
    key?: string
  ) => {
    try {
      setSaving(String(id));
      setError(null);
      const res = await fetch("/api/verification-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchId: String(id),
          status,
          by: user?.email || "verifier",
          secret: key || verifierSecret || undefined,
        }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || t('verifier.errors.saveFailed'));
      await fetchBatches();
    } catch (e: any) {
      setError(e?.message || t('verifier.errors.saveFailed'));
    } finally {
      setSaving(null);
    }
  };

  const setStatus = async (id: number | string, status: VerificationStatus) => {
    // Prevent modifying once verified
    const current = batches.find((x) => String(x.id) === String(id));
    const currStatus: VerificationStatus = current?.verification?.status || 'unverified';
    if (currStatus === 'verified') {
      setError(t('verifier.errors.alreadyVerified'));
      return;
    }

    // Allowed transitions:
    // unverified -> pending | verified
    // pending -> unverified | verified
    const allowed = (currStatus === 'unverified' && (status === 'pending' || status === 'verified')) ||
                    (currStatus === 'pending' && (status === 'unverified' || status === 'verified'));
    if (!allowed) return;

    // Extra confirmation + key for verify action -> open themed dialog
    if (status === 'verified') {
      setPendingId(id);
      setPendingStatus(status);
      setConfirmOpen(true);
      return;
    }
    await saveStatus(id, status);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('verifier.title')}</h1>
        {!!error && <div className="text-sm text-red-600">{error}</div>}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">{t('verifier.reviewTitle')}</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('verifier.searchPlaceholder')}
              />
            </div>
            <div className="w-full sm:w-64">
              <Select value={sortOption} onValueChange={(v) => setSortOption(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('verifier.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id-desc">{t('verifier.sort.idDesc')}</SelectItem>
                  <SelectItem value="id-asc">{t('verifier.sort.idAsc')}</SelectItem>
                  <SelectItem value="qty-desc">{t('verifier.sort.qtyDesc')}</SelectItem>
                  <SelectItem value="qty-asc">{t('verifier.sort.qtyAsc')}</SelectItem>
                  <SelectItem value="crop-asc">{t('verifier.sort.cropAsc')}</SelectItem>
                  <SelectItem value="crop-desc">{t('verifier.sort.cropDesc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredSorted.map((b:any) => (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded p-3">
                <div className="text-sm">
                  <div className="font-medium break-words">Batch #{b.id} • {b.cropType || '—'} • {b.quantityKg}kg</div>
                  <div className="text-xs text-muted-foreground">{t('verifier.status')}: {b?.verification?.status || 'unverified'}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {((b?.verification?.status || 'unverified') === 'pending') && (
                    <Button variant="outline" size="sm" onClick={() => setStatus(b.id, 'unverified')} disabled={saving===String(b.id)}>{t('verifier.actions.unverified')}</Button>
                  )}
                  {((b?.verification?.status || 'unverified') !== 'verified') && (
                    <Button variant="outline" size="sm" onClick={() => setStatus(b.id, 'pending')} disabled={saving===String(b.id)}>{t('verifier.actions.pending')}</Button>
                  )}
                  {((b?.verification?.status || 'unverified') !== 'verified') && (
                    <Button variant="success" size="sm" onClick={() => setStatus(b.id, 'verified')} disabled={saving===String(b.id)}>{t('verifier.actions.verified')}</Button>
                  )}
                </div>
              </div>
            ))}
            {batches.length === 0 && <div className="text-sm text-muted-foreground">{t('verifier.noBatches')}</div>}
          </div>
        </Card>
      </main>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('verifier.confirmTitle')}</DialogTitle>
            <DialogDescription>{t('verifier.confirmVerify')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="verifier-key">{t('verifier.secretLabel')}</Label>
            <Input
              id="verifier-key"
              type="password"
              value={verifierSecret}
              onChange={(e) => setVerifierSecret(e.target.value)}
              placeholder={t('verifier.promptSecret')}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setPendingId(null);
                setPendingStatus(null);
                // optional: clear secret on cancel
                // setVerifierSecret("");
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="success"
              disabled={!verifierSecret || saving === String(pendingId)}
              onClick={async () => {
                if (!pendingId || pendingStatus !== 'verified') return;
                if (!verifierSecret) { setError(t('verifier.errors.secretRequired')); return; }
                setConfirmOpen(false);
                await saveStatus(String(pendingId), 'verified', verifierSecret);
                // clear dialog state post-submit
                setPendingId(null);
                setPendingStatus(null);
              }}
            >
              {t('common.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}
