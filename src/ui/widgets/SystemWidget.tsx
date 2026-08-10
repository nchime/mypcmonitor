import React from 'react';
import { Box, Text } from 'ink';
import type { BatterySnapshot, SystemSnapshot, ThemePalette } from '../../types.js';

interface SystemWidgetProps {
  system: SystemSnapshot | null;
  battery: BatterySnapshot | null;
  theme: ThemePalette;
}

export function SystemWidget({ system, battery, theme }: SystemWidgetProps) {
  const batText = battery && battery.hasBattery ? (
    <Text>
      <Text color={battery.isCharging ? 'green' : battery.percent < 20 ? 'red' : 'yellow'}>
        {battery.isCharging ? '⚡' : '🔋'} {battery.percent}%
      </Text>
      <Text color={theme.subtext}>
        {' '}({battery.acConnected ? 'AC 연결' : '배터리 사용'})
      </Text>
    </Text>
  ) : (
    <Text color={theme.subtext}>배터리: 데스크톱/미지원</Text>
  );

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={theme.primary} bold>
        시스템 & 배터리
      </Text>
      {system ? (
        <Text color={theme.text}>
          OS: {system.distro || system.platform} {system.release} ({system.arch})
        </Text>
      ) : (
        <Text color={theme.subtext}>OS: 로딩 중…</Text>
      )}
      <Box>{batText}</Box>
    </Box>
  );
}
