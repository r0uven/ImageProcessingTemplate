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

// Запускаем сервисы
runService('BACKEND', 'uvicorn', ['main:app', '--reload'], './backend');
runService('FRONTEND', 'npm', ['run', 'tauri', 'dev'], './frontend');

// Функция корректного завершения
function shutdown() {
    console.log('\n[DEV] Завершение работы всех процессов...');

    for (const p of processes) {
        if (!p.killed) {
            // В Windows для корректного гашения деревьев процессов через shell 
            // лучше всего использовать taskkill, либо стандартный kill
            if (process.platform === 'win32') {
                spawn(`taskkill /pid ${p.pid} /f /t`, { shell: true });
            } else {
                p.kill('SIGINT');
            }
        }
    }

    setTimeout(() => {
        process.exit(0);
    }, 500);
}

// Перехватываем нажатие Ctrl+C
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);