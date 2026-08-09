-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `userName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_userName_key`(`userName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exercises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `difficulty` ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL,

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
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `workoutComments` ADD CONSTRAINT `workoutComments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
