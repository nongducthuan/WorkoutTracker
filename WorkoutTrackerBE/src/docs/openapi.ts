/**
 * Hand-maintained OpenAPI 3.0 description, served at /docs (Swagger UI) and
 * /openapi.json. Keep it in step with the routers in src/routes.
 */

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const jsonBody = (schema: object, required = true) => ({
  required,
  content: { "application/json": { schema } },
});

const jsonResponse = (description: string, schema?: object) => ({
  description,
  ...(schema ? { content: { "application/json": { schema } } } : {}),
});

const errorResponses = {
  "400": jsonResponse("Validation or business rule failure", ref("Error")),
  "401": jsonResponse("Missing or invalid access token", ref("Error")),
  "404": jsonResponse("Resource not found or not owned by the caller", ref("Error")),
  "429": jsonResponse("Rate limited", ref("Error")),
};

const idParam = (name: string, description: string, type = "string") => ({
  name,
  in: "path",
  required: true,
  schema: { type },
  description,
});

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Workout Tracker API",
    version: "2.0.0",
    description:
      "Backend for the Workout Tracker mobile app.\n\n" +
      "Every endpoint outside `/auth/login`, `/auth/register`, `/auth/refresh`, " +
      "the password reset flow and the health checks requires a Bearer access token.\n\n" +
      "Errors always carry a stable `code` plus a human readable `message`; branch on `code`.",
  },
  servers: [{ url: "http://localhost:8080", description: "Local development" }],
  tags: [
    { name: "Auth", description: "Registration, login, tokens, password reset" },
    { name: "Me", description: "Current user profile and preferences" },
    { name: "Exercises", description: "Exercise catalogue" },
    { name: "Workouts", description: "Workout plans and their exercises" },
    { name: "Schedules", description: "Planned workouts on the calendar" },
    { name: "Sessions", description: "Workouts that were actually performed" },
    { name: "Comments", description: "Notes attached to a workout plan" },
    { name: "Reports", description: "Aggregates, personal records, muscle load" },
    { name: "Health", description: "Liveness and readiness probes" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: { type: "string", example: "OTP_EXPIRED" },
          message: { type: "string", example: "OtpExpired" },
        },
      },
      Message: {
        type: "object",
        properties: { message: { type: "string" } },
      },
      PublicUser: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          fullName: { type: "string" },
          email: { type: "string", format: "email" },
          userName: { type: "string" },
          avatarUrl: { type: "string", nullable: true },
          weightKg: { type: "number", nullable: true },
          heightCm: { type: "integer", nullable: true },
          birthday: { type: "string", format: "date", nullable: true },
        },
      },
      AuthResult: {
        type: "object",
        properties: {
          token: { type: "string", description: "Short lived JWT access token" },
          refreshToken: {
            type: "string",
            description: "Opaque token; rotated on every use of /auth/refresh",
          },
          expiresIn: { type: "string", example: "1h" },
          user: ref("PublicUser"),
        },
      },
      Exercise: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          category: { type: "string", example: "Chest" },
          difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
        },
      },
      PaginatedExercises: {
        type: "object",
        properties: {
          data: { type: "array", items: ref("Exercise") },
          total: { type: "integer" },
          page: { type: "integer" },
          pageSize: { type: "integer" },
        },
      },
      WorkoutPlan: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          description: { type: "string" },
          scheduledDate: {
            type: "string",
            format: "date-time",
            nullable: true,
            description: "Next uncompleted schedule, when listing plans",
          },
          lastPerformedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            description:
              "When the plan was last trained: the later of the newest finished session and the newest completed schedule. Null if neither exists. Only present when listing plans.",
          },
        },
      },
      WorkoutExercise: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          workoutId: { type: "string", format: "uuid" },
          exerciseId: { type: "integer" },
          exerciseName: { type: "string" },
          sets: { type: "integer" },
          repetitions: { type: "integer" },
          weight: { type: "number" },
        },
      },
      Schedule: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          scheduledDate: { type: "string", format: "date-time" },
          workoutId: { type: "string", format: "uuid" },
          workoutName: { type: "string" },
          isCompleted: { type: "boolean" },
          remindEnabled: {
            type: "boolean",
            description:
              "Per-session reminder switch. A reminder is due only when this and the account-wide userSettings.notificationsEnabled are both true.",
          },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          workoutId: { type: "string", format: "uuid" },
          comment: { type: "string" },
          userId: { type: "string", format: "uuid" },
          userName: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      SetInput: {
        type: "object",
        required: ["exerciseId", "setIndex", "reps", "weight"],
        properties: {
          exerciseId: { type: "integer" },
          setIndex: { type: "integer", minimum: 1 },
          reps: { type: "integer", minimum: 0, maximum: 1000 },
          weight: { type: "number", minimum: 0, maximum: 1000 },
          completedAt: { type: "string", format: "date-time" },
        },
      },
      SessionSet: {
        allOf: [
          ref("SetInput"),
          {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              exerciseName: { type: "string" },
            },
          },
        ],
      },
      WorkoutSession: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          workoutId: { type: "string", format: "uuid" },
          workoutName: { type: "string" },
          scheduleId: { type: "string", format: "uuid", nullable: true },
          startedAt: { type: "string", format: "date-time" },
          finishedAt: { type: "string", format: "date-time", nullable: true },
          durationSec: { type: "integer" },
          totalVolume: { type: "number", description: "Sum of reps × weight" },
          note: { type: "string", nullable: true },
          totalSets: { type: "integer" },
          exercisesCount: { type: "integer" },
          sets: { type: "array", items: ref("SessionSet") },
        },
      },
      PaginatedSessions: {
        type: "object",
        properties: {
          data: { type: "array", items: ref("WorkoutSession") },
          total: { type: "integer" },
          page: { type: "integer" },
          pageSize: { type: "integer" },
        },
      },
      UserSettings: {
        type: "object",
        properties: {
          weeklyGoal: { type: "integer", minimum: 1, maximum: 14 },
          preferredDays: {
            type: "array",
            items: { type: "integer", minimum: 0, maximum: 6 },
            description: "Weekdays as JS getDay(): 0 = Sunday … 6 = Saturday",
          },
          autoSchedule: { type: "boolean" },
          goal: { type: "string", enum: ["muscle", "fat_loss", "endurance"] },
          level: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          onboardingCompleted: { type: "boolean" },
          weightUnit: { type: "string", enum: ["kg", "lb"] },
          restTimerSeconds: { type: "integer", minimum: 0, maximum: 600 },
          autoStartRestTimer: { type: "boolean" },
          keepScreenOn: { type: "boolean" },
          soundEnabled: { type: "boolean" },
          vibrationEnabled: { type: "boolean" },
          notificationsEnabled: { type: "boolean" },
          language: { type: "string", enum: ["vi", "en"] },
          theme: { type: "string", enum: ["light", "dark", "system"] },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Report: {
        type: "object",
        properties: {
          totalWorkouts: { type: "integer" },
          totalVolume: { type: "number" },
          totalSets: { type: "integer" },
          avgDurationSec: { type: "integer" },
          streakDays: { type: "integer" },
          workoutsThisWeek: { type: "integer" },
          weeklyWorkouts: {
            type: "array",
            description: "The last 8 ISO weeks, including weeks with no training",
            items: {
              type: "object",
              properties: {
                week: { type: "string", example: "W33" },
                count: { type: "integer" },
                volume: { type: "number" },
              },
            },
          },
          recentActivity: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                date: { type: "string", format: "date-time" },
                workoutName: { type: "string" },
                exercisesCount: { type: "integer" },
              },
            },
          },
          source: {
            type: "string",
            enum: ["sessions", "schedules"],
            description:
              "`schedules` means the figures are estimated from plan configuration " +
              "because the account has no logged sessions yet.",
          },
        },
      },
      PersonalRecord: {
        type: "object",
        properties: {
          exerciseId: { type: "integer" },
          exerciseName: { type: "string" },
          category: { type: "string" },
          bestWeight: { type: "number" },
          bestWeightReps: { type: "integer" },
          bestWeightAt: { type: "string", format: "date-time" },
          estimatedOneRepMax: { type: "number", description: "Epley estimate" },
          estimatedOneRepMaxAt: { type: "string", format: "date-time" },
          bestSetVolume: { type: "number" },
          totalSets: { type: "integer" },
        },
      },
      ExerciseHistory: {
        type: "object",
        properties: {
          exerciseId: { type: "integer" },
          exerciseName: { type: "string" },
          currentPr: { type: "number", description: "All-time heaviest set, not just in the window" },
          currentPrAt: { type: "string", format: "date-time", nullable: true },
          estimatedOneRepMax: { type: "number" },
          gain: {
            type: "number",
            description: "Top weight in the last trained week minus the first trained week",
          },
          totalSessions: { type: "integer" },
          points: {
            type: "array",
            description: "One entry per week, oldest first; untrained weeks carry the previous weight",
            items: {
              type: "object",
              properties: {
                weekStart: { type: "string", format: "date-time" },
                week: { type: "string", example: "W33" },
                weight: { type: "number" },
                volume: { type: "number" },
                sets: { type: "integer", description: "0 means the weight was carried forward" },
              },
            },
          },
          sessions: {
            type: "array",
            description: "Newest first; one row per session, keyed on that session's top set",
            items: {
              type: "object",
              properties: {
                sessionId: { type: "string", format: "uuid" },
                date: { type: "string", format: "date-time" },
                workoutName: { type: "string" },
                sets: { type: "integer" },
                reps: { type: "integer" },
                weight: { type: "number" },
                volume: { type: "number" },
                isPr: { type: "boolean" },
              },
            },
          },
        },
      },
      MuscleLoad: {
        type: "object",
        properties: {
          days: { type: "integer" },
          from: { type: "string", format: "date-time" },
          to: { type: "string", format: "date-time" },
          totalVolume: { type: "number" },
          totalSets: { type: "integer" },
          groups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                volume: { type: "number" },
                sets: { type: "integer" },
                reps: { type: "integer" },
                percentage: { type: "number" },
              },
            },
          },
          exercises: {
            type: "array",
            description: "Per-exercise breakdown, for mapping onto a body heatmap",
            items: {
              type: "object",
              properties: {
                exerciseId: { type: "integer" },
                exerciseName: { type: "string" },
                category: { type: "string" },
                volume: { type: "number" },
                sets: { type: "integer" },
                reps: { type: "integer" },
              },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health/live": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe",
        security: [],
        responses: { "200": jsonResponse("Process is running") },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe (checks the database)",
        security: [],
        responses: {
          "200": jsonResponse("Ready"),
          "503": jsonResponse("Database unreachable"),
        },
      },
    },

    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Create an account",
        security: [],
        requestBody: jsonBody({
          type: "object",
          required: ["fullName", "userName", "email", "password"],
          properties: {
            fullName: { type: "string" },
            userName: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
        }),
        responses: { "201": jsonResponse("Account created", ref("AuthResult")), ...errorResponses },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Sign in with a username or an email",
        security: [],
        requestBody: jsonBody({
          type: "object",
          required: ["userName", "password"],
          properties: {
            userName: { type: "string", description: "Username or email" },
            password: { type: "string" },
          },
        }),
        responses: { "200": jsonResponse("Signed in", ref("AuthResult")), ...errorResponses },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Exchange a refresh token for a new token pair",
        security: [],
        requestBody: jsonBody({
          type: "object",
          required: ["refreshToken"],
          properties: { refreshToken: { type: "string" } },
        }),
        responses: { "200": jsonResponse("New token pair", ref("AuthResult")), ...errorResponses },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke one refresh token, or every session when none is sent",
        requestBody: jsonBody(
          {
            type: "object",
            properties: { refreshToken: { type: "string" } },
          },
          false
        ),
        responses: { "200": jsonResponse("Logged out", ref("Message")), ...errorResponses },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "The signed in user",
        responses: { "200": jsonResponse("Current user", ref("PublicUser")), ...errorResponses },
      },
    },
    "/auth/profile": {
      put: {
        tags: ["Auth"],
        summary: "Update profile; returns a fresh token pair",
        requestBody: jsonBody({
          type: "object",
          required: ["fullName", "email"],
          properties: {
            fullName: { type: "string" },
            email: { type: "string", format: "email" },
            avatarUrl: { type: "string", nullable: true },
            weightKg: { type: "number", nullable: true },
            heightCm: { type: "integer", nullable: true },
            birthday: { type: "string", format: "date", nullable: true },
          },
        }),
        responses: { "200": jsonResponse("Updated", ref("AuthResult")), ...errorResponses },
      },
    },
    "/auth/change-password": {
      put: {
        tags: ["Auth"],
        summary: "Change the password and revoke other sessions",
        requestBody: jsonBody({
          type: "object",
          required: ["oldPassword", "newPassword"],
          properties: {
            oldPassword: { type: "string" },
            newPassword: { type: "string", minLength: 8 },
          },
        }),
        responses: { "200": jsonResponse("Changed", ref("Message")), ...errorResponses },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Email a one time code",
        security: [],
        requestBody: jsonBody({
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", format: "email" } },
        }),
        responses: { "200": jsonResponse("Code sent", ref("Message")), ...errorResponses },
      },
    },
    "/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Exchange a valid code for a reset token",
        security: [],
        requestBody: jsonBody({
          type: "object",
          required: ["email", "otpCode"],
          properties: {
            email: { type: "string", format: "email" },
            otpCode: { type: "string" },
          },
        }),
        responses: {
          "200": jsonResponse("Verified", {
            type: "object",
            properties: { resetToken: { type: "string" } },
          }),
          ...errorResponses,
        },
      },
    },
    "/auth/reset-password": {
      put: {
        tags: ["Auth"],
        summary: "Set a new password using a reset token",
        security: [],
        requestBody: jsonBody({
          type: "object",
          required: ["resetToken", "newPassword"],
          properties: {
            resetToken: { type: "string" },
            newPassword: { type: "string", minLength: 8 },
          },
        }),
        responses: { "200": jsonResponse("Password reset", ref("Message")), ...errorResponses },
      },
    },

    "/me": {
      get: {
        tags: ["Me"],
        summary: "The signed in user (alias of /auth/me)",
        responses: { "200": jsonResponse("Current user", ref("PublicUser")), ...errorResponses },
      },
    },
    "/me/settings": {
      get: {
        tags: ["Me"],
        summary: "Preferences, created with defaults on first read",
        responses: { "200": jsonResponse("Settings", ref("UserSettings")), ...errorResponses },
      },
      put: {
        tags: ["Me"],
        summary: "Update preferences (partial update)",
        requestBody: jsonBody(ref("UserSettings")),
        responses: { "200": jsonResponse("Updated settings", ref("UserSettings")), ...errorResponses },
      },
    },

    "/exercises": {
      get: {
        tags: ["Exercises"],
        summary: "Search the exercise catalogue",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" }, description: "Substring of the name" },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "Exact category match, e.g. \"Chest\". See /exercises/categories.",
          },
          {
            name: "maxDifficulty",
            in: "query",
            schema: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
            description: "Inclusive upper bound: \"Intermediate\" returns beginner and intermediate movements.",
          },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: { "200": jsonResponse("Page of exercises", ref("PaginatedExercises")), ...errorResponses },
      },
    },
    "/exercises/categories": {
      get: {
        tags: ["Exercises"],
        summary: "Distinct categories in the catalogue, for the filter chips",
        responses: {
          "200": jsonResponse("Categories", { type: "array", items: { type: "string" } }),
          ...errorResponses,
        },
      },
    },

    "/workouts": {
      get: {
        tags: ["Workouts"],
        summary: "List the caller's workout plans",
        responses: {
          "200": jsonResponse("Plans", { type: "array", items: ref("WorkoutPlan") }),
          ...errorResponses,
        },
      },
      post: {
        tags: ["Workouts"],
        summary: "Create a workout plan",
        requestBody: jsonBody({
          type: "object",
          required: ["name", "description"],
          properties: { name: { type: "string" }, description: { type: "string" } },
        }),
        responses: { "201": jsonResponse("Created plan", ref("WorkoutPlan")), ...errorResponses },
      },
    },
    "/workouts/{id}": {
      parameters: [idParam("id", "Workout plan id")],
      get: {
        tags: ["Workouts"],
        summary: "Read one plan",
        responses: { "200": jsonResponse("Plan", ref("WorkoutPlan")), ...errorResponses },
      },
      put: {
        tags: ["Workouts"],
        summary: "Update a plan; returns the updated entity",
        requestBody: jsonBody({
          type: "object",
          properties: { name: { type: "string" }, description: { type: "string" } },
        }),
        responses: { "200": jsonResponse("Updated plan", ref("WorkoutPlan")), ...errorResponses },
      },
      delete: {
        tags: ["Workouts"],
        summary: "Delete a plan and everything attached to it",
        responses: { "200": jsonResponse("Deleted", ref("Message")), ...errorResponses },
      },
    },

    "/workout-exercises/{workoutId}": {
      parameters: [idParam("workoutId", "Workout plan id")],
      get: {
        tags: ["Workouts"],
        summary: "Exercises configured on a plan",
        responses: {
          "200": jsonResponse("Exercises", { type: "array", items: ref("WorkoutExercise") }),
          ...errorResponses,
        },
      },
    },
    "/workout-exercises": {
      post: {
        tags: ["Workouts"],
        summary: "Add an exercise to a plan; returns the created entity",
        requestBody: jsonBody({
          type: "object",
          required: ["workoutId", "exerciseId", "sets", "repetitions", "weight"],
          properties: {
            workoutId: { type: "string", format: "uuid" },
            exerciseId: { type: "integer" },
            sets: { type: "integer", minimum: 1 },
            repetitions: { type: "integer", minimum: 1 },
            weight: { type: "number", minimum: 0 },
          },
        }),
        responses: { "201": jsonResponse("Created", ref("WorkoutExercise")), ...errorResponses },
      },
    },
    "/workout-exercises/{id}": {
      parameters: [idParam("id", "Workout exercise id")],
      put: {
        tags: ["Workouts"],
        summary: "Update a plan exercise; returns the updated entity",
        requestBody: jsonBody({
          type: "object",
          properties: {
            exerciseId: { type: "integer" },
            sets: { type: "integer" },
            repetitions: { type: "integer" },
            weight: { type: "number" },
          },
        }),
        responses: { "200": jsonResponse("Updated", ref("WorkoutExercise")), ...errorResponses },
      },
      delete: {
        tags: ["Workouts"],
        summary: "Remove an exercise from a plan",
        responses: { "200": jsonResponse("Deleted", ref("Message")), ...errorResponses },
      },
    },

    "/workout-schedules": {
      get: {
        tags: ["Schedules"],
        summary: "List schedules, optionally windowed by date",
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "workoutId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "isCompleted", in: "query", schema: { type: "string", enum: ["true", "false"] } },
        ],
        responses: {
          "200": jsonResponse("Schedules", { type: "array", items: ref("Schedule") }),
          ...errorResponses,
        },
      },
      post: {
        tags: ["Schedules"],
        summary: "Schedule a workout; returns the created entity",
        requestBody: jsonBody({
          type: "object",
          required: ["scheduledDate", "workoutId"],
          properties: {
            scheduledDate: { type: "string", format: "date-time" },
            workoutId: { type: "string", format: "uuid" },
            remindEnabled: {
              type: "boolean",
              description: "Defaults to true when omitted.",
            },
          },
        }),
        responses: { "201": jsonResponse("Created", ref("Schedule")), ...errorResponses },
      },
    },
    "/workout-schedules/workout/{workoutId}": {
      parameters: [idParam("workoutId", "Workout plan id")],
      get: {
        tags: ["Schedules"],
        summary: "Schedules for one plan",
        responses: {
          "200": jsonResponse("Schedules", { type: "array", items: ref("Schedule") }),
          ...errorResponses,
        },
      },
    },
    "/workout-schedules/{id}": {
      parameters: [idParam("id", "Schedule id")],
      get: {
        tags: ["Schedules"],
        summary: "Read one schedule",
        responses: { "200": jsonResponse("Schedule", ref("Schedule")), ...errorResponses },
      },
      put: {
        tags: ["Schedules"],
        summary: "Reschedule; returns the updated entity",
        requestBody: jsonBody({
          type: "object",
          required: ["scheduledDate"],
          properties: {
            scheduledDate: { type: "string", format: "date-time" },
            workoutId: { type: "string", format: "uuid" },
            remindEnabled: { type: "boolean" },
          },
        }),
        responses: { "200": jsonResponse("Updated", ref("Schedule")), ...errorResponses },
      },
      delete: {
        tags: ["Schedules"],
        summary: "Delete a schedule",
        responses: { "200": jsonResponse("Deleted", ref("Message")), ...errorResponses },
      },
    },
    "/workout-schedules/{id}/complete": {
      parameters: [idParam("id", "Schedule id")],
      put: {
        tags: ["Schedules"],
        summary: "Mark a schedule complete without logging sets",
        responses: { "200": jsonResponse("Updated", ref("Schedule")), ...errorResponses },
      },
    },

    "/workout-sessions": {
      get: {
        tags: ["Sessions"],
        summary: "Session history",
        parameters: [
          { name: "from", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "to", in: "query", schema: { type: "string", format: "date-time" } },
          { name: "workoutId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "finishedOnly", in: "query", schema: { type: "string", enum: ["true", "false"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
        ],
        responses: { "200": jsonResponse("Sessions", ref("PaginatedSessions")), ...errorResponses },
      },
      post: {
        tags: ["Sessions"],
        summary: "Start a session, or log a finished one by including `sets`",
        requestBody: jsonBody({
          type: "object",
          required: ["workoutId"],
          properties: {
            workoutId: { type: "string", format: "uuid" },
            scheduleId: { type: "string", format: "uuid" },
            startedAt: { type: "string", format: "date-time" },
            finishedAt: { type: "string", format: "date-time" },
            durationSec: { type: "integer" },
            note: { type: "string" },
            sets: { type: "array", items: ref("SetInput") },
          },
        }),
        responses: { "201": jsonResponse("Session", ref("WorkoutSession")), ...errorResponses },
      },
    },
    "/workout-sessions/{id}": {
      parameters: [idParam("id", "Session id")],
      get: {
        tags: ["Sessions"],
        summary: "One session with every logged set",
        responses: { "200": jsonResponse("Session", ref("WorkoutSession")), ...errorResponses },
      },
      delete: {
        tags: ["Sessions"],
        summary: "Delete a session and its sets",
        responses: { "200": jsonResponse("Deleted", ref("Message")), ...errorResponses },
      },
    },
    "/workout-sessions/{id}/finish": {
      parameters: [idParam("id", "Session id")],
      put: {
        tags: ["Sessions"],
        summary:
          "Close an open session. Replaces its sets, recomputes volume and marks " +
          "the linked schedule complete.",
        requestBody: jsonBody({
          type: "object",
          properties: {
            finishedAt: { type: "string", format: "date-time" },
            durationSec: { type: "integer" },
            note: { type: "string" },
            sets: { type: "array", items: ref("SetInput") },
          },
        }),
        responses: {
          "200": jsonResponse("Finished session", ref("WorkoutSession")),
          "409": jsonResponse("Session was already finished", ref("Error")),
          ...errorResponses,
        },
      },
    },

    "/workout-comments/{workoutId}": {
      parameters: [idParam("workoutId", "Workout plan id")],
      get: {
        tags: ["Comments"],
        summary: "Comments on a plan, newest first",
        responses: {
          "200": jsonResponse("Comments", { type: "array", items: ref("Comment") }),
          ...errorResponses,
        },
      },
    },
    "/workout-comments": {
      post: {
        tags: ["Comments"],
        summary: "Add a comment; returns the created entity",
        requestBody: jsonBody({
          type: "object",
          required: ["workoutId", "comment"],
          properties: {
            workoutId: { type: "string", format: "uuid" },
            comment: { type: "string" },
          },
        }),
        responses: { "201": jsonResponse("Created", ref("Comment")), ...errorResponses },
      },
    },
    "/workout-comments/{id}": {
      parameters: [idParam("id", "Comment id")],
      put: {
        tags: ["Comments"],
        summary: "Edit a comment; returns the updated entity",
        requestBody: jsonBody({
          type: "object",
          required: ["comment"],
          properties: { comment: { type: "string" } },
        }),
        responses: { "200": jsonResponse("Updated", ref("Comment")), ...errorResponses },
      },
      delete: {
        tags: ["Comments"],
        summary: "Delete a comment",
        responses: { "200": jsonResponse("Deleted", ref("Message")), ...errorResponses },
      },
    },

    "/reports": {
      get: {
        tags: ["Reports"],
        summary: "Headline figures and the 8 week trend",
        responses: { "200": jsonResponse("Report", ref("Report")), ...errorResponses },
      },
    },
    "/reports/personal-records": {
      get: {
        tags: ["Reports"],
        summary: "Best weight and estimated 1RM per exercise, from logged sets",
        responses: {
          "200": jsonResponse("Records", { type: "array", items: ref("PersonalRecord") }),
          ...errorResponses,
        },
      },
    },
    "/reports/exercise-history/{exerciseId}": {
      parameters: [idParam("exerciseId", "Exercise id", "integer")],
      get: {
        tags: ["Reports"],
        summary: "Weekly progression and recent sessions for one exercise",
        parameters: [
          { name: "weeks", in: "query", schema: { type: "integer", default: 8, maximum: 52 } },
          {
            name: "sessionLimit",
            in: "query",
            schema: { type: "integer", default: 12, maximum: 100 },
          },
        ],
        responses: {
          "200": jsonResponse("History", ref("ExerciseHistory")),
          ...errorResponses,
        },
      },
    },
    "/reports/muscle-load": {
      get: {
        tags: ["Reports"],
        summary: "Volume and set count per muscle group over a window",
        parameters: [
          {
            name: "days",
            in: "query",
            schema: { type: "integer", default: 7, minimum: 1, maximum: 365 },
          },
        ],
        responses: { "200": jsonResponse("Muscle load", ref("MuscleLoad")), ...errorResponses },
      },
    },
  },
};
