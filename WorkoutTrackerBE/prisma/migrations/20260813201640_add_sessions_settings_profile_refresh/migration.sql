-- AlterTable
ALTER TABLE `passwordresets` ADD COLUMN `attemptCount` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `avatarUrl` VARCHAR(512) NULL,
    ADD COLUMN `birthday` DATE NULL,
    ADD COLUMN `heightCm` INTEGER NULL,
    ADD COLUMN `weightKg` DOUBLE NULL;

-- CreateTable
CREATE TABLE `userSettings` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `weeklyGoal` INTEGER NOT NULL DEFAULT 4,
    `preferredDays` VARCHAR(64) NOT NULL DEFAULT '[]',
    `weightUnit` ENUM('kg', 'lb') NOT NULL DEFAULT 'kg',
    `restTimerSeconds` INTEGER NOT NULL DEFAULT 90,
    `autoStartRestTimer` BOOLEAN NOT NULL DEFAULT true,
    `keepScreenOn` BOOLEAN NOT NULL DEFAULT true,
    `soundEnabled` BOOLEAN NOT NULL DEFAULT true,
    `vibrationEnabled` BOOLEAN NOT NULL DEFAULT true,
    `notificationsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `language` VARCHAR(8) NOT NULL DEFAULT 'vi',
    `theme` VARCHAR(16) NOT NULL DEFAULT 'system',
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `userSettings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workoutSessions` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `workoutId` CHAR(36) NOT NULL,
    `scheduleId` CHAR(36) NULL,
    `startedAt` DATETIME(3) NOT NULL,
    `finishedAt` DATETIME(3) NULL,
    `durationSec` INTEGER NOT NULL DEFAULT 0,
    `totalVolume` DOUBLE NOT NULL DEFAULT 0,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IX_WorkoutSessions_UserId`(`userId`),
    INDEX `IX_WorkoutSessions_WorkoutId`(`workoutId`),
    INDEX `IX_WorkoutSessions_UserId_StartedAt`(`userId`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workoutSets` (
    `id` CHAR(36) NOT NULL,
    `sessionId` CHAR(36) NOT NULL,
    `exerciseId` INTEGER NOT NULL,
    `setIndex` INTEGER NOT NULL,
    `reps` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IX_WorkoutSets_SessionId`(`sessionId`),
    INDEX `IX_WorkoutSets_ExerciseId`(`exerciseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refreshTokens` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `tokenHash` VARCHAR(64) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refreshTokens_tokenHash_key`(`tokenHash`),
    INDEX `IX_RefreshTokens_UserId`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `IX_Exercises_Category` ON `exercises`(`category`);

-- AddForeignKey
ALTER TABLE `userSettings` ADD CONSTRAINT `userSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutSessions` ADD CONSTRAINT `workoutSessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutSessions` ADD CONSTRAINT `workoutSessions_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `workoutPlans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutSessions` ADD CONSTRAINT `workoutSessions_scheduleId_fkey` FOREIGN KEY (`scheduleId`) REFERENCES `scheduleWorkouts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutSets` ADD CONSTRAINT `workoutSets_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `workoutSessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutSets` ADD CONSTRAINT `workoutSets_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refreshTokens` ADD CONSTRAINT `refreshTokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
