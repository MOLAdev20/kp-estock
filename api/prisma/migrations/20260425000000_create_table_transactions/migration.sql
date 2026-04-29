-- CreateTable
CREATE TABLE `transactions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `transaction_code` VARCHAR(191) NOT NULL,
    `total_price` DECIMAL(15, 2) NOT NULL,
    `discount_type` ENUM('percent', 'nominal') NOT NULL,
    `discount_amount` DECIMAL(15, 2) NOT NULL,
    `grand_total` DECIMAL(15, 2) NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `transactions_transaction_code_key`(`transaction_code`),
    INDEX `transactions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey`
FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
