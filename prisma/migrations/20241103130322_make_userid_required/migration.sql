/*
  Warnings:

  - Made the column `userId` on table `vaultitem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `vaultitem` DROP FOREIGN KEY `VaultItem_userId_fkey`;

-- AlterTable
ALTER TABLE `vaultitem` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `VaultItem` ADD CONSTRAINT `VaultItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
