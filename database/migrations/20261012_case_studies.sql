-- ============================================================
-- Case Studies migration - Quantum Tech Solutionz
-- Run-safe: uses CREATE TABLE IF NOT EXISTS / INSERT IGNORE
-- so it can be executed multiple times without errors.
-- ============================================================

CREATE TABLE IF NOT EXISTS `case_study_categories` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(150) NOT NULL,
  `slug`        VARCHAR(160) NOT NULL,
  `cover_image` VARCHAR(500) DEFAULT NULL,
  `sort_order`  INT NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cs_categories_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `case_studies` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED NOT NULL,
  `title`       VARCHAR(255) NOT NULL,
  `slug`        VARCHAR(270) NOT NULL,
  `description` TEXT,
  `tag_label`   VARCHAR(120) DEFAULT NULL,
  `thumbnail`   VARCHAR(500) DEFAULT NULL,
  `video_type`  ENUM('mp4','youtube','vimeo') NOT NULL DEFAULT 'mp4',
  `video_url`   VARCHAR(500) DEFAULT NULL,   -- youtube / vimeo link (embed converted server-side)
  `video_file`  VARCHAR(500) DEFAULT NULL,   -- uploaded mp4 path
  `duration`    VARCHAR(12) DEFAULT NULL,    -- e.g. 02:48 (blank hides the badge)
  `sort_order`  INT NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_case_studies_slug` (`slug`),
  KEY `idx_case_studies_category` (`category_id`),
  CONSTRAINT `fk_case_studies_category`
    FOREIGN KEY (`category_id`) REFERENCES `case_study_categories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Seed the three categories (idempotent via slug unique key)
-- ------------------------------------------------------------
INSERT IGNORE INTO `case_study_categories` (`name`, `slug`, `sort_order`, `is_active`) VALUES
  ('Web Development',   'web-development',   1, 1),
  ('Digital Marketing', 'digital-marketing', 2, 1),
  ('App Development',   'app-development',   3, 1);
