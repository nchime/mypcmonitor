import React from 'react';
import { Box, Text } from 'ink';
import type { MemorySnapshot } from '../../types.js';
import { colorForPercent, formatBytes } from '../format.js';
import { BarGauge } from '../BarGauge.js';
import { Sparkline } from '../Sparkline.js';
import type { RingBuffer } from '../../core/ringBuffer.js';

interface MemoryWidgetProps {
  snapshot: MemorySnapshot | null;
  history: RingBuffer;
}

export function MemoryWidget({ snapshot, history }: MemoryWidgetProps) {
  if (!snapshot) return <Text color="gray">메모리: 로딩 중…</Text>;

  const pct = snapshot.totalBytes > 0 ? ((snapshot.totalBytes - snapshot.availableBytes) / snapshot.totalBytes) * 100 : 0;
  const swapPct =
    snapshot.swapTotalBytes > 0 ? (snapshot.swapUsedBytes / snapshot.swapTotalBytes) * 100 : 0;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="magenta" bold>
        메모리
      </Text>
      <Sparkline values={history.toArray().map((p) => p.value)} width={40} color={colorForPercent} />
      <BarGauge percent={pct} color={colorForPercent} />
      <Text color="gray">
      <Text color="gray">
        압박 {formatBytes(snapshot.usedBytes)} / {formatBytes(snapshot.totalBytes)}
      </Text>
      </Text>
      {swapPct > 0 && <Text color="gray">스왑 {formatBytes(snapshot.swapUsedBytes)} / {formatBytes(snapshot.swapTotalBytes)}</Text>}
    </Box>
  );
}