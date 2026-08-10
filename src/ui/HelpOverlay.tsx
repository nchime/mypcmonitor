import React from 'react';
import { Box, Text, useStdout } from 'ink';
import { APP_VERSION } from '../constants.js';

export interface ShortcutDef {
  keys: string;
  label: string;
  desc: string;
  detail: string;
}

export const SHORTCUTS: ShortcutDef[] = [
  {
    keys: 'h / ?',
    label: '도움말',
    desc: '단축키 도움말 표시/숨김',
    detail: '이 오버레이를 토글합니다. 도움말이 열린 상태에서 아무 키를 누르면 해당 키의 상세 기능을 아래에서 확인할 수 있습니다.',
  },
  {
    keys: 'v',
    label: '버전',
    desc: '버전 정보 표시',
    detail: `현재 설치된 버전(${APP_VERSION})을 화면 하단 우측에 표시합니다.`,
  },
  {
    keys: 'p',
    label: '일시정지',
    desc: '실시간 갱신 일시정지/재개',
    detail: '데이터 갱신을 잠시 멈춥니다. 다시 누르면 갱신이 재개됩니다. 화면을 붙잡고 관찰할 때 유용합니다.',
  },
  {
    keys: 'r',
    label: '수집 주기',
    desc: '폴링 주기를 순환 변경',
    detail: '데이터 수집 배율을 1x → 2x → 4x → 0.5x 순으로 순환합니다. 4x는 느리게(저부하), 0.5x는 빠르게 갱신합니다.',
  },
  {
    keys: 'Ctrl+L',
    label: '화면 리셋',
    desc: '터미널 화면을 지우고 다시 그림',
    detail: '화면이 어지럽거나 깨졌을 때 깨끗하게 다시 렌더링합니다.',
  },
  {
    keys: 'ESC',
    label: '닫기/종료',
    desc: '도움말 닫기, 아니면 프로그램 종료',
    detail: '도움말이 열려 있으면 도움말만 닫습니다. 아닌 경우 Ctrl+C와 동일하게 종료합니다.',
  },
  {
    keys: 'q',
    label: '종료',
    desc: '프로그램 종료',
    detail: 'Ctrl+C와 동일하게 즉시 종료합니다. 좌측 상단 헤더에도 힌트가 표시됩니다.',
  },
  {
    keys: '1 ~ 4',
    label: '프로세스 정렬',
    desc: '프로세스 목록 정렬 기준 변경',
    detail: '1=CPU, 2=메모리, 3=PID, 4=이름 순으로 프로세스 목록을 정렬합니다. 프로세스 위젯 제목에 현재 기준이 표시됩니다.',
  },
  {
    keys: '↑ / ↓',
    label: '프로세스 스크롤',
    desc: '프로세스 목록 스크롤',
    detail: '정렬된 프로세스 목록에서 위/아래 화살표로 스크롤하여 더 많은 항목을 볼 수 있습니다.',
  },
];

interface HelpOverlayProps {
  selectedKey: string | null;
  onClose: () => void;
}

export function HelpOverlay({ selectedKey, onClose }: HelpOverlayProps) {
  const { stdout } = useStdout();
  const cols = stdout.columns ?? 100;

  const selected = selectedKey
    ? SHORTCUTS.find((s) => s.keys.includes(selectedKey))
    : undefined;

  // 인라인 우측 패널로 렌더링되므로, 좌측 위젯 열(55)+프로세스 열 여유를 고려한 폭.
  // 좁은 터미널에서도 34칸은 확보하고, 넓으면 62칸까지만 사용한다.
  const width = Math.max(34, Math.min(62, cols - 76));

  return (
    <Box
      width={width}
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      paddingX={1}
      paddingY={0}
    >
      <Text bold color="cyan">
        도움말 — MyPCMonitor 단축키
      </Text>
      <Text color="gray">키를 누르면 해당 키의 상세 설명이 아래에 표시됩니다.</Text>
      <Box flexDirection="column" marginTop={1}>
        {SHORTCUTS.map((s) => (
          <Box key={s.keys} flexDirection="row">
            <Box width={9}>
              <Text color="yellow" bold>
                {s.keys}
              </Text>
            </Box>
            <Text color="white">
              {s.label} <Text color="gray">— {s.desc}</Text>
            </Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1} borderStyle="single" borderColor="magenta" paddingX={1} paddingY={0}>
        {selected ? (
          <Text>
            <Text color="yellow" bold>
              [{selected.keys}] {selected.label}
            </Text>
            {'\n'}
            <Text color="white">{selected.detail}</Text>
          </Text>
        ) : (
          <Text color="gray">
            (키를 눌러 상세보기 — 예: r을 누르면 주기 변경 설명)
          </Text>
        )}
      </Box>
      <Box marginTop={1}>
        <Text color="cyan" bold>ESC / h · ? — 닫기</Text>
      </Box>
    </Box>
  );
}