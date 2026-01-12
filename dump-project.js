// dump-project.js
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'project-dump.txt';
const ROOT_DIR = process.cwd(); // Корень проекта — текущая директория

// Папки и файлы, которые игнорируем
const IGNORE_DIRS = new Set([
  'node_modules',
  '.git',
  '.idea',
  '.vscode',
  'dist',
  'build',
  '.next',
  'coverage',
  '.husky',
]);

const IGNORE_FILES = new Set([
  '.env',
  '.env.local',
  '.env.example',
  'yarn.lock',
  'package-lock.json',
  '.gitignore',
  OUTPUT_FILE, // чтобы не включить сам дамп
]);

// Расширения, которые будем включать (можно добавить/убрать)
const INCLUDE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yaml', '.yml',
  '.html', '.css', '.scss', '.env.example', '.txt', '.graphql',
]);

let output = fs.createWriteStream(OUTPUT_FILE, { encoding: 'utf-8' });

output.write(`=== ДАМП ПРОЕКТА ===\n`);
output.write(`Дата: ${new Date().toISOString()}\n`);
output.write(`Путь: ${ROOT_DIR}\n`);
output.write(`=====================================\n\n`);

function walk(dir) {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch (err) {
    console.error(`Не удалось прочитать папку: ${dir}`);
    return;
  }

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative(ROOT_DIR, fullPath);
    const stat = fs.statSync(fullPath);

    // Игнорируем папки
    if (stat.isDirectory()) {
      if (IGNORE_DIRS.has(file)) {
        console.log(`Пропуск папки: ${relativePath}`);
        continue;
      }
      walk(fullPath);
      continue;
    }

    // Игнорируем отдельные файлы
    if (IGNORE_FILES.has(file)) {
      console.log(`Пропуск файла: ${relativePath}`);
      continue;
    }

    // Фильтр по расширению
    const ext = path.extname(file).toLowerCase();
    if (!INCLUDE_EXTENSIONS.has(ext) && !stat.isDirectory()) {
      console.log(`Пропуск по расширению: ${relativePath}`);
      continue;
    }

    // Читаем файл
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf-8');
    } catch (err) {
      content = `<ОШИБКА ЧТЕНИЯ ФАЙЛА: ${err.message}>`;
    }

    // Записываем в дамп
    output.write(`\n\n`);
    output.write(`=====================================\n`);
    output.write(`Файл: ${relativePath}\n`);
    output.write(`=====================================\n\n`);
    output.write(content);

    if (!content.endsWith('\n')) output.write('\n');

    console.log(`Добавлен: ${relativePath}`);
  }
}

console.log('Начинаю сборку дампа проекта...');
walk(ROOT_DIR);
output.end();

output.on('finish', () => {
  console.log(`\nГотово! Всё записано в ${OUTPUT_FILE}`);
});

output.on('error', (err) => {
  console.error('Ошибка записи файла:', err);
});