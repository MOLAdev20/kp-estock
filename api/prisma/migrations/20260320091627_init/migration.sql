-- CreateTable
CREATE TABLE `product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_sku` VARCHAR(191) NOT NULL,
    `product_title` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `cost_price` DECIMAL(15, 2) NOT NULL,
    `selling_price` DECIMAL(15, 2) NOT NULL,
    `stock` INTEGER NOT NULL,
    `minimum_stock` INTEGER NOT NULL,
    `rack` VARCHAR(191) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `status` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `product_id_key`(`id`),
    UNIQUE INDEX `product_product_sku_key`(`product_sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
