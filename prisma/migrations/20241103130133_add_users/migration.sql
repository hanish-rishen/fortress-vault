-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create default admin user
INSERT INTO `User` (`email`, `password`) 
VALUES ('admin@fortress.com', '$2b$10$K7L6LxBgxj6A6vbzRUHRhOYjzXDxB6VaHXmzGE9.TFEqDPX3TK8tW');

-- AlterTable
ALTER TABLE `VaultItem` ADD COLUMN `userId` INTEGER;

-- Update existing vault items to belong to admin
UPDATE `VaultItem` SET `userId` = 1;

-- AddForeignKey
ALTER TABLE `VaultItem` ADD CONSTRAINT `VaultItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;