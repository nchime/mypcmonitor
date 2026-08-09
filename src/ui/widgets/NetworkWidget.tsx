import React from 'react';
import { Box, Text } from 'ink';
import type { NetworkSnapshot } from '../../types.js';
import { formatBytes, formatRate } from '../format.js';
import { Sparkline } from '../Sparkline.js';
import type { RingBuffer } from '../../core/ringBuffer.js';

function netColor(pct: number): 'green' | 'yellow' | 'red' {
  if (pct >= 90) return 'red';
  if (pct >= 60) return 'yellow';
  return 'green';
}

interface NetworkWidgetProps {
  snapshot: NetworkSnapshot | null;
  rxHistory: RingBuffer;
  txHistory: RingBuffer;
}

export function NetworkWidget({ snapshot, rxHistory, txHistory }: NetworkWidgetProps) {
  if (!snapshot) return <Text color="gray">네트워크: 로딩 중…</Text>;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="yellow" bold>
        네트워크
      </Text>
      <Text color="gray">다운 {formatRate(snapshot.totalRxBytesPerSec)} | 업 {formatRate(snapshot.totalTxBytesPerSec)}</Text>
      <Text color="blue">▼</Text>
      <Sparkline values={rxHistory.toArray().map((p) => p.value)} width={40} color={netColor} />
      <Text color="blue">▲</Text>
      <Sparkline values={txHistory.toArray().map((p) => p.value)} width={40} color={netColor} />
      {snapshot.interfaces.map((i) => (
        <Text key={i.name} color="gray">
          {i.name}: ↓ {formatBytes(i.rxTotalBytes)} ↑ {formatBytes(i.txTotalBytes)} ({formatRate(i.rxBytesPerSec)} ↓ / {formatRate(i.txBytesPerSec)} ↑)
        </Text>
      ))}
    </Box>
  );
}