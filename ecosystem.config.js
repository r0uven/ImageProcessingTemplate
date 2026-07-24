module.exports = {
    apps: [
        {
            name: "backend",
            script: "uvicorn",
            args: "main:app --reload",
            cwd: "./backend",
            interpreter: "python",
            watch: false // uvicorn сам следит за файлами
        },
        {
            name: "frontend",
            script: "cmd",                  // Используем системную командную строку
            args: "/c npm run tauri dev",   // Передаем команду через /c
            cwd: "./frontend",
            watch: false
        }
    ]
};