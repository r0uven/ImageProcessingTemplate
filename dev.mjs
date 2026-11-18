import { spawn } from "child_process";
import path from "path";

// ============================================================
// ОБЩИЕ НАСТРОЙКИ
// ============================================================

const processes = [];

let isShuttingDown = false;
let isStarting = false;

const BACKEND_URL = "http://127.0.0.1:8001/docs";
const BACKEND_TIMEOUT = 30_000;
const CHECK_INTERVAL = 500;

// ============================================================
// ПРОШЛАЯ РЕАЛИЗАЦИЯ
// Одновременный запуск BACKEND и FRONTEND
// Сохранена для истории, в текущей работе не используется
// ============================================================

/*

import { spawn } from 'child_process';
import path from 'path';

const processes = [];

function runService(name, command, args, cwd) {
    const p = spawn(command, args, {
        cwd: path.resolve(cwd),
        shell: true,
        windowsHide: true,
        stdio: 'pipe'
    });

    processes.push(p);

    p.stdout.on('data', (data) => {
        process.stdout.write(`[${name}] ${data}`);
    });

    p.stderr.on('data', (data) => {
        process.stderr.write(`[${name}] ${data}`);
    });

    p.on('close', (code) => {
        console.log(`[${name}] процесс завершился с кодом ${code}`);
    });

    return p;
}

// Одновременный запуск сервисов
runService(
    'BACKEND',
    'python',
    ['-m', 'uvicorn', 'main:app', '--reload'],
    './backend'
);

runService(
    'FRONTEND',
    'npm',
    ['run', 'tauri', 'dev'],
    './frontend'
);

// Корректное завершение всех процессов
function shutdown() {
    console.log('\n[DEV] Завершение работы всех процессов...');

    for (const p of processes) {
        if (!p.killed) {
            if (process.platform === 'win32') {
                spawn(`taskkill /pid ${p.pid} /f /t`, {
                    shell: true
                });
            } else {
                p.kill('SIGINT');
            }
        }
    }

    setTimeout(() => {
        process.exit(0);
    }, 500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

*/

// ============================================================
// НОВАЯ РЕАЛИЗАЦИЯ
// Последовательный запуск: BACKEND -> FRONTEND
// С ожиданием готовности backend и контролем процессов
// ============================================================

// ------------------------------------------------------------
// ЗАПУСК ОТДЕЛЬНОГО СЕРВИСА
// ------------------------------------------------------------

function runService(name, command, args, cwd) {
  const p = spawn(command, args, {
    cwd: path.resolve(cwd),
    shell: true,
    windowsHide: true,
    stdio: "pipe",
  });

  processes.push({ name, process: p });

  // Перенаправление стандартного вывода
  p.stdout.on("data", (data) => {
    process.stdout.write(`[${name}] ${data}`);
  });

  // Перенаправление ошибок и диагностических сообщений
  p.stderr.on("data", (data) => {
    process.stderr.write(`[${name}] ${data}`);
  });

  // Ошибка непосредственно при запуске процесса
  p.on("error", (error) => {
    console.error(`[${name}] Ошибка запуска:`, error.message);
    shutdown();
  });

  // Контроль завершения процесса
  p.on("close", (code) => {
    console.log(`[${name}] процесс завершился с кодом ${code}`);

    // Если сервис неожиданно завершился,
    // останавливаем всю систему
    if (!isShuttingDown) {
      console.error(`[DEV] Сервис ${name} неожиданно завершился.`);
      shutdown();
    }
  });

  return p;
}

// ------------------------------------------------------------
// ОЖИДАНИЕ ГОТОВНОСТИ BACKEND
// ------------------------------------------------------------

async function waitForBackend(processRef) {
  console.log("[DEV] Ожидание готовности BACKEND...");

  const startTime = Date.now();

  while (Date.now() - startTime < BACKEND_TIMEOUT) {
    // Проверяем, не началось ли завершение приложения
    if (isShuttingDown) {
      return false;
    }

    // Проверяем, что backend продолжает работать
    if (processRef.exitCode !== null || processRef.signalCode !== null) {
      throw new Error("Backend завершился до запуска frontend");
    }

    try {
      const response = await fetch(BACKEND_URL);

      if (response.ok) {
        console.log("[DEV] BACKEND успешно запущен!");
        return true;
      }
    } catch {
      // Backend ещё не готов, продолжаем проверку
    }

    await new Promise((resolve) => setTimeout(resolve, CHECK_INTERVAL));
  }

  throw new Error(
    `Backend не стал доступен за ${BACKEND_TIMEOUT / 1000} секунд`,
  );
}

// ------------------------------------------------------------
// ПОСЛЕДОВАТЕЛЬНЫЙ ЗАПУСК СЕРВИСОВ
// ------------------------------------------------------------

async function start() {
  if (isStarting || isShuttingDown) return;

  isStarting = true;

  try {
    // ШАГ 1. Запускаем BACKEND
    console.log("\n[DEV] Запуск BACKEND...");

    const backend = runService(
      "BACKEND",
      "py",
      ["-m", "uvicorn", "main:app", "--reload", "--port", "8001"],
      "./backend",
    );

    // ШАГ 2. Ждём готовности BACKEND
    const isBackendReady = await waitForBackend(backend);

    if (!isBackendReady || isShuttingDown) {
      return;
    }

    // ШАГ 3. Запускаем FRONTEND
    console.log("\n[DEV] Запуск FRONTEND...");

    runService("FRONTEND", "npm", ["run", "tauri", "dev"], "./frontend");

    console.log("\n[DEV] Все сервисы запущены!");
  } catch (error) {
    console.error(`\n[DEV] Ошибка запуска: ${error.message}`);
    shutdown();
  }
}

// ------------------------------------------------------------
// КОРРЕКТНОЕ ЗАВЕРШЕНИЕ ВСЕХ СЕРВИСОВ
// ------------------------------------------------------------

function shutdown() {
  // Защита от повторного вызова
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log("\n[DEV] Завершение работы всех процессов...");

  for (const { name, process: p } of processes) {
    // Пропускаем уже завершившиеся процессы
    if (p.exitCode !== null || p.signalCode !== null) {
      continue;
    }

    if (process.platform === "win32") {
      // Windows: завершаем процесс вместе
      // со всем деревом дочерних процессов
      const killer = spawn("taskkill", ["/pid", String(p.pid), "/f", "/t"], {
        windowsHide: true,
        stdio: "ignore",
      });

      killer.on("error", (error) => {
        console.error(`[DEV] Не удалось завершить ${name}:`, error.message);
      });
    } else {
      // Linux / macOS
      p.kill("SIGINT");
    }
  }

  // Завершаем управляющий процесс после отправки команд
  setTimeout(() => {
    process.exit(0);
  }, 500);
}

// ------------------------------------------------------------
// ОБРАБОТЧИКИ СИГНАЛОВ ЗАВЕРШЕНИЯ
// ------------------------------------------------------------

// Ctrl+C
process.on("SIGINT", shutdown);

// Системное завершение
process.on("SIGTERM", shutdown);

// ------------------------------------------------------------
// ЗАПУСК ПРИЛОЖЕНИЯ
// ------------------------------------------------------------

start();
