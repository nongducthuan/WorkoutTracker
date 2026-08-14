import { describe, it, expect, vi } from "vitest";
import { z, ZodError } from "zod";
import { errorHandler } from "../src/middlewares/errorHandler.middleware";
import { AppError, ErrorCodes } from "../src/errors/appError";

const fakeRes = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const req = { log: { debug: vi.fn(), error: vi.fn() } } as any;

const zodErrorFrom = (schema: z.ZodTypeAny, value: unknown): ZodError => {
  const result = schema.safeParse(value);
  if (result.success) throw new Error("expected the parse to fail");
  return result.error;
};

describe("errorHandler", () => {
  it("reports a bad query string as a 400, not as a server fault", () => {
    // `validate` only wraps req.body, so query schemas are parsed inside the
    // controllers and their ZodError lands here directly.
    const res = fakeRes();
    const error = zodErrorFrom(z.object({ from: z.string().datetime() }), { from: "notadate" });

    errorHandler(error, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: ErrorCodes.INVALID_INPUT })
    );
  });

  it("passes the first zod message through so the client can tell what was wrong", () => {
    const res = fakeRes();
    const error = zodErrorFrom(z.object({ id: z.string().uuid("InvalidInputs") }), { id: "nope" });

    errorHandler(error, req, res, vi.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "InvalidInputs" })
    );
  });

  it("still honours an AppError's own status and code", () => {
    const res = fakeRes();

    errorHandler(new AppError("ScheduleNotFound", 404, ErrorCodes.SCHEDULE_NOT_FOUND), req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCodes.SCHEDULE_NOT_FOUND,
      message: "ScheduleNotFound",
    });
  });

  it("keeps anything unrecognised a 500 without leaking the message", () => {
    const res = fakeRes();

    errorHandler(new Error("connection string is postgres://user:hunter2@host"), req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      code: ErrorCodes.INTERNAL,
      message: "Internal Server Error",
    });
  });
});
