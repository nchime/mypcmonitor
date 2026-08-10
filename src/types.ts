export interface Timestamped {
  timestamp: number;
}

export interface CpuSnapshot extends Timestamped {
  /** 0-100 */
  cores: number[];
  /** 0-100 */
  aggregate: number;
  /** GHz */
  speed: number;
  temperature: number | null;
}

export interface MemorySnapshot extends Timestamped {
  totalBytes: number;
  usedBytes: number;
  activeBytes: number;
  availableBytes: number;
  swapUsedBytes: number;
  swapTotalBytes: number;
}

export interface DiskSnapshot extends Timestamped {
  volumes: Array<{
    mount: string;
    fs: string;
    totalBytes: number;
    usedBytes: number;
    /** 0-100 */
    usePercent: number;
  }>;
  readBytesPerSec: number;
  writeBytesPerSec: number;
}

export interface NetworkInterfaceSnapshot {
  name: string;
  rxBytesPerSec: number;
  txBytesPerSec: number;
  rxTotalBytes: number;
  txTotalBytes: number;
}

export interface NetworkSnapshot extends Timestamped {
  interfaces: NetworkInterfaceSnapshot[];
  totalRxBytesPerSec: number;
  totalTxBytesPerSec: number;
}

export type ProcessSortKey = 'cpu' | 'mem' | 'pid' | 'name';

export interface ProcessEntry {
  pid: number;
  name: string;
  cpuPercent: number;
  cpuSystemPercent: number;
  memPercent: number;
  memBytes: number;
}

export interface ProcessSnapshot extends Timestamped {
  totalCount: number;
  runningCount: number;
  processes: ProcessEntry[];
}

export interface HistoryPoint {
  t: number;
  value: number;
}

export interface BatterySnapshot extends Timestamped {
  hasBattery: boolean;
  isCharging: boolean;
  percent: number;
  acConnected: boolean;
  type: string;
  maxCapacity: number;
  currentCapacity: number;
}

export interface SystemSnapshot extends Timestamped {
  platform: string;
  distro: string;
  release: string;
  arch: string;
  hostname: string;
  uptimeSec: number;
}

export type MetricChannel = 'cpu' | 'memory' | 'disk' | 'network' | 'processes' | 'battery' | 'system';

export type ThemeName = 'dracula' | 'nord' | 'monokai' | 'solarizedDark';

export interface ThemePalette {
  name: string;
  primary: string; // cyan, blue, magenta, etc.
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  text: string;
  subtext: string;
  border: string;
}

export type ViewMode = 'grid' | 'compact' | 'cpu' | 'process';

export interface StoreSnapshot {
  cpu: CpuSnapshot | null;
  memory: MemorySnapshot | null;
  disk: DiskSnapshot | null;
  network: NetworkSnapshot | null;
  processes: ProcessSnapshot | null;
  battery: BatterySnapshot | null;
  system: SystemSnapshot | null;
  uptimeSec: number;
}