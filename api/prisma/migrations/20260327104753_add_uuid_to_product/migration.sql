/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `product` ADD COLUMN `uuid` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `product_uuid_key` ON `product`(`uuid`);
