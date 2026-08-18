import { PrismaClient, Difficulty } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper: build a relative date, similar to DATEADD(...GETDATE()...) in the original SQL
function daysAgoAt(daysAgo: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log('Cleaning up existing data...');
  // Delete in reverse order of foreign key dependencies
  await prisma.workoutSet.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.workoutComment.deleteMany();
  await prisma.scheduleWorkout.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutPlan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.exercise.deleteMany();

  console.log('Creating user...');
  const user = await prisma.user.create({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      fullName: 'User Full Name',
      email: 'user@example.com',
      userName: 'testuser',
      password: await bcrypt.hash('Test@123', 10),
    },
  });

  console.log('Creating user settings...');
  await prisma.userSettings.create({
    data: {
      id: 'E1111111-1111-1111-1111-111111111111',
      userId: user.id,
      goal: 'muscle',
      level: 'intermediate',
      onboardingCompleted: true,
    },
  });

  console.log('Creating exercises...');
  // difficulty is not present in the original SQL; assigned here to satisfy the current schema
  const exercisesData: {
    id: number;
    name: string;
    description: string;
    category: string;
    difficulty: Difficulty;
    videoUrl: string | null;
  }[] = [
    { id: 1, name: 'Barbell Bench Press', description: 'A classic compound lift targeting the chest, shoulders, and triceps.', category: 'Chest', difficulty: Difficulty.Intermediate, videoUrl: 'https://www.youtube.com/watch?v=vcBig73ojpE' },
    { id: 2, name: 'Incline Dumbbell Press', description: 'An upper-chest focused pressing movement using dumbbells.', category: 'Chest', difficulty: Difficulty.Intermediate, videoUrl: 'https://www.youtube.com/watch?v=8iPEnTCCb9E' },
    { id: 3, name: 'Cable Chest Fly', description: 'An isolation movement targeting the chest muscles with constant cable tension.', category: 'Chest', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=IOL8C_O44p4' },
    { id: 4, name: 'Barbell Back Squat', description: 'A fundamental lower body exercise targeting the quadriceps and glutes.', category: 'Legs', difficulty: Difficulty.Intermediate, videoUrl: 'https://www.youtube.com/watch?v=bEv6CCgLz9A' },
    { id: 5, name: 'Leg Press', description: 'A machine-based lower body press focusing primarily on the quadriceps.', category: 'Legs', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=yZmx_5r3yoc' },
    { id: 6, name: 'Leg Extensions', description: 'An isolation exercise targeting the quadriceps on a machine.', category: 'Legs', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=m0FOpMEgero' },
    { id: 7, name: 'Conventional Deadlift', description: 'A heavy compound movement that works the entire posterior chain.', category: 'Back', difficulty: Difficulty.Advanced, videoUrl: 'https://www.youtube.com/watch?v=wYreqqoogz0' },
    { id: 8, name: 'Lat Pulldown', description: 'A vertical pulling exercise targeting the latissimus dorsi.', category: 'Back', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=Salxy761Tsw' },
    { id: 9, name: 'Barbell Row', description: 'A horizontal pulling movement targeting the upper and mid back.', category: 'Back', difficulty: Difficulty.Intermediate, videoUrl: 'https://www.youtube.com/watch?v=RQU8wZPgd94' },
    { id: 10, name: 'Overhead Press', description: 'A vertical press targeting the shoulders and upper chest.', category: 'Shoulders', difficulty: Difficulty.Intermediate, videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI' },
    { id: 11, name: 'Dumbbell Lateral Raise', description: 'An isolation exercise targeting the lateral deltoids.', category: 'Shoulders', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=3VcKaXatLD0' },
    { id: 12, name: 'Barbell Bicep Curl', description: 'An isolation movement targeting the biceps.', category: 'Arms', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo' },
    { id: 13, name: 'Tricep Rope Pushdown', description: 'An isolation exercise targeting the lateral and medial heads of the triceps.', category: 'Arms', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=-1G9nK8k5G0' },
    { id: 14, name: 'Incline Bench Skull Crushers', description: 'An overhead tricep extension targeting the long head of the triceps.', category: 'Arms', difficulty: Difficulty.Intermediate, videoUrl: 'https://www.youtube.com/watch?v=qjXOC_Sh_4g' },
    { id: 15, name: 'Hanging Leg Raise', description: 'An advanced core exercise targeting the lower abdominals.', category: 'Core', difficulty: Difficulty.Advanced, videoUrl: 'https://www.youtube.com/watch?v=hdng3Nm1x_g' },
    { id: 16, name: 'Plank', description: 'An isometric core exercise targeting the deep abdominal muscles.', category: 'Core', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=pvIjsG5Svck' },
    { id: 17, name: 'Assault Bike Interval', description: 'High-intensity interval cardiovascular training using an air resistance bike.', category: 'Cardio', difficulty: Difficulty.Intermediate, videoUrl: 'https://www.youtube.com/watch?v=l_a6aRpe3lA' },
    { id: 18, name: 'Treadmill Run', description: 'Steady-state or interval running on a treadmill.', category: 'Cardio', difficulty: Difficulty.Beginner, videoUrl: 'https://www.youtube.com/watch?v=84Vf_Lq-Rz0' },
  ];

  await prisma.exercise.createMany({ data: exercisesData });

  console.log('Creating workout plans...');
  const pushDay = await prisma.workoutPlan.create({
    data: {
      id: 'F1111111-1111-1111-1111-111111111111',
      name: 'Push Day Routine',
      description: 'Focuses on chest, shoulders, and triceps.',
      userId: user.id,
    },
  });

  const legDay = await prisma.workoutPlan.create({
    data: {
      id: 'F2222222-2222-2222-2222-222222222222',
      name: 'Leg Day Hypertrophy',
      description: 'Focused on building quadriceps, hamstrings, and calves.',
      userId: user.id,
    },
  });

  const pullDay = await prisma.workoutPlan.create({
    data: {
      id: 'F3333333-3333-3333-3333-333333333333',
      name: 'Pull Day & Biceps',
      description: 'Targeting the back muscles and building biceps strength.',
      userId: user.id,
    },
  });

  const cardioCore = await prisma.workoutPlan.create({
    data: {
      id: 'F4444444-4444-4444-4444-444444444444',
      name: 'Cardio & Core Workout',
      description: 'High intensity conditioning session paired with abdominal training.',
      userId: user.id,
    },
  });

  console.log('Creating workout exercises...');
  await prisma.workoutExercise.createMany({
    data: [
      // Push Day
      { id: 'D1111111-1111-1111-1111-111111111111', exerciseId: 1, workoutId: pushDay.id, sets: 4, repetitions: 8, weight: 80.0 },
      { id: 'D2222222-2222-2222-2222-222222222222', exerciseId: 2, workoutId: pushDay.id, sets: 3, repetitions: 10, weight: 24.0 },
      { id: 'D3333333-3333-3333-3333-333333333333', exerciseId: 10, workoutId: pushDay.id, sets: 3, repetitions: 8, weight: 40.0 },
      { id: 'D4444444-4444-4444-4444-444444444444', exerciseId: 13, workoutId: pushDay.id, sets: 3, repetitions: 12, weight: 25.0 },
      // Leg Day
      { id: 'D5555555-5555-5555-5555-555555555555', exerciseId: 4, workoutId: legDay.id, sets: 4, repetitions: 6, weight: 100.0 },
      { id: 'D6666666-6666-6666-6666-666666666666', exerciseId: 5, workoutId: legDay.id, sets: 3, repetitions: 10, weight: 160.0 },
      { id: 'D7777777-7777-7777-7777-777777777777', exerciseId: 6, workoutId: legDay.id, sets: 3, repetitions: 12, weight: 45.0 },
      // Pull Day
      { id: 'D8888888-8888-8888-8888-888888888888', exerciseId: 7, workoutId: pullDay.id, sets: 3, repetitions: 5, weight: 120.0 },
      { id: 'D9999999-9999-9999-9999-999999999999', exerciseId: 8, workoutId: pullDay.id, sets: 4, repetitions: 10, weight: 60.0 },
      { id: 'DA111111-1111-1111-1111-111111111111', exerciseId: 12, workoutId: pullDay.id, sets: 3, repetitions: 12, weight: 30.0 },
      // Cardio & Core
      { id: 'DA222222-2222-2222-2222-222222222222', exerciseId: 17, workoutId: cardioCore.id, sets: 1, repetitions: 15, weight: 0.0 },
      { id: 'DA333333-3333-3333-3333-333333333333', exerciseId: 16, workoutId: cardioCore.id, sets: 3, repetitions: 60, weight: 0.0 },
    ],
  });

  console.log('Creating schedule workouts...');
  await prisma.scheduleWorkout.createMany({
    data: [
      { id: 'C1111111-1111-1111-1111-111111111111', scheduledDate: daysAgoAt(4, 8), workoutId: pushDay.id, isCompleted: true },
      { id: 'C2222222-2222-2222-2222-222222222222', scheduledDate: daysAgoAt(3, 17, 30), workoutId: legDay.id, isCompleted: true },
      { id: 'C3333333-3333-3333-3333-333333333333', scheduledDate: daysAgoAt(2, 9), workoutId: pullDay.id, isCompleted: true },
      { id: 'C4444444-4444-4444-4444-444444444444', scheduledDate: daysAgoAt(1, 16), workoutId: cardioCore.id, isCompleted: true },
    ],
  });

  console.log('Creating workout sessions & sets...');

  // Push Day session (matches ScheduleWorkout C1111111...)
  const pushSession = await prisma.workoutSession.create({
    data: {
      id: 'A1111111-1111-1111-1111-111111111111',
      userId: user.id,
      workoutId: pushDay.id,
      scheduleId: 'C1111111-1111-1111-1111-111111111111',
      startedAt: daysAgoAt(4, 8),
      finishedAt: daysAgoAt(4, 9),
      durationSec: 3600,
      totalVolume: 4 * 8 * 80 + 3 * 10 * 24 + 3 * 8 * 40 + 3 * 12 * 25,
    },
  });

  // Leg Day session (matches C2222222...)
  const legSession = await prisma.workoutSession.create({
    data: {
      id: 'A2222222-2222-2222-2222-222222222222',
      userId: user.id,
      workoutId: legDay.id,
      scheduleId: 'C2222222-2222-2222-2222-222222222222',
      startedAt: daysAgoAt(3, 17, 30),
      finishedAt: daysAgoAt(3, 18, 30),
      durationSec: 3600,
      totalVolume: 4 * 6 * 100 + 3 * 10 * 160 + 3 * 12 * 45,
    },
  });

  // Pull Day session (matches C3333333...)
  const pullSession = await prisma.workoutSession.create({
    data: {
      id: 'A3333333-3333-3333-3333-333333333333',
      userId: user.id,
      workoutId: pullDay.id,
      scheduleId: 'C3333333-3333-3333-3333-333333333333',
      startedAt: daysAgoAt(2, 9),
      finishedAt: daysAgoAt(2, 10, 15),
      durationSec: 4500,
      totalVolume: 3 * 5 * 120 + 4 * 10 * 60 + 3 * 12 * 30,
    },
  });

  // Cardio & Core session (matches C4444444...)
  const cardioSession = await prisma.workoutSession.create({
    data: {
      id: 'A4444444-4444-4444-4444-444444444444',
      userId: user.id,
      workoutId: cardioCore.id,
      scheduleId: 'C4444444-4444-4444-4444-444444444444',
      startedAt: daysAgoAt(1, 16),
      finishedAt: daysAgoAt(1, 16, 40),
      durationSec: 2400,
      totalVolume: 0,
    },
  });

  await prisma.workoutSet.createMany({
    data: [
      // Push Day sets
      { sessionId: pushSession.id, exerciseId: 1, setIndex: 1, reps: 8, weight: 80 },
      { sessionId: pushSession.id, exerciseId: 1, setIndex: 2, reps: 8, weight: 80 },
      { sessionId: pushSession.id, exerciseId: 2, setIndex: 1, reps: 10, weight: 24 },
      { sessionId: pushSession.id, exerciseId: 10, setIndex: 1, reps: 8, weight: 40 },
      { sessionId: pushSession.id, exerciseId: 13, setIndex: 1, reps: 12, weight: 25 },

      // Leg Day sets
      { sessionId: legSession.id, exerciseId: 4, setIndex: 1, reps: 6, weight: 100 },
      { sessionId: legSession.id, exerciseId: 5, setIndex: 1, reps: 10, weight: 160 },
      { sessionId: legSession.id, exerciseId: 6, setIndex: 1, reps: 12, weight: 45 },

      // Pull Day sets
      { sessionId: pullSession.id, exerciseId: 7, setIndex: 1, reps: 5, weight: 120 },
      { sessionId: pullSession.id, exerciseId: 8, setIndex: 1, reps: 10, weight: 60 },
      { sessionId: pullSession.id, exerciseId: 12, setIndex: 1, reps: 12, weight: 30 },

      // Cardio & Core sets
      { sessionId: cardioSession.id, exerciseId: 17, setIndex: 1, reps: 15, weight: 0 },
      { sessionId: cardioSession.id, exerciseId: 16, setIndex: 1, reps: 60, weight: 0 },
    ],
  });

  console.log('Creating workout comments...');
  await prisma.workoutComment.createMany({
    data: [
      {
        id: 'B1111111-1111-1111-1111-111111111111',
        workoutId: pushDay.id,
        userId: user.id,
        comment: 'Bench press felt heavy today. Will stick to 80kg next week.',
        createdAt: new Date('2026-05-20T09:30:00'),
      },
      {
        id: 'B2222222-2222-2222-2222-222222222222',
        workoutId: legDay.id,
        userId: user.id,
        comment: 'Leg press sets felt solid. Can potentially increase weight next session.',
        createdAt: new Date('2026-05-21T19:00:00'),
      },
      {
        id: 'B3333333-3333-3333-3333-333333333333',
        workoutId: cardioCore.id,
        userId: user.id,
        comment: 'Extremely sweaty session, great cardio pacing!',
        createdAt: new Date('2026-05-24T17:15:00'),
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });