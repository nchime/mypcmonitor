import { EventEmitter } from 'node:events';
import type {
  DiskSnapshot,
  MemorySnapshot,
  MetricChannel,
  NetworkSnapshot,
  ProcessSnapshot,
  CpuSnapshot,
  StoreSnapshot,
} from '../types.js';
import { RingBuffer } from './ringBuffer.js';

const HISTORY_CAPACITY = 120;

export class MonitorStore extends EventEmitter {
  readonly cpuHistory = new RingBuffer(HISTORY_CAPACITY);
  readonly memHistory = new RingBuffer(HISTORY_CAPACITY);
  readonly netRxHistory = new RingBuffer(HISTORY_CAPACITY);
  readonly netTxHistory = new RingBuffer(HISTORY_CAPACITY);

  private _cpu: CpuSnapshot | null = null;
  private _memory: MemorySnapshot | null = null;
  private _disk: DiskSnapshot | null = null;
  private _network: NetworkSnapshot | null = null;
  private _processes: ProcessSnapshot | null = null;

  get cpu(): CpuSnapshot | null {
    return this._cpu;
  }

  get memory(): MemorySnapshot | null {
    return this._memory;
  }

  get disk(): DiskSnapshot | null {
    return this._disk;
  }

  get network(): NetworkSnapshot | null {
    return this._network;
  }

  get processes(): ProcessSnapshot | null {
    return this._processes;
  }

  setCpu(s: CpuSnapshot | null): void {
    this._cpu = s;
    if (s) this.cpuHistory.push({ t: s.timestamp, value: s.aggregate });
    this.emit('cpu', s);
  }

  setMemory(s: MemorySnapshot | null): void {
    this._memory = s;
    if (s) {
      const pct = s.totalBytes > 0 ? ((s.totalBytes - s.availableBytes) / s.totalBytes) * 100 : 0;
      this.memHistory.push({ t: s.timestamp, value: pct });
    }
    this.emit('memory', s);
  }

  setDisk(s: DiskSnapshot | null): void {
    this._disk = s;
    this.emit('disk', s);
  }

  setNetwork(s: NetworkSnapshot | null): void {
    this._network = s;
    if (s) {
      this.netRxHistory.push({ t: s.timestamp, value: s.totalRxBytesPerSec });
      this.netTxHistory.push({ t: s.timestamp, value: s.totalTxBytesPerSec });
    }
    this.emit('network', s);
  }

  setProcesses(s: ProcessSnapshot | null): void {
    this._processes = s;
    this.emit('processes', s);
  }

  snapshot(): StoreSnapshot {
    return {
      cpu: this._cpu,
      memory: this._memory,
      disk: this._disk,
      network: this._network,
      processes: this._processes,
      uptimeSec: Math.floor(process.uptime()),
    };
  }

  onChannel(channel: MetricChannel, fn: () => void): () => void {
    this.on(channel, fn);
    return () => {
      this.off(channel, fn);
    };
  }
}