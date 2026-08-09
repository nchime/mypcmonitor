import type { MetricChannel } from '../types.js';

export interface SchedulerConfig {
  intervalMs: number;
  channel: MetricChannel;
  collect: () => Promise<void> | void;
  onError?: (err: Error) => void;
}

export class CollectorScheduler {
  private timers = new Map<MetricChannel, NodeJS.Timeout>();
  private cancelled = new Set<MetricChannel>();

  start(config: SchedulerConfig, initialDelayMs = 0): void {
    this.stop(config.channel);
    this.cancelled.delete(config.channel);
    const schedule = (delay: number): void => {
      const timer = setTimeout(async () => {
        const start = Date.now();
        try {
          await config.collect();
        } catch (err) {
          config.onError?.(err as Error);
        }
        if (!this.cancelled.has(config.channel)) {
          const elapsed = Date.now() - start;
          schedule(Math.max(0, config.intervalMs - elapsed));
        }
      }, delay);
      this.timers.set(config.channel, timer);
    };
    schedule(initialDelayMs);
  }

  stop(channel: MetricChannel): void {
    const timer = this.timers.get(channel);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(channel);
    }
    this.cancelled.add(channel);
  }

  stopAll(): void {
    for (const channel of this.timers.keys()) {
      this.stop(channel);
    }
  }
}