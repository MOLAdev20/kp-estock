-- CreateTable
CREATE TABLE `suppliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `suppliers_code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `pic` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `address` TEXT NOT NULL,
    `moq` INTEGER NOT NULL DEFAULT 0,
    `bankName` VARCHAR(100) NULL,
    `bankAccount` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `suppliers_suppliers_code_key`(`suppliers_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
