import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: false, // tests share Firestore test users; keep sequential
  workers: 1, // fullyParallel:false only serializes tests within a file — different files still run in separate workers against the same dev server unless workers is pinned, which caused real contention-driven timeouts (SMTP/Cloudinary/Firestore round-trips competing) once the rate-limiting suite added heavier real-network tests
  retries: 1, // next dev lazily compiles each route on first hit; whichever test's request happens to land first on an uncompiled route occasionally eats that one-time compile tax and times out — a real environmental artifact of testing against `next dev`, not a flaky assertion, so one retry (which hits an already-compiled route) resolves it without masking a genuine repeat failure
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
