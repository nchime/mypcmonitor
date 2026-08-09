import * as si from 'systeminformation';
import type { DiskSnapshot } from '../types.js';
import type { MonitorStore } from '../core/store.js';

export async function collectDisk(store: MonitorStore): Promise<void> {
  const [volumes, io] = await Promise.all([
    si.fsSize(),
    si.fsStats(),
  ]);

  const snapshot: DiskSnapshot = {
    timestamp: Date.now(),
    volumes: volumes.map((v) => ({
      mount: v.mount,
      fs: v.type,
      totalBytes: v.size,
      usedBytes: v.used,
      usePercent: v.use,
    })),
    readBytesPerSec: io.rx_sec ?? 0,
    writeBytesPerSec: io.wx_sec ?? 0,
  };
  store.setDisk(snapshot);
}