import si from 'systeminformation';
import type { MonitorStore } from '../core/store.js';
import type { BatterySnapshot, SystemSnapshot } from '../types.js';

export async function collectBattery(store: MonitorStore): Promise<void> {
  try {
    const b = await si.battery();
    const snap: BatterySnapshot = {
      timestamp: Date.now(),
      hasBattery: b.hasBattery,
      isCharging: b.isCharging,
      percent: b.percent,
      acConnected: b.acConnected,
      type: b.type,
      maxCapacity: b.maxCapacity,
      currentCapacity: b.currentCapacity,
    };
    store.setBattery(snap);
  } catch {
    store.setBattery(null);
  }
}

export async function collectSystem(store: MonitorStore): Promise<void> {
  try {
    const [os, time] = await Promise.all([si.osInfo(), si.time()]);
    const snap: SystemSnapshot = {
      timestamp: Date.now(),
      platform: os.platform,
      distro: os.distro,
      release: os.release,
      arch: os.arch,
      hostname: os.hostname,
      uptimeSec: time.uptime ?? Math.floor(process.uptime()),
    };
    store.setSystem(snap);
  } catch {
    store.setSystem(null);
  }
}
