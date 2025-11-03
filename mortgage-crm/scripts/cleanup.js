#!/usr/bin/env node

import { readdir, stat, readFile } from 'fs/promises';
import { join } from 'path';

async function findUnusedFiles(dir = 'src') {
  const unused = [];

  async function scan(path) {
    const entries = await readdir(path, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(path, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const content = await readFile(fullPath, 'utf-8');

        // Check for old code patterns
        if (content.includes('orchestrator-v') ||
            content.includes('David Young') ||
            content.includes('62043')) {
          unused.push(fullPath);
        }
      }
    }
  }

  await scan(dir);
  return unused;
}

async function cleanup() {
  console.log('🧹 Scanning for cleanup...\n');

  const unused = await findUnusedFiles();

  if (unused.length > 0) {
    console.log('⚠️  Found potentially problematic files:');
    unused.forEach(file => console.log(`  - ${file}`));
  } else {
    console.log('✅ No cleanup needed');
  }
}

cleanup();
