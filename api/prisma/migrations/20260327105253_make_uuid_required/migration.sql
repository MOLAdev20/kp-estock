/*
  Warnings:

  - Made the column `uuid` on table `product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `product` MODIFY `uuid` VARCHAR(191) NOT NULL;
