#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { MonitorStore } from './core/store.js';
import { createMonitor } from './collectors/index.js';
import { App } from './ui/App.js';

const store = new MonitorStore();
const scheduler = createMonitor(store);

const { waitUntilExit } = render(<App store={store} />);

async function handleSignal(): Promise<void> {
  scheduler.stopAll();
  process.exit(0);
}

process.on('SIGINT', () => void handleSignal());
process.on('SIGTERM', () => void handleSignal());

await waitUntilExit();