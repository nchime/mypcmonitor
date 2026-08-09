import * as si from 'systeminformation';
import type { ProcessEntry, ProcessSnapshot } from '../types.js';
import type { MonitorStore } from '../core/store.js';

export async function collectProcesses(store: MonitorStore): Promise<void> {
  const data = await si.processes();

  const entries: ProcessEntry[] = data.list.map((p) => ({
    pid: p.pid,
    name: p.name,
    cpuPercent: p.cpuu + p.cpus,
    cpuSystemPercent: p.cpus,
    memPercent: p.mem,
    memBytes: p.memRss * 1024,
  }));

  const snapshot: ProcessSnapshot = {
    timestamp: Date.now(),
    totalCount: data.all,
    runningCount: data.running,
    processes: entries,
  };
  store.setProcesses(snapshot);
}