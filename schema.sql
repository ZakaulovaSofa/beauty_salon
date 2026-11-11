-- Схема и тестовые данные для MySQL 8.0.16 и новее.
-- Перед импортом выберите пустую базу данных. Сохраните кодировку клиента utf8mb4.

-- users хранит общие данные учётных записей для всех ролей.
CREATE TABLE `users` ( 
    `id` INT NOT NULL AUTO_INCREMENT,
    `login` VARCHAR(100) NOT NULL, 
    `password_hash` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(100) NOT NULL, 
    `last_name` VARCHAR(100) NOT NULL, 
    `role` ENUM('client', 'master', 'admin') NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `uq_users_login` UNIQUE (`login`),
    CONSTRAINT `chk_users_login` CHECK (CHAR_LENGTH(TRIM(`login`)) > 0),
    CONSTRAINT `chk_users_password_hash` CHECK (CHAR_LENGTH(TRIM(`password_hash`)) > 0), 
    CONSTRAINT `chk_users_first_name` CHECK (CHAR_LENGTH(TRIM(`first_name`)) > 0), 
    CONSTRAINT `chk_users_last_name` CHECK (CHAR_LENGTH(TRIM(`last_name`)) > 0), 
    CONSTRAINT `chk_users_role` CHECK (`role` IN ('client', 'master', 'admin'))
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; -- InnoDB поддерживает транзакции и внешние ключи, utf8mb4 хранит кириллицу и эмодзи.

-- masters хранит профессиональные профили, в том числе историю профилей после смены роли пользователя.
CREATE TABLE `masters` ( 
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `experience` INT NOT NULL,
    `description` TEXT NULL, 
    `photo_url` VARCHAR(2048) NULL, 
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_masters_status` CHECK (`status` IN ('active', 'inactive')),
    CONSTRAINT `uq_masters_user` UNIQUE (`user_id`), 
    CONSTRAINT `chk_masters_experience` CHECK (`experience` >= 0), 
    CONSTRAINT `fk_masters_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `service` ( 
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL, 
    `price` INT NOT NULL, 
    `duration_minutes` INT NOT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_service_status` CHECK (`status` IN ('active', 'inactive')),
    CONSTRAINT `chk_service_name` CHECK (CHAR_LENGTH(TRIM(`name`)) > 0),
    CONSTRAINT `chk_service_price` CHECK (`price` >= 0),
    CONSTRAINT `chk_service_duration` CHECK (`duration_minutes` > 0) 
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `master_service` ( 
    `id` INT NOT NULL AUTO_INCREMENT,
    `master_id` INT NOT NULL, 
    `service_id` INT NOT NULL, 
    `status` ENUM('active', 'inactive') NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_master_service_status` CHECK (`status` IN ('active', 'inactive')),
    CONSTRAINT `uq_master_service_pair` UNIQUE (`master_id`, `service_id`), 
    CONSTRAINT `fk_master_service_master` FOREIGN KEY (`master_id`) REFERENCES `masters` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_master_service_service` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT 
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; 

CREATE TABLE `master_working_hours` ( 
    `id` INT NOT NULL AUTO_INCREMENT, 
    `master_id` INT NOT NULL, 
    `day_of_week` INT NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL, 
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_working_hours_day` CHECK (`day_of_week` BETWEEN 1 AND 7),
    CONSTRAINT `chk_working_hours_start` CHECK (`start_time` >= '00:00:00' AND `start_time` < '24:00:00'),
    CONSTRAINT `chk_working_hours_end` CHECK (`end_time` > `start_time` AND `end_time` < '24:00:00'), 
    CONSTRAINT `fk_working_hours_master` FOREIGN KEY (`master_id`) REFERENCES `masters` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT 
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `appointment` ( 
    `id` INT NOT NULL AUTO_INCREMENT, 
    `client_id` INT NOT NULL,
    `master_service_id` INT NOT NULL,
    `start_time` TIMESTAMP NOT NULL, 
    `end_time` TIMESTAMP NOT NULL,
    `price` INT NOT NULL, 
    `status` ENUM('planned', 'completed', 'cancelled') NOT NULL DEFAULT 'planned', 
    PRIMARY KEY (`id`), 
    CONSTRAINT `chk_appointment_interval` CHECK (`end_time` > `start_time`), 
    CONSTRAINT `chk_appointment_price` CHECK (`price` >= 0),
    CONSTRAINT `chk_appointment_status` CHECK (`status` IN ('planned', 'completed', 'cancelled')), 
    CONSTRAINT `fk_appointment_client` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_appointment_master_service` FOREIGN KEY (`master_service_id`) REFERENCES `master_service` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Тестовые данные для демонстрации. Пароль всех тестовых аккаунтов: SalonDemo2026!
-- В таблицу записывается только bcrypt-хеш. Учётные записи предназначены для тестовой базы.
SET @seed_password_hash = '$2b$10$TamB1vUhmurpc.oZBSCY0u0eD2uMhMsM6VNOHAOF0/OwEuLtyhUGq';

-- Время посещений задаётся в часовом поясе салона (UTC+08:00).
-- Ближайший будущий понедельник и прошедший понедельник вычисляются при импорте.
SET @seed_previous_time_zone = @@session.time_zone;
SET SESSION time_zone = '+08:00';
SET @seed_today = CURRENT_DATE();
SET @seed_next_monday = DATE_ADD(@seed_today, INTERVAL (7 - WEEKDAY(@seed_today)) DAY);
SET @seed_past_monday = DATE_SUB(@seed_next_monday, INTERVAL 14 DAY);

START TRANSACTION;

INSERT INTO `users` (`id`, `login`, `password_hash`, `first_name`, `last_name`, `role`) VALUES
    (1, 'demo_admin', @seed_password_hash, 'Ольга', 'Кузнецова', 'admin'),
    (2, 'demo_maria', @seed_password_hash, 'Мария', 'Петрова', 'master'),
    (3, 'demo_elena', @seed_password_hash, 'Елена', 'Смирнова', 'master'),
    (4, 'demo_anna', @seed_password_hash, 'Анна', 'Иванова', 'client'),
    (5, 'demo_daria', @seed_password_hash, 'Дарья', 'Соколова', 'client');

INSERT INTO `masters` (`id`, `user_id`, `experience`, `description`, `photo_url`, `status`) VALUES
    (1, 2, 5, 'Парикмахер-стилист', NULL, 'active'),
    (2, 3, 3, 'Парикмахер-колорист', NULL, 'inactive');

INSERT INTO `service` (`id`, `name`, `description`, `price`, `duration_minutes`, `status`) VALUES
    (1, 'Женская стрижка', 'Стрижка и укладка', 1500, 60, 'active'),
    (2, 'Окрашивание волос', 'Окрашивание в один тон', 4500, 120, 'active'),
    (3, 'Уход за волосами', 'Восстанавливающий уход', 1800, 45, 'inactive');

INSERT INTO `master_service` (`id`, `master_id`, `service_id`, `status`) VALUES
    (1, 1, 1, 'active'),
    (2, 1, 2, 'active'),
    (3, 1, 3, 'active'),
    (4, 2, 1, 'inactive'),
    (5, 2, 2, 'active');

INSERT INTO `master_working_hours` (`id`, `master_id`, `day_of_week`, `start_time`, `end_time`) VALUES
    (1, 1, 1, '09:00:00', '13:00:00'),
    (2, 1, 1, '14:00:00', '18:00:00'),
    (3, 1, 3, '10:00:00', '18:00:00'),
    (4, 2, 1, '09:00:00', '17:00:00');

-- Отменённый визит (2) освобождает тот же слот, который занимает запланированный визит (1).
-- Запись (4) показывает, что история сохраняется у отключённого мастера и отключённой связи.
INSERT INTO `appointment` (`id`, `client_id`, `master_service_id`, `start_time`, `end_time`, `price`, `status`) VALUES
    (1, 4, 1, TIMESTAMP(@seed_next_monday, '10:00:00'), TIMESTAMP(@seed_next_monday, '11:00:00'), 1500, 'planned'),
    (2, 5, 1, TIMESTAMP(@seed_next_monday, '10:00:00'), TIMESTAMP(@seed_next_monday, '11:00:00'), 1500, 'cancelled'),
    (3, 5, 2, TIMESTAMP(@seed_next_monday, '14:00:00'), TIMESTAMP(@seed_next_monday, '16:00:00'), 4500, 'planned'),
    (4, 4, 4, TIMESTAMP(@seed_past_monday, '11:00:00'), TIMESTAMP(@seed_past_monday, '12:00:00'), 1500, 'completed');

COMMIT;
SET SESSION time_zone = @seed_previous_time_zone;
