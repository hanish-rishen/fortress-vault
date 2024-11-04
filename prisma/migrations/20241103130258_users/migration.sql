/*
  Warnings:

  - You are about to alter the column `type` on the `vaultitem` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.

*/
-- DropForeignKey
ALTER TABLE `vaultitem` DROP FOREIGN KEY `VaultItem_userId_fkey`;

-- AlterTable
ALTER TABLE `vaultitem` MODIFY `type` VARCHAR(191) NOT NULL,
    MODIFY `content` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `VaultItem` ADD CONSTRAINT `VaultItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
