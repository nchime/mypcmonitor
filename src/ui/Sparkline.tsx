import React from 'react';
import { Box, Text } from 'ink';

const GLYPHS = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;

interface SparklineProps {
  values: number[];
  width: number;
  max?: number;
  color: (pct: number) => string;
}

function normalize(values: number[], width: number, max?: number): number[] {
  const len = Math.min(values.length, width);
  if (len === 0) return [];
  const window = values.slice(-len);
  const peak = max ?? Math.max(...window, 1e-9);
  return window.map((v) => {
    const scaled = (v / peak) * 100;
    return Math.max(0, Math.min(100, scaled));
  });
}

export function Sparkline({ values, width, max, color }: SparklineProps) {
  const normalized = normalize(values, width, max);
  if (normalized.length === 0) return <Text> </Text>;
  const glyphIndex = (pct: number) => Math.min(GLYPHS.length - 1, Math.floor((pct / 100) * (GLYPHS.length - 1)));
  return (
    <Box>
      {normalized.map((pct, i) => (
        <Text key={i} color={color(pct)}>
          {GLYPHS[glyphIndex(pct)]}
        </Text>
      ))}
    </Box>
  );
}