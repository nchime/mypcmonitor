import React from 'react';
import { Box, Text } from 'ink';
import type { CpuSnapshot } from '../../types.js';
import { colorForPercent } from '../format.js';
import { BarGauge } from '../BarGauge.js';
import { Sparkline } from '../Sparkline.js';
import type { RingBuffer } from '../../core/ringBuffer.js';

interface CpuWidgetProps {
  snapshot: CpuSnapshot | null;
  history: RingBuffer;
}

export function CpuWidget({ snapshot, history }: CpuWidgetProps) {
  if (!snapshot) return <Text color="gray">CPU: 로딩 중…</Text>;

  const temp =
    snapshot.temperature !== null
      ? <Text>
        <Text color="gray">온도:</Text>
        {' '}
        <Text color={snapshot.temperature > 80 ? 'red' : snapshot.temperature > 65 ? 'yellow' : 'green'}>
          {snapshot.temperature.toFixed(1)}°C
        </Text>
      </Text>
      : <Text color="gray">온도: 미지원</Text>;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="cyan" bold>
        CPU
      </Text>
      <Sparkline values={history.toArray().map((p) => p.value)} width={40} color={colorForPercent} />
      <BarGauge percent={snapshot.aggregate} color={colorForPercent} />
      <Text color="gray">사용률 {snapshot.aggregate.toFixed(1)}%  {snapshot.cores.map((c) => c.toFixed(0)).join(' ')}</Text>
      <Text>클럭 {snapshot.speed.toFixed(2)} GHz | {temp}</Text>
    </Box>
  );
}