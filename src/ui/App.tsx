import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useStdout, useInput } from 'ink';
import type { StoreSnapshot } from '../types.js';
import type { MonitorStore } from '../core/store.js';
import { CpuWidget } from './widgets/CpuWidget.js';
import { MemoryWidget } from './widgets/MemoryWidget.js';
import { DiskWidget } from './widgets/DiskWidget.js';
import { NetworkWidget } from './widgets/NetworkWidget.js';
import { ProcessWidget } from './widgets/ProcessWidget.js';
import { formatDuration, formatDateTime } from './format.js';
import { IntroScreen } from './IntroScreen.js';
import { HelpOverlay } from './HelpOverlay.js';
import { APP_VERSION } from '../constants.js';

interface AppProps {
  store: MonitorStore;
  onScaleChange: (scale: number) => void;
  onQuit: () => void;
}

const SCALE_ORDER = [1, 2, 4, 0.5];
const SCALE_LABEL: Record<number, string> = {
  0.5: '0.5x (빠름)',
  1: '1x',
  2: '2x',
  4: '4x (느림)',
};

// 리마운트/상태 리셋이 일어나도 인트로가 다시 표시되지 않도록 하는 모듈레벨 가드.
// 화면 상태는 컴포넌트 상태가 아니라 이 플래그를 원본으로 삼는다.
let introDone = false;

export function App({ store, onScaleChange, onQuit }: AppProps) {
  const [snapshot, setSnapshot] = useState<StoreSnapshot>(() => store.snapshot());
  const [now, setNow] = useState<Date>(() => new Date());
  const [screen, setScreen] = useState<'intro' | 'main'>(() => (introDone ? 'main' : 'intro'));
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpSel, setHelpSel] = useState<string | null>(null);
  const [showVersion, setShowVersion] = useState(false);
  const [paused, setPaused] = useState(false);
  const [scaleIdx, setScaleIdx] = useState(0);
  const { stdout } = useStdout();

  const scale = SCALE_ORDER[scaleIdx] ?? 1;

  // pause는 useInput 핸들러에서 ref를 써서 최신 값을 읽되, setSnapshot은 이 구독에서 통제한다
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let updateTimer: NodeJS.Timeout | null = null;

    const scheduleUpdate = () => {
      if (pausedRef.current || updateTimer !== null) return;
      updateTimer = setTimeout(() => {
        setSnapshot(store.snapshot());
        updateTimer = null;
      }, 100);
    };

    const channels = ['cpu', 'memory', 'disk', 'network', 'processes'] as const;
    const unsubscribe = channels.map((ch) => store.onChannel(ch, scheduleUpdate));
    return () => {
      unsubscribe.forEach((fn) => fn());
      if (updateTimer !== null) clearTimeout(updateTimer);
    };
  }, [store]);

  useInput((input, key) => {
    // 인트로 화면에서는 App 핸들러를 비활성화한다. 인트로 입력은
    // IntroScreen의 onAnyKey가 담당하므로, 여기서 h/v/p/q 처리가
    // 동시에 점화되지 않도록 early return 한다.
    if (screen !== 'main') return;

    const ch = input.toLowerCase();

    // 도움말 상세보기: 도움말 열린 상태에서 아무 키를 누르면 해당 키 설명 표시.
    // 도움말이 열려 있어도 q는 종료로 동작한다.
    if (helpOpen) {
      if (key.escape || input === 'h' || input === '?') {
        setHelpOpen(false);
        setHelpSel(null);
      } else if (ch === 'q') {
        onQuit();
      } else if (input) {
        setHelpSel(input.toLowerCase());
      }
      return;
    }

    if (ch === 'q') {
      onQuit();
    } else if (ch === 'h' || ch === '?') {
      setHelpOpen(true);
      setHelpSel(null);
    } else if (ch === 'v') {
      setShowVersion((v) => !v);
    } else if (ch === 'p') {
      setPaused((v) => !v);
    } else if (ch === 'r') {
      setScaleIdx((i) => (i + 1) % SCALE_ORDER.length);
    } else if (key.ctrl && ch === 'l') {
      stdout.write('\x1b[2J\x1b[H');
    } else if (key.escape) {
      onQuit();
    }
  });

  // 배율이 바뀔 때마다 스케줄러에 반영
  useEffect(() => {
    onScaleChange(SCALE_ORDER[scaleIdx] ?? 1);
  }, [scaleIdx]);

  const height = stdout.rows ?? 24;
  // 전체 터미널 높이에서 헤더(1줄) + 푸터(1~2줄) + 여백(1줄)을 뺀 높이를 ProcessWidget에 전달
  const contentHeight = Math.max(5, height - (showVersion ? 4 : 3));

  if (screen === 'intro') {
    return (
      <IntroScreen
        onAnyKey={() => {
          introDone = true;
          setScreen('main');
        }}
      />
    );
  }
  return (
    <Box flexDirection="column" height={height} paddingX={1} paddingY={0} overflow="hidden">
      <Text bold color="white">
        {' '}
        PC 모니터{' '}
        <Text color="cyan">[{formatDateTime(now)}]</Text>{' '}
        <Text color="gray">
          | Uptime {formatDuration(snapshot.uptimeSec)}
          | 배율 {SCALE_LABEL[scale] ?? '?'}
          | {paused ? '일시정지(재개 p)' : '실시간'}
          | q 종료
        </Text>
      </Text>
      <Box flexDirection="row" width="100%" flexGrow={1}>
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
            height={contentHeight}
            inputDisabled={helpOpen}
          />
        </Box>
        {helpOpen && (
          <Box flexDirection="column" marginLeft={1}>
            <HelpOverlay selectedKey={helpSel} onClose={() => { setHelpOpen(false); setHelpSel(null); }} />
          </Box>
        )}
      </Box>
      <Box>
        <Text color="gray">h 도움말 · v 버전 · p 일시정지 · r 주기({SCALE_LABEL[scale] ?? ''}) · ctrl+L 갱신 · q 종료</Text>
      </Box>
      {showVersion && (
        <Box>
          <Text color="gray" dimColor>mypcmonitor v{APP_VERSION} — 시스템 리시지 대시보드</Text>
        </Box>
      )}
    </Box>
  );
}