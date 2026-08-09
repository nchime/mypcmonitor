import * as si from 'systeminformation';
import type { NetworkSnapshot } from '../types.js';
import type { MonitorStore } from '../core/store.js';

const SKIP_INTERFACES = new Set([
  'lo0',
  'lo',
  'bridge0',
  'utun',
  'awdl0',
  'llw0',
]);

function isActive(iface: si.Systeminformation.NetworkStatsData): boolean {
  return iface.operstate === 'up' && !SKIP_INTERFACES.has(iface.iface);
}

export async function collectNetwork(store: MonitorStore): Promise<void> {
  const stats = await si.networkStats();

  const active = stats
    .filter(isActive)
    .filter((s) => s.rx_bytes > 0 || s.tx_bytes > 0 || s.rx_sec > 0 || s.tx_sec > 0);

  const interfaces = active.map((s) => ({
    name: s.iface,
    rxBytesPerSec: s.rx_sec,
    txBytesPerSec: s.tx_sec,
    rxTotalBytes: s.rx_bytes,
    txTotalBytes: s.tx_bytes,
  }));

  const snapshot: NetworkSnapshot = {
    timestamp: Date.now(),
    interfaces,
    totalRxBytesPerSec: interfaces.reduce((sum, i) => sum + i.rxBytesPerSec, 0),
    totalTxBytesPerSec: interfaces.reduce((sum, i) => sum + i.txBytesPerSec, 0),
  };
  store.setNetwork(snapshot);
}