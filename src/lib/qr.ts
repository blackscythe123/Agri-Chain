// Simple QR generation helper using a public QR code API (no secrets).
// Replace with a local generator (qrcode) if needed later.
export function qrUrlForBatch(batchId: number | string) {
  // Prefer LAN address if available via Vite env; fallback to origin.
  const lan = (import.meta as any).env?.VITE_LAN_BASE_URL as string | undefined;
  const base = lan && /^https?:\/\//.test(lan) ? lan.replace(/\/$/, "") : window.location.origin;
  const url = `${base}/?batch=${batchId}`;
  const enc = encodeURIComponent(url);
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${enc}`;
}

export function parseBatchFromLocation(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("batch");
}
