export type MuscleId =
  | 'chest'
  | 'abs'
  | 'obliques'
  | 'quadriceps'
  | 'tibialis'
  | 'front-deltoid'
  | 'biceps'
  | 'forearms-front'
  | 'trapezius-front'
  | 'trapezius-back'
  | 'rear-deltoid'
  | 'lats'
  | 'triceps'
  | 'forearms-back'
  | 'lower-back'
  | 'glutes'
  | 'hamstrings'
  | 'calves';

export interface MuscleMapping {
  primary: MuscleId[];
  secondary: MuscleId[];
}

export const exerciseMuscleMap: Record<string, MuscleMapping> = {
  'Barbell Bench Press': { primary: ['chest', 'front-deltoid'], secondary: ['triceps'] },
  'Incline Dumbbell Press': { primary: ['chest', 'front-deltoid'], secondary: ['triceps'] },
  'Cable Chest Fly': { primary: ['chest'], secondary: ['front-deltoid'] },
  'Barbell Back Squat': { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings', 'lower-back', 'calves'] },
  'Leg Press': { primary: ['quadriceps'], secondary: ['glutes', 'hamstrings'] },
  'Leg Extensions': { primary: ['quadriceps'], secondary: [] },
  'Conventional Deadlift': { primary: ['hamstrings', 'glutes', 'lower-back'], secondary: ['lats', 'trapezius-back', 'forearms-back'] },
  'Lat Pulldown': { primary: ['lats'], secondary: ['biceps', 'rear-deltoid'] },
  'Barbell Row': { primary: ['lats', 'trapezius-back'], secondary: ['biceps', 'rear-deltoid', 'lower-back'] },
  'Overhead Press': { primary: ['front-deltoid', 'trapezius-front'], secondary: ['triceps'] },
  'Dumbbell Lateral Raise': { primary: ['front-deltoid', 'rear-deltoid'], secondary: ['trapezius-front'] },
  'Barbell Bicep Curl': { primary: ['biceps'], secondary: ['forearms-front'] },
  'Tricep Rope Pushdown': { primary: ['triceps'], secondary: [] },
  'Incline Bench Skull Crushers': { primary: ['triceps'], secondary: ['chest', 'front-deltoid'] },
  'Hanging Leg Raise': { primary: ['abs'], secondary: ['obliques'] },
  'Plank': { primary: ['abs', 'obliques'], secondary: ['lower-back'] },
  'Assault Bike Interval': { primary: ['quadriceps', 'calves'], secondary: ['glutes', 'hamstrings'] },
  'Treadmill Run': { primary: ['calves', 'quadriceps'], secondary: ['hamstrings', 'tibialis'] },
};


export const getExerciseMuscleGroup = (exerciseName: string): MuscleMapping => {
  const normalized = exerciseName.toLowerCase();
  
  
  const exactKey = Object.keys(exerciseMuscleMap).find(
    (k) => k.toLowerCase() === normalized
  );
  if (exactKey) {
    return exerciseMuscleMap[exactKey];
  }

  const primary: MuscleId[] = [];
  const secondary: MuscleId[] = [];

  
  if (normalized.includes('squat') || normalized.includes('lunge')) {
    primary.push('quadriceps', 'glutes');
    secondary.push('hamstrings', 'lower-back', 'calves');
  } else if (normalized.includes('deadlift') || normalized.includes('good morning')) {
    primary.push('hamstrings', 'glutes', 'lower-back');
    secondary.push('lats', 'trapezius-back', 'forearms-back');
  } else if (
    normalized.includes('bench') ||
    normalized.includes('chest') ||
    normalized.includes('pushup') ||
    normalized.includes('fly') ||
    normalized.includes('pec')
  ) {
    primary.push('chest');
    if (normalized.includes('press') || normalized.includes('pushup')) {
      primary.push('front-deltoid');
      secondary.push('triceps');
    } else {
      secondary.push('front-deltoid');
    }
  } else if (
    normalized.includes('overhead') ||
    normalized.includes('shoulder') ||
    normalized.includes('military') ||
    normalized.includes('lateral raise') ||
    normalized.includes('shrug')
  ) {
    primary.push('front-deltoid');
    if (normalized.includes('shrug') || normalized.includes('press')) {
      primary.push('trapezius-front');
    }
    secondary.push('triceps', 'rear-deltoid');
  } else if (
    normalized.includes('row') ||
    normalized.includes('pull up') ||
    normalized.includes('pulldown') ||
    normalized.includes('chin up') ||
    normalized.includes('lats')
  ) {
    primary.push('lats');
    secondary.push('biceps', 'rear-deltoid', 'trapezius-back');
  } else if (normalized.includes('bicep') || normalized.includes('curl')) {
    primary.push('biceps');
    secondary.push('forearms-front');
  } else if (
    normalized.includes('tricep') ||
    normalized.includes('dip') ||
    normalized.includes('skull crusher') ||
    normalized.includes('kickback')
  ) {
    primary.push('triceps');
    secondary.push('front-deltoid');
  } else if (
    normalized.includes('abs') ||
    normalized.includes('crunch') ||
    normalized.includes('leg raise') ||
    normalized.includes('plank') ||
    normalized.includes('situp')
  ) {
    primary.push('abs');
    secondary.push('obliques', 'lower-back');
  } else if (normalized.includes('calf') || normalized.includes('raise')) {
    primary.push('calves');
    secondary.push('tibialis');
  } else if (
    normalized.includes('run') ||
    normalized.includes('bike') ||
    normalized.includes('cardio') ||
    normalized.includes('treadmill') ||
    normalized.includes('hiit')
  ) {
    primary.push('quadriceps', 'calves');
    secondary.push('hamstrings', 'tibialis');
  } else {
    
    primary.push('chest');
  }

  
  return {
    primary: Array.from(new Set(primary)),
    secondary: Array.from(new Set(secondary)),
  };
};

export const getMuscleLabel = (id: MuscleId): string => {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
