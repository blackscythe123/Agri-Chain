// Simple in-browser mock "blockchain" using localStorage. Replace with real on-chain calls later.
import { nanoid } from "nanoid";

export type Address = string;


export interface ProduceBatch {
  batchId: string;
  cropType: string;
  quantityKg: number;
  basePricePerKg: number;
  harvestDate: string; // ISO
  farmer: Address;
  owner: Address; // current
  retailPricePerKg?: number;
  status: "Registered" | "Transferred" | "Delivered";
  createdAt: string; // ISO
}

const KEY = {
  batches: "agri:batches",
};

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const mockChain = {
  // Produce
  addBatch(input: Omit<ProduceBatch, "createdAt" | "status">) {
    const batches = read<ProduceBatch>(KEY.batches);
    const batch: ProduceBatch = {
      ...input,
      status: "Registered",
      createdAt: new Date().toISOString(),
    };
    batches.push(batch);
    write(KEY.batches, batches);
    return batch;
  },
  listBatches() {
    return read<ProduceBatch>(KEY.batches);
  },
  getBatch(batchId: string) {
    return read<ProduceBatch>(KEY.batches).find((b) => b.batchId === batchId) || null;
  },
  updateBatch(batchId: string, update: Partial<ProduceBatch>) {
    const batches = read<ProduceBatch>(KEY.batches);
    const idx = batches.findIndex((b) => b.batchId === batchId);
    if (idx >= 0) {
      batches[idx] = { ...batches[idx], ...update };
      write(KEY.batches, batches);
      return batches[idx];
    }
    return null;
  },

  // Ownership transfer
  transferOwnership(batchId: string, newOwner: Address) {
    return mockChain.updateBatch(batchId, { owner: newOwner, status: "Transferred" });
  },

  // Retail price
  updateRetailPrice(batchId: string, price: number) {
    return mockChain.updateBatch(batchId, { retailPricePerKg: price });
  },

};

export default mockChain;