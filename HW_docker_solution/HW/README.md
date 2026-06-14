# Домашнее задание №3. Docker + Bash

Проект состоит из двух основных контейнеров:

1. `generator` — Python-контейнер, который генерирует CSV-файл `data.csv`.
2. `reporter` — Node.js-контейнер, который читает `data.csv` и создаёт HTML-отчёт `report.html`.

Дополнительно реализована команда для запуска третьего контейнера с веб-сервером `nginx`, который показывает HTML-отчёт в браузере.

## Структура проекта

```text
HW/
├── generator/
│   ├── Dockerfile
│   └── generate.py
├── reporter/
│   ├── Dockerfile
│   ├── package.json
│   └── report.js
├── data/
├── local_data/
├── run.sh
└── README.md
```

Папки `data/` и `local_data/` создаются автоматически при запуске `run.sh`, если их ещё нет.

## Тематика данных

В проекте генерируются данные о заказах.

Колонки CSV-файла:

| Колонка | Значение |
|---|---|
| `ORDER_ID` | номер заказа |
| `DELIVERY_MINUTES` | время доставки в минутах |
| `ORDER_AMOUNT` | сумма заказа |
| `PAYMENT_TYPE` | тип оплаты |

## Команды

Все команды запускаются из папки `HW`.

Перед запуском нужно дать скрипту права на выполнение:

```bash
chmod +x run.sh
```

## 1. Сборка контейнера генератора

```bash
./run.sh build_generator
```

Эта команда собирает Docker-образ `hw-generator` из папки `generator`.

## 2. Запуск генератора

```bash
./run.sh run_generator
```

После запуска в папке `data/` должен появиться файл:

```text
data/data.csv
```

Проверить можно командой:

```bash
ls -la data
```

## 3. Локальная генерация данных без Docker

```bash
./run.sh create_local_data
```

После запуска в папке `local_data/` должен появиться файл:

```text
local_data/data.csv
```

Эта команда нужна для локальной проверки работы Python-скрипта.

## 4. Сборка контейнера аналитика

```bash
./run.sh build_reporter
```

Эта команда собирает Docker-образ `hw-reporter` из папки `reporter`.

## 5. Запуск аналитика

```bash
./run.sh run_reporter
```

Контейнер читает файл:

```text
data/data.csv
```

И создаёт HTML-отчёт:

```text
data/report.html
```

Проверить можно командой:

```bash
ls -la data
```

## 6. Просмотр структуры проекта

```bash
./run.sh structure
```

Команда выводит структуру файлов и директорий проекта.

## 7. Очистка данных

```bash
./run.sh clear_data
```

Команда удаляет из папки `data/` все файлы с расширениями `.csv` и `.html`.

После очистки можно заново выполнить:

```bash
./run.sh run_generator
./run.sh run_reporter
```

## 8. Проверка папки `/data` внутри контейнера генератора

```bash
./run.sh inside_generator
```

Команда запускает контейнер генератора и выводит содержимое папки `/data` внутри контейнера. Так проверяется, что контейнер видит локальную папку `data/` с хоста.

## 9. Проверка папки `/data` внутри контейнера аналитика

```bash
./run.sh inside_reporter
```

Команда запускает контейнер аналитика и выводит содержимое папки `/data` внутри контейнера. Так проверяется, что контейнер reporter тоже видит данные с хоста.

## 10. Запуск веб-сервера для просмотра отчёта

Перед запуском сервера нужно создать отчёт:

```bash
./run.sh build_generator
./run.sh run_generator
./run.sh build_reporter
./run.sh run_reporter
```

После этого можно запустить сервер:

```bash
./run.sh report_server
```

Команда запускает контейнер `nginx` и пробрасывает порт:

```text
8080 на хосте -> 80 внутри контейнера
```

Файл `report.html` раздаётся из папки `data/` через volume:

```text
data/ -> /usr/share/nginx/html
```

## Как открыть отчёт в GitHub Codespaces

1. Открыть репозиторий в GitHub Codespaces.
2. Перейти в папку проекта:

```bash
cd HW
```

3. Собрать и запустить генератор и аналитик:

```bash
chmod +x run.sh
./run.sh build_generator
./run.sh run_generator
./run.sh build_reporter
./run.sh run_reporter
```

4. Запустить веб-сервер:

```bash
./run.sh report_server
```

5. В нижней панели Codespaces открыть вкладку `Ports`.
6. Найти порт `8080`.
7. Нажать на ссылку в колонке `Forwarded Address`.
8. В браузере откроется отчёт `report.html`.

Если автоматически откроется список файлов nginx, нужно перейти по адресу:

```text
/report.html
```

## Полная проверка проекта

```bash
chmod +x run.sh
./run.sh build_generator
./run.sh run_generator
./run.sh create_local_data
./run.sh build_reporter
./run.sh run_reporter
./run.sh structure
./run.sh inside_generator
./run.sh inside_reporter
./run.sh report_server
```

После проверки в папке `data/` должны быть файлы:

```text
data.csv
report.html
```
