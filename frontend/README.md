Команды для запуска в дев режиме

1. uvicorn main:app --reload - backend
2. npm run tauri dev - frontend

frontend\src-tauri\src\lib.rs здесь можно изменить инициализирование БД, но чтобы изменения сохранились нужно удалить бд по пути ...\AppData\Roaming\com.tauri.dev\database.db. Либо чтобы не удалять бд можно менять версию миграции для нвого изменения, и после первого запуска прилложения после сохранения изменений, для новых изменений нужно делать новую миграцию и тд
Migration {
version: 2, // вот эта версия
description: "insert_default_tool",
...
}
и потом
vec![
    migration_1(),
    migration_2(),
]
