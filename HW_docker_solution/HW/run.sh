#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="$PROJECT_DIR/data"
LOCAL_DATA_DIR="$PROJECT_DIR/local_data"
GENERATOR_IMAGE="hw-generator"
REPORTER_IMAGE="hw-reporter"
SERVER_CONTAINER="hw-report-server"
SERVER_PORT="8080"

mkdir -p "$DATA_DIR" "$LOCAL_DATA_DIR"

case "$1" in
  build_generator)
    docker build -t "$GENERATOR_IMAGE" "$PROJECT_DIR/generator"
    ;;

  run_generator)
    docker run --rm -v "$DATA_DIR:/data" "$GENERATOR_IMAGE"
    ;;

  create_local_data)
    python3 "$PROJECT_DIR/generator/generate.py" "$LOCAL_DATA_DIR"
    echo "Файл создан: local_data/data.csv"
    ;;

  build_reporter)
    docker build -t "$REPORTER_IMAGE" "$PROJECT_DIR/reporter"
    ;;

  run_reporter)
    docker run --rm -v "$DATA_DIR:/data" "$REPORTER_IMAGE"
    ;;

  structure)
    find "$PROJECT_DIR" -maxdepth 3 -not -path '*/.git/*' -print | sort
    ;;

  clear_data)
    find "$DATA_DIR" -maxdepth 1 -type f \( -name "*.csv" -o -name "*.html" \) -delete
    echo "Папка data очищена от .csv и .html файлов"
    ;;

  inside_generator)
    docker run --rm -v "$DATA_DIR:/data" "$GENERATOR_IMAGE" sh -c "echo 'Содержимое /data внутри generator:' && ls -la /data"
    ;;

  inside_reporter)
    docker run --rm -v "$DATA_DIR:/data" "$REPORTER_IMAGE" sh -c "echo 'Содержимое /data внутри reporter:' && ls -la /data"
    ;;

  report_server)
    if [ ! -f "$DATA_DIR/report.html" ]; then
      echo "Файл data/report.html не найден. Сначала выполните:"
      echo "./run.sh build_generator"
      echo "./run.sh run_generator"
      echo "./run.sh build_reporter"
      echo "./run.sh run_reporter"
      exit 1
    fi

    docker rm -f "$SERVER_CONTAINER" >/dev/null 2>&1 || true
    echo "Сервер запускается на порту $SERVER_PORT"
    echo "В Codespaces откройте вкладку Ports и перейдите по адресу порта $SERVER_PORT"
    docker run --rm \
      --name "$SERVER_CONTAINER" \
      -p "$SERVER_PORT:80" \
      -v "$DATA_DIR:/usr/share/nginx/html:ro" \
      nginx:alpine
    ;;

  *)
    echo "Использование: ./run.sh <command>"
    echo ""
    echo "Доступные команды:"
    echo "  build_generator   - собрать Docker-образ генератора"
    echo "  run_generator     - запустить генератор и создать data/data.csv"
    echo "  create_local_data - создать local_data/data.csv локально без Docker"
    echo "  build_reporter    - собрать Docker-образ аналитика"
    echo "  run_reporter      - запустить аналитик и создать data/report.html"
    echo "  structure         - вывести структуру проекта"
    echo "  clear_data        - удалить .csv и .html из папки data"
    echo "  inside_generator  - показать папку /data внутри контейнера генератора"
    echo "  inside_reporter   - показать папку /data внутри контейнера аналитика"
    echo "  report_server     - запустить веб-сервер для report.html"
    exit 1
    ;;
esac
