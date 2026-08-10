import React, { useEffect, useRef, useState } from 'react';
import { Box, Text, useStdout, useInput } from 'ink';
import type { StoreSnapshot, ThemeName, ViewMode } from '../types.js';
import type { MonitorStore } from '../core/store.js';
import { CpuWidget } from './widgets/CpuWidget.js';
import { MemoryWidget } from './widgets/MemoryWidget.js';
import { DiskWidget } from './widgets/DiskWidget.js';
import { NetworkWidget } from './widgets/NetworkWidget.js';
import { ProcessWidget } from './widgets/ProcessWidget.js';
import { SystemWidget } from './widgets/SystemWidget.js';
import { formatDuration, formatDateTime } from './format.js';
import { IntroScreen } from './IntroScreen.js';
import { HelpOverlay } from './HelpOverlay.js';
import { APP_VERSION } from '../constants.js';
import { THEMES } from './theme.js';

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

const THEME_ORDER: ThemeName[] = ['dracula', 'nord', 'monokai', 'solarizedDark'];
const VIEW_MODE_ORDER: ViewMode[] = ['grid', 'compact', 'cpu', 'process'];
const VIEW_MODE_LABEL: Record<ViewMode, string> = {
  grid: '종합 (Grid)',
  compact: '미니 (Compact)',
  cpu: 'CPU 집중',
  process: '프로세스 집중',
};

// 리마운트/상태 리셋이 일어나도 인트로가 다시 표시되지 않도록 하는 모듈레벨 가드.
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
  const [themeIdx, setThemeIdx] = useState(0);
  const [viewModeIdx, setViewModeIdx] = useState(0);
  const { stdout } = useStdout();

  const scale = SCALE_ORDER[scaleIdx] ?? 1;
  const currentTheme = THEMES[THEME_ORDER[themeIdx] ?? 'dracula'];
  const viewMode = VIEW_MODE_ORDER[viewModeIdx] ?? 'grid';

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

    const channels = ['cpu', 'memory', 'disk', 'network', 'processes', 'battery', 'system'] as const;
    const unsubscribe = channels.map((ch) => store.onChannel(ch, scheduleUpdate));
    return () => {
      unsubscribe.forEach((fn) => fn());
      if (updateTimer !== null) clearTimeout(updateTimer);
    };
  }, [store]);

  useInput((input, key) => {
    if (screen !== 'main') return;

    const ch = input.toLowerCase();

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
    } else if (ch === 't') {
      setThemeIdx((i) => (i + 1) % THEME_ORDER.length);
    } else if (ch === 'm' || key.tab) {
      setViewModeIdx((i) => (i + 1) % VIEW_MODE_ORDER.length);
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

  useEffect(() => {
    onScaleChange(SCALE_ORDER[scaleIdx] ?? 1);
  }, [scaleIdx]);

  const height = stdout.rows ?? 24;
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
      <Text bold color={currentTheme.text}>
        {' '}
        MyPCMonitor{' '}
        <Text color={currentTheme.primary}>[{formatDateTime(now)}]</Text>{' '}
        <Text color={currentTheme.subtext}>
          | Uptime {formatDuration(snapshot.uptimeSec)}
          | 테마 {currentTheme.name}
          | 뷰 {VIEW_MODE_LABEL[viewMode]}
          | 배율 {SCALE_LABEL[scale] ?? '?'}
          | {paused ? '일시정지(재개 p)' : '실시간'}
          | q 종료
        </Text>
      </Text>

      {/* 뷰 모드별 동적 레이아웃 */}
      <Box flexDirection="row" width="100%" flexGrow={1}>
        {viewMode === 'grid' && (
          <>
            <Box flexDirection="column" width={55}>
              <SystemWidget system={snapshot.system} battery={snapshot.battery} theme={currentTheme} />
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
          </>
        )}

        {viewMode === 'compact' && (
          <Box flexDirection="column" width="100%">
            <SystemWidget system={snapshot.system} battery={snapshot.battery} theme={currentTheme} />
            <CpuWidget snapshot={snapshot.cpu} history={store.cpuHistory} />
            <MemoryWidget snapshot={snapshot.memory} history={store.memHistory} />
            <DiskWidget snapshot={snapshot.disk} />
          </Box>
        )}

        {viewMode === 'cpu' && (
          <Box flexDirection="column" width="100%">
            <CpuWidget snapshot={snapshot.cpu} history={store.cpuHistory} />
            <MemoryWidget snapshot={snapshot.memory} history={store.memHistory} />
            <SystemWidget system={snapshot.system} battery={snapshot.battery} theme={currentTheme} />
          </Box>
        )}

        {viewMode === 'process' && (
          <Box flexDirection="column" width="100%">
            <ProcessWidget
              snapshot={snapshot.processes}
              height={contentHeight}
              inputDisabled={helpOpen}
            />
          </Box>
        )}

        {helpOpen && (
          <Box flexDirection="column" marginLeft={1}>
            <HelpOverlay selectedKey={helpSel} onClose={() => { setHelpOpen(false); setHelpSel(null); }} />
          </Box>
        )}
      </Box>

      <Box>
        <Text color={currentTheme.subtext}>
          t 테마({currentTheme.name}) · m/Tab 뷰 · h 도움말 · v 버전 · p 일시정지 · r 주기 · q 종료
        </Text>
      </Box>
      {showVersion && (
        <Box>
          <Text color={currentTheme.subtext} dimColor>mypcmonitor v{APP_VERSION} — 시스템 리소스 대시보드</Text>
        </Box>
      )}
    </Box>
  );
}