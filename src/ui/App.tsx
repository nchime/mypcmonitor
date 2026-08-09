import React, { useEffect, useState } from 'react';
import { Box, Text, useStdout, useApp } from 'ink';
import type { StoreSnapshot } from '../types.js';
import type { MonitorStore } from '../core/store.js';
import { CpuWidget } from './widgets/CpuWidget.js';
import { MemoryWidget } from './widgets/MemoryWidget.js';
import { DiskWidget } from './widgets/DiskWidget.js';
import { NetworkWidget } from './widgets/NetworkWidget.js';
import { ProcessWidget } from './widgets/ProcessWidget.js';
import { formatDuration } from './format.js';

interface AppProps {
  store: MonitorStore;
}

export function App({ store }: AppProps) {
  const [snapshot, setSnapshot] = useState<StoreSnapshot>(() => store.snapshot());
  const { stdout } = useStdout();
  const { exit } = useApp();

  useEffect(() => {
    const channels = ['cpu', 'memory', 'disk', 'network', 'processes'] as const;
    const unsubscribe = channels.map((ch) =>
      store.onChannel(ch, () => setSnapshot(store.snapshot())),
    );
    return () => unsubscribe.forEach((fn) => fn());
  }, [store]);

  const height = stdout.rows ?? 24;

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="white">
        {' '}
        PC 모니터{' '}
        <Text color="gray">| Uptime {formatDuration(snapshot.uptimeSec)} | q 종료</Text>
      </Text>
      <Box flexDirection="row" width="100%">
        <Box flexDirection="column" width={55}>
          <CpuWidget snapshot={snapshot.cpu} history={store.cpuHistory} />
          <MemoryWidget snapshot={snapshot.memory} history={store.memHistory} />
          <DiskWidget snapshot={snapshot.disk} />
          <NetworkWidget
            snapshot={snapshot.network}
            rxHistory={store.netRxHistory}
            txHistory={store.netTxHistory}
          />
        </Box>
        <Box flexDirection="column" flexGrow={1} marginLeft={1}>
          <ProcessWidget
            snapshot={snapshot.processes}
            height={height}
            onExit={exit}
          />
        </Box>
      </Box>
    </Box>
  );
}