import * as si from 'systeminformation';
import type { MemorySnapshot } from '../types.js';
import type { MonitorStore } from '../core/store.js';

export async function collectMemory(store: MonitorStore): Promise<void> {
  const mem = await si.mem();

  const snapshot: MemorySnapshot = {
    timestamp: Date.now(),
    totalBytes: mem.total,
    usedBytes: mem.used,
    activeBytes: mem.active,
    availableBytes: mem.available,
    swapUsedBytes: mem.swapused,
    swapTotalBytes: mem.swaptotal,
  };
  store.setMemory(snapshot);
}