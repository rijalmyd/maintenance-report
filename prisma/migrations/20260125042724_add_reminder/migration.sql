-- CreateTable
CREATE TABLE `reminders` (
    `id` CHAR(36) NOT NULL,
    `asset_id` CHAR(36) NOT NULL,
    `reminder_type` ENUM('STNK', 'KIR') NOT NULL,
    `due_date` DATETIME(3) NOT NULL,
    `interval_month` INTEGER NOT NULL,
    `last_done_at` DATETIME(3) NULL,
    `next_due_date` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reminders` ADD CONSTRAINT `reminders_asset_id_fkey` FOREIGN KEY (`asset_id`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
