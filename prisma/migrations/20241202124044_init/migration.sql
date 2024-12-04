-- CreateTable
CREATE TABLE `bilhete` (
    `id` VARCHAR(191) NOT NULL,
    `numero` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `compradorId` VARCHAR(191) NULL,
    `vendedorId` VARCHAR(191) NULL,
    `sorteioId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Bilhete_numero_key`(`numero`),
    INDEX `Bilhete_compradorId_fkey`(`compradorId`),
    INDEX `Bilhete_sorteioId_fkey`(`sorteioId`),
    INDEX `Bilhete_vendedorId_fkey`(`vendedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pagamento` (
    `id` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `pixCode` TEXT NULL,
    `pixUrl` TEXT NULL,
    `bilheteId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sorteio` (
    `id` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL,
    `numeroSorteado` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefone` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `slug` VARCHAR(191) NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    UNIQUE INDEX `Usuario_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bilhete` ADD CONSTRAINT `Bilhete_compradorId_fkey` FOREIGN KEY (`compradorId`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bilhete` ADD CONSTRAINT `Bilhete_sorteioId_fkey` FOREIGN KEY (`sorteioId`) REFERENCES `sorteio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bilhete` ADD CONSTRAINT `Bilhete_vendedorId_fkey` FOREIGN KEY (`vendedorId`) REFERENCES `usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
