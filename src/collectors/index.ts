import { MonitorStore } from '../core/store.js';
import { CollectorScheduler } from './scheduler.js';
import { collectCpu } from './cpu.js';
import { collectMemory } from './memory.js';
import { collectDisk } from './disk.js';
import { collectNetwork } from './network.js';
import { collectProcesses } from './processes.js';
import { collectBattery, collectSystem } from './system.js';

export const POLL_INTERVALS = {
  cpu: 500,
  memory: 1000,
  network: 1000,
  disk: 2000,
  processes: 3000,
  battery: 5000,
  system: 10000,
} as const;

export function createMonitor(store: MonitorStore): CollectorScheduler {
  const scheduler = new CollectorScheduler();

  scheduler.start({ intervalMs: POLL_INTERVALS.cpu, channel: 'cpu', collect: () => collectCpu(store) }, 0);

  scheduler.start(
    { intervalMs: POLL_INTERVALS.memory, channel: 'memory', collect: () => collectMemory(store) },
    50,
  );

  scheduler.start(
    { intervalMs: POLL_INTERVALS.disk, channel: 'disk', collect: () => collectDisk(store) },
    100,
  );

  scheduler.start(
    { intervalMs: POLL_INTERVALS.network, channel: 'network', collect: () => collectNetwork(store) },
    150,
  );

  scheduler.start(
    { intervalMs: POLL_INTERVALS.processes, channel: 'processes', collect: () => collectProcesses(store) },
    200,
  );

  scheduler.start(
    { intervalMs: POLL_INTERVALS.battery, channel: 'battery', collect: () => collectBattery(store) },
    250,
  );

  scheduler.start(
    { intervalMs: POLL_INTERVALS.system, channel: 'system', collect: () => collectSystem(store) },
    300,
  );

  return scheduler;
}