// These are dummy hex addresses suitable for testnets.
export const DEFAULT_ADDRESSES = {
  FARMER: '0x1111111111111111111111111111111111111111',
  DISTRIBUTOR: '0x2222222222222222222222222222222222222222',
  RETAILER: '0x3333333333333333333333333333333333333333',
  CONSUMER: '0x4444444444444444444444444444444444444444',
  VERIFIER: '0x5555555555555555555555555555555555555555',
  ADMIN: '0x6666666666666666666666666666666666666666'
} as const;

export const isHexAddress = (v: string) => /^0x[0-9a-fA-F]{40}$/.test(v || '');

export function ensureAddress(input: string | undefined | null, fallback: string) {
  const v = (input || '').trim();
  if (!v) return fallback;
  return isHexAddress(v) ? v : v; // let caller surface errors if invalid
}
