import { describe, it, expect, vi } from "vitest";
import { ExerciseService } from "../src/services/exercise.service";
import { GetExercisesQuerySchema } from "../src/dtos/exercise.dto";
import { difficultiesUpTo } from "../src/repositories/exercise.repository";

const repoWith = (data: any[] = [], total = data.length) =>
  ({
    findMany: vi.fn().mockResolvedValue({ data, total }),
    findCategories: vi.fn().mockResolvedValue(["Back", "Chest"]),
  }) as any;

describe("GetExercisesQuerySchema", () => {
  it("defaults to the first page", () => {
    const parsed = GetExercisesQuerySchema.parse({});
    expect(parsed).toMatchObject({ page: 1, pageSize: 10 });
    expect(parsed.category).toBeUndefined();
    expect(parsed.search).toBeUndefined();
  });

  it("treats a blank category as no filter, so an empty chip does not hide everything", () => {
    expect(GetExercisesQuerySchema.parse({ category: "   " }).category).toBeUndefined();
    expect(GetExercisesQuerySchema.parse({ category: " Chest " }).category).toBe("Chest");
  });

  it("clamps a junk page number instead of asking for a negative offset", () => {
    expect(GetExercisesQuerySchema.parse({ page: "0" }).page).toBe(1);
    expect(GetExercisesQuerySchema.parse({ page: "abc" }).page).toBe(1);
    expect(GetExercisesQuerySchema.parse({ pageSize: "-5" }).pageSize).toBe(1);
  });
});

describe("difficultiesUpTo", () => {
  it("is inclusive and cumulative — a level never excludes the easier ones", () => {
    expect(difficultiesUpTo("Beginner")).toEqual(["Beginner"]);
    expect(difficultiesUpTo("Intermediate")).toEqual(["Beginner", "Intermediate"]);
    expect(difficultiesUpTo("Advanced")).toEqual([
      "Beginner",
      "Intermediate",
      "Advanced",
    ]);
  });
});

describe("ExerciseService.getAllExercises", () => {
  it("passes both filters down so the catalogue is narrowed by the database", async () => {
    const repo = repoWith([{ id: 1 }]);

    const result = await new ExerciseService(repo).getAllExercises(
      GetExercisesQuerySchema.parse({ search: "press", category: "Chest", pageSize: "25" })
    );

    expect(repo.findMany).toHaveBeenCalledWith({
      search: "press",
      category: "Chest",
      page: 1,
      pageSize: 25,
    });
    // `total` is the count of everything matching, not of this page — the client
    // needs it to know whether a "load more" button belongs on screen.
    expect(result).toMatchObject({ total: 1, page: 1, pageSize: 25 });
  });

  it("reports the full match count alongside a partial page", async () => {
    const repo = repoWith([{ id: 1 }, { id: 2 }], 57);

    const result = await new ExerciseService(repo).getAllExercises(
      GetExercisesQuerySchema.parse({ page: "2", pageSize: "2" })
    );

    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(57);
  });

  it("passes the level bound down", async () => {
    const repo = repoWith([]);

    await new ExerciseService(repo).getAllExercises(
      GetExercisesQuerySchema.parse({ maxDifficulty: "Intermediate" })
    );

    expect(repo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ maxDifficulty: "Intermediate" })
    );
  });

  it("rejects a level outside the ladder", () => {
    expect(GetExercisesQuerySchema.safeParse({ maxDifficulty: "Expert" }).success).toBe(false);
  });

  it("lists categories from the whole catalogue, not from one page", async () => {
    const repo = repoWith([{ id: 1 }]);

    await expect(new ExerciseService(repo).getCategories()).resolves.toEqual(["Back", "Chest"]);
    expect(repo.findMany).not.toHaveBeenCalled();
  });
});
