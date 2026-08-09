import type { HistoryPoint } from '../types.js';

export class RingBuffer {
  private readonly data: HistoryPoint[];
  private head = 0;
  private size = 0;

  constructor(private readonly capacity: number) {
    this.data = new Array<HistoryPoint>(capacity);
  }

  push(point: HistoryPoint): void {
    this.data[this.head] = point;
    this.head = (this.head + 1) % this.capacity;
    if (this.size < this.capacity) this.size++;
  }

  last(): HistoryPoint | undefined {
    if (this.size === 0) return undefined;
    const idx = (this.head - 1 + this.capacity) % this.capacity;
    return this.data[idx];
  }

  toArray(): HistoryPoint[] {
    const start = (this.head - this.size + this.capacity) % this.capacity;
    const out: HistoryPoint[] = [];
    for (let i = 0; i < this.size; i++) {
      out.push(this.data[(start + i) % this.capacity]!);
    }
    return out;
  }

  clear(): void {
    this.size = 0;
    this.head = 0;
  }

  get length(): number {
    return this.size;
  }
}