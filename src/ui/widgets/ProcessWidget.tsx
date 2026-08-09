import React, { useMemo, useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ProcessSnapshot, ProcessSortKey, ProcessEntry } from '../../types.js';
import { colorForPercent, formatBytes, pad } from '../format.js';

interface ProcessWidgetProps {
  snapshot: ProcessSnapshot | null;
  height: number;
  /** true면 키보드 입력을 무시한다 (도움말 오버레이 등이 열린 경우). */
  inputDisabled?: boolean;
}

const SORT_COLUMN: Record<ProcessSortKey, { label: string; value: (p: ProcessEntry) => number | string }> = {
  cpu: { label: 'CPU', value: (p) => p.cpuPercent },
  mem: { label: 'MEM', value: (p) => p.memPercent },
  pid: { label: 'PID', value: (p) => p.pid },
  name: { label: 'NAME', value: (p) => p.name.toLowerCase() },
};

const SORT_KEYS: ProcessSortKey[] = ['cpu', 'mem', 'pid', 'name'];

export function ProcessWidget({ snapshot, height, inputDisabled = false }: ProcessWidgetProps) {
  const [sort, setSort] = useState<ProcessSortKey>('cpu');
  const [offset, setOffset] = useState(0);
  const contentHeight = Math.max(1, height - 3);

  const rows = useMemo(() => {
    if (!snapshot) return [];
    const col = SORT_COLUMN[sort] ?? SORT_COLUMN.cpu;
    return [...snapshot.processes].sort((a, b) => {
      const av = col.value(a);
      const bv = col.value(b);
      if (typeof av === 'string' || typeof bv === 'string') {
        return String(av).localeCompare(String(bv));
      }
      return (bv as number) - (av as number);
    });
  }, [snapshot, sort]);

  useEffect(() => {
    if (offset > Math.max(0, rows.length - contentHeight)) {
      setOffset(Math.max(0, rows.length - contentHeight));
    }
  }, [rows.length, offset, contentHeight]);

  useInput((input, key) => {
    if (inputDisabled) return;
    if (input === '1' || input === '2' || input === '3' || input === '4') {
      setSort(SORT_KEYS[Number(input) - 1] ?? 'cpu');
    } else if (key.downArrow) {
      setOffset((o) => Math.min(o + 1, Math.max(0, rows.length - contentHeight)));
    } else if (key.upArrow) {
      setOffset((o) => Math.max(0, o - 1));
    }
  });

  const col = SORT_COLUMN[sort] ?? SORT_COLUMN.cpu;
  const visible = rows.slice(offset, offset + contentHeight);

  return (
    <Box flexDirection="column" flexGrow={1}>
      <Text color="cyan" bold>
        프로세스 {snapshot?.totalCount ?? '-'}개 / 실행 {snapshot?.runningCount ?? '-'}개
        <Text color="gray">({col.label} 정렬)</Text>
      </Text>
      <Box flexDirection="column">
        <Box>
        <Text>{pad('PID', 6)}{pad('NAME', 24)}{pad('CPU%', 8)}{pad('MEM%', 8)}{'MEM'}</Text>
        </Box>
        {visible.length === 0 && <Text color="gray">로딩 중…</Text>}
        {visible.map((p) => (
          <Box key={p.pid}>
            <Text color="gray">{pad(p.pid, 6)}</Text>
            <Text>{p.name.length > 23 ? `${p.name.slice(0, 22)}…` : pad(p.name, 24)}</Text>
            <Text color={colorForPercent(p.cpuPercent)}>{pad(p.cpuPercent.toFixed(1), 8)}</Text>
            <Text color={colorForPercent(p.memPercent)}>{pad(p.memPercent.toFixed(1), 8)}</Text>
            <Text color="gray">{formatBytes(p.memBytes)}</Text>
          </Box>
        ))}
      </Box>
      <Text color="gray" dimColor>
        `[1] CPU [2] MEM [3] PID [4] NAME 정렬 · ↑↓ 스크롤 · q 종료`
      </Text>
    </Box>
  );
}