import React from 'react';
import { Text, Box } from 'ink';

const BLOCK = '█';
const GAP = '░';
const WIDTH = 20;

interface BarGaugeProps {
  percent: number;
  label?: string;
  color: (pct: number) => string;
  width?: number;
}

export function BarGauge({ percent, label, color, width = WIDTH }: BarGaugeProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const bar = BLOCK.repeat(filled) + GAP.repeat(Math.max(0, width - filled));
  return (
    <Box>
      {label !== undefined && <Text> {label} </Text>}
      <Text color={color(clamped)}>{bar}</Text>
      <Text> {clamped.toFixed(1)}%</Text>
    </Box>
  );
}