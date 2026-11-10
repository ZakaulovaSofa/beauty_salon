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
    PRIMARY KEY (`id`),
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
    PRIMARY KEY (`id`),
    CONSTRAINT `chk_service_name` CHECK (CHAR_LENGTH(TRIM(`name`)) > 0),
    CONSTRAINT `chk_service_price` CHECK (`price` >= 0),
    CONSTRAINT `chk_service_duration` CHECK (`duration_minutes` > 0) 
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `master_service` ( 
    `id` INT NOT NULL AUTO_INCREMENT,
    `master_id` INT NOT NULL, 
    `service_id` INT NOT NULL, 
    PRIMARY KEY (`id`),
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
