-- CreateTable
CREATE TABLE `stock_opnames` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `opname_code` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `stock_opnames_opname_code_key`(`opname_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_opname_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `stock_opname_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `system_stock` INTEGER NOT NULL,
    `physical_stock` INTEGER NOT NULL,
    `variance` INTEGER NOT NULL,

    UNIQUE INDEX `stock_opname_items_stock_opname_id_product_id_key`(`stock_opname_id`, `product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stock_opnames` ADD CONSTRAINT `stock_opnames_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_opname_items` ADD CONSTRAINT `stock_opname_items_opname_id_fkey` FOREIGN KEY (`stock_opname_id`) REFERENCES `stock_opnames`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_opname_items` ADD CONSTRAINT `stock_opname_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
