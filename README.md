# Look&Lock — онлайн-запись в салон красоты

Курсовой проект для одного салона. В текущей версии есть MySQL с демонстрационными данными и каркас бэкенда на NestJS, TypeScript и Sequelize. Контроллеры пока не реализуют HTTP-методы, поэтому каталог, бронирование, вход и Swagger через браузер ещё недоступны.

[Описание проекта](docs/index.md) · [Сценарии пользователей](docs/user_stories.md) · [Модель данных и ER-диаграмма](docs/data_model.md) · [Спецификация планируемого REST API](docs/endpoints.md)

## Локальный запуск

Понадобятся Git, запущенный Docker Desktop с Docker Compose на Mac (или Docker Engine с плагином Compose на Linux), Node.js и npm. Для установки используйте Node.js 22.22.3+ в ветке 22 или Node.js 24.15.0+ в ветке 24: это требование пакетов в lock-файле. Сборка и модульные тесты с уже установленными пакетами проверены на Node.js 20.20.2 и npm 10.8.2; чистая установка на этой версии выдаёт предупреждения о совместимости. MySQL и phpMyAdmin устанавливать отдельно не нужно.

### 1. Получите исходники

```bash
git clone https://github.com/ZakaulovaSofa/beauty_salon.git
cd beauty_salon
```

### 2. Запустите MySQL и phpMyAdmin

Из корня репозитория:

```bash
docker compose config --quiet
docker compose up -d
docker compose ps
```

MySQL доступен с хоста по адресу `127.0.0.1:3307`, phpMyAdmin — по [http://127.0.0.1:8081](http://127.0.0.1:8081). Для входа используйте значения `MYSQL_USER` и `MYSQL_PASSWORD` из сервиса `mysql` в [docker-compose.yml](docker-compose.yml). Имя базы задано в `MYSQL_DATABASE`.

Дождитесь, пока следующий запрос начнёт возвращать результат. При первом запуске MySQL нужно время на создание базы и импорт:

```bash
docker compose exec -T mysql sh -c '
  MYSQL_PWD="$MYSQL_PASSWORD" mysql --default-character-set=utf8mb4 \
    -u "$MYSQL_USER" "$MYSQL_DATABASE" -e "
      SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM masters) AS masters,
        (SELECT COUNT(*) FROM service) AS services,
        (SELECT COUNT(*) FROM master_service) AS master_services,
        (SELECT COUNT(*) FROM master_working_hours) AS working_hours,
        (SELECT COUNT(*) FROM appointment) AS appointments;
    "
'
```

На свежем наборе ожидается одна строка с числами `5, 2, 3, 5, 4, 4`. Если запрос не проходит, проверьте `docker compose logs --tail=100 mysql`. Если порт занят, выберите свободный порт слева от двоеточия в `ports` соответствующего сервиса. Для MySQL измените и `DB_PORT` в следующем шаге.

### 3. Настройте и запустите NestJS

В каталоге `backend/` создайте файл `.env`, если его ещё нет. Пример сейчас нужно заполнить вручную: оба файла `.env.example` пусты, а корневой `.env` в текущей конфигурации не нужен. Не добавляйте рабочий `backend/.env` в Git.

```dotenv
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USERNAME=<значение MYSQL_USER>
DB_PASSWORD=<значение MYSQL_PASSWORD>
DB_NAME=<значение MYSQL_DATABASE>
```

Замените значения в угловых скобках данными из `docker-compose.yml`. Имя хоста `mysql` предназначено для связи между контейнерами; NestJS в этой инструкции запускается на компьютере, поэтому использует `127.0.0.1`.

```bash
cd backend
npm ci
npm run start:dev
```

После сообщения об успешном старте можно проверить, что сервер отвечает:

```bash
curl -i http://127.0.0.1:3000/
```

Для текущего каркаса ожидается HTTP `404`: корневого маршрута пока нет. `404` также вернут `/services` и `/docs`. Если порт занят, укажите свободный `PORT` в `backend/.env` и обновите адрес в команде.

## Работа с базой

- При создании пустого тома `mysql_data` MySQL импортирует [schema.sql](schema.sql). Обычный перезапуск сохраняет том и не повторяет импорт. NestJS не меняет схему автоматически: в его настройках стоит `synchronize: false`.
- Демо-учётные записи и роли можно посмотреть в таблице `users`. Вход через API пока не реализован. Время визитов в дампе Compose задано в UTC; рабочие часы — локальное время салона.
- Для остановки NestJS нажмите `Ctrl+C`. Из корня репозитория выполните `docker compose stop`, чтобы остановить контейнеры и сохранить данные. Следующий запуск — `docker compose up -d`.

## Сборка и тесты

Из `backend/`:

```bash
npm run build
npm run start:prod  # после сборки, при работающей БД и заполненном .env
npm test
npm run lint
npm run test:cov
```

Модульные тесты проверяют создание контроллеров и сервисов, не подключаясь к MySQL. `npm run test:e2e` требует рабочую БД и содержит устаревшее ожидание: тест из шаблона Nest проверяет `200 Hello World!` на `GET /`, а приложение возвращает `404`.

Дополнительные команды NestJS и ссылки на его документацию сохранены в [backend/README.md](backend/README.md).
