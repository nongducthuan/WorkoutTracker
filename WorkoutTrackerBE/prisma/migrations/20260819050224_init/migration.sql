-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(512) NULL,
    `weightKg` DOUBLE NULL,
    `heightCm` INTEGER NULL,
    `birthday` DATE NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_userName_key`(`userName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `userSettings` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `weeklyGoal` INTEGER NOT NULL DEFAULT 4,
    `preferredDays` VARCHAR(64) NOT NULL DEFAULT '[]',
    `autoSchedule` BOOLEAN NOT NULL DEFAULT false,
    `weightUnit` ENUM('kg', 'lb') NOT NULL DEFAULT 'kg',
    `restTimerSeconds` INTEGER NOT NULL DEFAULT 90,
    `autoStartRestTimer` BOOLEAN NOT NULL DEFAULT true,
    `keepScreenOn` BOOLEAN NOT NULL DEFAULT true,
    `soundEnabled` BOOLEAN NOT NULL DEFAULT true,
    `vibrationEnabled` BOOLEAN NOT NULL DEFAULT true,
    `notificationsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `language` VARCHAR(8) NOT NULL DEFAULT 'vi',
    `theme` VARCHAR(16) NOT NULL DEFAULT 'system',
    `goal` ENUM('muscle', 'fat_loss', 'endurance') NOT NULL DEFAULT 'muscle',
    `level` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    `onboardingCompleted` BOOLEAN NOT NULL DEFAULT false,
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

-- CreateTable
CREATE TABLE `exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `difficulty` ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,
    `videoUrl` VARCHAR(512) NULL,

    INDEX `IX_Exercises_Category`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workoutPlans` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `userId` CHAR(36) NOT NULL,

    INDEX `IX_WorkoutPlans_UserId`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workoutExercises` (
    `id` CHAR(36) NOT NULL,
    `exerciseId` INTEGER NOT NULL,
    `workoutId` CHAR(36) NOT NULL,
    `sets` INTEGER NOT NULL,
    `repetitions` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,

    INDEX `IX_WorkoutExercises_ExerciseId`(`exerciseId`),
    INDEX `IX_WorkoutExercises_WorkoutId`(`workoutId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheduleWorkouts` (
    `id` CHAR(36) NOT NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `workoutId` CHAR(36) NOT NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `remindEnabled` BOOLEAN NOT NULL DEFAULT true,

    INDEX `IX_ScheduleWorkouts_ScheduledDate`(`scheduledDate`),
    INDEX `IX_ScheduleWorkouts_WorkoutId`(`workoutId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workoutComments` (
    `id` CHAR(36) NOT NULL,
    `workoutId` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `comment` TEXT NOT NULL,
    `Date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IX_WorkoutComments_UserId`(`userId`),
    INDEX `IX_WorkoutComments_WorkoutId`(`workoutId`),
    INDEX `IX_WorkoutComments_CreatedAt`(`Date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passwordResets` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `otpCode` VARCHAR(10) NOT NULL,
    `otpExpiresAt` DATETIME(3) NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `resetToken` VARCHAR(255) NULL,
    `tokenExpiresAt` DATETIME(3) NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `attemptCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `IX_PasswordResets_UserId`(`userId`),
    INDEX `IX_PasswordResets_ResetToken`(`resetToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- AddForeignKey
ALTER TABLE `workoutPlans` ADD CONSTRAINT `workoutPlans_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutExercises` ADD CONSTRAINT `workoutExercises_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `exercises`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutExercises` ADD CONSTRAINT `workoutExercises_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `workoutPlans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scheduleWorkouts` ADD CONSTRAINT `scheduleWorkouts_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `workoutPlans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutComments` ADD CONSTRAINT `workoutComments_workoutId_fkey` FOREIGN KEY (`workoutId`) REFERENCES `workoutPlans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workoutComments` ADD CONSTRAINT `workoutComments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `passwordResets` ADD CONSTRAINT `passwordResets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
