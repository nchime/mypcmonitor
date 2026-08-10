#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { MonitorStore } from './core/store.js';
import { createMonitor } from './collectors/index.js';
import { App } from './ui/App.js';

// 대체 화면 버퍼(Alternate Screen Buffer) 및 커서 숨김 설정 (스크롤백 및 깜빡임 방지)
process.stdout.write('\x1b[?1049h\x1b[?25l');

const store = new MonitorStore();
const scheduler = createMonitor(store);

const { waitUntilExit } = render(
  <App
    store={store}
    onScaleChange={(s) => scheduler.setScale(s)}
    onQuit={() => void handleSignal()}
  />,
  { patchConsole: false },
);

function handleSignal(): void {
  scheduler.stopAll();
  process.stdout.write('\x1b[?1049l\x1b[?25h');
  process.exit(0);
}

process.on('SIGINT', () => handleSignal());
process.on('SIGTERM', () => handleSignal());

await waitUntilExit();
process.stdout.write('\x1b[?1049l\x1b[?25h');