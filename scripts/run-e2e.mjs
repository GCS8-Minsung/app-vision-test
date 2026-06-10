import { spawn } from "node:child_process";
import http from "node:http";
import process from "node:process";
import { setTimeout } from "node:timers";

const port = 3100;
const baseUrl = `http://127.0.0.1:${port}`;
const isWindows = process.platform === "win32";

function run(command, args, options = {}) {
  if (isWindows) {
    return spawn([command, ...args].join(" "), {
      stdio: options.stdio ?? "inherit",
      shell: true,
      env: { ...process.env, ...options.env }
    });
  }

  return spawn(command, args, {
    stdio: options.stdio ?? "inherit",
    env: { ...process.env, ...options.env }
  });
}

function waitForServer(url, timeoutMs = 60_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }

        setTimeout(attempt, 500);
      });

      request.setTimeout(2_000, () => {
        request.destroy();
      });
    };

    attempt();
  });
}

function stopProcess(child) {
  if (!child.pid || child.killed) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    if (isWindows) {
      const killer = spawn(`taskkill /pid ${child.pid} /T /F`, {
        stdio: "ignore",
        shell: true
      });
      killer.on("exit", () => resolve());
      return;
    }

    child.kill("SIGTERM");
    resolve();
  });
}

const server = run("npx", ["next", "dev", "-H", "127.0.0.1", "-p", String(port)], {
  stdio: "pipe"
});

server.stdout.on("data", (chunk) => process.stdout.write(`[next] ${chunk}`));
server.stderr.on("data", (chunk) => process.stderr.write(`[next] ${chunk}`));

let exitCode = 1;

try {
  await waitForServer(baseUrl);

  exitCode = await new Promise((resolve) => {
    const tests = run("npx", ["playwright", "test"], {
      env: { PLAYWRIGHT_BASE_URL: baseUrl }
    });
    tests.on("exit", (code) => resolve(code ?? 1));
  });
} finally {
  await stopProcess(server);
}

process.exit(exitCode);
