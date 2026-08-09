import * as si from 'systeminformation';
import type { CpuSnapshot } from '../types.js';
import type { MonitorStore } from '../core/store.js';

export async function collectCpu(store: MonitorStore): Promise<void> {
  const [load, speed, temp] = await Promise.all([
    si.currentLoad(),
    si.cpuCurrentSpeed(),
    si.cpuTemperature(),
  ]);

  const snapshot: CpuSnapshot = {
    timestamp: Date.now(),
    cores: load.cpus.map((c) => c.load),
    aggregate: load.currentLoad,
    speed: speed.avg,
    temperature: temp.main > 0 ? temp.main : null,
  };
  store.setCpu(snapshot);
}