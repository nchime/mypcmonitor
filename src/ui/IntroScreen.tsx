import React from 'react';
import { Box, Text, useStdout, useInput } from 'ink';
import { APP_VERSION } from '../constants.js';

interface IntroScreenProps {
  /** 아무 키나 누르면 메인 화면으로 이동한다. */
  onAnyKey: () => void;
}
const textArtLines = [
  " __  __       ____   ____ __  __             _ _             ",
  "|  \\/  |_   _|  _ \\ / ___|  \\/  | ___  _ __ (_) |_ ___  _ __ ",
  "| |\\/| | | | | |_) | |   | |\\/| |/ _ \\| '_ \\| | __/ _ \\| '__|",
  "| |  | | |_| |  __/| |___| |  | | (_) | | | | | || (_) | |   ",
  "|_|  |_|\\__, |_|    \\____|_|  |_|\\___/|_| |_|_|\\__\\___/|_|   ",
  "        |___/                                                "
];

export function IntroScreen({ onAnyKey }: IntroScreenProps) {
  const { stdout } = useStdout();
  const height = stdout.rows ?? 24;
  
  useInput(() => {
    // 인트로에서는 아무 키나 누르면 메인으로 이동 (터미널마다 Enter 바이트가
    // 다르므로 특정 키에 의존하지 않는다).
    onAnyKey();
  });

  const paddingTop = Math.max(0, Math.floor((height - textArtLines.length) / 2));

  return (
    <Box flexDirection="column" height={height} justifyContent="space-between">
      <Box flexDirection="column" alignItems="center" paddingTop={paddingTop}>
        {textArtLines.map((line, i) => (
          <Text key={i} color={i % 2 === 0 ? 'cyan' : 'magenta'}>
            {line}
          </Text>
        ))}
        <Box marginTop={1} flexDirection="column" alignItems="center">
          <Text bold color="cyan">v{APP_VERSION}</Text>
          <Text color="gray">아무 키나 누르면 시작합니다</Text>
          </Box>
        </Box>
      <Box width="100%" justifyContent="flex-end" marginRight={1}>
        <Text color="gray">ver {APP_VERSION}</Text>
      </Box>
    </Box>
  );
}
