import { UserSettings } from "@prisma/client";
import {
  UserSettingsRepository,
  UserSettingsUpdate,
} from "../repositories/userSettings.repository";
import { UpdateUserSettingsDto } from "../dtos/userSettings.dto";

export interface UserSettingsResponse
  extends Omit<UserSettings, "preferredDays" | "id" | "userId"> {
  preferredDays: number[];
}

const toResponse = (settings: UserSettings): UserSettingsResponse => {
  const { id: _id, userId: _userId, preferredDays, ...rest } = settings;

  let parsed: number[] = [];
  try {
    const raw = JSON.parse(preferredDays);
    if (Array.isArray(raw)) {
      parsed = raw.filter((d): d is number => typeof d === "number");
    }
  } catch {
    // A malformed column should degrade to "no preferred days", not a 500.
    parsed = [];
  }

  return { ...rest, preferredDays: parsed };
};

export class UserSettingsService {
  private repository: UserSettingsRepository;

  constructor(repository: UserSettingsRepository = new UserSettingsRepository()) {
    this.repository = repository;
  }

  async get(userId: string): Promise<UserSettingsResponse> {
    const existing = await this.repository.findByUserId(userId);
    if (existing) return toResponse(existing);

    // Rows are created on first access rather than at registration, so accounts
    // that predate this table get defaults too.
    const created = await this.repository.createDefault(userId);
    return toResponse(created);
  }

  async update(
    userId: string,
    dto: UpdateUserSettingsDto
  ): Promise<UserSettingsResponse> {
    const { preferredDays, ...rest } = dto;
    const data: UserSettingsUpdate = { ...rest };

    if (preferredDays) {
      data.preferredDays = JSON.stringify([...preferredDays].sort((a, b) => a - b));
    }

    const saved = await this.repository.upsert(userId, data);
    return toResponse(saved);
  }
}
