import React from 'react';
import { Box, Text } from 'ink';
import type { DiskSnapshot } from '../../types.js';
import { colorForPercent, formatRate } from '../format.js';
import { BarGauge } from '../BarGauge.js';

interface DiskWidgetProps {
  snapshot: DiskSnapshot | null;
}

export function DiskWidget({ snapshot }: DiskWidgetProps) {
  if (!snapshot) return <Text color="gray">디스크: 로딩 중…</Text>;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="green" bold>
        디스크
      </Text>
      <Text color="gray">
        읽기 {formatRate(snapshot.readBytesPerSec)} | 쓰기 {formatRate(snapshot.writeBytesPerSec)}
      </Text>
      {snapshot.volumes.slice(0, 3).map((v) => (
        <BarGauge
          key={v.mount}
          percent={v.usePercent}
          label={`${v.mount}`}
          color={colorForPercent}
        />
      ))}
    </Box>
  );
}