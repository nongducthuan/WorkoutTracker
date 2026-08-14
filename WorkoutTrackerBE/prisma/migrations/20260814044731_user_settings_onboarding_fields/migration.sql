-- AlterTable
ALTER TABLE `usersettings` ADD COLUMN `autoSchedule` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `goal` ENUM('muscle', 'fat_loss', 'endurance') NOT NULL DEFAULT 'muscle',
    ADD COLUMN `level` ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    ADD COLUMN `onboardingCompleted` BOOLEAN NOT NULL DEFAULT false;
