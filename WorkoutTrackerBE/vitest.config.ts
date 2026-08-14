import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Integration tests share one database, so they must not run concurrently.
    fileParallelism: false,
    setupFiles: ["tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/services/**", "src/utils/**"],
      reporter: ["text", "lcov"],
    },
  },
});
