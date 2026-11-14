import { spawn } from 'child_process';
import path from 'path';

console.log('Starting Next.js server on port 3000...');

const nextBin = path.resolve(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
const server = spawn(process.execPath, [nextBin, 'start', '-H', '127.0.0.1', '-p', '3000'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: '3000', HOSTNAME: '127.0.0.1' },
});

let serverOutput = '';
server.stdout.on('data', (d) => {
  serverOutput += d.toString();
  // console.log('[Server stdout]', d.toString());
});
server.stderr.on('data', (d) => {
  serverOutput += d.toString();
  // console.error('[Server stderr]', d.toString());
});

async function waitForServer(url, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200 || res.status === 404) {
        return true;
      }
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function main() {
  const isReady = await waitForServer('http://127.0.0.1:3000/api/results', 15000);
  if (!isReady) {
    console.error('Server failed to start within timeout. Logs:\n', serverOutput);
    server.kill();
    process.exit(1);
  }

  console.log('Next.js server is online and responding at http://localhost:3000');
  console.log('Launching test verification suite...\n');

  const testProc = spawn(process.execPath, [path.resolve(process.cwd(), 'scripts', 'test-verification.mjs')], {
    stdio: 'inherit',
  });

  testProc.on('exit', (code) => {
    console.log(`\nTest suite finished with exit code ${code}. Stopping server...`);
    server.kill();
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error('Test runner failure:', err);
  server.kill();
  process.exit(1);
});
